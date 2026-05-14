from flask import Blueprint, jsonify, request
from hardware.arduino_controller import arduino_controller
from hardware.hardware_state import hardware_state_manager
from kernel.socket_bus import socket_bus

hardware_bp = Blueprint('hardware', __name__)

@hardware_bp.route('/state', methods=['GET'])
def get_hardware_state():
    return jsonify(hardware_state_manager.to_dict())

@hardware_bp.route('/simulation', methods=['POST'])
def toggle_simulation():
    data = request.get_json()
    enabled = data.get('enabled', True)
    arduino_controller.toggle_simulation(enabled)
    
    # Broadcast to all clients
    socket_bus.emit_raw('HARDWARE_STATE_UPDATE', hardware_state_manager.to_dict())
    
    return jsonify({"status": "success", "simulation_mode": enabled})

@hardware_bp.route('/reset', methods=['POST'])
def reset_hardware():
    arduino_controller.reset_all()
    # Broadcast to all clients
    socket_bus.emit_raw('HARDWARE_STATE_UPDATE', hardware_state_manager.to_dict())
    return jsonify({"status": "success", "message": "Hardware reset triggered"})

@hardware_bp.route('/demo', methods=['POST'])
def run_demo():
    arduino_controller.startup_demo()
    return jsonify({"status": "success", "message": "Demo sequence started"})
