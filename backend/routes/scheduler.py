from flask import Blueprint, jsonify, request
from os_modules.cpu_scheduler import scheduler_engine
from hardware.arduino_controller import arduino_controller

scheduler_bp = Blueprint('scheduler', __name__)

@scheduler_bp.route('/state', methods=['GET'])
def get_state():
    from kernel.kernel_state import kernel_state
    return jsonify(kernel_state.scheduler_state)

@scheduler_bp.route('/start', methods=['POST'])
def start_scheduler():
    scheduler_engine.start()
    return jsonify({"message": "Scheduler started", "status": "success"})

@scheduler_bp.route('/pause', methods=['POST'])
def pause_scheduler():
    scheduler_engine.pause()
    return jsonify({"message": "Scheduler paused", "status": "success"})

@scheduler_bp.route('/resume', methods=['POST'])
def resume_scheduler():
    scheduler_engine.resume()
    return jsonify({"message": "Scheduler resumed", "status": "success"})

@scheduler_bp.route('/stop', methods=['POST'])
def stop_scheduler():
    scheduler_engine.stop()
    return jsonify({"message": "Scheduler stopped", "status": "success"})

@scheduler_bp.route('/algorithm', methods=['POST'])
def set_algorithm():
    data = request.get_json()
    algo = data.get('algorithm')
    if scheduler_engine.set_algorithm(algo):
        return jsonify({"message": f"Algorithm set to {algo}", "status": "success"})
    return jsonify({"message": "Invalid algorithm", "status": "error"}), 400

@scheduler_bp.route('/quantum', methods=['POST'])
def set_quantum():
    data = request.get_json()
    val = data.get('quantum')
    try:
        scheduler_engine.set_quantum(float(val))
        return jsonify({"message": f"Quantum set to {val}", "status": "success"})
    except:
        return jsonify({"message": "Invalid quantum value", "status": "error"}), 400

@scheduler_bp.route('/reset', methods=['POST'])
def reset_simulation():
    scheduler_engine.stop()
    from os_modules.process_manager import process_manager
    from os_modules.memory_manager import memory_manager
    from os_modules.ready_queue import ready_queue_manager
    from kernel.socket_bus import socket_bus
    from kernel.kernel_state import kernel_state

    with kernel_state.lock:
        # Full purge
        for pid in list(process_manager.processes.keys()):
            process_manager.delete_process(pid)
        
        memory_manager.blocks = [memory_manager.blocks[0]] # Assuming first block is the large free one?
        # Actually better to use memory_manager's internal reset if it has one.
        # Let's just call deallocate on all or re-init.
        memory_manager.__init__(memory_manager.total_memory)
        ready_queue_manager.clear()
        # Reset Deadlock State
        kernel_state.deadlock_state = {
            "is_deadlocked": False,
            "detected_pids": [],
            "detection_timestamp": None,
            "resource_cycles": []
        }
        
        # Reset Metrics
        kernel_state.metrics = {
            "cpu_utilization": 0,
            "ram_pressure": 0,
            "process_throughput": 0,
            "avg_wait_time": 0,
            "avg_turnaround_time": 0
        }

        kernel_state.event_logs.clear()
        
        from monitoring.event_trace_engine import event_trace_engine
        event_trace_engine.clear()
        socket_bus.emit_raw("TRACE_HISTORY_CLEARED", {})

        # Reset Intelligence Engine
        from analytics.analytics_engine import analytics_engine
        analytics_engine.intelligence_engine.reset()
        
        # HARDWARE RESET
        arduino_controller.reset_all()

        # SNAPSHOT PURGE (Truly fresh start)
        import shutil
        snapshot_dir = "storage/snapshots"
        if os.path.exists(snapshot_dir):
            for filename in os.listdir(snapshot_dir):
                file_path = os.path.join(snapshot_dir, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    print(f'Failed to delete {file_path}. Reason: {e}')
        
    socket_bus.emit("KERNEL", "RESET", "System simulation has been fully reset and storage purged.", "CRITICAL")
    socket_bus.broadcast_state()
    return jsonify({"message": "Simulation reset", "status": "success"})
