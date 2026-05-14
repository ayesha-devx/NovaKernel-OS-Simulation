import threading
import time
from core.kernel_bus import kernel_bus
from core.kernel_analytics import kernel_analytics
from os_modules.process_manager import process_manager
from os_modules.memory_manager import memory_manager
from os_modules.cpu_scheduler import scheduler_engine
from os_modules.ready_queue import ready_queue_manager
from os_modules.file_system import fs_engine

class NovaKernel:
    def __init__(self):
        self.version = "1.0.0-PRO-INTEGRATED"
        self.is_running = True
        self.socketio = None
        
        # Core Components Reference
        self.bus = kernel_bus
        self.analytics = kernel_analytics
        
        # Subsystems Reference
        self.process_manager = process_manager
        self.memory_manager = memory_manager
        self.scheduler = scheduler_engine
        self.ready_queue = ready_queue_manager
        self.filesystem = fs_engine

        self.sync_thread = None
        self.lock = threading.Lock()

    def boot(self, socketio):
        self.socketio = socketio
        self.bus.set_socket(socketio)
        
        # Inject dependencies across modules
        self.process_manager.event_logger = self.bus # Use bus as logger
        self.memory_manager.set_dependencies(socketio, self.bus)
        self.ready_queue.set_dependencies(socketio, self.bus, self.process_manager)
        self.scheduler.set_dependencies(socketio, self.bus, self.process_manager)
        self.filesystem.set_dependencies(socketio, self.bus)

        self.bus.emit("KERNEL_CORE", "SYSTEM_BOOT", "NovaKernel Engine initialized and synchronized.", "SUCCESS")
        
        # Start background sync thread
        self.sync_thread = threading.Thread(target=self._kernel_loop, daemon=True)
        self.sync_thread.start()

    def _kernel_loop(self):
        """Main background loop for kernel heartbeat and analytics sync"""
        while self.is_running:
            state = self.get_full_state()
            self.analytics.update(state)
            
            if self.socketio:
                self.socketio.emit('kernel_state_updated', state)
                self.socketio.emit('analytics_updated', self.analytics.get_summary())
                
            time.sleep(1.0) # Heartbeat interval

    def get_full_state(self):
        with self.lock:
            return {
                "system": {
                    "version": self.version,
                    "status": "ACTIVE",
                    "uptime": self.analytics.metrics["uptime"],
                    "health": self.analytics.metrics["health_score"]
                },
                "processes": self.process_manager.get_all_processes(),
                "scheduler": self.scheduler.get_state(),
                "memory": {
                    "blocks": [b.to_dict() for b in self.memory_manager.blocks],
                    "stats": self.memory_manager.get_statistics()
                },
                "ready_queue": self.ready_queue.queue,
                "filesystem": self.filesystem.get_state(),
                "logs": self.bus.get_logs()
            }

# Global Instance
kernel = NovaKernel()
