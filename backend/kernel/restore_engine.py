import threading
import time
from kernel.kernel_state import kernel_state
from kernel.snapshot_storage import snapshot_storage
from kernel.state_serializer import state_serializer

# Subsystem Imports for Rehydration
from os_modules.process_manager import process_manager, Process
from os_modules.memory_manager import memory_manager
from os_modules.cpu_scheduler import scheduler_engine
from os_modules.ready_queue import ready_queue_manager
from os_modules.file_system import fs_engine
from os_modules.disk_scheduler import disk_scheduler
from analytics.analytics_engine import analytics_engine
from hardware.hardware_state import hardware_state_manager

class RestoreEngine:
    """
    Staged rehydration engine for NovaKernel.
    Safely restores kernel state from snapshots subsystem-by-subsystem.
    """
    def __init__(self):
        self.socketio = None

    def set_socket(self, socketio):
        self.socketio = socketio

    def restore_snapshot(self, snapshot_id):
        """
        Triggers a staged system restoration.
        """
        thread = threading.Thread(
            target=self._restore_worker,
            args=(snapshot_id,),
            daemon=True
        )
        thread.start()
        return True

    def _restore_worker(self, snapshot_id):
        try:
            self._emit_progress(snapshot_id, "VALIDATING", 10)
            
            # 1. Load and Validate
            data, error = snapshot_storage.load_snapshot(snapshot_id)
            if not data:
                raise Exception(f"Load failed: {error}")
            
            valid, msg = state_serializer.validate_snapshot(data)
            if not valid:
                raise Exception(f"Validation failed: {msg}")
            
            # 2. Preparation (Freeze Writes)
            self._emit_progress(snapshot_id, "PREPARING", 20)
            with kernel_state.lock:
                kernel_state.snapshot_state = "LOADING"
                # Temporarily disable scheduler to prevent state mutation
                old_scheduler_active = kernel_state.scheduler_state.get("is_running", False)
                kernel_state.scheduler_state["is_running"] = False
            
            sub = data.get("subsystems", {})
            
            # 3. Restore Core Subsystems (Staged)
            
            # A. Restore Memory
            self._emit_progress(snapshot_id, "RESTORING_MEMORY", 30)
            self._restore_memory(sub.get("memory", {}))
            
            # B. Restore Processes (PCB Table)
            self._emit_progress(snapshot_id, "RESTORING_PROCESSES", 50)
            self._restore_processes(sub.get("processes", {}))
            
            # C. Restore Scheduler & Queues
            self._emit_progress(snapshot_id, "RESTORING_SCHEDULER", 70)
            self._restore_scheduler(sub.get("scheduler", {}), sub.get("ready_queue", []))
            
            # D. Restore File System & Disk
            self._emit_progress(snapshot_id, "RESTORING_STORAGE", 85)
            self._restore_filesystem(sub.get("filesystem", {}), sub.get("disk", {}))
            
            # E. Restore Analytics & Telemetry
            self._emit_progress(snapshot_id, "RESTORING_ANALYTICS", 95)
            self._restore_analytics(sub.get("analytics", {}))
            
            # 4. Finalize & Resume
            with kernel_state.lock:
                kernel_state.snapshot_state = "IDLE"
                kernel_state.last_restore_time = time.time()
                kernel_state.active_snapshot_id = snapshot_id
                # Resume scheduler if it was active
                kernel_state.scheduler_state["is_running"] = old_scheduler_active
            
            self._emit_progress(snapshot_id, "COMPLETED", 100)
            if self.socketio:
                self.socketio.emit("SNAPSHOT_RESTORED", {"id": snapshot_id})
                
        except Exception as e:
            print(f"RESTORE_ENGINE_ERROR: {str(e)}")
            with kernel_state.lock:
                kernel_state.snapshot_state = "ERROR"
            if self.socketio:
                self.socketio.emit("RESTORE_FAILED", {"id": snapshot_id, "error": str(e)})

    def _restore_memory(self, mem_data):
        """Restores memory blocks and usage metrics."""
        with kernel_state.lock:
            kernel_state.memory_map["total_ram"] = mem_data.get("total_ram", 4096)
            kernel_state.memory_map["used_ram"] = mem_data.get("used_ram", 0)
            kernel_state.memory_map["fragmentation"] = mem_data.get("fragmentation", 0)
            # Rebuild blocks (need to convert dict back to Block objects if necessary)
            # For now, memory_manager manages its own list, so we update it.
            from os_modules.memory_manager import MemoryBlock
            blocks = []
            for b in mem_data.get("blocks", []):
                new_block = MemoryBlock(
                    block_id=b.get('block_id'),
                    start_address=b.get('start_address'),
                    size=b.get('size'),
                    status=b.get('status', 'FREE'),
                    pid=b.get('pid'),
                    process_name=b.get('process_name'),
                    algo=b.get('allocation_algo')
                )
                blocks.append(new_block)
            memory_manager.blocks = blocks

    def _restore_processes(self, proc_data):
        """Rehydrates the Process table from serialized data."""
        with kernel_state.lock:
            kernel_state.processes = {}
            for pid_str, p in proc_data.items():
                if isinstance(p, str):
                    continue # Skip corrupted entries from older broken snapshots
                pid = int(pid_str)
                # Re-create Process object
                proc = Process(
                    pid=pid,
                    name=p.get('name'),
                    priority=p.get('priority'),
                    burst_time=p.get('burst_time'),
                    memory_required=p.get('memory_required'),
                    parent_pid=p.get('parent_pid')
                )
                # Restore runtime metadata
                proc.state = p.get('state', 'NEW')
                proc.burst_remaining = p.get('burst_remaining', proc.burst_time)
                proc.waiting_time = p.get('waiting_time', 0)
                proc.turnaround_time = p.get('turnaround_time', 0)
                proc.child_pids = p.get('child_pids', [])
                proc.depth = p.get('depth', 0)
                proc.arrival_time = p.get('arrival_time', time.time())
                
                kernel_state.processes[pid] = proc

    def _restore_scheduler(self, sched_data, queue_data):
        """Restores scheduler settings and ready queue."""
        with kernel_state.lock:
            kernel_state.scheduler_state["current_algorithm"] = sched_data.get("current_algorithm", "ROUND_ROBIN")
            kernel_state.scheduler_state["current_process"] = sched_data.get("current_process")
            kernel_state.scheduler_state["quantum_left"] = sched_data.get("quantum_left", 0)
            kernel_state.ready_queue = [int(pid) for pid in queue_data]

            # Synchronize internal engine states to prevent them from overwriting the restored state
            scheduler_engine.algorithm = sched_data.get("current_algorithm", "ROUND_ROBIN")
            scheduler_engine.quantum_remaining = sched_data.get("quantum_left", 0)
            scheduler_engine.context_switches = sched_data.get("context_switches", scheduler_engine.context_switches)
            scheduler_engine.total_execution_time = sched_data.get("total_execution_time", scheduler_engine.total_execution_time)
            
            # Synchronize ready queue manager mode
            ready_queue_manager.mode = "PRIORITY" if scheduler_engine.algorithm == "PRIORITY" else "FIFO"
            ready_queue_manager.start_times = {int(pid): time.time() for pid in queue_data}

    def _restore_filesystem(self, fs_data, disk_data):
        """Restores virtual file system and disk scheduler state."""
        with kernel_state.lock:
            kernel_state.file_system_state["files"] = fs_data.get("files", {})
            kernel_state.file_system_state["inodes"] = fs_data.get("inodes", [])
            kernel_state.file_system_state["used_disk"] = fs_data.get("used_disk", 0)
            
            kernel_state.disk_state["current_track"] = disk_data.get("current_track", 0)
            kernel_state.disk_state["queue"] = disk_data.get("queue", [])

    def _restore_analytics(self, anal_data):
        """Rehydrates telemetry history."""
        with kernel_state.lock:
            from collections import deque
            # We restore the telemetry stream and timeline
            kernel_state.analytics_state["telemetry"] = anal_data.get("metrics", [])
            kernel_state.analytics_state["timeline"] = anal_data.get("timeline", [])

    def _emit_progress(self, snapshot_id, stage, progress):
        if self.socketio:
            self.socketio.emit("RESTORE_PROGRESS", {
                "id": snapshot_id,
                "stage": stage,
                "progress": progress
            })

# Global Instance
restore_engine = RestoreEngine()
