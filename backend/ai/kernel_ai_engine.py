# NovaKernel AI Assistant - Central Orchestrator
import time
import threading
from ai.ai_state import ai_state
from ai.context_builder import context_builder
from ai.recommendation_engine import recommendation_engine
from ai.explanation_engine import explanation_engine
from ai.viva_assistant import viva_assistant
from ai.query_router import query_router
from ai.gemini_engine import gemini_engine

class KernelAIEngine:
    """
    Main intelligence interface for NovaKernel.
    Orchestrates analysis, explanations, and recommendations.
    """
    def __init__(self):
        self.lock = threading.Lock()
        self.last_update = 0
        self.update_interval = 1.5 # Throttled to ~0.6Hz
        
    def process_query(self, query):
        """Processes a user query and returns an intelligent response."""
        with self.lock:
            ai_state.last_query = query
            ai_state.query_count += 1
            
            # 1. Build Context
            ctx = context_builder.build_live_context()
            
            # 2. Route Query
            intent, sub_intent = query_router.route_query(query)
            
            # 3. Generate Response
            response = ""
            
            # Use Gemini if configured, otherwise fallback to Rule-Based
            if gemini_engine.initialized:
                response = gemini_engine.generate_response(query, ctx)
                if response:
                    intent = "GEMINI_AI"
                else:
                    # GEMINI FAILED - Trigger Fallback
                    print(f"[AI_ENGINE] Gemini failed for query: '{query}'. Falling back to local rules.")
                    response = self._get_local_response(intent, sub_intent, query, ctx, gemini_failed=True)
            else:
                response = self._get_local_response(intent, sub_intent, query, ctx, gemini_failed=False)
                
            # 4. Update State
            ai_state.add_message("user", query)
            ai_state.add_message("assistant", response, intent)
            ai_state.last_response = response
            
            # --- TRACE HOOK ---
            try:
                from monitoring.event_trace_engine import event_trace_engine
                event_trace_engine.trace(
                    subsystem="AI",
                    severity="SUCCESS",
                    category="AI",
                    title="AI Query Processed",
                    description=f"Operator query answered via {intent}",
                    metadata={"query": query[:50] + "..." if len(query) > 50 else query, "intent": intent}
                )
            except: pass

            return {
                "query": query,
                "response": response,
                "intent": intent,
                "timestamp": time.time()
            }

    def _get_local_response(self, intent, sub_intent, query, ctx, gemini_failed=False):
        """Standard rule-based response generation."""
        if intent == "VIVA":
            return viva_assistant.teach_concept(sub_intent, ctx)
        elif intent == "EXPLAIN":
            if sub_intent == "CPU": return explanation_engine.explain_cpu_usage(ctx)
            elif sub_intent == "DEADLOCK": return explanation_engine.explain_deadlock(ctx)
            elif sub_intent == "MEMORY": return explanation_engine.explain_memory(ctx)
            elif sub_intent == "DISK": return explanation_engine.explain_disk(ctx)
        elif intent == "RECOMMEND":
            recs = recommendation_engine.generate_recommendations(ctx)
            if recs:
                return f"I have {len(recs)} suggestions for your kernel: " + " ".join([r['message'] for r in recs])
            else:
                return "System is currently optimized. No recommendations at this time."
        if intent == "SYSTEM_SUMMARY":
            status = ctx.get('system', {}).get('status', 'ACTIVE')
            health = ctx.get('system', {}).get('health', 100)
            procs = ctx.get('analytics', {}).get('cpu_metrics', {}).get('active_processes', 0)
            mem = ctx.get('analytics', {}).get('memory_metrics', {}).get('utilization', 0)
            
            return f"### 🔌 [LOCAL MODE] System Status Report\n\nGemini is currently offline. Here is the local telemetry analysis:\n\n*   **Kernel Status**: {status}\n*   **Integrity**: {health}%\n*   **Active Load**: {procs} processes\n*   **Memory Pressure**: {mem}%\n\nPlease check your internet connection or API key to restore full Neural Intelligence."
        
        if gemini_failed:
            return "The NovaKernel Neural Link is experiencing high latency or quota limitations. I am currently operating in **Safety Fallback Mode**. I can still assist with OS concepts and live telemetry analysis based on local heuristics."
        
        return "I am the NovaKernel AI Assistant. My Neural Intelligence link is currently offline (Local Mode). I can explain OS concepts and analyze performance based on the live telemetry provided above."

    def get_live_intelligence(self):
        """Generates real-time analysis for the dashboard (narrator)."""
        now = time.time()
        if now - self.last_update < self.update_interval:
            return self._get_cached_report()
            
        with self.lock:
            # 1. Build Context
            ctx = context_builder.build_live_context()
            
            # 2. Generate Recommendations
            recs = recommendation_engine.generate_recommendations(ctx)
            ai_state.recommendations = recs
            
            # 3. Generate Health Narration
            narration = context_builder.get_summary_string(ctx)
            ai_state.health_narration = narration
            
            # 4. Update Confidence (Heuristic)
            ai_state.current_analysis["confidence"] = ctx['system']['health']
            ai_state.current_analysis["timestamp"] = now
            self.last_update = now
            
            return self._get_cached_report()

    def _get_cached_report(self):
        return {
            "summary": ai_state.health_narration,
            "recommendations": ai_state.recommendations,
            "state": ai_state.to_dict(),
            "timestamp": time.time()
        }

kernel_ai_engine = KernelAIEngine()
