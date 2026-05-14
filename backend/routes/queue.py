from flask import Blueprint, jsonify, request
from os_modules.ready_queue import ready_queue_manager

queue_bp = Blueprint('queue', __name__)

@queue_bp.route('/', methods=['GET'])
def get_queue():
    return jsonify(ready_queue_manager.get_queue())

@queue_bp.route('/enqueue/<int:pid>', methods=['POST'])
def enqueue_process(pid):
    success = ready_queue_manager.enqueue(pid)
    if success:
        return jsonify({"message": f"Process {pid} enqueued", "status": "success"})
    return jsonify({"message": f"Failed to enqueue process {pid}", "status": "error"}), 400

@queue_bp.route('/dequeue', methods=['POST'])
def dequeue_process():
    pid = ready_queue_manager.dequeue()
    if pid:
        return jsonify({"message": f"Process {pid} dequeued", "pid": pid, "status": "success"})
    return jsonify({"message": "Queue is empty", "status": "error"}), 400

@queue_bp.route('/mode', methods=['POST'])
def switch_mode():
    data = request.get_json()
    mode = data.get('mode')
    if ready_queue_manager.set_mode(mode):
        return jsonify({"message": f"Queue mode set to {mode}", "status": "success"})
    return jsonify({"message": "Invalid mode", "status": "error"}), 400

@queue_bp.route('/stats', methods=['GET'])
def get_stats():
    return jsonify(ready_queue_manager.get_stats())

@queue_bp.route('/clear', methods=['POST'])
def clear_queue():
    ready_queue_manager.clear()
    return jsonify({"message": "Queue cleared", "status": "success"})
