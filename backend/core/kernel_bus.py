import time
import uuid
import threading
from datetime import datetime

class KernelEvent:
    def __init__(self, module, event_type, message, severity="INFO", metadata=None):
        self.id = str(uuid.uuid4())
        self.timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        self.module = module
        self.event_type = event_type
        self.message = message
        self.severity = severity # INFO, SUCCESS, WARNING, ERROR, CRITICAL
        self.metadata = metadata or {}

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "module": self.module,
            "event_type": self.event_type,
            "message": self.message,
            "severity": self.severity,
            "metadata": self.metadata
        }

class KernelBus:
    def __init__(self):
        self.socketio = None
        self.logs = []
        self.max_logs = 200
        self.lock = threading.Lock()
        self.event_handlers = []

    def set_socket(self, socketio):
        self.socketio = socketio

    def emit(self, module, event_type, message, severity="INFO", metadata=None, broadcast=True):
        event = KernelEvent(module, event_type, message, severity, metadata)
        
        with self.lock:
            self.logs.append(event.to_dict())
            if len(self.logs) > self.max_logs:
                self.logs.pop(0)

        # Log to terminal for backend debugging
        print(f"[{event.timestamp}] [{module}] {severity}: {message}")

        if self.socketio and broadcast:
            # Emit specific event
            self.socketio.emit('kernel_event', event.to_dict())
            
        return event

    def log(self, module, message, severity="INFO", metadata=None):
        """Compatibility method for legacy modules"""
        return self.emit(module, "LOG", message, severity, metadata)

    def get_logs(self, module=None, severity=None):
        with self.lock:
            filtered = self.logs
            if module:
                filtered = [l for l in filtered if l['module'] == module]
            if severity:
                filtered = [l for l in filtered if l['severity'] == severity]
            return filtered

# Global Instance
kernel_bus = KernelBus()
