from flask_socketio import emit

def register_system_events(socketio):
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        emit('system_status', {'message': 'Connected to NovaKernel Engine'})

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    @socketio.on('ping_kernel')
    def handle_ping(data):
        emit('pong_kernel', {'status': 'Kernel is responsive', 'timestamp': data.get('timestamp')})
