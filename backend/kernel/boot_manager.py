import time
import threading
from kernel.kernel_state import kernel_state
from kernel.boot_event_bus import boot_event_bus
from kernel.boot_validator import boot_validator

class BootManager:
    """
    Orchestrates the cinematic NovaKernel startup sequence.
    """
    def __init__(self):
        self.lock = threading.Lock()
        self.is_booting = False
        self._boot_thread = None

    def start_boot_sequence(self, socketio):
        """Starts the asynchronous boot sequence."""
        print("[BOOT_MANAGER] Sequence Initiated.")
        with self.lock:
            if self.is_booting or kernel_state.kernel_ready:
                # Already booting or booted
                boot_event_bus.set_socket(socketio)
                return

            self.is_booting = True
            boot_event_bus.set_socket(socketio)
            
            # Reset state
            kernel_state.boot_state = "INITIALIZING"
            kernel_state.boot_progress = 0
            kernel_state.boot_logs.clear()
            
            self._boot_thread = threading.Thread(target=self._run_sequence, daemon=True)
            self._boot_thread.start()

    def _run_sequence(self):
        """Internal sequence runner."""
        try:
            phases = [
                ("INITIALIZING", "Initializing NovaKernel Core [v1.1.0]", 1.2),
                ("INITIALIZING", "Establishing Neural Link Interface", 0.6),
                ("LOADING_MODULES", "Mounting Virtual File System (Ext4v)", 1.0),
                ("LOADING_MODULES", "Loading Multi-Threaded Scheduler", 0.8),
                ("LOADING_MODULES", "Allocating Kernel Memory Pages", 0.8),
                ("SYNCING_HAL", "Synchronizing Hardware Abstraction Layer", 1.2),
                ("SYNCING_HAL", "Calibrating Disk I/O Controller", 0.6),
                ("STARTING_ANALYTICS", "Starting Real-time Analytics Engine", 1.0),
                ("STARTING_AI", "Igniting AI Kernel Assistant", 1.2),
                ("VERIFYING_KERNEL", "Performing Integrity Checksums", 1.0),
                ("VERIFYING_KERNEL", "Kernel Synchronization Established", 0.5),
                ("STABILIZING", "Stabilizing System Clock & Heartbeat", 0.8),
                ("ACTIVE", "NovaKernel System ACTIVE", 0.5)
            ]


            total_steps = len(phases)
            for i, (state, message, duration) in enumerate(phases):
                self._update_phase(state, message, int(((i + 1) / total_steps) * 100))
                time.sleep(duration)
                
                # Validation Hook
                if state == "VERIFYING_KERNEL":
                    self._perform_validation()

            # Finalize
            with kernel_state.lock:
                kernel_state.boot_state = "ACTIVE"
                kernel_state.boot_progress = 100
                kernel_state.kernel_ready = True
            
            boot_event_bus.emit_boot_update("ACTIVE", 100, force=True)
            boot_event_bus.emit_boot_log("System Online. Welcome, Operator.", "SUCCESS")
            boot_event_bus.emit_boot_complete()
            
        except Exception as e:
            print(f"BOOT_CRITICAL_PANIC: {str(e)}")
            import traceback
            traceback.print_exc()
            self._fallback_to_safe_mode(str(e))

        finally:
            self.is_booting = False

    def _update_phase(self, state, message, progress):
        """Updates global state and emits logs/events."""
        with kernel_state.lock:
            kernel_state.boot_state = state
            kernel_state.boot_progress = progress
            log = boot_event_bus.emit_boot_log(message, "INFO")
            kernel_state.boot_logs.append(log)
        
        boot_event_bus.emit_boot_update(state, progress)

    def _perform_validation(self):
        """Runs the boot validator and logs results."""
        results = boot_validator.validate_all()
        for res in results:
            severity = "SUCCESS" if res["status"] == "OK" else "WARN"
            msg = f"Validation [{res['module']}]: {res['details']}"
            
            with kernel_state.lock:
                log = boot_event_bus.emit_boot_log(msg, severity)
                kernel_state.boot_logs.append(log)
                
            if res["status"] != "OK":
                # Log to global event logs too
                kernel_state.event_logs.append({
                    "timestamp": time.time(),
                    "module": "BOOT_VALIDATOR",
                    "event_type": "VALIDATION_FAILURE",
                    "message": msg,
                    "severity": "WARN"
                })

    def _fallback_to_safe_mode(self, error_msg):
        """Gracefully enters safe mode if boot fails."""
        with kernel_state.lock:
            kernel_state.boot_state = "SAFE_MODE"
            kernel_state.kernel_ready = True # Allow access anyway
            log = boot_event_bus.emit_boot_log(f"BOOT_FAILURE: {error_msg}. Entering SAFE_MODE.", "ERROR")
            kernel_state.boot_logs.append(log)
            
        boot_event_bus.emit_boot_update("SAFE_MODE", 100, force=True)
        boot_event_bus.emit_boot_complete()

boot_manager = BootManager()
