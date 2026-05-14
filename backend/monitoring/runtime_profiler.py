import time
import threading
import collections
from typing import Dict, List, Any

class RuntimeProfiler:
    """
    Passive Runtime Profiler for NovaKernel.
    Tracks socket throughput, subsystem latencies, and telemetry pressure.
    """
    def __init__(self, socket_bus=None):
        self.socket_bus = socket_bus
        self.metrics = {
            "socket_throughput": collections.deque(maxlen=200),
            "telemetry_pressure": collections.deque(maxlen=200),
            "subsystem_latencies": {},  # name: deque
            "event_processing_time": collections.deque(maxlen=200),
            "monitoring_overhead": collections.deque(maxlen=200)
        }
        
        self.throughput_counter = 0
        self.telemetry_counter = 0
        self.last_reset = time.time()
        
        self.warnings = []
        self.is_running = False
        self._lock = threading.Lock()
        self._thread = None

    def start(self, socket_bus=None):
        with self._lock:
            if socket_bus:
                self.socket_bus = socket_bus
            if not self.is_running:
                self.is_running = True
                self._thread = threading.Thread(target=self._profiler_loop, daemon=True)
                self._thread.start()

    def stop(self):
        self.is_running = False

    def record_throughput(self, count=1):
        """Record socket emission event."""
        with self._lock:
            self.throughput_counter += count

    def record_telemetry(self, count=1):
        """Record telemetry data point emission."""
        with self._lock:
            self.telemetry_counter += count

    def record_latency(self, subsystem: str, duration_ms: float):
        """Record processing duration for a subsystem."""
        with self._lock:
            if subsystem not in self.metrics["subsystem_latencies"]:
                self.metrics["subsystem_latencies"][subsystem] = collections.deque(maxlen=100)
            self.metrics["subsystem_latencies"][subsystem].append(duration_ms)

    def _profiler_loop(self):
        while self.is_running:
            try:
                time.sleep(0.5)  # 2 updates per second
                self._generate_snapshot()
            except Exception:
                continue

    def _generate_snapshot(self):
        now = time.time()
        elapsed = now - self.last_reset
        if elapsed <= 0: return

        with self._lock:
            # Calculate rates
            throughput_rate = self.throughput_counter / elapsed
            telemetry_rate = self.telemetry_counter / elapsed
            
            self.metrics["socket_throughput"].append(throughput_rate)
            self.metrics["telemetry_pressure"].append(telemetry_rate)
            
            # Reset counters
            self.throughput_counter = 0
            self.telemetry_counter = 0
            self.last_reset = now

            # Aggregate subsystem latencies
            subsystem_summary = {}
            for name, history in self.metrics["subsystem_latencies"].items():
                if history:
                    subsystem_summary[name] = round(sum(history) / len(history), 2)
                else:
                    subsystem_summary[name] = 0

            # Calculate Performance Score
            perf_score = self._calculate_performance_score(throughput_rate, telemetry_rate, subsystem_summary)

            status = {
                "timestamp": now,
                "score": perf_score,
                "rates": {
                    "socket_throughput": round(throughput_rate, 1),
                    "telemetry_pressure": round(telemetry_rate, 1)
                },
                "latencies": subsystem_summary,
                "history": {
                    "throughput": list(self.metrics["socket_throughput"]),
                    "pressure": list(self.metrics["telemetry_pressure"])
                },
                "status": "OPTIMAL" if perf_score > 90 else "DEGRADED" if perf_score > 70 else "CRITICAL"
            }

            if self.socket_bus:
                self.socket_bus.emit('PROFILER_METRICS_UPDATE', status)

    def _calculate_performance_score(self, throughput, telemetry, latencies) -> float:
        score = 100.0
        
        # Socket Pressure (-10 points per 100 emits/sec over 500)
        if throughput > 500:
            score -= min(30, (throughput - 500) / 10)
            
        # Telemetry Pressure (-5 points per 1000 items/sec over 5000)
        if telemetry > 5000:
            score -= min(20, (telemetry - 5000) / 200)
            
        # Latency Penalties
        for name, lat in latencies.items():
            if lat > 50:  # >50ms processing is suspicious
                score -= min(15, (lat - 50) / 5)

        return max(0, min(100, score))

# Global Profiler Instance
runtime_profiler = RuntimeProfiler()

def get_profiler(socket_bus=None):
    if socket_bus:
        runtime_profiler.socket_bus = socket_bus
    return runtime_profiler
