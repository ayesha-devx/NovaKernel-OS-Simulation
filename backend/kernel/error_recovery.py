from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus

class ErrorRecovery:
    """
    GLOBAL ERROR RECOVERY SYSTEM.
    Handles subsystem failures and provides graceful fallback mechanisms.
    """
    @staticmethod
    def handle_subsystem_failure(subsystem, error_msg):
        """
        Marks a subsystem as DEGRADED and attempts recovery.
        """
        kernel_state.set_subsystem_health(subsystem, "DEGRADED")
        socket_bus.emit("KERNEL_ERROR", "SUBSYSTEM_FAILURE", 
                       f"Subsystem {subsystem} is DEGRADED: {error_msg}", 
                       "CRITICAL")
        
        # Recovery attempt logic
        if subsystem == "scheduler":
            # Attempt to reset scheduler
            from os_modules.cpu_scheduler import scheduler_engine
            scheduler_engine.is_running = False
            socket_bus.emit("KERNEL", "RECOVERY", "Attempting Scheduler reset...", "WARNING")
            
        elif subsystem == "memory_manager":
            # Check for memory corruption or leaks
            socket_bus.emit("KERNEL", "RECOVERY", "Running memory integrity check...", "WARNING")

    @staticmethod
    def validate_kernel_integrity():
        """
        Scans the kernel state for inconsistencies.
        """
        with kernel_state.lock:
            # Check for processes in READY state but not in ready_queue
            for pid, process in kernel_state.processes.items():
                if process.state == "READY" and pid not in kernel_state.ready_queue:
                    kernel_state.ready_queue.append(pid)
                    socket_bus.emit("KERNEL_RECOVERY", "INTEGRITY_FIX", f"Syncing PID {pid} back to Ready Queue.", "INFO")
            
            # Check for zombie processes (running but not in process list)
            curr_pid = kernel_state.scheduler_state["current_process"]
            if curr_pid and curr_pid not in kernel_state.processes:
                kernel_state.scheduler_state["current_process"] = None
                socket_bus.emit("KERNEL_RECOVERY", "ZOMBIE_CLEANUP", "Zombie process removed from CPU.", "WARNING")

# Global Instance
error_recovery = ErrorRecovery()
