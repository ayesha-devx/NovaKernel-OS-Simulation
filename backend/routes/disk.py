from flask import Blueprint, jsonify, request
from kernel.kernel_state import kernel_state
from os_modules.disk_scheduler import disk_scheduler
from os_modules.disk_request_manager import disk_request_manager
from os_modules.disk_metrics import disk_metrics
from kernel.socket_bus import socket_bus

disk_bp = Blueprint('disk', __name__)

@disk_bp.route('/state', methods=['GET'])
def get_disk_state():
    with kernel_state.lock:
        return jsonify({
            "state": kernel_state.disk_state,
            "metrics": kernel_state.disk_metrics
        })

@disk_bp.route('/algorithm', methods=['POST'])
def set_algorithm():
    data = request.json
    algo = data.get("algorithm")
    if algo:
        disk_scheduler.set_algorithm(algo)
        socket_bus.broadcast_state()
        return jsonify({"success": True, "message": f"Algorithm set to {algo}"})
    return jsonify({"success": False, "message": "Missing algorithm"}), 400

@disk_bp.route('/request', methods=['POST'])
def add_request():
    data = request.json
    track = data.get("track")
    op = data.get("type", "READ")
    pid = data.get("pid", "SYS")
    
    if track is not None:
        req = disk_request_manager.add_request(int(track), op, pid)
        socket_bus.broadcast_state()
        return jsonify({"success": True, "request": req})
    return jsonify({"success": False, "message": "Missing track"}), 400

@disk_bp.route('/simulate', methods=['POST'])
def simulate_load():
    count = request.json.get("count", 5)
    for _ in range(count):
        disk_request_manager.generate_random_request()
    
    socket_bus.broadcast_state()
    return jsonify({"success": True, "message": f"Generated {count} random requests"})

@disk_bp.route('/reset', methods=['POST'])
def reset_disk():
    disk_request_manager.clear_queue()
    disk_metrics.reset()
    return jsonify({"success": True, "message": "Disk subsystem reset"})
