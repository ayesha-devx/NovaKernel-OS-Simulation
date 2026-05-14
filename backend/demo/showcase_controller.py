from flask import Blueprint, jsonify, request
from demo.demo_engine import demo_engine
from demo.demo_state import demo_state
from kernel.socket_bus import socket_bus

demo_bp = Blueprint('demo', __name__)

@demo_bp.route('/state', methods=['GET'])
def get_demo_state():
    return jsonify(demo_state.to_dict())

@demo_bp.route('/start', methods=['POST'])
def start_demo():
    if demo_engine.start_showcase():
        return jsonify({"success": True, "message": "Showcase started"})
    return jsonify({"success": False, "message": "Showcase already active"}), 400

@demo_bp.route('/stop', methods=['POST'])
def stop_demo():
    demo_engine.stop_showcase()
    return jsonify({"success": True, "message": "Showcase stopped"})

@demo_bp.route('/pause', methods=['POST'])
def pause_demo():
    demo_state.update(paused=True)
    socket_bus.emit_raw('demo_state_updated', demo_state.to_dict())
    return jsonify({"success": True, "message": "Showcase paused"})

@demo_bp.route('/resume', methods=['POST'])
def resume_demo():
    demo_state.update(paused=False)
    socket_bus.emit_raw('demo_state_updated', demo_state.to_dict())
    return jsonify({"success": True, "message": "Showcase resumed"})

@demo_bp.route('/speed', methods=['POST'])
def set_speed():
    data = request.json
    speed = data.get("speed", 1.0)
    demo_state.update(playback_speed=max(0.1, min(5.0, speed)))
    socket_bus.emit_raw('demo_state_updated', demo_state.to_dict())
    return jsonify({"success": True, "speed": speed})
