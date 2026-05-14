import time
import collections
import statistics

class KernelIntelligenceEngine:
    def __init__(self):
        # Historical buffers for forecasting (capped for performance)
        self.cpu_history = collections.deque(maxlen=60)
        self.mem_history = collections.deque(maxlen=60)
        self.disk_history = collections.deque(maxlen=60)
        self.recommendations = []
        self.max_recommendations = 10
        
    def reset(self):
        """Reset the intelligence engine state."""
        self.recommendations = []
        self.cpu_history.clear()
        self.mem_history.clear()
        self.disk_history.clear()
        
    def analyze(self, current_state, analytics_metrics):
        """
        Main entry point for intelligence analysis.
        Calculates health, detects anomalies, and generates insights.
        """
        # 1. Update History
        cpu_util = analytics_metrics.get('cpu', {}).get('utilization', 0)
        mem_util = analytics_metrics.get('memory', {}).get('utilization', 0)
        disk_util = analytics_metrics.get('disk', {}).get('utilization', 0)
        
        self.cpu_history.append(cpu_util)
        self.mem_history.append(mem_util)
        self.disk_history.append(disk_util)
        
        # 2. Calculate Subsystem Health Scores
        cpu_score = self._analyze_cpu(analytics_metrics.get('cpu', {}))
        mem_score = self._analyze_memory(analytics_metrics.get('memory', {}))
        disk_score = self._analyze_disk(analytics_metrics.get('disk', {}))
        deadlock_score = self._analyze_deadlock(current_state.get('deadlock', {}))
        
        # 3. Global Health Score
        global_score = (cpu_score * 0.3) + (mem_score * 0.25) + (disk_score * 0.2) + (deadlock_score * 0.25)
        global_score = max(0, min(100, global_score))
        
        # 4. Forecasting
        forecasts = self._generate_forecasts()
        
        # 5. Anomaly Detection & Insights
        insights = self._generate_insights(analytics_metrics, current_state)
        
        # 6. Deadlock Risk
        deadlock_risk = self._calculate_deadlock_risk(current_state)
        
        return {
            "health_score": round(global_score, 1),
            "health_status": self._get_health_status(global_score),
            "subsystem_scores": {
                "cpu": cpu_score,
                "memory": mem_score,
                "disk": disk_score,
                "deadlock": deadlock_score
            },
            "forecasts": forecasts,
            "recommendations": insights,
            "deadlock_risk": deadlock_risk,
            "anomalies": self._detect_anomalies(analytics_metrics)
        }

    def _get_health_status(self, score):
        if score >= 90: return "OPTIMAL"
        if score >= 70: return "STABLE"
        if score >= 50: return "DEGRADED"
        if score >= 30: return "WARNING"
        return "CRITICAL"

    def _analyze_cpu(self, cpu):
        score = 100
        util = cpu.get('utilization', 0)
        cs = cpu.get('context_switches', 0)
        
        # Deduct for high utilization
        if util > 80: score -= (util - 80) * 2
        elif util > 60: score -= (util - 60) * 0.5
        
        # Deduct for excessive context switching
        if cs > 100: score -= min(20, (cs - 100) / 10)
        
        return max(0, score)

    def _analyze_memory(self, mem):
        score = 100
        util = mem.get('utilization', 0)
        frag = mem.get('fragmentation', 0)
        
        if util > 90: score -= 40
        elif util > 70: score -= (util - 70) * 1.5
        
        if frag > 50: score -= (frag - 50) * 0.8
        
        return max(0, score)

    def _analyze_disk(self, disk):
        score = 100
        q_depth = disk.get('queue_depth', 0)
        
        if q_depth > 10: score -= 30
        elif q_depth > 5: score -= 15
        
        return max(0, score)

    def _analyze_deadlock(self, deadlock):
        if deadlock.get('is_deadlocked', False):
            return 0
        return 100

    def _calculate_deadlock_risk(self, state):
        deadlock_info = state.get('deadlock', {})
        if deadlock_info.get('is_deadlocked'): return "CRITICAL"
        
        # Analyze resource wait chains (heuristic)
        resource_cycles = deadlock_info.get('resource_cycles', [])
        if resource_cycles: return "HIGH"
        
        # Monitor blocked processes
        processes = state.get('processes', [])
        blocked_count = 0
        for p in processes:
            state_val = p.state if hasattr(p, 'state') else p.get('state')
            if state_val == 'WAITING':
                blocked_count += 1
        
        total_count = len(processes)
        
        if total_count > 0:
            blocked_ratio = blocked_count / total_count
            if blocked_ratio > 0.7: return "HIGH"
            if blocked_ratio > 0.4: return "MODERATE"
            
        return "LOW"

    def _generate_forecasts(self):
        def forecast_next(history, windows):
            if len(history) < 2: return {w: 0 for w in windows}
            
            # Simple linear trend based on last 10 points
            recent = list(history)[-10:]
            avg_delta = statistics.mean([recent[i] - recent[i-1] for i in range(1, len(recent))])
            current = history[-1]
            
            # Scale deltas for time windows (assuming 1s analysis interval)
            return {
                "10s": max(0, min(100, current + avg_delta * 10)),
                "30s": max(0, min(100, current + avg_delta * 30)),
                "60s": max(0, min(100, current + avg_delta * 60))
            }
            
        return {
            "cpu": forecast_next(self.cpu_history, [10, 30, 60]),
            "memory": forecast_next(self.mem_history, [10, 30, 60]),
            "disk": forecast_next(self.disk_history, [10, 30, 60])
        }

    def _generate_insights(self, metrics, state):
        new_insights = []
        
        # CPU Insights
        cpu = metrics.get('cpu', {})
        if cpu.get('utilization', 0) > 85:
            new_insights.append(self._create_insight("CRITICAL", "CPU", "Extreme CPU saturation detected. System responsiveness may drop.", 0.95))
        elif cpu.get('utilization', 0) > 60:
            new_insights.append(self._create_insight("WARNING", "CPU", "High CPU load. Consider reducing process fork frequency.", 0.8))
            
        if cpu.get('context_switches', 0) > 150:
            new_insights.append(self._create_insight("INFO", "SCHEDULER", "High context switching overhead. Round Robin quantum might be too low.", 0.75))

        # Memory Insights
        mem = metrics.get('memory', {})
        if mem.get('fragmentation', 0) > 40:
             new_insights.append(self._create_insight("WARNING", "MEMORY", "High external fragmentation detected. Large allocations may fail.", 0.85))
        if mem.get('utilization', 0) > 90:
             new_insights.append(self._create_insight("CRITICAL", "MEMORY", "Memory exhaustion imminent. System stability at risk.", 0.9))

        # Disk Insights
        disk = metrics.get('disk', {})
        if disk.get('queue_depth', 0) > 8:
             new_insights.append(self._create_insight("WARNING", "DISK", "Disk I/O congestion detected. SCAN algorithm recommended for high load.", 0.7))

        # Deadlock Insights
        deadlock = state.get('deadlock', {})
        if deadlock.get('is_deadlocked'):
             new_insights.append(self._create_insight("CRITICAL", "DEADLOCK", "SYSTEM DEADLOCK DETECTED. Immediate recovery action required.", 1.0))
        elif self._calculate_deadlock_risk(state) == "HIGH":
             new_insights.append(self._create_insight("WARNING", "DEADLOCK", "High risk of circular wait detected in resource allocation.", 0.8))

        # Scheduler Inactivity Insight
        scheduler = state.get('scheduler', {})
        ready_queue = state.get('ready_queue', [])
        if len(ready_queue) > 5 and not scheduler.get('is_running', False):
             new_insights.append(self._create_insight("WARNING", "SCHEDULER", "Processes are waiting in queue but Scheduler is inactive. Run 'dispatch' to start execution.", 1.0))

        # Default "Healthy" insight if none exist
        if not new_insights and not self.recommendations:
             new_insights.append(self._create_insight("SUCCESS", "SYSTEM", "Kernel vectors are stable. Heuristic Engine reporting optimal execution.", 1.0))

        # Maintain global recommendation list (Strict cap to prevent deep object trees)
        # Maintain global recommendation list
        # 1. Remove stale critical alerts that are no longer in new_insights
        # This ensures that once a deadlock or extreme load is gone, the recommendation disappears
        active_messages = [insight['message'] for insight in new_insights]
        self.recommendations = [
            r for r in self.recommendations 
            if r['severity'] not in ["CRITICAL", "WARNING"] or r['message'] in active_messages
        ]

        # 2. Add new unique insights
        for insight in new_insights:
            # Avoid duplicate recent messages
            if not any(r['message'] == insight['message'] for r in self.recommendations):
                self.recommendations.insert(0, insight)
        
        # 3. Cap the list
        self.recommendations = self.recommendations[:5]
        return self.recommendations

    def _create_insight(self, severity, subsystem, message, confidence):
        return {
            "id": int(time.time() * 1000),
            "timestamp": time.time(),
            "severity": severity,
            "subsystem": subsystem,
            "message": message,
            "confidence": round(confidence * 100, 1)
        }

    def _detect_anomalies(self, metrics):
        anomalies = []
        # Sudden CPU Spike
        if len(self.cpu_history) > 5:
            last_avg = sum(list(self.cpu_history)[-5:-1]) / 4
            current = self.cpu_history[-1]
            if current > last_avg + 40:
                anomalies.append({"type": "SPIKE", "subsystem": "CPU", "value": current})
                
        # Memory Leak Pattern (Simplified)
        if len(self.mem_history) > 10:
            increasing = all(self.mem_history[i] >= self.mem_history[i-1] for i in range(len(self.mem_history)-10, len(self.mem_history)))
            if increasing and self.mem_history[-1] > 80:
                anomalies.append({"type": "LEAK_PATTERN", "subsystem": "MEMORY", "value": self.mem_history[-1]})
                
        return anomalies
