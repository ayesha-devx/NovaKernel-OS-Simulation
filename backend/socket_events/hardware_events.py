from flask_socketio import emit
from hardware.arduino_controller import arduino_controller
from hardware.hardware_state import hardware_state_manager
from kernel.socket_bus import socket_bus

def register_hardware_events(socketio):
    @socketio.on('SWITCH_HAL_MODE')
    def handle_switch_mode(data):
        enabled = data.get('enabled', True)
        # Update backend state
        arduino_controller.toggle_simulation(enabled)
        
        # Broadcast the updated state to all clients via socket_bus for tracking/consistency
        socket_bus.emit_raw('HARDWARE_STATE_UPDATE', hardware_state_manager.to_dict())
        
        # Also log the event
        mode_str = "SIMULATION" if enabled else "REAL HARDWARE"
        socket_bus.emit_raw('HAL_LOG', {
            "message": f"HAL mode manually switched to {mode_str}",
            "severity": "INFO",
            "timestamp": hardware_state_manager.to_dict()["last_sync"],
            "event_type": "MODE_CHANGE"
        })

    @socketio.on('REQUEST_HARDWARE_STATE')
    def handle_request_state():
        socket_bus.emit_raw('HARDWARE_STATE_UPDATE', hardware_state_manager.to_dict())
