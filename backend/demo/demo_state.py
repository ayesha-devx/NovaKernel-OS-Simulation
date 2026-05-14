import threading
import time

class DemoState:
    """
    GLOBAL DEMO STATE MANAGER.
    Tracks the lifecycle and progress of cinematic showcase sequences.
    """
    def __init__(self):
        self.active = False
        self.current_sequence = "IDLE"  # BOOT, CPU, MEMORY, DISK, DEADLOCK, FINALIZE
        self.progress = 0
        self.paused = False
        self.playback_speed = 1.0
        self.current_step = ""
        self.start_time = 0
        self.error = None
        self.lock = threading.Lock()

    def update(self, **kwargs):
        with self.lock:
            for key, value in kwargs.items():
                if hasattr(self, key):
                    setattr(self, key, value)

    def to_dict(self):
        with self.lock:
            return {
                "active": self.active,
                "current_sequence": self.current_sequence,
                "progress": self.progress,
                "paused": self.paused,
                "playback_speed": self.playback_speed,
                "current_step": self.current_step,
                "uptime": round(time.time() - self.start_time, 1) if self.active else 0,
                "error": self.error
            }

demo_state = DemoState()
