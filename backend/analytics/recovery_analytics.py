import time
import threading
from collections import defaultdict

class RecoveryAnalytics:
    """
    RECOVERY ANALYTICS ENGINE.
    Real-time metrics tracking for deadlock detection and recovery events.
    Lightweight, thread-safe, future chart-compatible.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._metrics = {
            "total_deadlocks": 0,
            "successful_recoveries": 0,
            "failed_recoveries": 0,
            "avg_recovery_time_s": 0.0,
            "last_recovery_duration_s": 0.0,
            "last_deadlock_at": None,
            "last_recovery_at": None,
        }
        self._resource_conflict_counts = defaultdict(int)  # rid -> count
        self._terminated_process_counts = defaultdict(int) # pid -> count
        self._cycle_size_counts = defaultdict(int)          # cycle_len -> count
        self._recovery_durations = []                        # For rolling average

    # ------------------------------------------------------------------ #
    #  Recording API                                                       #
    # ------------------------------------------------------------------ #

    def record_deadlock_detected(self, involved_pids: list, cycle_size: int,
                                  conflicting_resources: list = None):
        """Called when a new deadlock is detected."""
        with self._lock:
            self._metrics["total_deadlocks"] += 1
            self._metrics["last_deadlock_at"] = time.strftime("%H:%M:%S")
            self._cycle_size_counts[cycle_size] += 1
            for rid in (conflicting_resources or []):
                self._resource_conflict_counts[rid] += 1
        print(f"[RECOVERY_ANALYTICS] Deadlock #{self._metrics['total_deadlocks']} recorded. "
              f"Cycle={cycle_size}, PIDs={involved_pids}")

    def record_recovery_success(self, victim_pid: int, duration_s: float,
                                 strategy: str = "UNKNOWN"):
        """Called after a successful recovery."""
        with self._lock:
            self._metrics["successful_recoveries"] += 1
            self._metrics["last_recovery_duration_s"] = round(duration_s, 3)
            self._metrics["last_recovery_at"] = time.strftime("%H:%M:%S")
            self._terminated_process_counts[victim_pid] += 1

            # Rolling average
            self._recovery_durations.append(duration_s)
            if len(self._recovery_durations) > 100:
                self._recovery_durations = self._recovery_durations[-100:]
            self._metrics["avg_recovery_time_s"] = round(
                sum(self._recovery_durations) / len(self._recovery_durations), 3
            )
        print(f"[RECOVERY_ANALYTICS] Recovery success: victim=PID {victim_pid}, "
              f"duration={duration_s:.3f}s, strategy={strategy}")

    def record_recovery_failure(self, reason: str = ""):
        """Called if recovery failed."""
        with self._lock:
            self._metrics["failed_recoveries"] += 1
        print(f"[RECOVERY_ANALYTICS] Recovery FAILED. Reason: {reason}")

    # ------------------------------------------------------------------ #
    #  Query API                                                           #
    # ------------------------------------------------------------------ #

    def get_summary(self) -> dict:
        """Full analytics snapshot — safe for REST API response."""
        with self._lock:
            success = self._metrics["successful_recoveries"]
            total = self._metrics["total_deadlocks"]
            success_rate = round((success / total * 100), 1) if total > 0 else 0.0

            # Top conflicting resources (sorted by frequency)
            top_resources = sorted(
                [{"rid": k, "conflicts": v} for k, v in self._resource_conflict_counts.items()],
                key=lambda x: x["conflicts"], reverse=True
            )[:5]

            # Most terminated processes
            top_terminated = sorted(
                [{"pid": k, "terminations": v} for k, v in self._terminated_process_counts.items()],
                key=lambda x: x["terminations"], reverse=True
            )[:5]

            # Most common cycle sizes
            cycle_distribution = [
                {"size": k, "count": v}
                for k, v in sorted(self._cycle_size_counts.items())
            ]

            return {
                **self._metrics,
                "success_rate_pct": success_rate,
                "top_conflicting_resources": top_resources,
                "most_terminated_processes": top_terminated,
                "cycle_size_distribution": cycle_distribution,
            }

    def reset(self):
        """Clear all analytics — called on full system reset."""
        with self._lock:
            self._metrics = {
                "total_deadlocks": 0,
                "successful_recoveries": 0,
                "failed_recoveries": 0,
                "avg_recovery_time_s": 0.0,
                "last_recovery_duration_s": 0.0,
                "last_deadlock_at": None,
                "last_recovery_at": None,
            }
            self._resource_conflict_counts.clear()
            self._terminated_process_counts.clear()
            self._cycle_size_counts.clear()
            self._recovery_durations.clear()
        print("[RECOVERY_ANALYTICS] Analytics reset.")


# Global Instance
recovery_analytics = RecoveryAnalytics()
