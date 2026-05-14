import time
import random
import threading
from hardware.hardware_state import hardware_state_manager
from hardware.hardware_logger import hardware_logger

class MockHardware:
    """
    VIRTUAL ARDUINO SIMULATOR.
    Simulates LED transitions, buzzer pulses, and latency when real hardware is missing.
    """
    def __init__(self):
        self.latency_range = (0.01, 0.05) # 10-50ms simulated latency

    def process_command(self, command):
        """Simulates the effect of a serial command on the virtual board."""
        # 1. Simulate Latency
        delay = random.uniform(*self.latency_range)
        time.sleep(delay)
        hardware_state_manager.latency_ms = int(delay * 1000)

        # 2. Parse and Update State
        if command.startswith("P"):
            try:
                slot = int(command[1])
                state_code = command.split("_")[1]
                self._update_slot(slot, state_code)
            except:
                pass
        
        elif command == "DEADLOCK":
            hardware_state_manager.special_leds["DEADLOCK"] = True
            hardware_state_manager.buzzer_active = True
        
        elif command == "DISK_ACTIVE":
            from kernel.socket_bus import socket_bus
            from kernel.kernel_state import kernel_state
            
            hardware_state_manager.special_leds["DISK"] = True
            # Force update snapshot and broadcast immediately
            kernel_state.hardware_state = hardware_state_manager.to_dict()
            socket_bus.broadcast_state()

            # Create a pulse effect
            def _off():
                time.sleep(0.3) # Longer pulse for better UI visibility
                hardware_state_manager.special_leds["DISK"] = False
                kernel_state.hardware_state = hardware_state_manager.to_dict()
                socket_bus.broadcast_state()
            
            threading.Thread(target=_off, daemon=True).start()
        
        elif command == "RESET_ALL":
            self._reset_all()
            
        elif command == "DEMO":
            self._run_demo()

        # 3. Log
        hardware_state_manager.log_command(command)
        # hardware_logger.log(f"[MOCK] Command '{command}' processed visually.", "INFO")

    def _update_slot(self, slot, state_code):
        # Reset all LEDs for this slot first (exclusive states)
        for key in hardware_state_manager.led_states[slot]:
            hardware_state_manager.led_states[slot][key] = False
        
        if state_code == "READY":
            hardware_state_manager.led_states[slot]["READY"] = True
        elif state_code == "RUNNING":
            hardware_state_manager.led_states[slot]["RUNNING"] = True
        elif state_code == "WAIT":
            hardware_state_manager.led_states[slot]["WAITING"] = True
        elif state_code == "DONE":
            # Termination: briefly flash then off? Or just off.
            # In simulation we'll just keep it off.
            pass

    def _reset_all(self):
        for slot in hardware_state_manager.led_states:
            for led in hardware_state_manager.led_states[slot]:
                hardware_state_manager.led_states[slot][led] = False
        hardware_state_manager.special_leds["DEADLOCK"] = False
        hardware_state_manager.special_leds["DISK"] = False
        hardware_state_manager.special_leds["TERMINATION"] = False
        hardware_state_manager.buzzer_active = False

    def _run_demo(self):
        # Just a visual reset for now
        self._reset_all()

mock_hardware = MockHardware()
