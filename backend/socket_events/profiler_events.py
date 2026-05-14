from monitoring.runtime_profiler import get_profiler

def register_profiler_events(socketio):
    """
    Registers socket events for the Runtime Profiler.
    These events are passive and do not affect kernel execution.
    """
    @socketio.on('request_profiler_sync')
    def handle_profiler_sync():
        profiler = get_profiler()
        # The profiler loop handles periodic updates
        pass

    @socketio.on('toggle_debug_overlay')
    def handle_overlay_toggle(data):
        # Tracking for analytical purposes
        pass
