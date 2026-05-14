from flask import Blueprint, jsonify, request
from os_modules.process_manager import process_manager
from kernel.socket_bus import socket_bus

process_bp = Blueprint('process', __name__)

@process_bp.route('/all', methods=['GET'])
def get_processes():
    return jsonify(process_manager.get_all_processes())

@process_bp.route('/create', methods=['POST'])
def create_process():
    data = request.json
    try:
        # Validation
        name = data.get('name', f"P-{process_manager.next_pid}")
        priority = int(data.get('priority', 5))
        burst_time = int(data.get('burst_time', 10))
        memory_required = int(data.get('memory_required', 128))
        
        if burst_time <= 0 or memory_required <= 0 or not (1 <= priority <= 10):
            return jsonify({"error": "Invalid parameters. Burst/Memory must be > 0, Priority 1-10."}), 400
            
        process = process_manager.create_process(name, priority, burst_time, memory_required)
        
        if not process:
            return jsonify({"error": "Insufficient contiguous RAM to spawn process. Try Best Fit or Reset Memory."}), 400
            
        socket_bus.broadcast_state()
        return jsonify(process.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@process_bp.route('/state/<int:pid>', methods=['PUT'])
def update_state(pid):
    data = request.json
    new_state = data.get('state')
    
    valid_states = ["NEW", "READY", "RUNNING", "WAITING", "TERMINATED"]
    if new_state not in valid_states:
        return jsonify({"error": "Invalid state"}), 400
        
    updated_process = process_manager.update_process_state(pid, new_state)
    if updated_process:
        socket_bus.broadcast_state()
        return jsonify(updated_process)
    
    return jsonify({"error": "Process not found"}), 404

@process_bp.route('/delete/<int:pid>', methods=['DELETE'])
def delete_process(pid):
    if process_manager.delete_process(pid):
        socket_bus.broadcast_state()
        return jsonify({"message": "Process deleted"})
    return jsonify({"error": "Process not found"}), 404

@process_bp.route('/logs/clear', methods=['DELETE'])
def clear_logs():
    from os_modules.event_logger import event_logger
    from kernel.kernel_state import kernel_state
    
    # Clear internal event logger
    event_logger.clear_logs()
    
    # Clear the centralized kernel event logs
    with kernel_state.lock:
        kernel_state.event_logs.clear()
        
    # Broadcast the "logs_cleared" signal for immediate UI response
    from flask_socketio import emit
    emit('logs_cleared', namespace='/', broadcast=True)
    
    # Also broadcast full state to ensure synchronization
    socket_bus.broadcast_state()
    
    return jsonify({"message": "Logs cleared"})


@process_bp.route('/fork/<int:pid>', methods=['POST'])
def fork_process(pid):
    child = process_manager.fork_process(pid)
    if child:
        socket_bus.broadcast_state()
        return jsonify(child)
    return jsonify({"error": "Parent process not found"}), 404

@process_bp.route('/tree', methods=['GET'])
def get_process_tree():
    return jsonify(process_manager.get_process_tree())
