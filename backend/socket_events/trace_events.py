import time
from flask_socketio import emit
from monitoring.event_trace_engine import event_trace_engine

_last_emit_time = 0
_emit_interval = 0.5  # 2 updates per second

def register_trace_events(socketio):
    """
    Registers trace-related socket events and starts background emission.
    """
    
    @socketio.on('REQUEST_TRACE_HISTORY')
    def handle_request_history(data=None):
        limit = (data or {}).get('limit', 100)
        emit('TRACE_EVENT_UPDATE', {
            "events": event_trace_engine.get_history(limit),
            "warnings": event_trace_engine.get_warnings(),
            "health": event_trace_engine.get_health(),
            "timestamp": time.time()
        })

    @socketio.on('CLEAR_TRACE_HISTORY')
    def handle_clear_history():
        event_trace_engine.clear()
        socketio.emit('TRACE_HISTORY_CLEARED')
        socketio.emit('TRACE_EVENT_UPDATE', {
            "events": [],
            "warnings": [],
            "health": event_trace_engine.get_health(),
            "timestamp": time.time()
        })

    def trace_emit_loop():
        global _last_emit_time
        print("[MONITORING] Trace Emit Loop Started")
        while True:
            try:
                now = time.time()
                if now - _last_emit_time >= _emit_interval:
                    socketio.emit('TRACE_EVENT_UPDATE', {
                        "events": event_trace_engine.get_history(50), # Send last 50 for live updates
                        "warnings": event_trace_engine.get_warnings(),
                        "health": event_trace_engine.get_health(),
                        "timestamp": now,
                        "pulse_id": hash(now)
                    })
                    _last_emit_time = now
                    
                    # Heartbeat for Watchdog & Profiler
                    try:
                        from monitoring.runtime_watchdog import runtime_watchdog
                        from monitoring.runtime_profiler import runtime_profiler
                        runtime_watchdog.heartbeat("trace_engine")
                        runtime_profiler.record_latency("trace_engine", (time.time() - now) * 1000)
                        runtime_profiler.record_telemetry(len(event_trace_engine.history))
                    except: pass
            except Exception as e:
                print(f"[TRACE_SOCKET] Loop Error: {str(e)}")
            
            socketio.sleep(_emit_interval)

    # Start the background task
    socketio.start_background_task(trace_emit_loop)
