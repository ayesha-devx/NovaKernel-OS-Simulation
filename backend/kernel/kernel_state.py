import threading
import time
from datetime import datetime
from collections import deque

class KernelState:
    """
    SINGLE SOURCE OF TRUTH for the entire NovaKernel OS.
    Maintains all subsystem states in a centralized, thread-safe manner.
    """
    def __init__(self):
        self.lock = threading.RLock()
        
        # System Information
        self.version = "1.1.0-STABLE-KERNEL"
        self.boot_time = time.time()
        self.status = "BOOTING"
        self.uptime = 0
        self.health_score = 100
        
        # Subsystem States
        self.hardware_state = {}     # Hardware HAL State
        self.processes = {}          # PID -> Process Object
        self.ready_queue = []        # List of PIDs
        self.scheduler_state = {
            "current_algorithm": "ROUND_ROBIN",
            "is_running": False,
            "current_process": None, # PID
            "quantum_left": 0
        }
        self.memory_map = {
            "blocks": [],
            "total_ram": 4096,
            "used_ram": 0,
            "fragmentation": 0,
            "external_fragmentation": 0,
            "largest_free_block": 4096
        }
        self.file_system_state = {
            "files": {},
            "inodes": [],
            "used_disk": 0,
            "total_disk": 8192 # MB
        }
        self.deadlock_state = {
            "is_deadlocked": False,
            "detected_pids": [],
            "detection_timestamp": None,
            "resource_cycles": [] # List of PIDs/RIDs in cycle
        }
        
        self.resource_state = {
            "resources": {
                "R1": {"id": "R1", "name": "System Printer", "type": "IO", "allocated_to": None, "waiting_pids": []},
                "R2": {"id": "R2", "name": "Primary Disk", "type": "STORAGE", "allocated_to": None, "waiting_pids": []},
                "R3": {"id": "R3", "name": "File System Lock", "type": "SOFTWARE", "allocated_to": None, "waiting_pids": []},
                "R4": {"id": "R4", "name": "Network Socket", "type": "NETWORK", "allocated_to": None, "waiting_pids": []},
                "R5": {"id": "R5", "name": "Graphics Buffer", "type": "IO", "allocated_to": None, "waiting_pids": []},
                "R6": {"id": "R6", "name": "Memory Controller", "type": "CORE", "allocated_to": None, "waiting_pids": []}
            }
        }
        
        # Communication & Monitoring
        self.socket_state = {
            "connected_clients": 0,
            "last_emit_timestamp": None,
            "event_throughput": 0 # events/sec
        }
        self.max_logs = 200
        self.event_logs = deque(maxlen=self.max_logs)
        
        # Metrics
        self.metrics = {
            "cpu_utilization": 0,
            "ram_pressure": 0,
            "process_throughput": 0,
            "avg_wait_time": 0,
            "avg_turnaround_time": 0
        }

        # Subsystem Health
        self.subsystem_health = {
            "process_manager": "HEALTHY",
            "scheduler": "HEALTHY",
            "memory_manager": "HEALTHY",
            "file_system": "HEALTHY",
            "socket_bus": "HEALTHY",
            "hardware_hal": "HEALTHY"
        }

        # --- Phase 4 Extensions (Safe / Additive) ---
        # Recovery Timeline: chronological event log for the UI timeline panel
        self.recovery_timeline = []

        # Recovery Metrics: aggregated statistics for the analytics dashboard
        self.recovery_metrics = {
            "total_deadlocks": 0,
            "successful_recoveries": 0,
            "failed_recoveries": 0,
            "avg_recovery_time_s": 0.0,
            "last_recovery_duration_s": 0.0,
        }

        # Animation Phase: current live recovery animation phase
        self.recovery_animation_phase = "IDLE"

        # --- Module 7: Disk Scheduling System ---
        self.disk_state = {
            "current_track": 0,
            "head_direction": 1, # 1 for UP, -1 for DOWN
            "is_moving": False,
            "current_algorithm": "FCFS",
            "queue": [],         # List of Request Dicts
            "active_request": None,
            "completed_requests": [],
            "max_tracks": 100,    # Default 0-99 tracks
            "head_path": []      # Visual track history
        }

        self.disk_metrics = {
            "total_seek_distance": 0,
            "avg_seek_distance": 0.0,
            "total_requests_completed": 0,
            "throughput": 0.0,
            "disk_utilization": 0.0
        }

        # --- Phase 9: Final Stabilization & Demo Safety ---
        self.demo_safe_mode = False
        self.validation_errors = [] # List of {severity, message, module}
        
        self.analytics_state = {
            "cpu_metrics": {},
            "memory_metrics": {},
            "disk_metrics": {},
            "scheduler_metrics": {},
            "hardware_metrics": {},
            "filesystem_metrics": {},
            "timeline": [], # Recent timeline events
            "telemetry": [] # Recent metrics snapshots
        }

        # --- Module 14: Boot & Snapshot Layer ---
        self.boot_state = "OFFLINE" # OFFLINE, INITIALIZING, ...
        self.boot_progress = 0
        self.boot_logs = deque(maxlen=200)
        self.kernel_ready = False
        
        # Phase 2: Persistent Snapshot & Session Restore
        self.snapshot_state = "IDLE" # IDLE, SAVING, LOADING, ERROR
        self.active_snapshot_id = None
        self.last_restore_time = None
        self.checkpoint_enabled = True
        self.snapshot_history = [] # Recent snapshot metadata
        self.showcase = {
            "active": False,
            "scenario_id": None,
            "current_step": 0,
            "total_steps": 0,
            "paused": False,
            "last_narration": "Awaiting orchestration...",
            "progress": 0,
            "is_completed": False,
            "logs": []
        }

    def update_uptime(self):
        self.uptime = round(time.time() - self.boot_time, 2)

    def get_full_state(self):
        """Returns a sanitized, cycle-free snapshot of the entire kernel state."""
        with self.lock:
            self.update_uptime()
            
            # 1. Build the raw state dictionary
            raw_state = {
                "system": {
                    "version": self.version,
                    "status": self.status,
                    "uptime": self.uptime,
                    "health": self.health_score,
                    "hardware_connected": self.hardware_state.get("connected", False)
                },
                "processes": [p.to_dict() if hasattr(p, 'to_dict') else p for p in list(self.processes.values())],
                "ready_queue": list(self.ready_queue),
                "scheduler": self.scheduler_state.copy(),
                "memory": self.memory_map.copy(),
                "filesystem": self.file_system_state.copy(),
                "deadlock": self.deadlock_state.copy(),
                "metrics": self.metrics.copy(),
                "hardware": self.hardware_state.copy(),
                "logs": list(self.event_logs)[-20:], 
                "analytics": {k: v for k, v in self.analytics_state.items() if k not in ['telemetry', 'timeline']},
                "timeline": self.analytics_state.get("timeline", [])[-25:],
                "telemetry_stream": self.analytics_state.get("telemetry", [])[-50:],
                "subsystems": self.subsystem_health.copy(),
                "resources": self.resource_state.copy(),
                "disk": self.disk_state.copy(),
                "disk_metrics": self.disk_metrics.copy(),
                "boot": {
                    "state": self.boot_state,
                    "progress": self.boot_progress,
                    "logs": list(self.boot_logs),
                    "ready": self.kernel_ready
                },
                "showcase": self._get_active_showcase_state()
            }
            
            # 2. Aggressively sanitize to prevent circular references in JSON
        return self._sanitize(raw_state)

    def _get_active_showcase_state(self):
        """Dynamically fetch showcase state to ensure consistency."""
        try:
            from showcase.showcase_state import showcase_state
            return showcase_state.to_dict()
        except:
            return self.showcase

    def _sanitize(self, payload, memo=None):
        """Internal helper to strip non-primitives and kill circular references."""
        if memo is None: memo = set()
        obj_id = id(payload)
        if obj_id in memo: return "[Circular]"
        
        if isinstance(payload, dict):
            memo.add(obj_id)
            return {str(k): self._sanitize(v, memo) for k, v in payload.items()}
        elif isinstance(payload, (list, tuple)):
            memo.add(obj_id)
            return [self._sanitize(item, memo) for item in payload]
        elif isinstance(payload, (int, float, bool, type(None), str)):
            return payload
        else:
            return str(payload)

    def set_subsystem_health(self, subsystem, status):
        """Update health status of a specific subsystem."""
        with self.lock:
            if subsystem in self.subsystem_health:
                self.subsystem_health[subsystem] = status
                if status != "HEALTHY":
                    self.health_score = max(0, self.health_score - 10)
                else:
                    self.health_score = min(100, self.health_score + 5)

# Global Instance
kernel_state = KernelState()
