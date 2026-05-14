from flask import Blueprint, jsonify, request
from os_modules.memory_manager import memory_manager

memory_bp = Blueprint('memory', __name__)

@memory_bp.route('/map', methods=['GET'])
def get_memory_map():
    return jsonify({
        "blocks": [b.to_dict() for b in memory_manager.blocks],
        "stats": memory_manager.get_statistics()
    })

@memory_bp.route('/algorithm', methods=['POST'])
def set_algorithm():
    data = request.json
    algo = data.get('algorithm')
    if memory_manager.set_algorithm(algo):
        return jsonify({"status": "success", "message": f"Algorithm set to {algo}"})
    return jsonify({"status": "error", "message": "Invalid algorithm"}), 400

@memory_bp.route('/stats', methods=['GET'])
def get_stats():
    return jsonify(memory_manager.get_statistics())

@memory_bp.route('/reset', methods=['POST'])
def reset_memory():
    # Logic to reset memory to initial state
    memory_manager.blocks = [memory_manager.blocks[0].__class__(0, 0, memory_manager.total_memory)]
    memory_manager.next_block_id = 1
    memory_manager.total_allocated = 0
    memory_manager.allocation_failures = 0
    memory_manager._notify_update()
    return jsonify({"status": "success", "message": "Memory reset complete"})
