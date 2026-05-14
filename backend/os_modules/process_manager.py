import time
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus
from kernel.lifecycle_engine import lifecycle_engine
from os_modules.memory_manager import memory_manager
from hardware.hardware_event_bridge import hardware_event_bridge

class Process:
    def __init__(self, pid, name, priority, burst_time, memory_required, parent_pid=None):
        self.pid = pid
        self.name = name
        self.priority = priority
        self.burst_time = burst_time
        self.memory_required = memory_required
        self.parent_pid = parent_pid
        self.state = "NEW"
        self.arrival_time = round(time.time(), 2)
        self.creation_timestamp = time.strftime("%H:%M:%S")
        self.fork_timestamp = None
        
        # Hierarchy
        self.child_pids = []
        self.depth = 0
        
        # Scheduling Metrics
        self.burst_remaining = burst_time
        self.waiting_time = 0
        self.turnaround_time = 0
        self.response_time = -1 
        self.completion_time = None
        self.last_ready_time = self.arrival_time
        self.last_start_time = 0
        self.execution_slices = [] # List of (start_time, end_time)
        
        self.status_color = self._get_color()

    def _get_color(self):
        colors = {
            "NEW": "#9CA3AF",      # Gray
            "READY": "#F59E0B",    # Amber
            "RUNNING": "#10B981",  # Green
            "WAITING": "#3B82F6",  # Blue
            "TERMINATED": "#EF4444" # Red
        }
        return colors.get(self.state, "#9CA3AF")

    def update_state(self, new_state):
        self.state = new_state
        self.status_color = self._get_color()
        
    def to_dict(self):
        with memory_manager.lock:
            mem_blocks = [b.to_dict() for b in memory_manager.blocks if b.pid == self.pid]
        
        # UI Alignment: Convert absolute timestamps to relative kernel uptime
        boot = kernel_state.boot_time
        rel = lambda t: round(t - boot, 2) if t and t > 1000000 else t # Only subtract if it looks like a unix timestamp
            
        return {
            "pid": self.pid,
            "name": self.name,
            "priority": self.priority,
            "state": self.state,
            "burst_time": self.burst_time,
            "burst_remaining": round(self.burst_remaining, 2),
            "memory_required": self.memory_required,
            "parent_pid": self.parent_pid,
            "arrival_time": rel(self.arrival_time),
            "last_start_time": rel(getattr(self, 'last_start_time', 0)),
            "creation_timestamp": self.creation_timestamp,
            "waiting_time": round(self.waiting_time, 2),
            "turnaround_time": round(self.turnaround_time, 2),
            "response_time": round(self.response_time, 2) if self.response_time >= 0 else 0,
            "completion_time": rel(self.completion_time),
            "execution_slices": [(rel(s), rel(e)) for s, e in self.execution_slices],
            "status_color": self.status_color,
            "child_pids": self.child_pids,
            "depth": self.depth,
            "fork_timestamp": self.fork_timestamp,
            "memory_blocks": mem_blocks
        }

class ProcessManager:
    def __init__(self):
        self.next_pid = 1000

    @property
    def processes(self):
        return kernel_state.processes

    def create_process(self, name, priority, burst_time, memory_required, parent_pid=None):
        pid = self.next_pid
        self.next_pid += 1
        
        process = Process(pid, name, priority, burst_time, memory_required, parent_pid)
        
        # --- TRACE HOOK ---
        try:
            from monitoring.event_trace_engine import event_trace_engine
            event_trace_engine.trace(
                subsystem="PROCESS",
                severity="SUCCESS",
                category="PROCESS",
                title="Process Created",
                description=f"Initialized {name} (PID: {pid})",
                metadata={"pid": pid, "priority": priority, "memory": memory_required}
            )
        except: pass

        # ATTEMPT MEMORY ALLOCATION
        if not memory_manager.allocate(process.pid, process.name, process.memory_required):
            socket_bus.emit("PROCESS_MANAGER", "ALLOC_FAILED", 
                           f"Failed to create process {name}: Memory allocation failed.", "ERROR")
            
            # --- TRACE HOOK ---
            try:
                event_trace_engine.trace(
                    subsystem="PROCESS",
                    severity="ERROR",
                    category="MEMORY",
                    title="Allocation Failed",
                    description=f"Process {name} creation failed: Insufficient memory",
                    metadata={"pid": pid, "required": memory_required}
                )
            except: pass
            return None
            
        with kernel_state.lock:
            kernel_state.processes[process.pid] = process
        
        # HARDWARE SYNC (Assign slot first)
        hardware_event_bridge.on_process_created(process.pid)
        
        # TRANSITION TO READY (Triggers LED via lifecycle engine hook)
        lifecycle_engine.transition(process.pid, "READY")
        
        # READY QUEUE INTEGRATION
        from os_modules.ready_queue import ready_queue_manager
        ready_queue_manager.enqueue(process.pid)
            
        return process

    def get_all_processes(self):
        return [p.to_dict() for p in self.processes.values()]

    def update_process_state(self, pid, new_state):
        if pid in kernel_state.processes:
            success, msg = lifecycle_engine.transition(pid, new_state)
            
            if success:
                process = kernel_state.processes[pid]
                
                # --- TRACE HOOK ---
                try:
                    from monitoring.event_trace_engine import event_trace_engine
                    event_trace_engine.trace(
                        subsystem="PROCESS",
                        severity="INFO",
                        category="PROCESS",
                        title="State Transition",
                        description=f"PID {pid} moved to {new_state}",
                        metadata={"pid": pid, "new_state": new_state}
                    )
                except: pass

                # READY QUEUE INTEGRATION
                from os_modules.ready_queue import ready_queue_manager
                if new_state == "READY":
                    ready_queue_manager.enqueue(pid)
                
                if new_state == "TERMINATED":
                    from kernel.resource_cleaner import resource_cleaner
                    resource_cleaner.cleanup_process(pid)
                
                return process.to_dict()
            else:
                return {"error": msg}
        return None

    def fork_process(self, parent_pid):
        if parent_pid not in self.processes:
            return None
            
        parent = self.processes[parent_pid]
        
        # Create child process (inherits attributes)
        child_name = f"{parent.name}-child"
        child = self.create_process(
            name=child_name,
            priority=parent.priority,
            burst_time=parent.burst_time,
            memory_required=parent.memory_required,
            parent_pid=parent_pid
        )
        
        if not child:
            return None

        # Set hierarchy metadata
        child.depth = parent.depth + 1
        child.fork_timestamp = time.strftime("%H:%M:%S")
        
        # Link to parent
        parent.child_pids.append(child.pid)
        
        # --- TRACE HOOK ---
        try:
            from monitoring.event_trace_engine import event_trace_engine
            event_trace_engine.trace(
                subsystem="PROCESS",
                severity="SUCCESS",
                category="PROCESS",
                title="Process Forked",
                description=f"PID {parent_pid} spawned child {child.pid}",
                metadata={"parent_pid": parent_pid, "child_pid": child.pid}
            )
        except: pass

        return child.to_dict()

    def get_process_tree(self):
        # Build a hierarchical structure for the tree visualization
        def build_node(pid):
            p = self.processes[pid]
            return {
                "pid": p.pid,
                "name": p.name,
                "state": p.state,
                "children": [build_node(child_pid) for child_pid in p.child_pids if child_pid in self.processes]
            }
            
        # Root processes are those without parents
        roots = [p.pid for p in self.processes.values() if p.parent_pid is None]
        return [build_node(root_pid) for root_pid in roots]

    def delete_process(self, pid):
        if pid in kernel_state.processes:
            process = kernel_state.processes[pid]
            
            from kernel.resource_cleaner import resource_cleaner
            resource_cleaner.cleanup_process(pid)
            
            # --- TRACE HOOK ---
            try:
                from monitoring.event_trace_engine import event_trace_engine
                event_trace_engine.trace(
                    subsystem="PROCESS",
                    severity="WARNING",
                    category="PROCESS",
                    title="Process Deleted",
                    description=f"PID {pid} removed from table",
                    metadata={"pid": pid, "name": process.name}
                )
            except: pass

            with kernel_state.lock:
                del kernel_state.processes[pid]
            
            # HARDWARE SYNC
            hardware_event_bridge.on_state_change(pid, "TERMINATED")

            socket_bus.emit("PROCESS_MANAGER", "PROCESS_REMOVED", 
                           f"Process {process.name} (PID: {pid}) removed from system.", "WARNING")
            
            return True
        return False

    def reset(self):
        """Emergency purge: Clear all processes and reset kernel state."""
        # --- TRACE HOOK ---
        try:
            from monitoring.event_trace_engine import event_trace_engine
            event_trace_engine.trace(
                subsystem="SYSTEM",
                severity="CRITICAL",
                category="SYSTEM",
                title="Kernel Reset",
                description="Global process table purge initiated",
                metadata={"active_count": len(kernel_state.processes)}
            )
        except: pass

        with kernel_state.lock:
            # 1. Clear Memory for all processes
            from os_modules.memory_manager import memory_manager
            for pid in list(kernel_state.processes.keys()):
                memory_manager.deallocate(pid)
            
            # 2. Clear Ready Queue & Scheduler
            kernel_state.ready_queue = []
            kernel_state.scheduler_state["current_process"] = None
            
            # 3. Clear PCB Table
            kernel_state.processes = {}
            self.next_pid = 1000
            
            socket_bus.emit("PROCESS_MANAGER", "SYSTEM_RESET", "Global process table purged.", "WARNING")
            socket_bus.broadcast_state()

# Global instance
process_manager = ProcessManager()

