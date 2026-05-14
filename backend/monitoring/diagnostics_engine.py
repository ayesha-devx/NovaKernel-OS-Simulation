import time
import threading
from monitoring.monitoring_state import monitoring_state
from monitoring.monitoring_utils import format_severity
from kernel.kernel_state import kernel_state

class DiagnosticsEngine:
    def __init__(self):
        self.is_running = False
        self.thread = None
        
        self.scheduler = None
        self.analytics = None
        self.hardware = None
        self.ai_assistant = None
        self.snapshot_engine = None
        self.showcase_engine = None
        
        self.last_perf_update = time.time()

    def _init_dependencies(self):
        from os_modules.cpu_scheduler import scheduler_engine
        from analytics.analytics_engine import analytics_engine
        from hardware.hardware_state import hardware_state_manager
        # Graceful handling for optional systems
        try:
            from ai.nova_assistant import nova_assistant
            self.ai_assistant = nova_assistant
        except ImportError:
            self.ai_assistant = None
            
        try:
            from kernel.snapshot_engine import snapshot_engine
            self.snapshot_engine = snapshot_engine
        except ImportError:
            self.snapshot_engine = None
            
        try:
            from showcase.showcase_orchestrator import showcase_engine
            self.showcase_engine = showcase_engine
        except ImportError:
            self.showcase_engine = None

        self.scheduler = scheduler_engine
        self.analytics = analytics_engine
        self.hardware = hardware_state_manager
        
    def start(self):
        if self.is_running:
            return
        self._init_dependencies()
        self.is_running = True
        self.thread = threading.Thread(target=self._diagnostics_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.is_running = False

    def _check_subsystems(self):
        status = {}
        
        # Scheduler
        sched = kernel_state.scheduler_state
        status["scheduler"] = "ONLINE" if sched.get("is_running") else "OFFLINE"
        if sched.get("is_paused"): status["scheduler"] = "PAUSED"
             
        # Analytics
        analytics = kernel_state.analytics_state
        status["analytics"] = "ONLINE" if analytics.get("cpu_metrics", {}).get("utilization", 0) >= 0 else "OFFLINE"
        
        # Hardware
        hw = kernel_state.hardware_state
        status["hardware"] = "CONNECTED" if hw.get("connected") else "DISCONNECTED"
            
        # AI
        status["ai_assistant"] = "ONLINE" if self.ai_assistant else "OFFLINE"
        
        # Snapshot / Showcase
        status["snapshot"] = "READY" if self.snapshot_engine else "OFFLINE"
        status["showcase"] = "READY" if kernel_state.showcase.get("active") else "IDLE"
        
        monitoring_state.diagnostics["subsystems"] = status
        
    def _evaluate_health(self):
        score = 100
        warnings = []
        
        # Check Subsystems
        subs = monitoring_state.diagnostics["subsystems"]
        if subs.get("scheduler") == "OFFLINE":
            score -= 30
            warnings.append("Scheduler is offline")
        if subs.get("analytics") == "OFFLINE":
            score -= 10
            warnings.append("Analytics engine is offline")
            
        # Check Queues
        q_sizes = monitoring_state.metrics.get("queue_sizes", [])
        if q_sizes:
            latest_q = q_sizes[-1]["value"]
            if latest_q > 50:
                score -= 20
                warnings.append("High queue depth detected (>50)")
            elif latest_q > 20:
                score -= 5
                
        # Check Deadlocks
        is_currently_deadlocked = kernel_state.deadlock_state.get("is_deadlocked", False)
        if is_currently_deadlocked:
            score -= 40
            warnings.append("CRITICAL: System Deadlock Detected")
            monitoring_state.diagnostics["watchdog_status"] = "DEADLOCK"
            
        # Watchdog Check (Detect stalled performance thread or runaway growth)
        now = time.time()
        # If we were deadlocked but now we're not, reset status to OK first
        if not is_currently_deadlocked and monitoring_state.diagnostics["watchdog_status"] == "DEADLOCK":
            monitoring_state.diagnostics["watchdog_status"] = "OK"

        if now - monitoring_state.last_update > 5.0 and monitoring_state.diagnostics["watchdog_status"] != "DEADLOCK":
            monitoring_state.diagnostics["watchdog_status"] = "STALLED"
            score -= 20
            warnings.append("Monitoring thread appears stalled")
        elif monitoring_state.diagnostics["watchdog_status"] != "DEADLOCK":
            monitoring_state.diagnostics["watchdog_status"] = "OK"

        # Check runaway metrics buffer
        for key, val in monitoring_state.metrics.items():
            if len(val) > 150:
                score -= 10
                warnings.append(f"Runaway metric growth in {key}")
                
        score = max(0, min(100, score))
        monitoring_state.performance_score = score
        monitoring_state.backend_health = format_severity(score)
        
        # Cap warnings
        monitoring_state.diagnostics["warnings"] = warnings[-10:]
        monitoring_state.warning_count = len(warnings)

    def _diagnostics_loop(self):
        print("[MONITORING] Diagnostics Engine Loop Started")
        while self.is_running:
            try:
                self._check_subsystems()
                self._evaluate_health()
                
                # Heartbeat for Watchdog
                try:
                    from monitoring.runtime_watchdog import runtime_watchdog
                    runtime_watchdog.heartbeat("diagnostics_engine")
                except: pass
            except Exception as e:
                print(f"[MONITORING] Diagnostics Error: {str(e)}")
            time.sleep(2.0)

diagnostics_engine = DiagnosticsEngine()
