import time
import threading

class RuntimeWatchdog:
    """
    Monitors runtime stability and subsystem responsiveness.
    Tracks heartbeats from critical internal engines to detect stalls.
    """
    def __init__(self):
        self.is_running = False
        self.thread = None
        self.socketio = None
        
        # Subsystem tracking
        self.heartbeats = {}  # name -> last_timestamp
        self.stalled_subsystems = []
        self.health_score = 100
        self.uptime_start = time.time()
        
        # Thresholds
        self.stale_threshold = 10.0  # 10 seconds before considered stalled

    def start(self, socketio=None):
        if self.is_running:
            return
        self.socketio = socketio
        self.is_running = True
        self.thread = threading.Thread(target=self._watchdog_loop, daemon=True)
        self.thread.start()

    def heartbeat(self, subsystem_name):
        """Called by subsystems to signal they are alive."""
        self.heartbeats[subsystem_name] = time.time()

    def _watchdog_loop(self):
        print("[WATCHDOG] Runtime Stability Watchdog active.")
        while self.is_running:
            try:
                self._check_responsiveness()
                self._calculate_health()
                self._emit_health()
            except Exception as e:
                print(f"[WATCHDOG] Loop Error: {str(e)}")
            time.sleep(2.0)

    def _check_responsiveness(self):
        now = time.time()
        stalled = []
        for name, last_seen in self.heartbeats.items():
            if now - last_seen > self.stale_threshold:
                stalled.append({
                    "name": name,
                    "drift": round(now - last_seen, 1),
                    "status": "STALLED"
                })
        self.stalled_subsystems = stalled

    def _calculate_health(self):
        # Base score
        score = 100
        
        # 1. Deduct for stalled subsystems
        score -= len(self.stalled_subsystems) * 15
        
        # 2. Deduct for leak warnings (cross-reference)
        try:
            from monitoring.leak_detector import leak_detector
            warning_penalty = len(leak_detector.warnings) * 5
            score -= warning_penalty
        except:
            pass
            
        self.health_score = max(0, min(100, score))

    def _emit_health(self):
        if not self.socketio:
            return
            
        status = {
            "score": self.health_score,
            "stalled": self.stalled_subsystems,
            "heartbeats": {k: round(time.time() - v, 1) for k, v in self.heartbeats.items()},
            "uptime": round(time.time() - self.uptime_start, 1),
            "status": self._get_status_label()
        }
        self.socketio.emit("WATCHDOG_HEALTH_UPDATE", status)

    def _get_status_label(self):
        if self.health_score > 90: return "EXCELLENT"
        if self.health_score > 75: return "STABLE"
        if self.health_score > 50: return "DEGRADED"
        return "CRITICAL"

runtime_watchdog = RuntimeWatchdog()
