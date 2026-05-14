import time
import threading
from monitoring.socket_inspector import socket_inspector

def start_socket_telemetry_loop(socketio):
    def loop():
        print("[SOCKET_INSPECTOR] Telemetry Loop Started")
        while socket_inspector.is_active:
            try:
                # Update internal metrics
                socket_inspector.update_metrics()
                
                # Fetch snapshot
                snapshot = socket_inspector.get_snapshot()
                
                # Update listener count (read-only)
                try:
                    # In Flask-SocketIO, handlers are in socketio.server.handlers
                    # This is slightly invasive but read-only.
                    handlers = getattr(socketio.server, 'handlers', {})
                    total_listeners = sum(len(ns_handlers) for ns_handlers in handlers.values())
                    socket_inspector.metrics["active_listeners"] = total_listeners
                except:
                    pass
                
                # Emit to frontend (throttled at 2 updates/sec via loop sleep)
                socketio.emit('SOCKET_TELEMETRY_UPDATE', {
                    "metrics": snapshot["metrics"],
                    "health_score": snapshot["health_score"],
                    "warnings": snapshot["warnings"],
                    "traffic": snapshot["traffic"],
                    "timestamp": time.time()
                })
                
                # Heartbeat for Watchdog
                try:
                    from monitoring.runtime_watchdog import runtime_watchdog
                    runtime_watchdog.heartbeat("socket_inspector")
                except: pass
                
            except Exception as e:
                print(f"[SOCKET_INSPECTOR] Error: {str(e)}")
                
            socketio.sleep(0.5) # 2 updates per second
            
    socketio.start_background_task(loop)

def register_socket_monitoring_events(socketio):
    @socketio.on('REQUEST_SOCKET_DIAGNOSTICS')
    def handle_request_diagnostics():
        socketio.emit('SOCKET_TELEMETRY_UPDATE', socket_inspector.get_snapshot())

    @socketio.on('PING_STAMP')
    def handle_ping(data):
        # Track incoming
        socket_inspector.track_incoming('PING_STAMP', data)
        # Calculate latency
        try:
            client_time = data.get("timestamp", 0)
            if client_time:
                latency = (time.time() * 1000) - client_time
                socket_inspector.metrics["latency_ms"] = round(latency, 2)
        except:
            pass

    start_socket_telemetry_loop(socketio)
