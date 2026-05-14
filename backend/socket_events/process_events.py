from flask_socketio import emit
from os_modules.process_manager import process_manager
from os_modules.event_logger import event_logger

def register_process_events(socketio):
    @socketio.on('get_initial_state')
    def handle_get_initial_state():
        emit('initial_state', {
            'processes': process_manager.get_all_processes(),
            'logs': event_logger.get_logs()
        })

    @socketio.on('request_process_creation')
    def handle_request_process_creation(data):
        # Allow creating via socket as well
        name = data.get('name')
        priority = data.get('priority')
        burst_time = data.get('burst_time')
        memory_required = data.get('memory_required')
        
        process = process_manager.create_process(name, priority, burst_time, memory_required)
        emit('process_created', process.to_dict(), broadcast=True)

    @socketio.on('request_state_change')
    def handle_request_state_change(data):
        pid = data.get('pid')
        new_state = data.get('state')
        updated_process = process_manager.update_process_state(pid, new_state)
        if updated_process:
            emit('process_updated', updated_process, broadcast=True)
