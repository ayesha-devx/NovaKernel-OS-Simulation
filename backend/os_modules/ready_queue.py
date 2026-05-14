import time
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus

class ReadyQueueManager:
    def __init__(self):
        self.mode = "FIFO" # FIFO or PRIORITY
        self.process_manager = None
        self.socketio = None
        self.event_logger = None
        self.start_times = {} # Track when PID entered queue

    @property
    def queue(self):
        return kernel_state.ready_queue

    def set_dependencies(self, socketio, event_logger, process_manager):
        self.socketio = socketio
        self.event_logger = event_logger
        self.process_manager = process_manager

    def enqueue(self, pid):
        # Strict validation: Prevent duplicates
        with kernel_state.lock:
            if pid in kernel_state.ready_queue:
                return False
                
            process_data = self.process_manager.processes.get(pid)
            if not process_data or process_data.state != "READY":
                return False
                
            kernel_state.ready_queue.append(pid)
            self.start_times[pid] = time.time()
            
            # Log and sort
            if self.mode == "PRIORITY":
                self._sort_queue()
                
            pos = kernel_state.ready_queue.index(pid) + 1
            socket_bus.emit("READY_QUEUE", "ENQUEUE", 
                           f"Process {process_data.name} (PID: {pid}) entered READY queue at position #{pos}.", 
                           "INFO", {"pid": pid, "mode": self.mode, "position": pos})
                
            self._notify_update()
            return True

    def dequeue(self):
        with kernel_state.lock:
            if not kernel_state.ready_queue:
                return None
                
            pid = kernel_state.ready_queue.pop(0)
            if pid in self.start_times:
                del self.start_times[pid]
                
            process_data = self.process_manager.processes.get(pid)
            name = process_data.name if process_data else "Unknown"
            
            socket_bus.emit("READY_QUEUE", "DEQUEUE", 
                           f"Scheduler dequeued {name} (PID: {pid}) for CPU dispatch.", "INFO", {"pid": pid})
                
            self._notify_update()
            return pid

    def remove(self, pid):
        with kernel_state.lock:
            if pid in self.queue:
                self.queue.remove(pid)
                if pid in self.start_times:
                    del self.start_times[pid]
                self._notify_update()
                return True
            return False

    def set_mode(self, mode):
        if mode not in ["FIFO", "PRIORITY"]:
            return False
            
        # Prevent redundant updates and duplicate logs
        if self.mode == mode:
            return True
            
        old_mode = self.mode
        self.mode = mode
        
        if self.mode == "PRIORITY":
            self._sort_queue()
        elif self.mode == "FIFO":
            # Re-sort by arrival time to restore FIFO order
            self.queue.sort(key=lambda pid: self.process_manager.processes[pid].arrival_time)

        if self.event_logger:
            self.event_logger.log("READY_QUEUE", f"Queue algorithm switched: {old_mode} -> {self.mode}", "WARNING")
            
        if self.socketio:
            self.socketio.emit('queue_mode_changed', {"mode": self.mode})
            
        self._notify_update()
        return True

    def _sort_queue(self):
        # Priority sort: lower priority number = higher priority
        # Stable sort preserves arrival order for equal priority
        self.queue.sort(key=lambda pid: (self.process_manager.processes[pid].priority, self.process_manager.processes[pid].arrival_time))

    def _notify_update(self):
        socket_bus.broadcast_state()

    def get_queue(self):
        queue_data = []
        now = time.time()
        for idx, pid in enumerate(self.queue):
            p = self.process_manager.processes.get(pid)
            if p:
                wait_duration = round(now - self.start_times.get(pid, now), 2)
                data = p.to_dict()
                data["queue_position"] = idx + 1
                data["waiting_duration"] = wait_duration
                queue_data.append(data)
        return queue_data

    def get_stats(self):
        with kernel_state.lock:
            now = time.time()
            count = len(self.queue)
            total_wait = sum(now - self.start_times.get(pid, now) for pid in self.queue)
            avg_wait = round(total_wait / count, 2) if count > 0 else 0
            
            oldest_pid = self.queue[0] if self.queue else None
            oldest_name = "None"
            if oldest_pid:
                p = self.process_manager.processes.get(oldest_pid)
                oldest_name = p.name if p else "Unknown"

            return {
                "length": count,
                "average_waiting_time": avg_wait,
                "current_algorithm": self.mode,
                "oldest_waiting_process": oldest_name,
                "throughput": round(count / 60, 2) # Example metric: processes/min
            }

    def clear(self):
        with kernel_state.lock:
            kernel_state.ready_queue.clear()
            self.start_times = {}
        socket_bus.emit("READY_QUEUE", "CLEAR", "Ready queue cleared.", "WARNING")
        self._notify_update()

# Global instance
ready_queue_manager = ReadyQueueManager()
