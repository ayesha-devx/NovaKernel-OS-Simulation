from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import os

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'nova_kernel_secret_2024'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Register Blueprints
from routes.health import health_bp
from routes.process import process_bp
from routes.queue import queue_bp
from routes.scheduler import scheduler_bp
from routes.memory import memory_bp
from routes.filesystem import filesystem_bp
from routes.kernel import kernel_bp
from routes.hardware import hardware_bp
from routes.deadlock import deadlock_bp
from routes.disk import disk_bp
from routes.shell import shell_bp
from routes.ai import ai_bp
from routes.showcase import showcase_bp

app.register_blueprint(health_bp, url_prefix='/api')
app.register_blueprint(process_bp, url_prefix='/api/process')
app.register_blueprint(queue_bp, url_prefix='/api/queue')
app.register_blueprint(scheduler_bp, url_prefix='/api/scheduler')
app.register_blueprint(memory_bp, url_prefix='/api/memory')
app.register_blueprint(filesystem_bp, url_prefix='/api/filesystem')
app.register_blueprint(kernel_bp, url_prefix='/api/kernel')
app.register_blueprint(hardware_bp, url_prefix='/api/hardware')
app.register_blueprint(deadlock_bp, url_prefix='/api/deadlock')
app.register_blueprint(disk_bp, url_prefix='/api/disk')
app.register_blueprint(shell_bp, url_prefix='/api/shell')
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(showcase_bp, url_prefix='/api/showcase')

# Register Socket Events
from socket_events.system_events import register_system_events
from socket_events.process_events import register_process_events
from socket_events.boot_events import register_boot_events
from socket_events.snapshot_events import register_snapshot_events
from socket_events.monitoring_events import register_monitoring_events
from socket_events.trace_events import register_trace_events
from socket_events.watchdog_events import register_watchdog_events
from socket_events.profiler_events import register_profiler_events
from socket_events.socket_monitoring_events import register_socket_monitoring_events
from socket_events.hardware_events import register_hardware_events

register_system_events(socketio)
register_boot_events(socketio)
register_snapshot_events(socketio)
register_monitoring_events(socketio)
register_socket_monitoring_events(socketio)
register_trace_events(socketio)
register_watchdog_events(socketio)
register_profiler_events(socketio)
register_hardware_events(socketio)

# Initialize Monitoring Engines
from monitoring.leak_detector import leak_detector
from monitoring.runtime_watchdog import runtime_watchdog
from monitoring.runtime_profiler import runtime_profiler

# Initialize Engine Dependencies
from kernel.snapshot_engine import snapshot_engine
from kernel.restore_engine import restore_engine
from kernel.kernel_state import kernel_state
from kernel.nova_kernel import kernel


def start_engines():
    """Starts all background engines with slight staggering for stability."""
    try:
        import time
        from socket_events.process_events import register_process_events
        
        print("[SYSTEM] Starting background monitoring engines...")
        leak_detector.start(socketio)
        time.sleep(0.1)
        runtime_watchdog.start(socketio)
        time.sleep(0.1)
        runtime_profiler.start(socketio)
        
        print("[SYSTEM] Initializing kernel subsystems...")
        snapshot_engine.set_socket(socketio)
        restore_engine.set_socket(socketio)
        snapshot_engine.start_checkpoint_system()
        register_process_events(socketio)
        
        # Start NovaKernel Master Engine
        print("[SYSTEM] Booting NovaKernel...")
        kernel.boot(socketio)
    except Exception as e:
        print(f"[CRITICAL_ERROR] Engine startup failed: {e}")

@app.route('/')
def index():
    return jsonify({
        "message": "NovaKernel Integrated Engine is running", 
        "status": "online",
        "version": kernel.version,
        "health": kernel_state.analytics_state.get("intelligence_state", {}).get("health_score", 100)
    })


if __name__ == '__main__':
    import threading
    import time
    
    # Start engines in a separate thread to not block the server startup
    # Reduced delay for snappier initialization
    startup_thread = threading.Thread(target=lambda: (time.sleep(0.5), start_engines()), daemon=True)
    startup_thread.start()
    
    print(f"--- NovaKernel Master Server Starting on port 5000 ---")
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)

