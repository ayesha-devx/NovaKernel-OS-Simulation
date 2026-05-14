import time
import json
import threading
from monitoring.monitoring_utils import capped_append, Throttler

class SocketInspector:
    def __init__(self):
        self.traffic_history = []  # MAX 200
        self.metrics = {
            "emits_per_sec": 0,
            "incoming_per_sec": 0,
            "avg_payload_size": 0,
            "max_payload_size": 0,
            "reconnect_count": 0,
            "active_listeners": 0,
            "latency_ms": 0,
            "total_bytes_sent": 0
        }
        self.health_score = 100
        self.warnings = []
        
        # Sliding windows for rate calculation (store timestamps)
        self._emit_timestamps = []
        self._incoming_timestamps = []
        self._rate_window = 10.0 # Calculate rates over last 10 seconds for stability with sparse events (pings)
        
        self.payload_sizes = [] # Rolling for avg
        self.last_update = time.time()
        
        self._lock = threading.Lock()
        self._id_counter = 0
        self.is_active = True
        
    def _get_next_id(self):
        self._id_counter += 1
        return self._id_counter

    def track_emit(self, event, *args, **kwargs):
        """Passive tracking of socket.emit calls."""
        if not self.is_active: return
        
        try:
            timestamp = time.time()
            # Calculate payload size
            payload_str = str(args) + str(kwargs)
            size = len(payload_str.encode('utf-8'))
            
            with self._lock:
                self._emit_timestamps.append(timestamp)
                self.metrics["total_bytes_sent"] += size
                
                # Update max payload
                if size > self.metrics["max_payload_size"]:
                    self.metrics["max_payload_size"] = size
                
                # Store in history (Filter out internal monitoring noise for cleaner UI)
                internal_events = [
                    "SOCKET_TELEMETRY_UPDATE", 
                    "PROFILER_METRICS_UPDATE", 
                    "PERFORMANCE_UPDATE", 
                    "DIAGNOSTICS_UPDATE", 
                    "WATCHDOG_HEALTH_UPDATE",
                    "TRACE_EVENT_UPDATE",
                    "RUNTIME_STABILITY_UPDATE",
                    "RESOURCE_PRESSURE_UPDATE",
                    "HAL_LOG",
                    "ANALYTICS_METRICS_UPDATE",
                    "PING_STAMP",
                    "REQUEST_BOOT_STATUS",
                    "REQUEST_SOCKET_DIAGNOSTICS",
                    "REQUEST_MONITORING_DATA"
                ]
                if event not in internal_events:
                    entry = {
                        "id": self._get_next_id(),
                        "type": "OUTGOING",
                        "event": event,
                        "size": size,
                        "timestamp": timestamp
                    }
                    # We use a larger history internally, UI slices it
                    self.traffic_history.append(entry)
                    if len(self.traffic_history) > 200:
                        self.traffic_history.pop(0)
                
                # Add to payload sizes for rolling average
                self.payload_sizes.append(size)
                if len(self.payload_sizes) > 100:
                    self.payload_sizes.pop(0)
                
                # Check for oversized payloads
                if size > 1024 * 100: # 100KB warning (raised from 50KB for analytics updates)
                    self._add_warning("OVERSIZED_PAYLOAD", f"Event '{event}' sent {round(size/1024, 1)} KB", severity="WARNING")
        except:
            pass # Fail silently

    def track_incoming(self, event, data=None):
        """Passive tracking of incoming socket events."""
        if not self.is_active: return
        
        try:
            timestamp = time.time()
            size = len(str(data).encode('utf-8')) if data else 0
            
            with self._lock:
                self._incoming_timestamps.append(timestamp)
                
                # Filter out noise from history but NOT from rate metrics
                noise_events = ["PING_STAMP", "REQUEST_MONITORING_DATA", "REQUEST_SOCKET_DIAGNOSTICS"]
                if event not in noise_events:
                    entry = {
                        "id": self._get_next_id(),
                        "type": "INCOMING",
                        "event": event,
                        "size": size,
                        "timestamp": timestamp
                    }
                    self.traffic_history.append(entry)
                    if len(self.traffic_history) > 200:
                        self.traffic_history.pop(0)
                
                # Check for floods
                recent_incoming = [t for t in self._incoming_timestamps if timestamp - t < 1.0]
                if len(recent_incoming) > 50:
                    self._add_warning("EVENT_FLOOD", "High frequency of incoming events detected", severity="CRITICAL")
        except:
            pass

    def update_metrics(self):
        """Calculate rates and scores using sliding windows."""
        now = time.time()
        
        with self._lock:
            # 1. Clean up old timestamps
            self._emit_timestamps = [t for t in self._emit_timestamps if now - t < self._rate_window]
            self._incoming_timestamps = [t for t in self._incoming_timestamps if now - t < self._rate_window]
            
            # 2. Calculate rates (Events / Window Duration)
            self.metrics["emits_per_sec"] = round(len(self._emit_timestamps) / self._rate_window, 2)
            self.metrics["incoming_per_sec"] = round(len(self._incoming_timestamps) / self._rate_window, 2)
            
            # 3. Average payload size
            if self.payload_sizes:
                self.metrics["avg_payload_size"] = round(sum(self.payload_sizes) / len(self.payload_sizes), 2)
            
            # 4. Calculate health score
            self._calculate_health()
            
            # 5. Expire warnings
            self.warnings = [w for w in self.warnings if now - w["timestamp"] < 60]
            self.last_update = now

    def _calculate_health(self):
        score = 100
        
        # Penalty for high latency (More graceful scaling)
        lat = self.metrics.get("latency_ms", 0)
        if lat > 200: score -= 15
        if lat > 500: score -= 25
        if lat > 1000: score -= 40
        
        # Penalty for reconnects
        score -= min(40, self.metrics.get("reconnect_count", 0) * 10)
        
        # Penalty for large payloads (>20KB avg is heavy for a kernel sim)
        avg_size = self.metrics.get("avg_payload_size", 0)
        if avg_size > 1024 * 20: score -= 10
        if avg_size > 1024 * 50: score -= 15
        
        # Penalty for high traffic (Congestion)
        if self.metrics["emits_per_sec"] > 30: score -= 20
        
        # Penalty for warnings
        score -= len(self.warnings) * 10
        
        self.health_score = max(0, score)

    def _add_warning(self, type, message, severity="WARNING"):
        now = time.time()
        # Deduplicate
        for w in self.warnings:
            if w["type"] == type:
                w["message"] = message
                w["timestamp"] = now
                w["severity"] = severity
                return
        
        self.warnings.append({
            "type": type,
            "message": message,
            "severity": severity,
            "timestamp": now
        })

    def get_snapshot(self):
        with self._lock:
            # Sort traffic by timestamp descending for the UI
            sorted_traffic = sorted(self.traffic_history, key=lambda x: x['timestamp'], reverse=True)
            
            return {
                "metrics": self.metrics.copy(),
                "health_score": self.health_score,
                "warnings": self.warnings.copy(),
                "traffic": sorted_traffic[:50] # UI only wants last 50
            }

socket_inspector = SocketInspector()
