import time
from kernel.kernel_state import kernel_state

class MetricsCollector:
    """
    PASSIVE METRICS COLLECTOR.
    Safely reads state from various kernel modules without modifying them.
    """
    def __init__(self):
        pass

    def collect_cpu_metrics(self):
        """Extracts CPU and Process related metrics."""
        from os_modules.cpu_scheduler import scheduler_engine
        metrics = scheduler_engine.get_metrics()
        
        # Calculate process states
        states = {"READY": 0, "RUNNING": 0, "WAITING": 0, "TERMINATED": 0}
        for p in kernel_state.processes.values():
            if p.state in states:
                states[p.state] += 1

        return {
            "utilization": metrics.get("cpu_utilization", 0),
            "context_switches": metrics.get("context_switches", 0),
            "throughput": metrics.get("throughput", 0),
            "active_processes": states["RUNNING"] + states["READY"],
            "process_states": states,
            "idle_percent": 100 - metrics.get("cpu_utilization", 0)
        }

    def collect_memory_metrics(self):
        """Extracts Memory Manager metrics."""
        from os_modules.memory_manager import memory_manager
        stats = memory_manager.get_statistics()
        
        return {
            "utilization": stats.get("utilization", 0),
            "fragmentation": stats.get("fragmentation_percentage", 0),
            "external_fragmentation": stats.get("external_fragmentation", 0),
            "largest_free_block": stats.get("largest_free_block", 0),
            "used_mb": stats.get("used_memory", 0),
            "free_mb": stats.get("free_memory", 0),
            "block_count": stats.get("block_count", 0),
            "alloc_failures": stats.get("allocation_failures", 0)
        }

    def collect_disk_metrics(self):
        """Extracts Disk Scheduling metrics."""
        # Using disk_metrics from kernel_state
        dm = kernel_state.disk_metrics
        ds = kernel_state.disk_state
        
        return {
            "utilization": dm.get("disk_utilization", 0),
            "queue_depth": len(ds.get("queue", [])),
            "total_seek": dm.get("total_seek_distance", 0),
            "avg_seek": dm.get("avg_seek_distance", 0),
            "throughput": dm.get("throughput", 0)
        }

    def collect_scheduler_metrics(self):
        """Extracts deep scheduling efficiency metrics."""
        from kernel.lifecycle_engine import lifecycle_engine
        
        return {
            "avg_wait": lifecycle_engine.calculate_avg_metric("waiting_time"),
            "avg_turnaround": lifecycle_engine.calculate_avg_metric("turnaround_time"),
            "queue_length": len(kernel_state.ready_queue),
            "algorithm": kernel_state.scheduler_state.get("current_algorithm", "N/A")
        }

    def collect_filesystem_metrics(self):
        """Extracts File System metrics."""
        fs = kernel_state.file_system_state
        
        return {
            "file_count": len(fs.get("files", {})),
            "inode_usage": len(fs.get("inodes", [])),
            "storage_usage": fs.get("used_disk", 0),
            "storage_total": fs.get("total_disk", 8192)
        }

    def collect_hardware_metrics(self):
        """Extracts Hardware HAL metrics."""
        hw = kernel_state.hardware_state
        
        return {
            "connected": hw.get("connected", False),
            "simulation_mode": hw.get("simulation_mode", True),
            "uptime": hw.get("uptime", 0),
            "command_throughput": hw.get("cmd_count", 0) # if tracked
        }

    def collect_all(self):
        """Batch collection of all subsystem metrics."""
        return {
            "cpu": self.collect_cpu_metrics(),
            "memory": self.collect_memory_metrics(),
            "disk": self.collect_disk_metrics(),
            "scheduler": self.collect_scheduler_metrics(),
            "filesystem": self.collect_filesystem_metrics(),
            "hardware": self.collect_hardware_metrics()
        }

metrics_collector = MetricsCollector()
