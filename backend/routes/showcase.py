from flask import Blueprint, jsonify, request
from showcase.showcase_engine import showcase_engine
from showcase.showcase_state import showcase_state

showcase_bp = Blueprint('showcase', __name__)

@showcase_bp.route('/scenarios', methods=['GET'])
def list_scenarios():
    return jsonify(showcase_engine.get_available_scenarios())

@showcase_bp.route('/state', methods=['GET'])
def get_state():
    return jsonify(showcase_state.to_dict())

@showcase_bp.route('/start/<scenario_id>', methods=['POST'])
def start_showcase(scenario_id):
    if showcase_engine.start_showcase(scenario_id):
        return jsonify({"success": True, "message": f"Scenario {scenario_id} started."})
    return jsonify({"success": False, "message": "Failed to start scenario."}), 400

@showcase_bp.route('/pause', methods=['POST'])
def pause_showcase():
    showcase_engine.pause_showcase()
    return jsonify({"success": True})

@showcase_bp.route('/resume', methods=['POST'])
def resume_showcase():
    showcase_engine.resume_showcase()
    return jsonify({"success": True})

@showcase_bp.route('/stop', methods=['POST'])
def stop_showcase():
    showcase_engine.stop_showcase()
    return jsonify({"success": True})
