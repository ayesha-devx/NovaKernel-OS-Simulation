import time

class KernelAnalytics:
    def __init__(self):
        self.start_time = time.time()
        self.metrics = {
            "cpu_utilization": 0,
            "memory_utilization": 0,
            "disk_utilization": 0,
            "process_count": 0,
            "context_switches": 0,
            "avg_wait_time": 0,
            "throughput": 0,
            "fragmentation_percent": 0,
            "uptime": 0,
            "active_threads": 1,
            "health_score": 100
        }
        self.history = []
        self.max_history = 60 # 1 minute of 1s snapshots

    def update(self, kernel_state):
        """Calculates global metrics based on current kernel state"""
        self.metrics["uptime"] = int(time.time() - self.start_time)
        
        # CPU Metrics
        scheduler_metrics = kernel_state.get('scheduler', {}).get('metrics', {})
        self.metrics["cpu_utilization"] = scheduler_metrics.get('cpu_utilization', 0)
        self.metrics["context_switches"] = scheduler_metrics.get('context_switches', 0)
        self.metrics["throughput"] = scheduler_metrics.get('throughput', 0)
        self.metrics["avg_wait_time"] = scheduler_metrics.get('avg_waiting_time', 0)

        # Memory Metrics
        memory_stats = kernel_state.get('memory', {}).get('stats', {})
        self.metrics["memory_utilization"] = memory_stats.get('utilization', 0)
        self.metrics["fragmentation_percent"] = memory_stats.get('fragmentation_percentage', 0)

        # Storage Metrics
        fs_stats = kernel_state.get('filesystem', {}).get('stats', {})
        self.metrics["disk_utilization"] = fs_stats.get('utilization', 0)
        
        # Process Metrics
        self.metrics["process_count"] = len(kernel_state.get('processes', []))

        # Health Calculation
        self._calculate_health()

        # Save to history
        self.history.append({
            "timestamp": time.time(),
            "cpu": self.metrics["cpu_utilization"],
            "mem": self.metrics["memory_utilization"]
        })
        if len(self.history) > self.max_history:
            self.history.pop(0)

        return self.metrics

    def _calculate_health(self):
        score = 100
        # Penalize for high fragmentation
        if self.metrics["fragmentation_percent"] > 20: score -= 10
        if self.metrics["fragmentation_percent"] > 40: score -= 20
        
        # Penalize for memory pressure
        if self.metrics["memory_utilization"] > 90: score -= 15
        
        # Penalize for CPU saturation
        if self.metrics["cpu_utilization"] > 95: score -= 10
        
        self.metrics["health_score"] = max(0, score)

    def get_summary(self):
        return self.metrics

# Global Instance
kernel_analytics = KernelAnalytics()
