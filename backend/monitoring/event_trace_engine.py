import time
import uuid
import threading
from collections import deque
from typing import Dict, List, Optional, Any

class EventTraceEngine:
    """
    Centralized passive kernel activity tracer.
    Maintains a rolling buffer of events and provides deduplication/throttling.
    """
    def __init__(self, max_history: int = 500):
        self._history = deque(maxlen=max_history)
        self._lock = threading.Lock()
        self._enabled = True
        
        # Deduplication state: (subsystem, category, title) -> (timestamp, count)
        self._last_events = {}
        self._dedup_threshold = 1.0  # Seconds
        
        # Warnings
        self._warnings = []
        self._storm_threshold = 20  # Events per second
        self._event_timestamps = deque(maxlen=100)

    def trace(self, 
              subsystem: str, 
              severity: str, 
              category: str, 
              title: str, 
              description: str, 
              metadata: Optional[Dict[str, Any]] = None,
              event_id: Optional[str] = None):
        """
        Passive trace hook. Wraps everything in try-except to ensure zero kernel impact.
        """
        if not self._enabled:
            return

        try:
            now = time.time()
            
            # 1. Storm Protection
            self._event_timestamps.append(now)
            if len(self._event_timestamps) >= 50:
                rate = len(self._event_timestamps) / (now - self._event_timestamps[0])
                if rate > self._storm_threshold:
                    self._add_warning("EVENT_STORM", f"High event rate detected: {rate:.1f} events/sec. Throttling active.")
                    if rate > self._storm_threshold * 2:
                        return # Drop event if extremely high

            # 2. Deduplication (Internal)
            dedup_key = (subsystem, category, title)
            if dedup_key in self._last_events and not event_id:
                last_time, count = self._last_events[dedup_key]
                if now - last_time < self._dedup_threshold:
                    self._last_events[dedup_key] = (last_time, count + 1)
                    return # Skip redundant event

            self._last_events[dedup_key] = (now, 1)

            # 3. Create Event
            event = {
                "id": event_id or str(uuid.uuid4())[:8],
                "timestamp": now,
                "subsystem": subsystem.upper(),
                "severity": severity.upper(),
                "category": category.upper(),
                "title": title,
                "description": description,
                "metadata": metadata or {}
            }

            with self._lock:
                self._history.append(event)

        except Exception as e:
            print(f"[TRACE_ENGINE] Internal Error: {str(e)}")
            # Fail silently to avoid kernel panic

    def _add_warning(self, type: str, message: str):
        warning = {
            "type": type,
            "message": message,
            "timestamp": time.time()
        }
        with self._lock:
            # Check if warning already exists recently
            if not any(w["type"] == type and (time.time() - w["timestamp"] < 5.0) for w in self._warnings):
                self._warnings.append(warning)
                if len(self._warnings) > 10:
                    self._warnings.pop(0)

    def get_history(self, limit: int = 100) -> List[Dict]:
        with self._lock:
            history = list(self._history)
            return history[-limit:]

    def get_warnings(self) -> List[Dict]:
        with self._lock:
            return list(self._warnings)

    def get_health(self) -> Dict:
        now = time.time()
        rate = 0
        if len(self._event_timestamps) > 1:
            rate = len(self._event_timestamps) / (now - self._event_timestamps[0])
        
        return {
            "status": "STABLE" if rate < self._storm_threshold else "BUSY",
            "event_rate": round(rate, 2),
            "buffer_usage": len(self._history),
            "enabled": self._enabled
        }

    def clear(self):
        with self._lock:
            self._history.clear()
            self._warnings.clear()
            self._last_events.clear()

    def remove_events_by_prefix(self, prefix: str):
        """Removes all events whose ID starts with the given prefix."""
        with self._lock:
            # We must recreate the deque to remove items effectively
            items = list(self._history)
            new_items = [e for e in items if not str(e.get("id", "")).startswith(prefix)]
            if len(new_items) != len(items):
                self._history = deque(new_items, maxlen=self._history.maxlen)

# Global Singleton
event_trace_engine = EventTraceEngine()
