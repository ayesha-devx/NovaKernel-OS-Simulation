# NovaKernel AI Assistant - Query Router
import re

class QueryRouter:
    """
    Detects query intent and routes to the appropriate AI sub-engine.
    """
    
    @staticmethod
    def route_query(query):
        query = query.lower()
        
        # 1. Viva Concepts
        if any(word in query for word in ["explain", "teach", "what is", "how does", "give", "list"]):
            if "fcfs" in query: return "VIVA", "FCFS"
            if "rr" in query or "round robin" in query: return "VIVA", "RR"
            if "deadlock" in query: return "VIVA", "DEADLOCK"
            if "fragmentation" in query or "memory" in query: return "VIVA", "FRAGMENTATION"
            if "scan" in query or "disk" in query: return "VIVA", "DISK_SCAN"
            if "cmd" in query or "command" in query: return "VIVA", "COMMANDS"
            if "linux" in query: return "VIVA", "LINUX"
            
        # 2. Performance Analysis ("Why")
        if "why" in query:
            if "cpu" in query: return "EXPLAIN", "CPU"
            if "deadlock" in query: return "EXPLAIN", "DEADLOCK"
            if "memory" in query: return "EXPLAIN", "MEMORY"
            if "disk" in query: return "EXPLAIN", "DISK"
            
        # 3. Recommendations
        if any(word in query for word in ["recommend", "suggest", "optimize", "fix"]):
            return "RECOMMEND", None
            
        # 4. Status
        if any(word in query for word in ["status", "summary", "health", "how are we", "happening", "right now", "live", "current"]):
            return "SUMMARY", None
            
        return "GENERAL", None

query_router = QueryRouter()
