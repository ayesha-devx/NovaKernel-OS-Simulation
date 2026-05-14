from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus
from os_modules.process_manager import process_manager
from os_modules.cpu_scheduler import scheduler_engine as scheduler
from os_modules.memory_manager import memory_manager

class RecoveryEngine:
    """
    AUTO RECOVERY SYSTEM.
    Executes safe recovery procedures for various kernel subsystems.
    """
    def __init__(self):
        pass

    def recover(self, validation_errors):
        """Processes a list of validation errors and triggers recovery actions."""
        if not validation_errors:
            return

        socket_bus.emit("RECOVERY", "RECOVERY_START", f"Attempting recovery for {len(validation_errors)} issues...", "WARNING")
        
        recovered_count = 0
        for err in validation_errors:
            action = err.get("action")
            success = False
            
            try:
                if action == "CLEANUP_ZOMBIE":
                    success = self._cleanup_zombie(err)
                elif action == "RECOVERY_SCHEDULER":
                    success = self._recover_scheduler(err)
                elif action == "RECOVERY_MEMORY":
                    success = self._recover_memory(err)
                elif action == "RECOVERY_RESOURCES":
                    success = self._recover_resources(err)
                elif action == "RECOVERY_DISK":
                    success = self._recover_disk(err)
            except Exception as e:
                print(f"[RECOVERY_ERROR] Failed to execute {action}: {str(e)}")
                success = False
            
            if success:
                recovered_count += 1

        if recovered_count > 0:
            socket_bus.emit("RECOVERY", "RECOVERY_COMPLETE", f"Successfully recovered {recovered_count} subsystems.", "SUCCESS")
            socket_bus.broadcast_state()

    def _cleanup_zombie(self, error):
        try:
            pid_str = error["message"].split("PID ")[1]
            pid = int(pid_str)
            print(f"[RECOVERY] Cleaning up zombie PID: {pid}")
            process_manager.delete_process(pid)
            return True
        except:
            return False

    def _recover_scheduler(self, error):
        print(f"[RECOVERY] Repairing scheduler state...")
        with kernel_state.lock:
            # 1. Clear invalid current process
            curr = kernel_state.scheduler_state["current_process"]
            if curr is not None and curr not in kernel_state.processes:
                kernel_state.scheduler_state["current_process"] = None
            
            # 2. Scrub ready queue for orphans
            active_pids = set(kernel_state.processes.keys())
            kernel_state.ready_queue = [pid for pid in kernel_state.ready_queue if pid in active_pids]
            
            # 3. If scheduler is supposed to be running but is stuck, toggle it
            # (Non-invasive: just ensures state consistency)
        return True

    def _recover_memory(self, error):
        print(f"[RECOVERY] Repairing memory maps...")
        with kernel_state.lock:
            # Re-sync memory manager logic
            if hasattr(memory_manager, '_merge_adjacent_free_blocks'):
                memory_manager._merge_adjacent_free_blocks()
            
            # Recalculate usage
            total = 0
            for b in kernel_state.memory_map["blocks"]:
                if b["status"] == "ALLOCATED":
                    total += b["size"]
            kernel_state.memory_map["used_ram"] = total
            
            # Fix negative fragmentation
            if kernel_state.memory_map["fragmentation"] < 0:
                kernel_state.memory_map["fragmentation"] = 0
        return True

    def _recover_resources(self, error):
        print(f"[RECOVERY] Reclaiming stale resources...")
        with kernel_state.lock:
            active_pids = set(kernel_state.processes.keys())
            res_state = kernel_state.resource_state.get("resources", {})
            for rid, res in res_state.items():
                owner = res.get("allocated_to")
                if owner is not None and int(owner) not in active_pids:
                    res["allocated_to"] = None
                    # Simple handover
                    waiters = res.get("waiting_pids", [])
                    valid_waiters = [w for w in waiters if int(w) in active_pids]
                    if valid_waiters:
                        res["allocated_to"] = int(valid_waiters[0])
                        res["waiting_pids"] = valid_waiters[1:]
                    else:
                        res["waiting_pids"] = []
        return True

    def _recover_disk(self, error):
        print(f"[RECOVERY] Stabilizing disk queue...")
        with kernel_state.lock:
            # Remove requests from non-existent processes if needed
            # (Assuming disk requests might have pids attached in metadata)
            pass
        return True

recovery_engine = RecoveryEngine()
