import time
from collections import deque
import threading
import copy

class TelemetryBuffer:
    """
    THREAD-SAFE ROLLING TELEMETRY BUFFER.
    Maintains a capped history of system-wide metric snapshots.
    """
    def __init__(self, max_snapshots=100):
        # last 5 minutes of data at 1Hz (approx)
        self.max_snapshots = max_snapshots
        self.snapshots = deque(maxlen=max_snapshots)
        self.lock = threading.Lock()

    def add_snapshot(self, metrics):
        """
        Adds a new timestamped snapshot to the buffer.
        metrics: dict containing cpu, memory, disk, etc.
        """
        safe_metrics = copy.deepcopy(metrics)
        snapshot = {
            "timestamp": time.time(),
            "data": safe_metrics
        }
        with self.lock:
            self.snapshots.append(snapshot)

    def get_recent(self, count=50):
        """Returns the last N snapshots."""
        with self.lock:
            snap_list = list(self.snapshots)
            return snap_list[-count:]

    def clear(self):
        """Purges all telemetry history."""
        with self.lock:
            self.snapshots.clear()

    def export(self):
        """Exports the entire buffer for analysis or replay."""
        with self.lock:
            return list(self.snapshots)

telemetry_buffer = TelemetryBuffer()
