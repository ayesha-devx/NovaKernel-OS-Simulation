import threading
import time
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus
from kernel.error_recovery import error_recovery
from kernel.lifecycle_engine import lifecycle_engine
from kernel.resource_cleaner import resource_cleaner
from os_modules.process_manager import process_manager
from os_modules.memory_manager import memory_manager
from os_modules.cpu_scheduler import scheduler_engine
from os_modules.ready_queue import ready_queue_manager
from os_modules.file_system import fs_engine
from os_modules.deadlock_detector import deadlock_detector
from os_modules.disk_scheduler import disk_scheduler
from hardware.hardware_state import hardware_state_manager
from analytics.analytics_engine import analytics_engine
# from kernel.boot_manager import boot_manager (Moved to method to avoid circular import)

class NovaKernelMaster:
    """
    UNIFIED OPERATING SYSTEM KERNEL.
    Orchestrates all subsystems and maintains global stability.
    """
    def __init__(self):
        self.version = "1.1.0-STABLE-INTEGRATED"
        self.is_running = False
        self.sync_thread = None
        self.lock = threading.Lock()

    def boot(self, socketio):
        """Initializes all subsystems and starts the kernel heartbeat."""
        print(f"--- NovaKernel {self.version} Booting ---")
        
        # 1. Initialize Communication
        socket_bus.set_socket(socketio)
        kernel_state.status = "INITIALIZING"
        
        # 2. Inject Dependencies (Cross-Module Sync)
        # Process Manager needs Ready Queue and Memory Manager
        ready_queue_manager.set_dependencies(socketio, socket_bus, process_manager)
        scheduler_engine.set_dependencies(socketio, socket_bus, process_manager)
        # Note: New architecture uses global instances mostly, but we keep set_dependencies for legacy support if needed
        
        # 3. Mark Subsystems as Healthy (Internal Init)
        deadlock_detector.start()
        disk_scheduler.start()
        analytics_engine.start()
        
        # Start Monitoring Engine (Phase 1)
        from monitoring.performance_monitor import performance_monitor
        from monitoring.diagnostics_engine import diagnostics_engine
        performance_monitor.start(socketio)
        diagnostics_engine.start()
        
        # 4. Start Kernel Boot Manager (Cinematic Layer)
        from kernel.boot_manager import boot_manager
        boot_manager.start_boot_sequence(socketio)
        
        # 5. Start Kernel Heartbeat Thread
        self.is_running = True
        self.sync_thread = threading.Thread(target=self._kernel_heartbeat, daemon=True)
        self.sync_thread.start()

    def _kernel_heartbeat(self):
        """Main kernel loop for monitoring, analytics, and error recovery."""
        last_metrics_update = 0
        while self.is_running:
            try:
                now = time.time()
                
                # Update System Uptime
                kernel_state.update_uptime()
                
                # Sync Hardware State
                kernel_state.hardware_state = hardware_state_manager.to_dict()

                # Perform Integrity Check every 5 seconds
                if now - last_metrics_update >= 5.0:
                    error_recovery.validate_kernel_integrity()
                    last_metrics_update = now
                
                # Broadcast state to all clients
                socket_bus.broadcast_state()
                
                time.sleep(1.0) # 1Hz heartbeat
                
            except Exception as e:
                print(f"KERNEL_PANIC: {str(e)}")
                error_recovery.handle_subsystem_failure("kernel_core", str(e))
                time.sleep(1.0)

    def get_full_state(self):
        return kernel_state.get_full_state()

# Global Instance
kernel = NovaKernelMaster()
