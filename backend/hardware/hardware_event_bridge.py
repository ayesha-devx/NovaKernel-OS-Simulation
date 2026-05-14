from hardware.arduino_controller import arduino_controller
from hardware.hardware_logger import hardware_logger

class HardwareEventBridge:
    """
    CENTRAL CONNECTOR.
    Routes Kernel events to the Hardware HAL.
    """
    
    @staticmethod
    def on_process_created(pid):
        slot = arduino_controller.assign_slot(pid)
        if slot:
            hardware_logger.log(f"PID {pid} assigned to Hardware Slot {slot}", "INFO")
        else:
            hardware_logger.log(f"PID {pid} ignored by Hardware (No slots available)", "WARNING")
        
        from analytics.analytics_engine import analytics_engine
        analytics_engine.record_event("HARDWARE", "SLOT_ASSIGNED", f"PID {pid} mapped to slot {slot}", pid=pid)

    @staticmethod
    def on_state_change(pid, new_state):
        if new_state == "READY":
            arduino_controller.process_ready(pid)
        elif new_state == "RUNNING":
            arduino_controller.process_running(pid)
        elif new_state == "WAITING":
            arduino_controller.process_waiting(pid)
        elif new_state == "TERMINATED":
            arduino_controller.process_terminated(pid)
        
        from analytics.analytics_engine import analytics_engine
        analytics_engine.record_event("HARDWARE", "SIGNAL_SENT", f"Hardware signal: {new_state} for PID {pid}", pid=pid)

    @staticmethod
    def on_deadlock():
        arduino_controller.deadlock_detected()
        from analytics.analytics_engine import analytics_engine
        analytics_engine.record_event("HARDWARE", "DEADLOCK_ALARM", "Hardware deadlock alarm triggered", "CRITICAL")

    @staticmethod
    def on_disk_activity():
        arduino_controller.disk_activity()
        from analytics.analytics_engine import analytics_engine
        analytics_engine.record_event("HARDWARE", "DISK_PULSE", "Hardware disk activity pulse", "INFO")

    @staticmethod
    def on_system_reset():
        arduino_controller.reset_all()
        from analytics.analytics_engine import analytics_engine
        analytics_engine.record_event("HARDWARE", "SYSTEM_RESET", "Hardware subsystem reset", "WARNING")

hardware_event_bridge = HardwareEventBridge()
