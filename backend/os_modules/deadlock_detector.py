import time
import threading

class DeadlockDetector:
    def __init__(self):
        self.is_monitoring = False
        self.monitor_thread = None

    def start(self):
        """Starts the background deadlock monitoring thread."""
        if not self.is_monitoring:
            self.is_monitoring = True
            self.monitor_thread = threading.Thread(target=self._run_monitor, daemon=True)
            self.monitor_thread.start()
            print("[DEADLOCK] Standalone Detector Engine active.")

    def _run_monitor(self):
        """Infinite loop for detection and self-healing with zero-dependency logic."""
        time.sleep(3.0) # Boot grace period
        while self.is_monitoring:
            try:
                self.check_for_deadlock()
                time.sleep(1.0)
            except Exception as e:
                # Direct print to avoid complex logger dependencies in crash state
                print(f"[DEADLOCK_CRITICAL] Monitor Error: {e}")
                time.sleep(2.0)

    def check_for_deadlock(self):
        """Main detection loop with DIRECT Self-Healing (No external module calls)."""
        from kernel.kernel_state import kernel_state
        from kernel.socket_bus import socket_bus
        from hardware.hardware_event_bridge import hardware_event_bridge

        with kernel_state.lock:
            resources = kernel_state.resource_state["resources"]
            processes = kernel_state.processes
            
            integrity_fixed = False

            # --- 1. DIRECT SELF-HEALING (Atomic State Modification) ---
            for rid, res in resources.items():
                owner_pid = res.get("allocated_to")
                waiters = res.get("waiting_pids", [])
                
                # A. Purge Owner from Waiting List (Ghost Request Fix)
                if owner_pid is not None:
                    # Clean the list using integer comparison for safety
                    new_waiters = [p for p in waiters if int(p) != int(owner_pid)]
                    if len(new_waiters) != len(waiters):
                        res["waiting_pids"] = new_waiters
                        integrity_fixed = True
                
                # B. Force Handover (Stalled Handover Fix)
                elif waiters:
                    # Resource is free but has waiters? Assign to first valid waiter!
                    valid_waiters = [p for p in waiters if int(p) in processes]
                    if valid_waiters:
                        next_pid = int(valid_waiters.pop(0))
                        res["allocated_to"] = next_pid
                        res["waiting_pids"] = [p for p in valid_waiters if int(p) != next_pid]
                        # Transition process to READY if it exists
                        if next_pid in processes:
                            processes[next_pid].state = "READY"
                        integrity_fixed = True

            # If we fixed something, broadcast immediately
            if integrity_fixed:
                socket_bus.broadcast_state()
            
            # --- 2. BUILD WAIT-FOR GRAPH ---
            adj = {}
            nodes = set()
            for rid, res in resources.items():
                owner = res.get("allocated_to")
                if owner is not None and int(owner) in processes:
                    for waiter in res.get("waiting_pids", []):
                        if int(waiter) in processes:
                            u, v = f"P{waiter}", f"P{owner}"
                            if u not in adj: adj[u] = []
                            adj[u].append(v)
                            nodes.add(u); nodes.add(v)

            # --- 3. CYCLE DETECTION (Standard DFS) ---
            visited = set()
            rec_stack = set()
            cycles = []

            def get_cycle(u, stack_list):
                try:
                    idx = stack_list.index(u)
                    return stack_list[idx:]
                except:
                    return []

            def dfs(u, stack_list):
                visited.add(u)
                rec_stack.add(u)
                stack_list.append(u)

                for v in adj.get(u, []):
                    if v not in visited:
                        if dfs(v, stack_list):
                            return True
                    elif v in rec_stack:
                        # Cycle found!
                        cycle = get_cycle(v, stack_list)
                        if cycle:
                            cycles.append(cycle)
                        return True
                
                stack_list.pop()
                rec_stack.remove(u)
                return False

            for node in nodes:
                if node not in visited:
                    dfs(node, [])

            # --- 4. STATE UPDATE & BROADCAST ---
            was_deadlocked = kernel_state.deadlock_state["is_deadlocked"]
            is_deadlocked = len(cycles) > 0
            
            kernel_state.deadlock_state["is_deadlocked"] = is_deadlocked
            kernel_state.deadlock_state["resource_cycles"] = cycles
            
            if is_deadlocked:
                deadlocked_pids = []
                for cycle in cycles:
                    for node in cycle:
                        if node.startswith("P"):
                            deadlocked_pids.append(int(node[1:]))
                
                kernel_state.deadlock_state["detected_pids"] = list(set(deadlocked_pids))
                kernel_state.deadlock_state["detection_timestamp"] = time.strftime("%H:%M:%S")

                # PERSISTENCE CHECK: Re-trace every 30s if deadlock continues
                should_trace = not was_deadlocked
                if is_deadlocked:
                    last_trace = getattr(self, "_last_deadlock_trace", 0)
                    if time.time() - last_trace > 30.0:
                        should_trace = True
                        self._last_deadlock_trace = time.time()

                if should_trace:
                    socket_bus.emit("DEADLOCK", "DETECTED", 
                                   f"CRITICAL: Deadlock detected involving {len(deadlocked_pids)} processes!", 
                                   "CRITICAL")
                    hardware_event_bridge.on_deadlock()

                    # Update monitoring state immediately
                    try:
                        from monitoring.monitoring_state import monitoring_state
                        monitoring_state.diagnostics["watchdog_status"] = "DEADLOCK"
                    except: pass

                    # --- TRACE HOOK ---
                    try:
                        from monitoring.event_trace_engine import event_trace_engine
                        # Deterministic ID for UI deduplication
                        det_id = f"DEADLOCK-{'-'.join(map(str, sorted(deadlocked_pids)))}"
                        event_trace_engine.trace(
                            subsystem="DEADLOCK",
                            severity="CRITICAL",
                            category="DEADLOCK",
                            title="Deadlock Detected",
                            description=f"Resource cycle detected involving PIDs: {deadlocked_pids}",
                            metadata={"pids": deadlocked_pids, "cycle_count": len(cycles)},
                            event_id=det_id
                        )
                    except: pass

                    # ANALYTICS TIMELINE HOOK
                    from analytics.analytics_engine import analytics_engine
                    analytics_engine.record_event(
                        module="DEADLOCK_ENGINE",
                        event_type="DEADLOCK_DETECTED",
                        message=f"System deadlock detected! Cycle count: {len(cycles)}",
                        severity="CRITICAL",
                        metadata={"cycles": cycles, "pids": deadlocked_pids}
                    )
            else:
                kernel_state.deadlock_state["detected_pids"] = []
                kernel_state.deadlock_state["resource_cycles"] = []
                if was_deadlocked:
                    socket_bus.emit("DEADLOCK", "RESOLVED", "System deadlock has been resolved.", "SUCCESS")
                    
                    # Update monitoring state immediately for responsive UI
                    try:
                        from monitoring.monitoring_state import monitoring_state
                        monitoring_state.diagnostics["watchdog_status"] = "OK"
                    except: pass

                    # --- TRACE HOOK ---
                    try:
                        from monitoring.event_trace_engine import event_trace_engine
                        # Remove previous 'DEADLOCK-' events to clear the UI cards
                        event_trace_engine.remove_events_by_prefix("DEADLOCK-")
                        
                        # Use emit_raw to trigger the specific TRACE_EVENT_REMOVE listener in KernelContext
                        socket_bus.emit_raw("TRACE_EVENT_REMOVE", {"prefix": "DEADLOCK-"})
                        
                        event_trace_engine.trace(
                            subsystem="DEADLOCK",
                            severity="SUCCESS",
                            category="DEADLOCK",
                            title="Deadlock Resolved",
                            description="All circular dependencies cleared",
                            metadata={}
                        )
                    except: pass

                    # ANALYTICS TIMELINE HOOK
                    from analytics.analytics_engine import analytics_engine
                    analytics_engine.record_event(
                        module="DEADLOCK_ENGINE",
                        event_type="DEADLOCK_RESOLVED",
                        message="System deadlock resolved and resources released.",
                        severity="SUCCESS"
                    )

                    socket_bus.emit("HARDWARE", "RESET_ALL", "Deadlock cleared, resetting alarms.", "SUCCESS")
                    
                    # Force immediate state broadcast to update frontend kernelState.deadlock
                    socket_bus.broadcast_state()

# Global Instance
deadlock_detector = DeadlockDetector()
