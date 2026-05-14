import time
from datetime import datetime

class BootEventBus:
    """
    Lightweight event bus for the Kernel Boot Manager.
    Handles throttled emission of boot progress and logs.
    """
    def __init__(self):
        self.socketio = None
        self.last_emit_time = 0
        self.emit_interval = 0.25  # 4 updates per second max

    def set_socket(self, socketio):
        self.socketio = socketio

    def emit_boot_update(self, state, progress, force=False):
        """Emits boot state and progress update (throttled)."""
        now = time.time()
        if force or (now - self.last_emit_time >= self.emit_interval):
            if self.socketio:
                self.socketio.emit('BOOT_STATE_UPDATE', {
                    'state': state,
                    'progress': progress,
                    'timestamp': time.time()
                })
                self.last_emit_time = now
                
                # TRACKING
                try:
                    from monitoring.runtime_profiler import runtime_profiler
                    from monitoring.socket_inspector import socket_inspector
                    runtime_profiler.record_throughput()
                    socket_inspector.track_emit('BOOT_STATE_UPDATE', {'progress': progress})
                except: pass

    def emit_boot_log(self, message, severity="INFO"):
        """Emits a boot log entry."""
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        log_entry = {
            'timestamp': timestamp,
            'message': message,
            'severity': severity
        }
        
        if self.socketio:
            self.socketio.emit('BOOT_LOG_APPEND', log_entry)
            
            # TRACKING
            try:
                from monitoring.runtime_profiler import runtime_profiler
                from monitoring.socket_inspector import socket_inspector
                runtime_profiler.record_throughput()
                socket_inspector.track_emit('BOOT_LOG_APPEND', log_entry)
            except: pass
            
        return log_entry

    def emit_boot_complete(self):
        """Signals that the boot sequence is finished."""
        if self.socketio:
            self.socketio.emit('BOOT_SEQUENCE_COMPLETE', {
                'status': 'SUCCESS',
                'timestamp': time.time()
            })

boot_event_bus = BootEventBus()
