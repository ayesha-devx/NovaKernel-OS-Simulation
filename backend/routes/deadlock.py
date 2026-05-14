from flask import Blueprint, jsonify, request
from os_modules.resource_manager import resource_manager
from os_modules.deadlock_detector import deadlock_detector
from os_modules.deadlock_recovery import deadlock_recovery
from kernel.kernel_state import kernel_state

deadlock_bp = Blueprint('deadlock', __name__)

# ─────────────────────────────────────────────────────────────
#  EXISTING ENDPOINTS (unchanged)
# ─────────────────────────────────────────────────────────────

@deadlock_bp.route('/state', methods=['GET'])
def get_deadlock_state():
    return jsonify({
        "deadlock": kernel_state.deadlock_state,
        "resources": kernel_state.resource_state["resources"]
    })

@deadlock_bp.route('/resource/request', methods=['POST'])
def request_res():
    data = request.get_json()
    pid = data.get('pid')
    rid = data.get('rid')
    success, msg = resource_manager.request_resource(int(pid), rid)
    return jsonify({"success": success, "message": msg})

@deadlock_bp.route('/resource/release', methods=['POST'])
def release_res():
    data = request.get_json()
    pid = data.get('pid')
    rid = data.get('rid')
    success, msg = resource_manager.release_resource(int(pid), rid)
    return jsonify({"success": success, "message": msg})

@deadlock_bp.route('/recover/auto', methods=['POST'])
def auto_recover():
    """Auto-recover. Accepts optional 'strategy' in request body."""
    data = request.get_json(silent=True) or {}
    strategy = data.get('strategy', 'LOWEST_PRIORITY')
    success, msg = deadlock_recovery.auto_recover(strategy=strategy)
    return jsonify({"success": success, "message": msg})

@deadlock_bp.route('/simulate', methods=['POST'])
def simulate_deadlock():
    """
    Creates a guaranteed deadlock:
    P1 holds R1, wants R2
    P2 holds R2, wants R1
    """
    from os_modules.process_manager import process_manager
    from os_modules.recovery_timeline import recovery_timeline

    # Clear timeline for fresh simulation
    recovery_timeline.clear_timeline()
    recovery_timeline.add_event("SIMULATION", "Deadlock simulation initiated.", "WARNING")

    # 1. Create two dummy processes if not enough exist
    p1 = process_manager.create_process("Deadlock-A", 5, 10, 128)
    p2 = process_manager.create_process("Deadlock-B", 5, 10, 128)

    pid1 = p1.pid
    pid2 = p2.pid

    # 2. Setup circular wait
    resource_manager.request_resource(pid1, "R1") # P1 gets R1
    resource_manager.request_resource(pid2, "R2") # P2 gets R2

    # 3. Create the cross-requests (deadlock!)
    resource_manager.request_resource(pid1, "R2") # P1 waits for R2
    resource_manager.request_resource(pid2, "R1") # P2 waits for R1

    recovery_timeline.add_event(
        "SIMULATION",
        f"Circular wait established: P{pid1}↔P{pid2} via R1,R2.",
        "CRITICAL",
        {"pid1": pid1, "pid2": pid2}
    )
    recovery_timeline.broadcast_timeline()

    return jsonify({"message": "Deadlock simulation initiated", "pids": [pid1, pid2]})

@deadlock_bp.route('/reset', methods=['POST'])
def reset_resources():
    """Full atomic kernel reset."""
    from os_modules.recovery_timeline import recovery_timeline
    from os_modules.recovery_animation_engine import recovery_animation_engine
    from analytics.recovery_analytics import recovery_analytics

    # 1. Reset Resource Manager & Deadlock State
    resource_manager.reset()

    # 2. Reset Process Manager (Kill all)
    from os_modules.process_manager import process_manager
    process_manager.reset()

    # 3. Reset Hardware
    from hardware.hardware_event_bridge import hardware_event_bridge
    hardware_event_bridge.on_system_reset()

    # 4. Reset Phase 4 modules
    recovery_timeline.clear_timeline()
    recovery_animation_engine.reset()

    # 5. Reset Analytics & Intelligence
    from analytics.analytics_engine import analytics_engine
    analytics_engine.intelligence_engine.reset()

    recovery_timeline.add_event("SYSTEM_RESET", "Full kernel reset completed.", "SUCCESS")
    recovery_timeline.broadcast_timeline()

    return jsonify({"success": True, "message": "FULL KERNEL RESET SUCCESSFUL"})


# ─────────────────────────────────────────────────────────────
#  NEW PHASE 4 ENDPOINTS
# ─────────────────────────────────────────────────────────────

@deadlock_bp.route('/timeline', methods=['GET'])
def get_timeline():
    """GET /api/deadlock/timeline — returns the recovery event timeline."""
    from os_modules.recovery_timeline import recovery_timeline
    n = request.args.get('n', 50, type=int)
    return jsonify({"events": recovery_timeline.get_recent_events(n)})

@deadlock_bp.route('/timeline/clear', methods=['POST'])
def clear_timeline():
    """POST /api/deadlock/timeline/clear — wipe the timeline."""
    from os_modules.recovery_timeline import recovery_timeline
    recovery_timeline.clear_timeline()
    return jsonify({"success": True})

@deadlock_bp.route('/animation/state', methods=['GET'])
def get_animation_state():
    """GET /api/deadlock/animation/state — current animation phase."""
    from os_modules.recovery_animation_engine import recovery_animation_engine
    return jsonify(recovery_animation_engine.get_current_state())

@deadlock_bp.route('/animation/replay', methods=['GET'])
def get_replay_buffer():
    """GET /api/deadlock/animation/replay — full last recovery sequence for playback."""
    from os_modules.recovery_animation_engine import recovery_animation_engine
    return jsonify({"phases": recovery_animation_engine.get_replay_buffer()})

@deadlock_bp.route('/analytics', methods=['GET'])
def get_recovery_analytics():
    """GET /api/deadlock/analytics — recovery metrics summary."""
    from analytics.recovery_analytics import recovery_analytics
    return jsonify(recovery_analytics.get_summary())

@deadlock_bp.route('/victim/strategies', methods=['GET'])
def get_victim_strategies():
    """GET /api/deadlock/victim/strategies — list available strategies."""
    from os_modules.victim_selector import ALL_STRATEGIES
    return jsonify({"strategies": ALL_STRATEGIES})
