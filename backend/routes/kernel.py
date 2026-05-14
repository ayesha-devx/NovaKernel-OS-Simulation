from flask import Blueprint, jsonify
from kernel.nova_kernel import kernel
from kernel.kernel_state import kernel_state

kernel_bp = Blueprint('kernel', __name__)

@kernel_bp.route('/state', methods=['GET'])
def get_kernel_state():
    return jsonify(kernel.get_full_state())

@kernel_bp.route('/analytics', methods=['GET'])
def get_analytics():
    # Integrated metrics from kernel state
    return jsonify(kernel_state.metrics)

@kernel_bp.route('/logs', methods=['GET'])
def get_logs():
    # Centralized event logs
    return jsonify(kernel_state.event_logs)
