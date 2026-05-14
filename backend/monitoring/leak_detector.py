import time
import threading
from monitoring.monitoring_state import monitoring_state
from monitoring.monitoring_utils import capped_append

class LeakDetector:
    """
    Passive runtime resource leak analysis engine.
    Heuristic-based observability to detect memory growth, queue overgrowth, 
    telemetry floods, and duplicate listeners without destabilizing the kernel.
    """
    def __init__(self):
        self.is_running = False
        self.thread = None
        self.socketio = None
        
        # Configuration
        self.check_interval = 2.0  # Seconds
        self.history_limit = 50    # Samples to keep for trend analysis
        
        # State
        self.warnings = {}  # id -> warning_dict
        self.trends = {
            "memory": [],
            "queue": [],
            "telemetry": [],
            "snapshots": []
        }
        
        # Scoring components
        self.scores = {
            "memory": 100,
            "queue": 100,
            "telemetry": 100,
            "stability": 100
        }

    def start(self, socketio=None):
        if self.is_running:
            return
        self.socketio = socketio
        self.is_running = True
        self.thread = threading.Thread(target=self._analysis_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.is_running = False

    def _analysis_loop(self):
        print("[LEAK_DETECTOR] Passive Leak Analysis Engine started.")
        while self.is_running:
            try:
                self._collect_trends()
                self._analyze_leaks()
                self._update_scores()
                self._expire_warnings()
                self._emit_status()
            except Exception as e:
                print(f"[LEAK_DETECTOR] Analysis Error: {str(e)}")
            time.sleep(self.check_interval)

    def _collect_trends(self):
        """Pulls data from monitoring_state and keeps local history for trend detection."""
        metrics = monitoring_state.metrics
        
        # Memory
        if metrics.get("memory_usage"):
            val = metrics["memory_usage"][-1]["value"]
            self._push_trend("memory", val)
            
        # Queues
        if metrics.get("queue_sizes"):
            val = metrics["queue_sizes"][-1]["value"]
            self._push_trend("queue", val)
            
        # Telemetry Rate
        if metrics.get("socket_emits"):
            val = metrics["socket_emits"][-1]["value"]
            self._push_trend("telemetry", val)

        # Snapshots
        try:
            from storage.snapshot_engine import snapshot_engine
            self._push_trend("snapshots", float(len(snapshot_engine.snapshots)))
        except:
            pass

    def _push_trend(self, key, value):
        self.trends[key].append(value)
        if len(self.trends[key]) > self.history_limit:
            self.trends[key].pop(0)

    def _analyze_leaks(self):
        # 1. Memory Leak Detection (Consistent upward trend)
        mem_history = self.trends["memory"]
        if len(mem_history) >= 20:
            growth = mem_history[-1] - mem_history[0]
            if growth > 5.0:  # 5MB growth in ~40s window
                self._report_warning("MEM_LEAK_01", "Possible memory growth trend detected.", "HIGH", "Memory")
            elif growth > 2.0:
                self._report_warning("MEM_LEAK_02", "Minor memory drift observed.", "LOW", "Memory")

        # 2. Queue Overgrowth
        q_history = self.trends["queue"]
        if q_history:
            current_q = q_history[-1]
            if current_q > 100:
                self._report_warning("QUEUE_MAX_01", "Process queue exceeding performance limits.", "CRITICAL", "Scheduler")
            elif current_q > 40:
                self._report_warning("QUEUE_HIGH_01", "Elevated queue pressure detected.", "MEDIUM", "Scheduler")

        # 3. Telemetry Flooding
        tel_history = self.trends["telemetry"]
        if tel_history:
            avg_rate = sum(tel_history[-5:]) / 5 if len(tel_history) >= 5 else tel_history[-1]
            if avg_rate > 150:
                self._report_warning("FLOOD_01", "Critical telemetry flood detected.", "CRITICAL", "Socket")
            elif avg_rate > 60:
                self._report_warning("FLOOD_02", "High socket emission frequency.", "MEDIUM", "Socket")

        # 4. Snapshot Accumulation
        snap_history = self.trends["snapshots"]
        if snap_history and snap_history[-1] > 12:
            self._report_warning("SNAP_GROWTH", "Large number of system snapshots may impact stability.", "LOW", "Storage")

    def _update_scores(self):
        # Calculate individual health scores
        
        # Memory Score (100 -> 0)
        mem_score = 100
        if self.trends["memory"] and len(self.trends["memory"]) > 5:
            growth = self.trends["memory"][-1] - self.trends["memory"][0]
            mem_score -= min(60, max(0, growth * 10))
        self.scores["memory"] = mem_score

        # Queue Score
        q_score = 100
        if self.trends["queue"]:
            q_score -= min(80, (self.trends["queue"][-1] / 1.5))
        self.scores["queue"] = q_score

        # Telemetry Score
        tel_score = 100
        if self.trends["telemetry"]:
            tel_score -= min(90, (self.trends["telemetry"][-1] / 2))
        self.scores["telemetry"] = tel_score

        # Combined Stability Score
        self.scores["stability"] = (mem_score * 0.4 + q_score * 0.3 + tel_score * 0.3)

    def _report_warning(self, id, message, severity, subsystem):
        now = time.time()
        self.warnings[id] = {
            "id": id,
            "message": message,
            "severity": severity,
            "subsystem": subsystem,
            "timestamp": now,
            "trend": "INCREASING",
            "recommendation": self._get_recommendation(id)
        }
        
        # Immediate emit for criticals
        if severity == "CRITICAL" and self.socketio:
            self.socketio.emit("RESOURCE_PRESSURE_UPDATE", self.warnings[id])

    def _get_recommendation(self, id):
        recommendations = {
            "MEM_LEAK_01": "Verify if process creation and termination are balanced.",
            "QUEUE_MAX_01": "Reduce workload or increase scheduler dispatch frequency.",
            "FLOOD_01": "Throttle diagnostic events or reduce trace resolution.",
            "SNAP_GROWTH": "Clear old system snapshots to reclaim memory."
        }
        return recommendations.get(id, "Monitor subsystem performance for stability.")

    def _expire_warnings(self):
        now = time.time()
        # Warnings expire if not refreshed for 15 seconds
        expired_keys = [k for k, v in self.warnings.items() if now - v["timestamp"] > 15]
        for k in expired_keys:
            del self.warnings[k]

    def _emit_status(self):
        if not self.socketio:
            return
            
        # Throttled status emit (every 2s by loop)
        status = {
            "stability_score": self.scores["stability"],
            "resource_scores": self.scores,
            "warnings": list(self.warnings.values()),
            "pressure_levels": {
                "memory": self._get_pressure_level("memory"),
                "queue": self._get_pressure_level("queue"),
                "telemetry": self._get_pressure_level("telemetry")
            }
        }
        self.socketio.emit("RUNTIME_STABILITY_UPDATE", status)
        
        # Update monitoring_state for other engines to see
        monitoring_state.performance_score = self.scores["stability"]
        monitoring_state.warning_count = len(self.warnings)

    def _get_pressure_level(self, key):
        score = self.scores.get(key, 100)
        if score > 85: return "LOW"
        if score > 60: return "MEDIUM"
        if score > 30: return "HIGH"
        return "CRITICAL"

leak_detector = LeakDetector()
