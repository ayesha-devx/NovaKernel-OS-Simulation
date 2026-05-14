import time
import threading

class RecoveryTimeline:
    """
    RECOVERY TIMELINE ENGINE.
    Maintains a chronological, severity-tagged log of all deadlock recovery events.
    Thread-safe. Emits to frontend via socket bus.
    Max buffer: 200 events.
    """
    MAX_EVENTS = 200

    def __init__(self):
        self._lock = threading.Lock()
        self._events = []
        self._event_counter = 0

    def add_event(self, event_type: str, message: str, severity: str = "INFO", metadata: dict = None):
        """
        Add a timestamped event to the recovery timeline.
        Severity: INFO | WARNING | CRITICAL | SUCCESS
        """
        with self._lock:
            self._event_counter += 1
            event = {
                "id": self._event_counter,
                "timestamp": time.strftime("%H:%M:%S"),
                "epoch": time.time(),
                "type": event_type,
                "message": message,
                "severity": severity,
                "metadata": metadata or {}
            }
            self._events.append(event)
            # Enforce max buffer
            if len(self._events) > self.MAX_EVENTS:
                self._events = self._events[-self.MAX_EVENTS:]

            print(f"[RECOVERY_TIMELINE] [{severity}] {event_type}: {message}")
            return event

    def clear_timeline(self):
        """Wipe the timeline — called on full system reset."""
        with self._lock:
            self._events = []
            self._event_counter = 0
        print("[RECOVERY_TIMELINE] Timeline cleared.")

    def get_recent_events(self, n: int = 50) -> list:
        """Return the last N events, newest first."""
        with self._lock:
            return list(reversed(self._events[-n:]))

    def broadcast_timeline(self):
        """Push the latest timeline state to all connected clients."""
        from kernel.socket_bus import socket_bus
        events = self.get_recent_events(50)
        socket_bus.emit_raw("recovery_timeline_update", {"events": events})

    def get_all(self) -> list:
        with self._lock:
            return list(self._events)

# Global Instance
recovery_timeline = RecoveryTimeline()
