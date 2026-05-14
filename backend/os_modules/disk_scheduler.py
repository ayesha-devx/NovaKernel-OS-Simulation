import time
import threading
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus
from os_modules.disk_metrics import disk_metrics
from hardware.hardware_event_bridge import hardware_event_bridge
from analytics.analytics_engine import analytics_engine

class DiskScheduler:
    """
    DISK SCHEDULING ENGINE.
    Implements FCFS, SSTF, SCAN, C-SCAN algorithms.
    Simulates real-time head movement.
    """
    def __init__(self):
        self.is_running = False
        self.thread = None
        self.lock = threading.Lock()

    def start(self):
        if not self.is_running:
            self.is_running = True
            self.thread = threading.Thread(target=self._run_loop, daemon=True)
            self.thread.start()
            print("[DISK] Scheduler Engine active.")

    def set_algorithm(self, algo):
        with kernel_state.lock:
            if algo in ["FCFS", "SSTF", "SCAN", "C-SCAN"]:
                old_algo = kernel_state.disk_state.get("current_algorithm", "FCFS")
                kernel_state.disk_state["current_algorithm"] = algo
                socket_bus.emit("DISK", "ALGO_SWITCH", f"Switched to {algo}", "SUCCESS")
                
                # --- TRACE HOOK ---
                try:
                    from monitoring.event_trace_engine import event_trace_engine
                    event_trace_engine.trace(
                        subsystem="DISK",
                        severity="INFO",
                        category="DISK",
                        title="Disk Algorithm Switched",
                        description=f"Seek policy changed to {algo}",
                        metadata={"old_algo": old_algo, "new_algo": algo}
                    )
                except: pass

                from analytics.analytics_engine import analytics_engine
                analytics_engine.record_event("DISK_CONTROLLER", "ALGORITHM_SWITCH", f"Disk algo changed to {algo}", "INFO", metadata={"algorithm": algo})

    def _run_loop(self):
        """Main scheduling loop."""
        while self.is_running:
            try:
                self._schedule_next()
                time.sleep(0.5) # Poll frequency
            except Exception as e:
                print(f"[DISK_ERROR] {e}")
                time.sleep(1)

    def _schedule_next(self):
        with kernel_state.lock:
            queue = kernel_state.disk_state["queue"]
            if not queue or kernel_state.disk_state["active_request"]:
                return

            current_pos = kernel_state.disk_state["current_track"]
            algo = kernel_state.disk_state["current_algorithm"]
            direction = kernel_state.disk_state["head_direction"]

            # Reorder queue based on algorithm
            if algo == "FCFS":
                # First come first served (already ordered by timestamp/insertion)
                next_request = queue[0]
            
            elif algo == "SSTF":
                # Shortest Seek Time First
                next_request = min(queue, key=lambda r: abs(r["track"] - current_pos))
            
            elif algo == "SCAN":
                # Elevator algorithm
                waiters = []
                if direction == 1: # Moving UP
                    waiters = [r for r in queue if r["track"] >= current_pos]
                    if not waiters: # Switch direction
                        kernel_state.disk_state["head_direction"] = -1
                        waiters = [r for r in queue if r["track"] < current_pos]
                else: # Moving DOWN
                    waiters = [r for r in queue if r["track"] <= current_pos]
                    if not waiters: # Switch direction
                        kernel_state.disk_state["head_direction"] = 1
                        waiters = [r for r in queue if r["track"] > current_pos]
                
                if waiters:
                    next_request = min(waiters, key=lambda r: abs(r["track"] - current_pos))
                else:
                    next_request = queue[0]

            elif algo == "C-SCAN":
                # Circular SCAN (only moves one way)
                waiters = [r for r in queue if r["track"] >= current_pos]
                if waiters:
                    next_request = min(waiters, key=lambda r: r["track"])
                else:
                    # Jump back to start
                    next_request = min(queue, key=lambda r: r["track"])

            # Remove from queue and set as active
            kernel_state.disk_state["queue"] = [r for r in queue if r["id"] != next_request["id"]]
            kernel_state.disk_state["active_request"] = next_request
            
        # Move head (outside kernel lock to allow other state updates)
        self._move_head(next_request)

    def _move_head(self, request):
        target = request["track"]
        start = 0
        
        try:
            with kernel_state.lock:
                start = kernel_state.disk_state["current_track"]
                kernel_state.disk_state["is_moving"] = True
                kernel_state.disk_state["head_path"] = []

            # Simulate movement
            step = 1 if target >= start else -1
            dist = abs(target - start)
            
            socket_bus.emit("DISK", "HEAD_MOVE", f"Moving {start} \u2192 {target}", "INFO")
            
            # --- TRACE HOOK (Start Seek) ---
            try:
                from monitoring.event_trace_engine import event_trace_engine
                event_trace_engine.trace(
                    subsystem="DISK",
                    severity="INFO",
                    category="DISK",
                    title="Seek Initiated",
                    description=f"Moving head from {start} to {target}",
                    metadata={"start": start, "target": target, "distance": dist}
                )
            except: pass

            try:
                hardware_event_bridge.on_disk_activity() # Pulse hardware lights
            except: pass

            for i, pos in enumerate(range(start, target + step, step)):
                with kernel_state.lock:
                    kernel_state.disk_state["current_track"] = pos
                    kernel_state.disk_state["head_path"].append(pos)
                    # Keep head path small for UI
                    if len(kernel_state.disk_state["head_path"]) > 20:
                        kernel_state.disk_state["head_path"].pop(0)
                
                # Pulse hardware LED periodically during long seeks
                if i > 0 and i % 8 == 0:
                    try:
                        hardware_event_bridge.on_disk_activity()
                    except: pass

                # Broadcast state for UI animation
                socket_bus.broadcast_state()
                time.sleep(0.08) # Movement speed (Slightly slower for better visibility)

            # Success update
            with kernel_state.lock:
                request["status"] = "COMPLETED"
                request["seek_cost"] = dist
                kernel_state.disk_state["completed_requests"].append(request)
                if len(kernel_state.disk_state["completed_requests"]) > 50:
                    kernel_state.disk_state["completed_requests"].pop(0)
                disk_metrics.record_seek(dist)
                
            socket_bus.emit("DISK", "SUCCESS", f"Request {request['id']} completed at track {target}", "SUCCESS")
            
            # --- TRACE HOOK (Seek Complete) ---
            try:
                from monitoring.event_trace_engine import event_trace_engine
                event_trace_engine.trace(
                    subsystem="DISK",
                    severity="SUCCESS",
                    category="DISK",
                    title="Seek Completed",
                    description=f"Head positioned at track {target}",
                    metadata={"target": target, "cost": dist}
                )
            except: pass

        except Exception as e:
            print(f"[DISK_ERROR] Move failed: {e}")
            socket_bus.emit("DISK", "ERROR", f"Head seek failed: {str(e)}", "ERROR")
            
            # --- TRACE HOOK (Error) ---
            try:
                from monitoring.event_trace_engine import event_trace_engine
                event_trace_engine.trace(
                    subsystem="DISK",
                    severity="ERROR",
                    category="DISK",
                    title="Seek Error",
                    description=f"Head failure during move to {target}",
                    metadata={"error": str(e)}
                )
            except: pass
        finally:
            with kernel_state.lock:
                kernel_state.disk_state["is_moving"] = False
                kernel_state.disk_state["active_request"] = None
            
            # ANALYTICS TIMELINE HOOK (Outside lock to prevent deadlocks)
            try:
                analytics_engine.record_event(
                    module="DISK_CONTROLLER",
                    event_type="DISK_SEEK",
                    message=f"Completed seek {start} \u2192 {target}",
                    pid=request.get("pid", 0),
                    metadata={"start": start, "target": target}
                )
            except: pass
                
            socket_bus.broadcast_state()

disk_scheduler = DiskScheduler()
