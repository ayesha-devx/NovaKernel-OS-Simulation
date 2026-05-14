import time
from kernel.kernel_state import kernel_state

class DiskMetrics:
    """
    DISK METRICS ENGINE.
    Tracks seek distance, throughput, and efficiency.
    """
    def __init__(self):
        self.start_time = time.time()

    def record_seek(self, distance):
        with kernel_state.lock:
            kernel_state.disk_metrics["total_seek_distance"] += distance
            kernel_state.disk_metrics["total_requests_completed"] += 1
            
            completed = kernel_state.disk_metrics["total_requests_completed"]
            total_dist = kernel_state.disk_metrics["total_seek_distance"]
            
            if completed > 0:
                kernel_state.disk_metrics["avg_seek_distance"] = round(total_dist / completed, 2)
            
            # Throughput: requests per minute
            uptime_min = (time.time() - self.start_time) / 60
            if uptime_min > 0:
                kernel_state.disk_metrics["throughput"] = round(completed / uptime_min, 2)
            
            # Fake utilization based on movement
            kernel_state.disk_metrics["disk_utilization"] = min(100, round(completed * 0.5, 2))

    def reset(self):
        with kernel_state.lock:
            kernel_state.disk_metrics = {
                "total_seek_distance": 0,
                "avg_seek_distance": 0.0,
                "total_requests_completed": 0,
                "throughput": 0.0,
                "disk_utilization": 0.0
            }
            self.start_time = time.time()

disk_metrics = DiskMetrics()
