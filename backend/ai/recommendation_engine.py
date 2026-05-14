# NovaKernel AI Assistant - Recommendation Engine
import time

class RecommendationEngine:
    """
    Generates deterministic, rule-based recommendations for kernel optimization.
    Strictly passive - only suggests actions.
    """
    
    @staticmethod
    def generate_recommendations(context):
        """Analyzes context and returns a list of recommendations."""
        recommendations = []
        
        # 1. Scheduler Recommendations
        RecommendationEngine._analyze_scheduler(context, recommendations)
        
        # 2. Memory Recommendations
        RecommendationEngine._analyze_memory(context, recommendations)
        
        # 3. Disk Recommendations
        RecommendationEngine._analyze_disk(context, recommendations)
        
        # 4. Deadlock Recommendations
        RecommendationEngine._analyze_deadlock(context, recommendations)
        
        # 5. General System Health
        RecommendationEngine._analyze_system(context, recommendations)
        
        # 6. Default Healthy State
        if not recommendations:
            recommendations.append({
                "type": "SYSTEM",
                "severity": "SUCCESS",
                "title": "Kernel Optimal",
                "message": "AI analysis complete. All subsystems are operating within peak parameters. No optimizations required.",
                "action": "Maintain State"
            })
            
        return recommendations[:5] # Limit to top 5 for UI clarity

    @staticmethod
    def _analyze_scheduler(ctx, recs):
        sched = ctx['scheduler']
        ready_count = sched['ready_count']
        algo = sched['algorithm']
        
        if ready_count > 10 and algo == 'FCFS':
            recs.append({
                "type": "SCHEDULER",
                "severity": "WARNING",
                "title": "High Convoy Effect Risk",
                "message": "FCFS with many processes may cause short tasks to wait behind long ones. Recommend switching to Round Robin.",
                "action": "Switch to Round Robin"
            })
            
        if ready_count > 15 and algo == 'ROUND_ROBIN':
            recs.append({
                "type": "SCHEDULER",
                "severity": "INFO",
                "title": "High Context Switch Overhead",
                "message": "Many processes in Round Robin may lead to excessive switching. Consider increasing time quantum.",
                "action": "Increase Quantum"
            })

    @staticmethod
    def _analyze_memory(ctx, recs):
        mem = ctx['memory']
        util = mem['utilization']
        frag = mem['fragmentation']
        
        if util > 85:
            recs.append({
                "type": "MEMORY",
                "severity": "CRITICAL",
                "title": "Memory Saturation",
                "message": "Memory utilization is critically high. New process allocations may fail.",
                "action": "Terminate Idle Processes"
            })
            
        if frag > 40:
            recs.append({
                "type": "MEMORY",
                "severity": "WARNING",
                "title": "High Fragmentation",
                "message": "External fragmentation is rising. Large contiguous blocks are becoming scarce.",
                "action": "Run Memory Compaction"
            })

    @staticmethod
    def _analyze_disk(ctx, recs):
        disk = ctx['disk']
        q_depth = disk['queue_depth']
        algo = disk['algorithm']
        
        if q_depth > 5 and algo == 'FCFS':
            recs.append({
                "type": "DISK",
                "severity": "WARNING",
                "title": "Disk I/O Bottleneck",
                "message": "High disk queue depth detected with FCFS. SCAN or C-SCAN would improve throughput.",
                "action": "Switch to SCAN"
            })

    @staticmethod
    def _analyze_deadlock(ctx, recs):
        dl = ctx['deadlock']
        if dl['is_deadlocked']:
            recs.append({
                "type": "DEADLOCK",
                "severity": "CRITICAL",
                "title": "Circular Wait Detected",
                "message": f"System is currently deadlocked. {dl['cycles']} cycles found. Recommend immediate recovery.",
                "action": "Trigger Deadlock Recovery"
            })

    @staticmethod
    def _analyze_system(ctx, recs):
        sys = ctx['system']
        if sys['health'] < 70:
            recs.append({
                "type": "SYSTEM",
                "severity": "WARNING",
                "title": "Degraded Performance",
                "message": f"Global kernel health is at {sys['health']}%. Review recent logs for anomalies.",
                "action": "View System Logs"
            })

recommendation_engine = RecommendationEngine()
