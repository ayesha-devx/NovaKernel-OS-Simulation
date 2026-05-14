# NovaKernel AI Routes
from flask import Blueprint, jsonify, request
from ai.kernel_ai_engine import kernel_ai_engine

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/query', methods=['POST'])
def process_query():
    data = request.json
    query = data.get('query', '')
    if not query:
        return jsonify({"error": "No query provided"}), 400
        
    result = kernel_ai_engine.process_query(query)
    return jsonify(result)

@ai_bp.route('/intelligence', methods=['GET'])
def get_intelligence():
    report = kernel_ai_engine.get_live_intelligence()
    return jsonify(report)

@ai_bp.route('/history', methods=['GET'])
def get_history():
    from ai.ai_state import ai_state
    return jsonify({
        "history": ai_state.conversation_history
    })
