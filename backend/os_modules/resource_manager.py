import time
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus

class ResourceManager:
    """
    KERNEL RESOURCE MANAGER.
    Handles allocation, request, and release of system resources.
    Integrates with the Deadlock Detection Engine.
    """
    def __init__(self):
        self.lock = kernel_state.lock

    def request_resource(self, pid, resource_id):
        """
        Process (pid) requests a resource (resource_id).
        If available, allocates immediately.
        If busy, adds process to waiting queue.
        """
        with self.lock:
            res_map = kernel_state.resource_state["resources"]
            if resource_id not in res_map:
                return False, "Resource not found."

            resource = res_map[resource_id]
            process = kernel_state.processes.get(pid)
            if not process:
                return False, "Process not found."

            # Case 1: Resource is FREE
            if resource["allocated_to"] is None:
                resource["allocated_to"] = int(pid)
                # Ensure it's not still in the waiting list
                resource["waiting_pids"] = [p for p in resource["waiting_pids"] if int(p) != int(pid)]
                
                socket_bus.emit("RESOURCE_MANAGER", "ALLOCATED", 
                               f"Resource {resource['name']} allocated to PID {pid}.", 
                               "SUCCESS", {"pid": pid, "rid": resource_id})
                return True, "Allocated"

            # Case 2: Already held
            if int(resource["allocated_to"]) == int(pid):
                return True, "Already held"

            # Case 3: Resource is BUSY
            if int(pid) not in [int(p) for p in resource["waiting_pids"]]:
                resource["waiting_pids"].append(int(pid))
                socket_bus.emit("RESOURCE_MANAGER", "WAITING", 
                               f"PID {pid} is now waiting for {resource['name']}.", 
                               "WARNING", {"pid": pid, "rid": resource_id})
            
            return False, "Waiting"

    def release_resource(self, pid, resource_id):
        """
        Process (pid) releases a resource (resource_id).
        Triggers allocation to the next process in waiting queue.
        """
        with self.lock:
            res_map = kernel_state.resource_state["resources"]
            if resource_id not in res_map:
                return False, "Resource not found."

            resource = res_map[resource_id]
            
            # Allow None pid for kernel-level force handover (Self-Healing)
            if pid is not None and resource["allocated_to"] != pid:
                return False, "Process does not hold this resource."

            # Release it
            resource["allocated_to"] = None
            socket_bus.emit("RESOURCE_MANAGER", "RELEASED", 
                           f"Resource {resource['name']} released by PID {pid}.", 
                           "INFO", {"pid": pid, "rid": resource_id})

            # Hand over to next in queue
            if resource["waiting_pids"]:
                # Filter out any invalid or duplicate PIDs and normalize to int
                raw_waiters = [int(p) for p in resource["waiting_pids"]]
                if raw_waiters:
                    next_pid = raw_waiters.pop(0)
                    resource["allocated_to"] = next_pid
                    resource["waiting_pids"] = [p for p in raw_waiters if p != next_pid]
                    
                    # WAKE UP THE PROCESS: Transition from WAITING to READY
                    from os_modules.process_manager import process_manager
                    process_manager.update_process_state(next_pid, "READY")
                    
                    socket_bus.emit("RESOURCE_MANAGER", "HANDOVER", 
                                   f"Resource {resource['name']} handed over to waiting PID {next_pid}.", 
                                   "SUCCESS", {"pid": next_pid, "rid": resource_id})

            return True, "Released"

    def release_all_for_process(self, pid):
        """Emergency cleanup: release all resources held by a crashed/terminated process."""
        with self.lock:
            res_map = kernel_state.resource_state["resources"]
            # Target PID as integer for safe comparison
            target_pid = int(pid)
            
            # Iterate over a list to avoid issues with dict modification during loop
            for rid, res in list(res_map.items()):
                # 1. Clear Ownership
                owner = res.get("allocated_to")
                if owner is not None and int(owner) == target_pid:
                    self.release_resource(target_pid, rid)
                
                # 2. Clear Waiting List
                if "waiting_pids" in res:
                    res["waiting_pids"] = [p for p in res["waiting_pids"] if int(p) != target_pid]

    def reset(self):
        """Force reset all resource allocations and queues."""
        with self.lock:
            res_map = kernel_state.resource_state["resources"]
            for rid, res in res_map.items():
                res["allocated_to"] = None
                res["waiting_pids"] = []
            
            # Clear deadlock state too
            kernel_state.deadlock_state["is_deadlocked"] = False
            kernel_state.deadlock_state["detected_pids"] = []
            kernel_state.deadlock_state["resource_cycles"] = []
            
            socket_bus.emit("RESOURCE_MANAGER", "RESET", "All resources have been cleared.", "WARNING")
            socket_bus.broadcast_state()

    def get_resource_status(self):
        return kernel_state.resource_state["resources"]

# Global Instance
resource_manager = ResourceManager()
