# NovaKernel AI Assistant - Context Builder
from kernel.kernel_state import kernel_state

class ContextBuilder:
    """
    Extracts and formats live kernel state for AI consumption.
    Generates human-readable snapshots and serializable summaries.
    """
    
    @staticmethod
    def build_live_context():
        """Aggregates all relevant kernel subsystems into a compact context."""
        with kernel_state.lock:
            # 1. Scheduler Context
            scheduler = kernel_state.scheduler_state
            ready_queue = kernel_state.ready_queue
            
            # 2. Memory Context
            memory = kernel_state.memory_map
            
            # 3. Disk Context
            disk = kernel_state.disk_state
            disk_metrics = kernel_state.disk_metrics
            
            # 4. Deadlock Context
            deadlock = kernel_state.deadlock_state
            
            # 5. Hardware Context
            hardware = kernel_state.hardware_state
            
            # 6. Process Statistics
            processes = list(kernel_state.processes.values())
            active_count = len([p for p in processes if p.state == 'RUNNING' or p.state == 'READY'])
            blocked_count = len([p for p in processes if p.state == 'WAITING'])
            
            return {
                "system": {
                    "uptime": round(kernel_state.uptime, 2),
                    "health": kernel_state.health_score,
                    "status": kernel_state.status
                },
                "scheduler": {
                    "algorithm": scheduler.get("current_algorithm"),
                    "is_running": scheduler.get("is_running"),
                    "ready_count": len(ready_queue),
                    "current_pid": scheduler.get("current_process")
                },
                "memory": {
                    "total": memory.get("total_ram"),
                    "used": memory.get("used_ram"),
                    "utilization": round((memory.get("used_ram", 0) / memory.get("total_ram", 1)) * 100, 1),
                    "fragmentation": memory.get("fragmentation", 0)
                },
                "disk": {
                    "algorithm": disk.get("current_algorithm"),
                    "queue_depth": len(disk.get("queue", [])),
                    "is_moving": disk.get("is_moving"),
                    "utilization": disk_metrics.get("disk_utilization", 0)
                },
                "deadlock": {
                    "is_deadlocked": deadlock.get("is_deadlocked"),
                    "victim_pids": deadlock.get("detected_pids", []),
                    "cycles": len(deadlock.get("resource_cycles", []))
                },
                "processes": {
                    "total": len(processes),
                    "active": active_count,
                    "blocked": blocked_count
                },
                "hardware": {
                    "connected": hardware.get("connected", False),
                    "mode": hardware.get("simulation_mode", "VIRTUAL")
                }
            }

    @staticmethod
    def get_summary_string(context=None):
        """Generates a human-readable summary of the current context."""
        ctx = context or ContextBuilder.build_live_context()
        
        summary = [
            f"System is {ctx['system']['status']} (Health: {ctx['system']['health']}%).",
            f"Scheduler using {ctx['scheduler']['algorithm']} with {ctx['scheduler']['ready_count']} tasks in queue.",
            f"Memory utilization at {ctx['memory']['utilization']}% with {ctx['memory']['fragmentation']}% fragmentation.",
            f"Disk controller is {('active' if ctx['disk']['is_moving'] else 'idle')} using {ctx['disk']['algorithm']}.",
        ]
        
        if ctx['deadlock']['is_deadlocked']:
            summary.append(f"WARNING: Deadlock detected involving PIDs {ctx['deadlock']['victim_pids']}.")
        else:
            summary.append("No deadlocks detected.")
            
        return " ".join(summary)

context_builder = ContextBuilder()
