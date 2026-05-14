from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "version": "1.0.0",
        "service": "NovaKernel Engine"
    })

@health_bp.route('/monitoring/debug')
def monitoring_debug():
    from monitoring.monitoring_state import monitoring_state
    return jsonify(monitoring_state.to_dict())
