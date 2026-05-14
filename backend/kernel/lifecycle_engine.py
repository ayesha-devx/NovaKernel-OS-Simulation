import time
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus


class LifecycleEngine:
    """
    UNIFIED PROCESS LIFECYCLE ENGINE.
    Validates state transitions and calculates execution metrics.
    """
    ALLOWED_TRANSITIONS = {
        "NEW": ["READY"],
        "READY": ["RUNNING"],
        "RUNNING": ["WAITING", "TERMINATED", "READY"],
        "WAITING": ["READY"],
        "TERMINATED": []
    }

    @staticmethod
    def transition(pid, new_state):
        """
        Attempts to transition a process to a new state.
        Returns (success, message).
        """
        with kernel_state.lock:
            process = kernel_state.processes.get(pid)
            if not process:
                return False, f"Process {pid} not found."

            old_state = process.state
            if new_state not in LifecycleEngine.ALLOWED_TRANSITIONS.get(old_state, []):
                msg = f"INVALID TRANSITION: {old_state} -> {new_state} for PID {pid} blocked."
                socket_bus.emit("KERNEL_WARNING", "INVALID_TRANSITION", msg, "WARNING", {"pid": pid, "old_state": old_state, "new_state": new_state})
                return False, msg

            # Update state
            process.update_state(new_state)
            
            # Update timestamps and metrics
            now = time.time()
            if new_state == "RUNNING":
                if process.response_time == -1:
                    process.response_time = now - process.arrival_time
                process.last_start_time = now
            
            elif old_state == "RUNNING":
                duration = now - (getattr(process, 'last_start_time', now))
                process.burst_remaining = max(0, process.burst_remaining - duration)
                process.execution_slices.append((process.last_start_time, now))
            
            if new_state == "TERMINATED":
                process.completion_time = now
                process.turnaround_time = process.completion_time - process.arrival_time
                process.waiting_time = process.turnaround_time - process.burst_time
                
                # Update global metrics
                kernel_state.metrics["avg_turnaround_time"] = LifecycleEngine.calculate_avg_metric("turnaround_time")
                kernel_state.metrics["avg_wait_time"] = LifecycleEngine.calculate_avg_metric("waiting_time")

            socket_bus.emit("PROCESS_MANAGER", "STATE_CHANGE", 
                           f"Process {process.name} (PID: {pid}) changed: {old_state} -> {new_state}", 
                           "INFO", {"pid": pid, "old_state": old_state, "new_state": new_state})
            
            # UNIFIED HARDWARE SYNC
            from hardware.hardware_event_bridge import hardware_event_bridge
            hardware_event_bridge.on_state_change(pid, new_state)

            # ANALYTICS TIMELINE HOOK
            from analytics.analytics_engine import analytics_engine
            analytics_engine.record_event(
                module="PROCESS_MANAGER",
                event_type=new_state,
                message=f"PID {pid} ({process.name}) moved to {new_state}",
                pid=pid,
                metadata={"old_state": old_state}
            )

            return True, "Success"

    @staticmethod
    def calculate_avg_metric(metric_name):
        terminated = [p for p in kernel_state.processes.values() if p.state == "TERMINATED"]
        if not terminated:
            return 0
        total = sum(getattr(p, metric_name, 0) for p in terminated)
        return round(total / len(terminated), 2)

# Global Instance
lifecycle_engine = LifecycleEngine()
