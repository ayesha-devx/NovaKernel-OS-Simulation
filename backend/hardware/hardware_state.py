import time
import threading
from kernel.kernel_state import kernel_state

class HardwareState:
    def __init__(self):
        self.lock = threading.Lock()
        self.connected = False
        self.simulation_mode = True
        self.port = None
        self.latency_ms = 0
        self.last_command = None
        self.last_sync = time.time()
        self.reconnect_attempts = 0
        self.hardware_uptime = 0
        self.boot_time = time.time()
        
        # LED & Buzzer States (Mirroring the 3 Slots)
        # slot: { "READY": bool, "RUNNING": bool, "WAITING": bool }
        self.led_states = {
            1: {"READY": False, "RUNNING": False, "WAITING": False},
            2: {"READY": False, "RUNNING": False, "WAITING": False},
            3: {"READY": False, "RUNNING": False, "WAITING": False}
        }
        self.special_leds = {
            "DEADLOCK": False,
            "DISK": False,
            "TERMINATION": False
        }
        self.buzzer_active = False
        self.command_history = []
        self.max_history = 50

    def update_uptime(self):
        self.hardware_uptime = round(time.time() - self.boot_time, 2)

    def set_simulation_mode(self, enabled):
        with self.lock:
            self.simulation_mode = enabled

    def to_dict(self):
        with self.lock:
            self.update_uptime()
            return {
                "connected": self.connected,
                "simulation_mode": self.simulation_mode,
                "mode": "SIMULATION" if self.simulation_mode else "REAL",
                "status": "SIMULATION" if self.simulation_mode else ("READY" if self.connected else "READY"), # Requirement says READY for REAL
                "port": "VIRTUAL" if self.simulation_mode else (self.port or "COM_PENDING"),
                "latency_ms": self.latency_ms,
                "last_command": self.last_command,
                "last_sync": time.strftime("%H:%M:%S", time.localtime(self.last_sync)),
                "reconnect_attempts": self.reconnect_attempts,
                "uptime": self.hardware_uptime,
                "led_states": self.led_states,
                "special_leds": self.special_leds,
                "buzzer_active": self.buzzer_active,
                "command_history": self.command_history[-10:] # Recent 10 for quick sync
            }

    def log_command(self, command):
        with self.lock:
            self.last_command = command
            self.last_sync = time.time()
            self.command_history.append({
                "command": command,
                "timestamp": time.strftime("%H:%M:%S")
            })
            
            # --- TRACE HOOK ---
            try:
                from monitoring.event_trace_engine import event_trace_engine
                event_trace_engine.trace(
                    subsystem="HARDWARE",
                    severity="INFO",
                    category="HARDWARE",
                    title="Hardware Command",
                    description=f"Serial packet transmitted: {command}",
                    metadata={"command": command}
                )
            except: pass

            if len(self.command_history) > self.max_history:
                self.command_history.pop(0)

# Global Instance
hardware_state_manager = HardwareState()
