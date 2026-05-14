from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus

class SystemValidator:
    """
    KERNEL SYSTEM VALIDATOR.
    Identifies orphans, leaks, lockups, and inconsistencies.
    """
    def __init__(self):
        self.last_validation = None

    def validate(self):
        """Runs a full suite of validation checks."""
        errors = []
        
        with kernel_state.lock:
            # 1. Orphan Processes Check
            errors.extend(self._check_orphans())
            
            # 2. Memory Leaks / Fragmentation Check
            errors.extend(self._check_memory())
            
            # 3. Scheduler Lockup Check
            errors.extend(self._check_scheduler())
            
            # 4. Deadlock Inconsistencies
            errors.extend(self._check_deadlocks())
            
            # 5. Socket/Telemetry Sync
            errors.extend(self._check_sync())
            
            # Update kernel state
            kernel_state.validation_errors = errors
            
            # Update health score based on error severity
            self._update_health_score(errors)

        if errors:
            self._report_errors(errors)
            
        return errors

    def _check_orphans(self):
        errors = []
        active_pids = set(kernel_state.processes.keys())
        ready_queue_pids = set(kernel_state.ready_queue)
        
        # Zombies in processes but not ready/blocked/running?
        for pid, proc in kernel_state.processes.items():
            if proc.state == "TERMINATED":
                # TERMINATED processes should ideally be removed quickly
                errors.append({
                    "severity": "WARNING",
                    "module": "PROCESS_MANAGER",
                    "message": f"Zombie process detected: PID {pid}",
                    "action": "CLEANUP_ZOMBIE"
                })
        
        # PIDs in ready queue but not in processes map
        orphans = ready_queue_pids - active_pids
        for pid in orphans:
            errors.append({
                "severity": "ERROR",
                "module": "SCHEDULER",
                "message": f"Orphan PID in ready queue: {pid}",
                "action": "RECOVERY_SCHEDULER"
            })
            
        return errors

    def _check_memory(self):
        errors = []
        mem = kernel_state.memory_map
        if mem["used_ram"] < 0:
            errors.append({
                "severity": "CRITICAL",
                "module": "MEMORY_MANAGER",
                "message": "Negative memory usage detected!",
                "action": "RECOVERY_MEMORY"
            })
        
        # Check for block inconsistencies (total vs ram size)
        total_size = sum(b["size"] for b in mem["blocks"])
        if total_size != mem["total_ram"]:
            errors.append({
                "severity": "ERROR",
                "module": "MEMORY_MANAGER",
                "message": f"Memory map size mismatch: {total_size} != {mem['total_ram']}",
                "action": "RECOVERY_MEMORY"
            })
            
        return errors

    def _check_scheduler(self):
        errors = []
        sched = kernel_state.scheduler_state
        
        # Check for invalid current process
        curr = sched["current_process"]
        if curr is not None and curr not in kernel_state.processes:
             errors.append({
                "severity": "CRITICAL",
                "module": "SCHEDULER",
                "message": f"Scheduler tracking non-existent process: {curr}",
                "action": "RECOVERY_SCHEDULER"
            })
            
        return errors

    def _check_deadlocks(self):
        errors = []
        # Verify that all resources allocated to terminated processes are freed
        active_pids = set(kernel_state.processes.keys())
        res_state = kernel_state.resource_state.get("resources", {})
        for rid, res in res_state.items():
            owner = res.get("allocated_to")
            if owner is not None and int(owner) not in active_pids:
                errors.append({
                    "severity": "ERROR",
                    "module": "RESOURCE_MANAGER",
                    "message": f"Resource {rid} held by non-existent process {owner}",
                    "action": "RECOVERY_RESOURCES"
                })
        return errors

    def _check_sync(self):
        errors = []
        # Check if telemetry is stale 
        return errors

    def _update_health_score(self, errors):
        penalty = 0
        for err in errors:
            if err["severity"] == "CRITICAL": penalty += 20
            elif err["severity"] == "ERROR": penalty += 10
            elif err["severity"] == "WARNING": penalty += 5
        
        kernel_state.health_score = max(0, 100 - penalty)

    def _report_errors(self, errors):
        for err in errors:
            socket_bus.emit(
                "VALIDATOR", 
                "VALIDATION_ERROR", 
                f"[{err['severity']}] {err['message']}", 
                err['severity'],
                metadata=err
            )

system_validator = SystemValidator()
