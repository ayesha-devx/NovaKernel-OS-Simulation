from ai.ai_state import ai_state
from kernel.socket_bus import socket_bus

class NarrationEngine:
    """
    Handles AI-assisted narration during the showcase.
    Pushes messages to the AI state and broadcasts them via socket.
    """
    def narrate(self, message, scenario_id):
        # 1. Update Global AI State
        ai_state.add_message("assistant", message, f"SHOWCASE_{scenario_id}")
        ai_state.health_narration = message
        
        # 2. Broadcast as a cinematic notification
        socket_bus.emit("AI_ASSISTANT", "NARRATION", message, "INFO")
        
        # 3. Log to system timeline
        from analytics.analytics_engine import analytics_engine
        analytics_engine.record_event(
            module="SHOWCASE_ENGINE",
            event_type="NARRATION",
            message=message,
            severity="INFO"
        )

# Global Instance
narration_engine = NarrationEngine()
