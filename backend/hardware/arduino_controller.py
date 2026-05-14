from hardware.serial_manager import serial_manager
from hardware.command_mapper import command_mapper
from hardware.hardware_state import hardware_state_manager
from hardware.hardware_logger import hardware_logger

class ArduinoController:
    """
    HIGH-LEVEL HARDWARE API.
    Used by Kernel modules to interact with physical or virtual hardware.
    """
    def __init__(self):
        self.process_slots = {}  # { pid: slot_id }
        self.simulation_mode = True
        hardware_logger.log("NovaKernel Hardware Controller initialized and ready.", "SUCCESS")

    def assign_slot(self, pid):
        """Assigns a hardware slot (1-3) to a process."""
        used_slots = set(self.process_slots.values())
        for slot in [1, 2, 3]:
            if slot not in used_slots:
                self.process_slots[pid] = slot
                return slot
        return None

    def release_slot(self, pid):
        """Releases a slot for future use."""
        if pid in self.process_slots:
            del self.process_slots[pid]

    def _send(self, pid, state):
        slot = self.process_slots.get(pid)
        if slot:
            command = command_mapper.get_command(slot, state)
            if command:
                serial_manager.send(command)

    # API Methods
    def process_ready(self, pid):
        self._send(pid, "READY")

    def process_running(self, pid):
        self._send(pid, "RUNNING")

    def process_waiting(self, pid, slot=None):
        # Allow passing slot directly if pid not assigned yet
        if pid:
            self._send(pid, "WAITING")
        elif slot:
            command = command_mapper.get_command(slot, "WAITING")
            serial_manager.send(command)

    def process_terminated(self, pid):
        slot = self.process_slots.get(pid)
        if slot:
            self._send(pid, "TERMINATED")
            self.release_slot(pid)

    def deadlock_detected(self):
        serial_manager.send(command_mapper.DEADLOCK)

    def disk_activity(self):
        serial_manager.send(command_mapper.DISK_ACTIVE)

    def reset_all(self):
        self.process_slots.clear()
        serial_manager.send(command_mapper.RESET_ALL)
        hardware_logger.log("Global Hardware Reset triggered.", "WARNING")

    def startup_demo(self):
        serial_manager.send(command_mapper.DEMO)

    def toggle_simulation(self, enabled):
        hardware_state_manager.set_simulation_mode(enabled)
        mode = "SIMULATION" if enabled else "HARDWARE"
        hardware_logger.log(f"Operating mode switched to {mode}", "INFO")

arduino_controller = ArduinoController()
