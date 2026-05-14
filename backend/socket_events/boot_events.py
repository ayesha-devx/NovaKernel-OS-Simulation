from flask_socketio import emit
from kernel.boot_manager import boot_manager
from kernel.kernel_state import kernel_state

def register_boot_events(socketio):
    """Registers socket events for the Boot Manager."""
    
    @socketio.on('REQUEST_BOOT_STATUS')
    def handle_boot_status_request():
        """Returns the current boot state to a newly connected client."""
        with kernel_state.lock:
            emit('BOOT_STATE_UPDATE', {
                'state': kernel_state.boot_state,
                'progress': kernel_state.boot_progress,
                'logs': list(kernel_state.boot_logs),
                'ready': kernel_state.kernel_ready
            })

    @socketio.on('TRIGGER_REBOOT_SIMULATION')
    def handle_reboot_simulation():
        """Triggers a fresh boot sequence (for demo purposes)."""
        # Only allow if not already booting
        if not boot_manager.is_booting:
            with kernel_state.lock:
                kernel_state.kernel_ready = False
                kernel_state.boot_state = "OFFLINE"
            boot_manager.start_boot_sequence(socketio)
