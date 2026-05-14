import datetime

class EventLogger:
    def __init__(self, socketio=None):
        self.logs = []
        self.max_logs = 100
        self.socketio = socketio

    def log(self, module, message, level="INFO"):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        log_entry = {
            "timestamp": timestamp,
            "module": module,
            "message": message,
            "level": level # INFO, SUCCESS, WARNING, ERROR
        }
        
        self.logs.append(log_entry)
        if len(self.logs) > self.max_logs:
            self.logs.pop(0)
            
        print(f"[{timestamp}] [{level}] [{module}] {message}")
        
        if self.socketio:
            self.socketio.emit('new_event_log', log_entry)

    def get_logs(self):
        return self.logs

    def clear_logs(self):
        self.logs = []
        if self.socketio:
            self.socketio.emit('logs_cleared')

# The instance will be initialized in app.py
event_logger = EventLogger()
