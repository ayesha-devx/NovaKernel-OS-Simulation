import time
import threading
from monitoring.monitoring_state import monitoring_state
from monitoring.monitoring_utils import capped_append

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

class PerformanceMonitor:
    def __init__(self):
        self.is_running = False
        self.thread = None
        self.socketio = None
        
        # Delayed import wrapper
        self.pm = None
        self.rq = None

        self.last_emit_count = 0
        self.current_emit_count = 0
        self.last_check_time = time.time()

    def _init_dependencies(self):
        from os_modules.process_manager import process_manager
        from os_modules.ready_queue import ready_queue_manager
        self.pm = process_manager
        self.rq = ready_queue_manager

    def start(self, socketio=None):
        if self.is_running:
            return
        self.socketio = socketio
        self._init_dependencies()
        self.is_running = True
        self.thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.is_running = False

    def track_socket_emit(self):
        """Called whenever a relevant socket event is emitted to track rate."""
        self.current_emit_count += 1

    def _get_memory_usage(self):
        if HAS_PSUTIL:
            try:
                process = psutil.Process()
                mem_info = process.memory_info()
                return mem_info.rss / (1024 * 1024) # MB
            except Exception:
                return 0.0
        return 0.0 # Fallback

    def _monitor_loop(self):
        print("[MONITORING] Performance Monitor Loop Started")
        while self.is_running:
            try:
                now = time.time()
                elapsed = now - self.last_check_time
                if elapsed <= 0: elapsed = 1.0

                # 1. Collect Active Processes
                try:
                    from kernel.kernel_state import kernel_state
                    active_count = len([p for p in kernel_state.processes.values() if p.state != "TERMINATED"])
                except:
                    active_count = 0
                    
                capped_append(monitoring_state.metrics["active_processes"], {
                    "time": now, "value": float(active_count)
                }, max_size=20)

                # 2. Collect Queue Sizes
                try:
                    queue_size = len(self.rq.queue) if self.rq else 0
                except:
                    queue_size = 0
                    
                capped_append(monitoring_state.metrics["queue_sizes"], {
                    "time": now, "value": float(queue_size)
                }, max_size=20)

                # 3. Collect Memory Usage
                mem = self._get_memory_usage()
                capped_append(monitoring_state.metrics["memory_usage"], {
                    "time": now, "value": float(mem)
                }, max_size=20)

                # 4. Socket Emit Rate
                emit_rate = self.current_emit_count / elapsed
                capped_append(monitoring_state.metrics["socket_emits"], {
                    "time": now, "value": float(emit_rate)
                }, max_size=20)

                
                # Heartbeat for Watchdog
                try:
                    from monitoring.runtime_watchdog import runtime_watchdog
                    runtime_watchdog.heartbeat("monitoring_engine")
                except: pass

                self.current_emit_count = 0
                self.last_check_time = now
                monitoring_state.last_update = now

            except Exception as e:
                print(f"[MONITORING] Performance Monitor Error: {str(e)}")
            time.sleep(1.0)

performance_monitor = PerformanceMonitor()
