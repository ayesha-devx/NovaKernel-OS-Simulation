from flask_socketio import emit
from monitoring.monitoring_state import monitoring_state
from monitoring.performance_monitor import performance_monitor
from monitoring.monitoring_utils import Throttler
import time
import threading

_perf_throttler = Throttler(2.0) # Max 2 per sec
_diag_throttler = Throttler(2.0)
_monitoring_thread = None
_is_monitoring_active = False

def start_socket_monitoring_loop(socketio):
    global _is_monitoring_active, _monitoring_thread
    if _is_monitoring_active:
        return
    _is_monitoring_active = True
    
    def loop():
        print("[MONITORING] Background Emit Loop Started")
        while _is_monitoring_active:
            try:
                monitoring_state.enabled = True
                
                if monitoring_state.enabled:
                    # PERFORMANCE_UPDATE
                    socketio.emit('PERFORMANCE_UPDATE', {
                        "metrics": monitoring_state.metrics,
                        "timestamp": time.time(),
                        "pulse_id": hash(time.time()) # Force React update
                    })
                    performance_monitor.track_socket_emit()
                        
                    # DIAGNOSTICS_UPDATE
                    socketio.emit('DIAGNOSTICS_UPDATE', {
                        "health": monitoring_state.backend_health,
                        "score": monitoring_state.performance_score,
                        "subsystems": monitoring_state.diagnostics["subsystems"],
                        "warnings": monitoring_state.diagnostics["warnings"],
                        "watchdog": monitoring_state.diagnostics["watchdog_status"],
                        "timestamp": time.time(),
                        "pulse_id": hash(time.time())
                    })
                    performance_monitor.track_socket_emit()
            except Exception as e:
                print(f"[MONITORING] Emit Error: {str(e)}")
            socketio.sleep(0.5) # Use socketio.sleep for better async behavior
            
    _monitoring_thread = socketio.start_background_task(loop)

def register_monitoring_events(socketio):
    """
    Registers the monitoring listeners and starts the background emit loop.
    """
    @socketio.on('START_MONITORING')
    def handle_start_monitoring():
        monitoring_state.enabled = True
        
    @socketio.on('STOP_MONITORING')
    def handle_stop_monitoring():
        monitoring_state.enabled = False

    @socketio.on('REQUEST_MONITORING_DATA')
    def handle_request_monitoring():
        emit('PERFORMANCE_UPDATE', {
            "metrics": monitoring_state.metrics,
            "timestamp": time.time()
        })
        emit('DIAGNOSTICS_UPDATE', {
            "health": monitoring_state.backend_health,
            "score": monitoring_state.performance_score,
            "subsystems": monitoring_state.diagnostics["subsystems"],
            "warnings": monitoring_state.diagnostics["warnings"],
            "watchdog": monitoring_state.diagnostics["watchdog_status"],
            "timestamp": time.time()
        })

    start_socket_monitoring_loop(socketio)
