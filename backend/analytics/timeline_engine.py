import time
import uuid
from collections import deque
import threading

class KernelTimelineEngine:
    """
    UNIFIED KERNEL TIMELINE ENGINE.
    Tracks discrete OS events (process lifecycle, memory ops, disk seeks, etc).
    """
    def __init__(self, max_events=200):
        self.max_events = max_events
        self.events = deque(maxlen=max_events)
        self.lock = threading.Lock()

    def record_event(self, module, event_type, message, severity="INFO", pid=None, metadata=None):
        """
        Records a new event in the timeline.
        """
        entry = {
            "id": str(uuid.uuid4())[:8],
            "timestamp": time.time(),
            "module": module.upper(),
            "event": event_type.upper(),
            "severity": severity.upper(), # INFO, WARN, ERROR, CRITICAL
            "message": message,
            "pid": pid,
            "metadata": metadata or {}
        }
        
        with self.lock:
            self.events.append(entry)
        
        return entry

    def get_recent_events(self, limit=100):
        """Returns the most recent timeline events."""
        with self.lock:
            event_list = list(self.events)
            return event_list[-limit:]

    def clear(self):
        """Wipes the timeline history."""
        with self.lock:
            self.events.clear()

    def export(self):
        """Returns the entire event log."""
        with self.lock:
            return list(self.events)

timeline_engine = KernelTimelineEngine()
