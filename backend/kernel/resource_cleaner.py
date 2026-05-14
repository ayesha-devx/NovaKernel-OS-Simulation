from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus
from os_modules.resource_manager import resource_manager

class ResourceCleaner:
    """
    RESOURCE CLEANUP SYSTEM.
    Ensures no orphan memory, zombie processes, or stale queue entries.
    """
    @staticmethod
    def cleanup_process(pid):
        """
        Releases all resources held by a process.
        """
        with kernel_state.lock:
            process = kernel_state.processes.get(pid)
            if not process:
                return

            # 1. Remove from Ready Queue
            if pid in kernel_state.ready_queue:
                kernel_state.ready_queue.remove(pid)

            # 2. Free Memory
            from os_modules.memory_manager import memory_manager
            memory_manager.deallocate(pid)

            # 3. Release CPU slot if running
            if kernel_state.scheduler_state["current_process"] == pid:
                kernel_state.scheduler_state["current_process"] = None

            # 4. Unlock Files
            from os_modules.file_system import fs_engine
            if hasattr(fs_engine, 'release_process_locks'):
                fs_engine.release_process_locks(pid)

            # 5. Clear Disk Requests
            if "disk_state" in kernel_state.__dict__ or hasattr(kernel_state, 'disk_state'):
                kernel_state.disk_state["queue"] = [r for r in kernel_state.disk_state["queue"] if r.get("pid") != pid]
                if kernel_state.disk_state["active_request"] and kernel_state.disk_state["active_request"].get("pid") == pid:
                    # Active requests are harder to stop mid-seek, but we can clear the reference
                    pass

            # 6. KEY FIX: Release ALL held resources & clear from waiting queues
            res_map = kernel_state.resource_state.get("resources", {})
            target_pid = int(pid)
            for rid, res in list(res_map.items()):
                # Clear ownership - triggers handover
                owner = res.get("allocated_to")
                if owner is not None and int(owner) == target_pid:
                    res["allocated_to"] = None
                    # Handover to next valid waiter
                    valid_waiters = [p for p in res.get("waiting_pids", []) 
                                     if int(p) != target_pid and int(p) in kernel_state.processes]
                    if valid_waiters:
                        next_pid = int(valid_waiters[0])
                        res["allocated_to"] = next_pid
                        res["waiting_pids"] = [p for p in valid_waiters[1:] if int(p) != next_pid]
                        # Wake up the new owner
                        if next_pid in kernel_state.processes:
                            kernel_state.processes[next_pid].state = "READY"
                    else:
                        res["waiting_pids"] = []
                else:
                    # Remove terminated PID from any waiting list
                    res["waiting_pids"] = [p for p in res.get("waiting_pids", []) if int(p) != target_pid]

            # 7. Hardware Slot Cleanup
            from hardware.arduino_controller import arduino_controller
            arduino_controller.process_terminated(pid)

            process_name = process.name

        # Broadcast outside lock to avoid nesting issues
        socket_bus.emit("KERNEL", "CLEANUP_COMPLETE",
                        f"Process {process_name} (PID: {pid}) terminated and all resources reclaimed.",
                        "SUCCESS")
        socket_bus.broadcast_state()

# Global Instance
resource_cleaner = ResourceCleaner()
