import time
import threading
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus
from os_modules.ready_queue import ready_queue_manager

class CPUScheduler:
    def __init__(self):
        self.process_manager = None
        
        self.algorithm = "FIFO" # Default, will be updated
        self.quantum = 2.0 # Default for Round Robin
        self.is_active = False
        self.is_paused = False
        
        self.socketio = None
        self.event_logger = None
        self.scheduler_thread = None
        self.lock = threading.RLock()
        
        # Performance Metrics
        self.context_switches = 0
        self.total_execution_time = 0
        self.idle_time = 0
        
        # Real-time state
        self.quantum_remaining = 0
        self.last_tick_time = 0
        
        self._sync_state()

    def _sync_state(self):
        with kernel_state.lock:
            kernel_state.scheduler_state["current_algorithm"] = self.algorithm
            kernel_state.scheduler_state["is_running"] = self.is_active and not self.is_paused
            kernel_state.scheduler_state["is_paused"] = self.is_paused
            kernel_state.scheduler_state["quantum_left"] = self.quantum_remaining
            kernel_state.scheduler_state["context_switches"] = self.context_switches
            kernel_state.scheduler_state["total_execution_time"] = self.total_execution_time

    def set_dependencies(self, socketio, event_logger, process_manager):
        self.socketio = socketio
        self.event_logger = event_logger
        self.process_manager = process_manager
        
    def start(self):
        with kernel_state.lock:
            with self.lock:
                if not self.is_active:
                    self.is_active = True
                    self.is_paused = False
                    self.last_tick_time = time.time()
                    self.scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
                    self.scheduler_thread.start()
                    socket_bus.emit("CPU_SCHEDULER", "STARTED", f"Scheduler started in {self.algorithm} mode.", "SUCCESS")
                    
                    # --- TRACE HOOK ---
                    try:
                        from monitoring.event_trace_engine import event_trace_engine
                        event_trace_engine.trace(
                            subsystem="SCHEDULER",
                            severity="SUCCESS",
                            category="SYSTEM",
                            title="Scheduler Active",
                            description=f"CPU Dispatcher started using {self.algorithm}",
                            metadata={"algorithm": self.algorithm, "quantum": self.quantum}
                        )
                    except: pass

                    from analytics.analytics_engine import analytics_engine
                    analytics_engine.record_event("CPU_SCHEDULER", "SCHEDULER_STARTED", f"Scheduler active with {self.algorithm}", "SUCCESS")
                    
                    self._notify_update()

    def pause(self):
        with kernel_state.lock:
            with self.lock:
                self.is_paused = True
                socket_bus.emit("CPU_SCHEDULER", "PAUSED", "Scheduler paused.", "WARNING")
                
                # --- TRACE HOOK ---
                try:
                    from monitoring.event_trace_engine import event_trace_engine
                    event_trace_engine.trace(
                        subsystem="SCHEDULER",
                        severity="WARNING",
                        category="SYSTEM",
                        title="Scheduler Paused",
                        description="CPU Dispatching suspended",
                        metadata={}
                    )
                except: pass

                self._notify_update()

    def resume(self):
        with kernel_state.lock:
            with self.lock:
                self.is_paused = False
                self.last_tick_time = time.time()
                socket_bus.emit("CPU_SCHEDULER", "RESUMED", "Scheduler resumed.", "SUCCESS")
                
                # --- TRACE HOOK ---
                try:
                    from monitoring.event_trace_engine import event_trace_engine
                    event_trace_engine.trace(
                        subsystem="SCHEDULER",
                        severity="SUCCESS",
                        category="SYSTEM",
                        title="Scheduler Resumed",
                        description="CPU Dispatching resumed",
                        metadata={}
                    )
                except: pass

                self._notify_update()

    def stop(self):
        with kernel_state.lock:
            with self.lock:
                self.is_active = False
                if kernel_state.scheduler_state["current_process"]:
                    self._preempt_current("STOPPED")
                socket_bus.emit("CPU_SCHEDULER", "STOPPED", "Scheduler stopped.", "INFO")

                # --- TRACE HOOK ---
                try:
                    from monitoring.event_trace_engine import event_trace_engine
                    event_trace_engine.trace(
                        subsystem="SCHEDULER",
                        severity="WARNING",
                        category="SYSTEM",
                        title="Scheduler Stopped",
                        description="CPU Dispatcher terminated",
                        metadata={}
                    )
                except: pass

                from analytics.analytics_engine import analytics_engine
                analytics_engine.record_event("CPU_SCHEDULER", "SCHEDULER_STOPPED", "Scheduler stopped manually", "WARNING")

                self._notify_update()

    def set_algorithm(self, algo):
        with kernel_state.lock:
            with self.lock:
                if algo in ["FIFO", "ROUND_ROBIN", "PRIORITY"]:
                    old_algo = self.algorithm
                    self.algorithm = algo
                    socket_bus.emit("CPU_SCHEDULER", "ALGO_CHANGE", f"Algorithm changed: {old_algo} -> {algo}", "INFO")
                    
                    # --- TRACE HOOK ---
                    try:
                        from monitoring.event_trace_engine import event_trace_engine
                        event_trace_engine.trace(
                            subsystem="SCHEDULER",
                            severity="INFO",
                            category="SYSTEM",
                            title="Algorithm Switched",
                            description=f"Policy changed from {old_algo} to {algo}",
                            metadata={"old_algo": old_algo, "new_algo": algo}
                        )
                    except: pass

                    # Update ready queue manager mode as well
                    if algo == "PRIORITY":
                        ready_queue_manager.set_mode("PRIORITY")
                    else:
                        ready_queue_manager.set_mode("FIFO")
                    
                    from analytics.analytics_engine import analytics_engine
                    analytics_engine.record_event("CPU_SCHEDULER", "ALGORITHM_SWITCH", f"Scheduler algorithm changed to {algo}", "INFO", metadata={"algorithm": algo})
                    
                    self._notify_update()
                    return True
                return False

    def set_quantum(self, val):
        with kernel_state.lock:
            with self.lock:
                self.quantum = float(val)
                socket_bus.emit("CPU_SCHEDULER", "QUANTUM_UPDATE", f"Time quantum set to {self.quantum}s", "INFO")
                
                # --- TRACE HOOK ---
                try:
                    from monitoring.event_trace_engine import event_trace_engine
                    event_trace_engine.trace(
                        subsystem="SCHEDULER",
                        severity="INFO",
                        category="SYSTEM",
                        title="Quantum Updated",
                        description=f"Time slice updated to {self.quantum}s",
                        metadata={"quantum": self.quantum}
                    )
                except: pass

                self._notify_update()

    def _scheduler_loop(self):
        print("[CPU] Scheduler background loop started.")
        while self.is_active:
            try:
                if not self.is_paused:
                    self._tick()
                time.sleep(0.1) # 100ms precision for simulation
            except Exception as e:
                print(f"[CPU_ERROR] Scheduler loop panic: {str(e)}")
                time.sleep(1.0)

    def _tick(self):
        now = time.time()
        delta = now - self.last_tick_time
        self.last_tick_time = now
        
        if int(now) % 5 == 0 and int((now - delta) * 10) != int(now * 10): # Once every 5s
            print(f"[CPU_HEARTBEAT] Scheduler active. Delta: {delta:.3f}s")

        with kernel_state.lock:
            with self.lock:
                # Update waiting times for all processes in READY queue
                for pid in ready_queue_manager.queue:
                    p = self.process_manager.processes.get(pid)
                    if p:
                        p.waiting_time += delta
                
                pid = kernel_state.scheduler_state.get("current_process")
                if pid:
                    self._execute_current(delta)
                else:
                    self.idle_time += delta
                    self._try_dispatch()
                
                # Push real-time updates to UI
                self._notify_update()

    def _execute_current(self, delta):
        pid = kernel_state.scheduler_state.get("current_process")
        p = self.process_manager.processes.get(pid)
        if not p: return

        p.burst_remaining -= delta
        self.total_execution_time += delta
        
        if int(time.time() * 10) % 10 == 0: # Throttled debug log (once per sec)
            print(f"[CPU] PID {pid} executing... Rem: {p.burst_remaining:.2f}s")
        
        # Check for completion
        if p.burst_remaining <= 0:
            p.burst_remaining = 0
            self._complete_current()
            return

        # Algorithm specific logic
        if self.algorithm == "ROUND_ROBIN":
            self.quantum_remaining -= delta
            if self.quantum_remaining <= 0:
                self._preempt_current("QUANTUM_EXPIRED")
                
        elif self.algorithm == "PRIORITY":
            # Check if a higher priority process exists in queue
            if ready_queue_manager.queue:
                next_pid = ready_queue_manager.queue[0]
                next_p = self.process_manager.processes.get(next_pid)
                if next_p and next_p.priority < p.priority:
                    self._preempt_current("PRIORITY_PREEMPTION")

    def _dispatch(self, pid):
        p = self.process_manager.processes.get(pid)
        if not p:
            return

        # VERIFICATION: Process must have allocated memory
        from os_modules.memory_manager import memory_manager
        has_memory = any(block.pid == pid for block in memory_manager.blocks)
        
        if not has_memory:
            socket_bus.emit("CPU_SCHEDULER", "DISPATCH_FAILED", 
                           f"Failed to dispatch PID {pid}: Memory not allocated.", "ERROR", {"pid": pid})
            
            # --- TRACE HOOK ---
            try:
                from monitoring.event_trace_engine import event_trace_engine
                event_trace_engine.trace(
                    subsystem="SCHEDULER",
                    severity="ERROR",
                    category="PROCESS",
                    title="Dispatch Error",
                    description=f"Failed to dispatch PID {pid}: No memory backing",
                    metadata={"pid": pid}
                )
            except: pass
            return

        # VERIFICATION: Process state valid
        if p.state != "READY":
            socket_bus.emit("CPU_SCHEDULER", "DISPATCH_FAILED", 
                           f"Failed to dispatch PID {pid}: Invalid state {p.state}.", "WARNING", {"pid": pid})
            return

        # Update process state via lifecycle engine
        from kernel.lifecycle_engine import lifecycle_engine
        success, msg = lifecycle_engine.transition(pid, "RUNNING")
        if not success:
            return

        with kernel_state.lock:
            kernel_state.scheduler_state["current_process"] = pid
            
        # Reset quantum
        if self.algorithm == "ROUND_ROBIN":
            self.quantum_remaining = self.quantum
            
        self.context_switches += 1
        socket_bus.emit("CPU_SCHEDULER", "DISPATCH", f"PID {pid} ({p.name}) dispatched to CPU.", "INFO", {"pid": pid})
        
        # --- TRACE HOOK ---
        try:
            from monitoring.event_trace_engine import event_trace_engine
            event_trace_engine.trace(
                subsystem="SCHEDULER",
                severity="INFO",
                category="PROCESS",
                title="Process Dispatched",
                description=f"PID {pid} context switched to RUNNING",
                metadata={"pid": pid, "name": p.name}
            )
        except: pass

        from analytics.analytics_engine import analytics_engine
        analytics_engine.record_event("CPU_SCHEDULER", "SCHEDULER_DISPATCH", f"PID {pid} dispatched to CPU", "INFO", pid=pid)

        self._notify_update()

    def _preempt_current(self, reason):
        pid = kernel_state.scheduler_state["current_process"]
        if not pid: return
        
        # Return to READY queue via Lifecycle Engine
        from kernel.lifecycle_engine import lifecycle_engine
        lifecycle_engine.transition(pid, "READY")
        
        with kernel_state.lock:
            kernel_state.scheduler_state["current_process"] = None
        
        socket_bus.emit("CPU_SCHEDULER", "PREEMPT", 
                       f"PID {pid} preempted ({reason}). Returning to READY queue.", "WARNING", {"pid": pid, "reason": reason})
        
        # --- TRACE HOOK ---
        try:
            from monitoring.event_trace_engine import event_trace_engine
            event_trace_engine.trace(
                subsystem="SCHEDULER",
                severity="WARNING",
                category="PROCESS",
                title="Process Preempted",
                description=f"PID {pid} preempted: {reason}",
                metadata={"pid": pid, "reason": reason}
            )
        except: pass

        self._notify_update()
        self._try_dispatch()

    def _complete_current(self):
        pid = kernel_state.scheduler_state["current_process"]
        if not pid: return
        
        from kernel.lifecycle_engine import lifecycle_engine
        lifecycle_engine.transition(pid, "TERMINATED")
        
        with kernel_state.lock:
            kernel_state.scheduler_state["current_process"] = None
        
        socket_bus.emit("CPU_SCHEDULER", "COMPLETED", f"PID {pid} execution completed.", "SUCCESS", {"pid": pid})
        
        # --- TRACE HOOK ---
        try:
            from monitoring.event_trace_engine import event_trace_engine
            event_trace_engine.trace(
                subsystem="SCHEDULER",
                severity="SUCCESS",
                category="PROCESS",
                title="Process Completed",
                description=f"PID {pid} finished execution",
                metadata={"pid": pid}
            )
        except: pass

        self._notify_update()
        self._try_dispatch()

    def _try_dispatch(self):
        if not self.is_active or self.is_paused:
            return
        pid = ready_queue_manager.dequeue()
        if pid:
            self._dispatch(pid)

    def _notify_update(self):
        self._sync_state()
        metrics = self.get_metrics()
        kernel_state.metrics["cpu_utilization"] = metrics["cpu_utilization"]
        socket_bus.broadcast_state()

    def get_metrics(self):
        total_time = self.total_execution_time + self.idle_time
        utilization = (self.total_execution_time / total_time * 100) if total_time > 0 else 0
        
        from kernel.lifecycle_engine import lifecycle_engine
        avg_wait = lifecycle_engine.calculate_avg_metric("waiting_time")
        avg_turnaround = lifecycle_engine.calculate_avg_metric("turnaround_time")
        
        terminated_count = len([p for p in self.process_manager.processes.values() if p.state == "TERMINATED"])

        return {
            "cpu_utilization": round(utilization, 2),
            "context_switches": self.context_switches,
            "avg_waiting_time": avg_wait,
            "avg_turnaround_time": avg_turnaround,
            "throughput": terminated_count
        }

scheduler_engine = CPUScheduler()
