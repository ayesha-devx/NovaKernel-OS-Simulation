import time
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus
from os_modules.resource_manager import resource_manager

class DeadlockRecovery:
    """
    DEADLOCK RECOVERY ENGINE — Phase 4.
    Integrates with:
      - RecoveryTimeline   (event log)
      - RecoveryAnimationEngine (visual phases)
      - VictimSelector     (pluggable algorithms)
      - RecoveryAnalytics  (metrics)
    
    All existing API endpoints remain unchanged.
    """

    @staticmethod
    def auto_recover(strategy: str = "LOWEST_PRIORITY"):
        """
        Automatic Recovery Strategy with full Phase 4 instrumentation.
        1. Timeline recording
        2. Animation sequence
        3. Victim selection via pluggable strategy
        4. Analytics tracking
        """
        from os_modules.recovery_timeline import recovery_timeline
        from os_modules.recovery_animation_engine import recovery_animation_engine
        from os_modules.victim_selector import victim_selector
        from analytics.recovery_analytics import recovery_analytics

        recovery_start = time.time()

        with kernel_state.lock:
            if not kernel_state.deadlock_state["is_deadlocked"]:
                recovery_timeline.add_event("AUTO_RECOVER", "No deadlock detected — recovery aborted.", "WARNING")
                return False, "No deadlock detected."

            detected_pids = list(kernel_state.deadlock_state["detected_pids"])
            cycles = kernel_state.deadlock_state.get("resource_cycles", [])

        if not detected_pids:
            recovery_timeline.add_event("AUTO_RECOVER", "No victim PIDs identified.", "WARNING")
            return False, "No victim PIDs identified."

        # ── Timeline: Detection ─────────────────────────────────────────
        recovery_timeline.add_event(
            "DEADLOCK_DETECTED",
            f"Deadlock confirmed. Involved PIDs: {detected_pids}",
            "CRITICAL",
            {"pids": detected_pids, "cycles": cycles}
        )

        # ── Timeline: Analysis ──────────────────────────────────────────
        recovery_timeline.add_event(
            "CYCLE_ANALYSIS",
            f"Cycle analysis started. {len(cycles)} cycle(s) found, size={len(detected_pids)}.",
            "WARNING",
            {"cycle_count": len(cycles)}
        )

        # ── Analytics: Record deadlock ──────────────────────────────────
        conflicting_resources = []
        with kernel_state.lock:
            resources = kernel_state.resource_state["resources"]
            for rid, res in resources.items():
                if res.get("allocated_to") in detected_pids or any(
                    p in detected_pids for p in res.get("waiting_pids", [])
                ):
                    conflicting_resources.append(rid)

        recovery_analytics.record_deadlock_detected(
            involved_pids=detected_pids,
            cycle_size=len(detected_pids),
            conflicting_resources=conflicting_resources
        )

        # ── Victim Selection ────────────────────────────────────────────
        victim_pid, selection_reason = victim_selector.select(detected_pids, strategy)

        if not victim_pid:
            recovery_timeline.add_event("VICTIM_SELECTION", f"Selection failed: {selection_reason}", "CRITICAL")
            recovery_analytics.record_recovery_failure(selection_reason)
            return False, selection_reason

        with kernel_state.lock:
            victim_process = kernel_state.processes.get(victim_pid)
            victim_name = victim_process.name if victim_process else f"PID {victim_pid}"

            # Determine which resources the victim holds (for animation)
            held_resources = [
                rid for rid, res in kernel_state.resource_state["resources"].items()
                if res.get("allocated_to") is not None and int(res["allocated_to"]) == int(victim_pid)
            ]
            survivor_pids = [p for p in detected_pids if p != victim_pid]

        recovery_timeline.add_event(
            "VICTIM_SELECTED",
            f"Victim selected: {victim_name} (PID {victim_pid}). Strategy: {strategy}. Reason: {selection_reason}",
            "WARNING",
            {"victim_pid": victim_pid, "strategy": strategy, "reason": selection_reason}
        )

        # ── Emit socket event (existing behavior preserved) ─────────────
        socket_bus.emit("DEADLOCK_RECOVERY", "AUTO_RECOVER",
                        f"Auto-recovery triggered. Victim: {victim_name} (PID {victim_pid}), Strategy: {strategy}.",
                        "WARNING")

        # ── Start visual animation sequence (non-blocking) ──────────────
        recovery_animation_engine.run_recovery_sequence(
            victim_pid=victim_pid,
            victim_name=victim_name,
            freed_resources=held_resources,
            survivor_pids=survivor_pids
        )

        # ── Resource Release ────────────────────────────────────────────
        recovery_timeline.add_event(
            "RESOURCE_RELEASE",
            f"Releasing {len(held_resources)} resource(s) held by PID {victim_pid}: {held_resources}",
            "INFO",
            {"resources": held_resources}
        )

        # ── Execute termination ─────────────────────────────────────────
        from os_modules.process_manager import process_manager
        process_manager.delete_process(victim_pid)

        recovery_timeline.add_event(
            "PROCESS_TERMINATED",
            f"Process {victim_name} (PID {victim_pid}) terminated.",
            "SUCCESS",
            {"victim_pid": victim_pid}
        )

        # ── Hardware reset ──────────────────────────────────────────────
        from hardware.hardware_event_bridge import hardware_event_bridge
        hardware_event_bridge.on_system_reset()

        # ── Force re-scan ───────────────────────────────────────────────
        from os_modules.deadlock_detector import deadlock_detector
        deadlock_detector.check_for_deadlock()

        # ── Resource reallocation log ───────────────────────────────────
        if survivor_pids:
            recovery_timeline.add_event(
                "RESOURCE_REALLOCATION",
                f"Resources transferred to survivor(s): {survivor_pids}",
                "SUCCESS",
                {"survivor_pids": survivor_pids}
            )

        # ── System stabilized ───────────────────────────────────────────
        duration = round(time.time() - recovery_start, 3)
        recovery_timeline.add_event(
            "SYSTEM_STABILIZED",
            f"Deadlock resolved. System operational. Recovery took {duration}s.",
            "SUCCESS",
            {"duration_s": duration}
        )

        # ── Analytics: record success ───────────────────────────────────
        recovery_analytics.record_recovery_success(
            victim_pid=victim_pid,
            duration_s=duration,
            strategy=strategy
        )

        # ── Update kernel recovery metrics ──────────────────────────────
        with kernel_state.lock:
            summary = recovery_analytics.get_summary()
            kernel_state.recovery_metrics.update({
                "total_deadlocks": summary["total_deadlocks"],
                "successful_recoveries": summary["successful_recoveries"],
                "failed_recoveries": summary["failed_recoveries"],
                "avg_recovery_time_s": summary["avg_recovery_time_s"],
                "last_recovery_duration_s": summary["last_recovery_duration_s"],
            })

        # ── Broadcast timeline ──────────────────────────────────────────
        recovery_timeline.broadcast_timeline()
        socket_bus.broadcast_state()

        return True, f"Recovered by terminating PID {victim_pid}"

    @staticmethod
    def manual_resolve(pid):
        """Manually terminate a specific process to break the cycle."""
        from os_modules.process_manager import process_manager
        from os_modules.recovery_timeline import recovery_timeline
        recovery_timeline.add_event(
            "MANUAL_RESOLVE",
            f"Manual resolution: terminating PID {pid}.",
            "WARNING",
            {"pid": pid}
        )
        res = process_manager.delete_process(pid)
        if res:
            # Force immediate re-scan to clear deadlock state and broadcast
            from os_modules.deadlock_detector import deadlock_detector
            deadlock_detector.check_for_deadlock()
        return res

    @staticmethod
    def release_resource_manually(rid):
        """Force release a resource."""
        with kernel_state.lock:
            res = kernel_state.resource_state["resources"].get(rid)
            if res and res["allocated_to"]:
                pid = res["allocated_to"]
                return resource_manager.release_resource(pid, rid)
        return False, "Resource not allocated."


# Global Instance
deadlock_recovery = DeadlockRecovery()
