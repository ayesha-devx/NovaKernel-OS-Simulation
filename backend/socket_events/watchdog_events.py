def register_watchdog_events(socketio):
    """
    Registers socket events for the Leak Detector and Runtime Watchdog.
    These events are emitted periodically to update the Developer Console.
    """
    
    # These are mostly outbound events from the engines themselves.
    # We could add inbound controls here if needed later (e.g., reset scoring).
    
    @socketio.on('request_watchdog_sync')
    def handle_watchdog_sync():
        from monitoring.runtime_watchdog import runtime_watchdog
        from monitoring.leak_detector import leak_detector
        
        # Immediate refresh on request
        runtime_watchdog._emit_health()
        leak_detector._emit_status()
