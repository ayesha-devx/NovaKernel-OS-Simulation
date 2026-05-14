import json
import time
from datetime import datetime
from collections import deque
import threading

class StateSerializer:
    """
    Professional state serialization engine for NovaKernel.
    Captures deep, sanitized snapshots of the kernel state while ensuring
    safety against circular references and non-serializable objects.
    """
    
    @staticmethod
    def serialize_kernel_state(kernel_state):
        """
        Orchestrates the serialization of the entire kernel state.
        Uses a read-only capture strategy.
        """
        try:
            # 1. Capture basic system info
            with kernel_state.lock:
                # We take a quick shallow copy of the main dict structures under lock
                # to ensure consistency between related fields.
                state_dump = {
                    "metadata": {
                        "kernel_version": kernel_state.version,
                        "timestamp": time.time(),
                        "uptime": kernel_state.uptime,
                        "boot_state": kernel_state.boot_state,
                        "demo_safe_mode": kernel_state.demo_safe_mode
                    },
                    "subsystems": {
                        "processes": {pid: p for pid, p in kernel_state.processes.items()},
                        "ready_queue": list(kernel_state.ready_queue),
                        "scheduler": kernel_state.scheduler_state.copy(),
                        "memory": kernel_state.memory_map.copy(),
                        "filesystem": kernel_state.file_system_state.copy(),
                        "disk": kernel_state.disk_state.copy(),
                        "deadlock": kernel_state.deadlock_state.copy(),
                        "resources": kernel_state.resource_state.copy(),
                        "analytics": {
                            "metrics": kernel_state.analytics_state.get("telemetry", [])[-100:], # Cap history
                            "timeline": kernel_state.analytics_state.get("timeline", [])[-50:]
                        },
                        "hardware": kernel_state.hardware_state.copy(),
                        "recovery": {
                            "metrics": kernel_state.recovery_metrics.copy(),
                            "timeline": kernel_state.recovery_timeline[-50:]
                        }
                    }
                }
            
            # 2. Perform deep sanitization (Outside the lock to minimize blocking)
            return StateSerializer.sanitize(state_dump)
            
        except Exception as e:
            print(f"SERIALIZATION_ERROR: {str(e)}")
            return None

    @staticmethod
    def sanitize(payload, memo=None):
        """
        Deep sanitization utility.
        - Converts deques/sets to lists.
        - Calls to_dict() on custom objects if available.
        - Strips threads, locks, and sockets.
        - Prevents circular references.
        """
        if memo is None: memo = {}
        
        # Prevent circular references
        obj_id = id(payload)
        if obj_id in memo:
            return "[Circular_Reference]"
        
        # Handle Primitives
        if isinstance(payload, (int, float, bool, str, type(None))):
            return payload
            
        # Handle Dictionaries
        if isinstance(payload, dict):
            memo[obj_id] = payload
            return {str(k): StateSerializer.sanitize(v, memo) for k, v in payload.items()}
            
        # Handle Lists, Tuples, Deques, Sets
        if isinstance(payload, (list, tuple, deque, set)):
            memo[obj_id] = payload
            return [StateSerializer.sanitize(item, memo) for item in payload]
            
        # Handle Custom Objects with to_dict()
        if hasattr(payload, 'to_dict'):
            memo[obj_id] = payload
            return StateSerializer.sanitize(payload.to_dict(), memo)
            
        # Strip Unsafe Objects
        if isinstance(payload, (threading.Thread, threading.Lock, threading.RLock)):
            return f"[Unsafe_Object: {type(payload).__name__}]"
            
        # Default: Fallback to string representation
        return str(payload)

    @staticmethod
    def validate_snapshot(data):
        """Validates the integrity and version compatibility of a snapshot."""
        if not data or not isinstance(data, dict):
            return False, "Invalid snapshot format."
            
        metadata = data.get("metadata", {})
        if "kernel_version" not in metadata:
            return False, "Missing kernel version metadata."
            
        # Check for essential subsystems
        subsystems = data.get("subsystems", {})
        required = ["processes", "memory", "filesystem", "scheduler"]
        for req in required:
            if req not in subsystems:
                return False, f"Missing critical subsystem data: {req}"
                
        return True, "Snapshot valid."

# Global Instance
state_serializer = StateSerializer()
