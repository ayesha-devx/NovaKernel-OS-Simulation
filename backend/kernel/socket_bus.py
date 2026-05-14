import threading
import time
import uuid
from datetime import datetime
from kernel.kernel_state import kernel_state

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

class SocketBus:
    """
    GLOBAL SOCKET EVENT BUS.
    Handles all realtime communication and event propagation.
    """
    def __init__(self):
        self.socketio = None
        self.lock = threading.Lock()
        self.event_count = 0
        self.last_reset = time.time()
        self._emit_history = [] # Rolling window for rate limiting
        self._max_emits_per_sec = 10 # Hard cap for ALL events
        self._throttled_types = {} # type -> last_emit for type-specific debouncing

    def set_socket(self, socketio):
        self.socketio = socketio

    def emit(self, module, event_type, message, severity="INFO", metadata=None, broadcast=True):
        """
        Broadcasts an event to all connected clients and updates kernel state.
        """
        event = KernelEvent(module, event_type, message, severity, metadata)
        event_dict = event.to_dict()

        # Update Kernel State logs
        with kernel_state.lock:
            kernel_state.event_logs.append(event_dict)
            
            # Track throughput
            self.event_count += 1
            now = time.time()
            if now - self.last_reset >= 1.0:
                kernel_state.socket_state["event_throughput"] = self.event_count
                self.event_count = 0
                self.last_reset = now
            
            kernel_state.socket_state["last_emit_timestamp"] = event.timestamp

        # Terminal Log
        if severity in ["ERROR", "CRITICAL", "WARNING"]:
            print(f"[{event.timestamp}] [{module}] {severity}: {message}")

        if self.socketio and broadcast:
            # GLOBAL RATE LIMITER: Prevent event storms
            now = time.time()
            with self.lock:
                self._emit_history = [t for t in self._emit_history if now - t < 1.0]
                
                if len(self._emit_history) < self._max_emits_per_sec:
                    safe_event = self._sanitize_payload(event_dict)
                    self.socketio.emit('kernel_event', safe_event)
                    self._emit_history.append(now)
                    
                    # TRACKING
                    try:
                        from monitoring.runtime_profiler import runtime_profiler
                        from monitoring.socket_inspector import socket_inspector
                        runtime_profiler.record_throughput()
                        socket_inspector.track_emit(f"kernel:{safe_event.get('event_type', 'event')}", safe_event)
                    except: pass
                else:
                    # Drop high-frequency events to protect UI stability
                    pass

        return event

    def throttled_emit(self, module, event_type, message, severity="INFO", min_interval=0.5):
        """
        Emits an event only if min_interval has passed since the last event of this type.
        """
        now = time.time()
        last_emit = self._throttled_types.get(event_type, 0)
        
        if now - last_emit >= min_interval:
            self._throttled_types[event_type] = now
            return self.emit(module, event_type, message, severity)
        return None

    def log(self, module, message, severity="INFO", metadata=None):
        """Standard logging interface."""
        return self.emit(module, "LOG", message, severity, metadata)

    def broadcast_state(self):
        """Force broadcast the entire kernel state with safety wrapper."""
        if self.socketio:
            try:
                state = kernel_state.get_full_state()
                safe_state = self._sanitize_payload(state)
                self.socketio.emit('kernel_state_updated', safe_state)
            except Exception as e:
                print(f"[SOCKET_ERROR] Broadcast failed: {e}")

    def throttled_broadcast_state(self, min_interval=0.3):
        """
        Broadcasts state only if enough time has passed since the last broadcast.
        Increased default interval for better frontend stability.
        """
        now = time.time()
        last_sync = getattr(self, '_last_throttled_sync', 0)
        
        if now - last_sync >= min_interval:
            self.broadcast_state()
            self._last_throttled_sync = now

    def _sanitize_payload(self, payload, memo=None):
        """Recursively converts all non-primitive objects and detects circular references."""
        if memo is None:
            memo = set()

        # Handle potential cycles
        obj_id = id(payload)
        if obj_id in memo:
            return "[Circular Reference]"
        
        if isinstance(payload, dict):
            memo.add(obj_id)
            return {str(k): self._sanitize_payload(v, memo) for k, v in payload.items()}
        elif isinstance(payload, (list, tuple)):
            memo.add(obj_id)
            return [self._sanitize_payload(item, memo) for item in payload]
        elif isinstance(payload, (int, float, bool, type(None), str)):
            return payload
        else:
            return str(payload)

    def emit_raw(self, event_name: str, payload: dict):
        if self.socketio:
            safe_payload = self._sanitize_payload(payload)
            self.socketio.emit(event_name, safe_payload)
            
            # TRACKING
            try:
                from monitoring.runtime_profiler import runtime_profiler
                from monitoring.socket_inspector import socket_inspector
                runtime_profiler.record_throughput()
                socket_inspector.track_emit(event_name, safe_payload)
            except: pass

# Global Instance
socket_bus = SocketBus()
