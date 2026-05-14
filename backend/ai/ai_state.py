# NovaKernel AI Assistant - State Manager
import time

class AIState:
    """
    Tracks conversational context, active queries, and AI-specific metrics.
    Isolated from core kernel_state to ensure safety.
    """
    def __init__(self):
        self.active = True
        self.last_query = ""
        self.last_response = ""
        self.conversation_history = [] # List of {role, content, timestamp}
        self.max_history = 50
        
        self.current_analysis = {
            "focus": "SYSTEM_SUMMARY",
            "timestamp": time.time(),
            "confidence": 100
        }
        
        self.recommendations = []
        self.health_narration = "System initializing. AI Copilot standing by."
        self.viva_mode_active = False
        self.query_count = 0
        self.last_analysis_time = 0
        
    def add_message(self, role, content, intent=None):
        """Adds a message to the conversation history with optional intent tracking."""
        self.conversation_history.append({
            "role": role,
            "content": content,
            "intent": intent,
            "timestamp": time.time()
        })
        if len(self.conversation_history) > self.max_history:
            self.conversation_history.pop(0)

    def to_dict(self):
        return {
            "active": self.active,
            "last_query": self.last_query,
            "current_summary": self.health_narration,
            "recommendations": self.recommendations,
            "health_score": self.current_analysis.get("confidence", 100),
            "viva_mode": self.viva_mode_active,
            "query_count": self.query_count,
            "history_size": len(self.conversation_history)
        }

ai_state = AIState()
