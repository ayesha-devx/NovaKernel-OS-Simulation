import threading
import time
import traceback
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus
from analytics.metrics_collector import metrics_collector
from analytics.telemetry_buffer import telemetry_buffer
from analytics.timeline_engine import timeline_engine
from intelligence.kernel_intelligence import KernelIntelligenceEngine
from ai.kernel_ai_engine import kernel_ai_engine

class AnalyticsEngine:
    """
    CENTRAL ANALYTICS ORCHESTRATOR.
    Runs in a background thread, collects metrics, and emits updates.
    """
    def __init__(self, interval=0.5):
        self.interval = interval
        self.is_active = False
        self.thread = None
        self.lock = threading.Lock()
        self.last_emit_time = 0
        self.emit_interval = 1.5 # Throttle socket emissions to ~0.6Hz for stability
        self.intelligence_engine = KernelIntelligenceEngine()

    def start(self):
        """Starts the analytics collection background loop."""
        with self.lock:
            if not self.is_active:
                self.is_active = True
                self.thread = threading.Thread(target=self._analytics_loop, daemon=True)
                self.thread.start()
                print("[ANALYTICS] Engine started.")

    def stop(self):
        """Stops the analytics engine."""
        with self.lock:
            self.is_active = False

    def _analytics_loop(self):
        print(f"[ANALYTICS] Loop started with {self.interval}s interval.")
        self._consecutive_failures = 0
        
        while self.is_active:
            start_time = time.time()
            try:
                # 1. Collect real-time metrics
                all_metrics = metrics_collector.collect_all()
                if not all_metrics:
                    time.sleep(self.interval)
                    continue
                
                # 2. Update telemetry buffer
                telemetry_buffer.add_snapshot(all_metrics)
                
                # Track telemetry items for profiler
                try:
                    from monitoring.runtime_profiler import runtime_profiler
                    item_count = sum(len(v) if isinstance(v, (list, dict)) else 1 for v in all_metrics.values())
                    runtime_profiler.record_telemetry(item_count)
                except: pass
                
                # 3. Sync with Global Kernel State
                with kernel_state.lock:
                    kernel_state.analytics_state["cpu_metrics"] = all_metrics.get("cpu", {})
                    kernel_state.analytics_state["memory_metrics"] = all_metrics.get("memory", {})
                    kernel_state.analytics_state["disk_metrics"] = all_metrics.get("disk", {})
                    kernel_state.analytics_state["scheduler_metrics"] = all_metrics.get("scheduler", {})
                    kernel_state.analytics_state["hardware_metrics"] = all_metrics.get("hardware", {})
                    kernel_state.analytics_state["filesystem_metrics"] = all_metrics.get("filesystem", {})
                    
                    # Store recent timeline & telemetry in kernel state for quick API access
                    kernel_state.analytics_state["timeline"] = timeline_engine.get_recent_events(20)
                    kernel_state.analytics_state["telemetry"] = telemetry_buffer.get_recent(50)
                    
                    # Build intelligence report while we have the lock
                    try:
                        # Extract only needed raw state for intelligence analysis to avoid expensive full serialization
                        target_state = {
                            "deadlock": kernel_state.deadlock_state,
                            "processes": list(kernel_state.processes.values()),
                            "scheduler": kernel_state.scheduler_state,
                            "ready_queue": kernel_state.ready_queue
                        }
                        intelligence_report = self.intelligence_engine.analyze(target_state, all_metrics)
                        clean_report = socket_bus._sanitize_payload(intelligence_report)
                        kernel_state.analytics_state["intelligence_state"] = clean_report
                        
                        # Integrate AI Kernel Assistant Report
                        ai_report = kernel_ai_engine.get_live_intelligence()
                        kernel_state.analytics_state["ai_intelligence"] = ai_report
                    except Exception as ie:
                        print(f"[INTELLIGENCE_ERROR] Analysis failed: {str(ie)}")
                        intelligence_report = kernel_state.analytics_state.get("intelligence_state", {})
                        ai_report = kernel_state.analytics_state.get("ai_intelligence", {})

                # 4. Throttled Socket Emission (OUTSIDE the lock)
                now = time.time()
                if now - self.last_emit_time >= self.emit_interval:
                    # Include intelligence and historical buffers in the metrics update
                    payload = {
                        "cpu_metrics": all_metrics.get("cpu", {}),
                        "memory_metrics": all_metrics.get("memory", {}),
                        "disk_metrics": all_metrics.get("disk", {}),
                        "scheduler_metrics": all_metrics.get("scheduler", {}),
                        "hardware_metrics": all_metrics.get("hardware", {}),
                        "filesystem_metrics": all_metrics.get("filesystem", {}),
                        "ai_intelligence": ai_report,
                        "intelligence_state": intelligence_report,
                        "telemetry": telemetry_buffer.get_recent(10),
                        "timeline": timeline_engine.get_recent_events(10)
                    }
                    
                    socket_bus.emit_raw("ANALYTICS_METRICS_UPDATE", payload)
                    socket_bus.throttled_broadcast_state(min_interval=self.emit_interval)
                    self.last_emit_time = now
                
                # Reset failure counter on success
                self._consecutive_failures = 0

                # Heartbeat for Watchdog
                try:
                    from monitoring.runtime_watchdog import runtime_watchdog
                    from monitoring.runtime_profiler import runtime_profiler
                    runtime_watchdog.heartbeat("analytics_engine")
                    runtime_profiler.record_latency("analytics_engine", (time.time() - start_time) * 1000)
                except: pass

            except Exception as e:
                self._consecutive_failures += 1
                print(f"[ANALYTICS_ERROR] ({self._consecutive_failures}/5) Loop failure: {str(e)}")
                
                if self._consecutive_failures >= 5:
                    print("[ANALYTICS] CRITICAL: Multiple consecutive failures. Attempting engine reset...")
                    # Brief cooldown before retry
                    time.sleep(5)
                    self._consecutive_failures = 0
                    continue # Try again
                
                # Exponential backoff on failure
                time.sleep(min(10, self.interval * (2 ** self._consecutive_failures)))
            
            time.sleep(self.interval)

    def record_event(self, module, event_type, message, severity="INFO", pid=None, metadata=None):
        """Proxy method to record timeline events."""
        event = timeline_engine.record_event(module, event_type, message, severity, pid, metadata)
        # Immediately emit critical events via socket
        if severity in ["ERROR", "CRITICAL"]:
            socket_bus.emit("ANALYTICS", "CRITICAL_EVENT", event, "ERROR")
        return event

analytics_engine = AnalyticsEngine()
