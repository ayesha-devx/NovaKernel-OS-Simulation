import time

class MonitoringState:
    def __init__(self):
        self.enabled = True
        self.backend_health = "HEALTHY"
        self.socket_health = "STABLE"
        self.performance_score = 100
        self.warning_count = 0
        self.last_update = time.time()
        self.metrics = {
            "memory_usage": [],
            "socket_emits": [],
            "active_processes": [],
            "queue_sizes": [],
            "telemetry_freq": [],
            "analytics_update_rate": [],
        }
        self.diagnostics = {
            "subsystems": {},
            "warnings": [],
            "watchdog_status": "OK"
        }
    
    def to_dict(self):
        return {
            "enabled": self.enabled,
            "backend_health": self.backend_health,
            "socket_health": self.socket_health,
            "performance_score": self.performance_score,
            "warning_count": self.warning_count,
            "last_update": self.last_update,
            "metrics": self.metrics,
            "diagnostics": self.diagnostics
        }

monitoring_state = MonitoringState()
