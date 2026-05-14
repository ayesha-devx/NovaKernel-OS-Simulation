import time
import random
import uuid
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus

class DiskRequestManager:
    """
    DISK REQUEST MANAGER.
    Handles queuing and creation of READ/WRITE requests.
    """
    def add_request(self, track, op_type="READ", pid=None, priority=1):
        """Creates and enqueues a new disk request."""
        with kernel_state.lock:
            # Prevent track overflow
            max_tracks = kernel_state.disk_state.get("max_tracks", 100)
            track = max(0, min(track, max_tracks - 1))
            
            request = {
                "id": str(uuid.uuid4())[:8],
                "pid": pid or "SYS",
                "track": track,
                "type": op_type,
                "timestamp": time.time(),
                "priority": priority,
                "status": "PENDING",
                "seek_cost": 0
            }
            
            kernel_state.disk_state["queue"].append(request)
            
            socket_bus.emit("DISK", "REQUEST_QUEUED", 
                           f"Request {request['id']} for Track {track} ({op_type})", "INFO")
            
            # If scheduler is idle, it will pick this up in next loop
            return request

    def generate_random_request(self):
        """Simulates random I/O activity."""
        max_tracks = kernel_state.disk_state.get("max_tracks", 100)
        track = random.randint(0, max_tracks - 1)
        op = random.choice(["READ", "WRITE"])
        pid = random.choice(list(kernel_state.processes.keys())) if kernel_state.processes else "SYS"
        return self.add_request(track, op, pid)

    def clear_queue(self):
        with kernel_state.lock:
            kernel_state.disk_state["queue"] = []
            kernel_state.disk_state["active_request"] = None
            socket_bus.emit("DISK", "RESET", "Disk request queue cleared.", "WARNING")

disk_request_manager = DiskRequestManager()
