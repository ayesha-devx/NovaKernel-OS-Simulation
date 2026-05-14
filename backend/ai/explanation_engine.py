# NovaKernel AI Assistant - Explanation Engine

class ExplanationEngine:
    """
    Converts raw telemetry into human-readable explanations.
    Focuses on "Why" and "What" questions about the current state.
    """
    
    @staticmethod
    def explain_cpu_usage(ctx):
        util = ctx['system']['health'] # Heuristic
        ready = ctx['scheduler']['ready_count']
        algo = ctx['scheduler']['algorithm']
        
        if ready > 10:
            return f"CPU load is high because {ready} processes are competing for execution under {algo}. This increases context switching overhead."
        elif not ctx['scheduler']['is_running'] and ready > 0:
            return "CPU utilization is currently zero because the Scheduler is inactive despite tasks waiting in the ready queue."
        return "CPU usage is within nominal parameters for the current workload."

    @staticmethod
    def explain_deadlock(ctx):
        dl = ctx['deadlock']
        if dl['is_deadlocked']:
            return f"The system is in a deadlock state because processes {dl['victim_pids']} are involved in a circular wait condition, each holding a resource the other needs."
        return "The system is currently free of deadlocks. Resource allocation follows a safe sequence."

    @staticmethod
    def explain_memory(ctx):
        mem = ctx['memory']
        if mem['utilization'] > 80:
            return f"Memory pressure is high ({mem['utilization']}%). This is likely due to multiple active processes and high internal/external fragmentation ({mem['fragmentation']}%)."
        return "Memory state is healthy. Sufficient contiguous blocks are available for allocation."

    @staticmethod
    def explain_disk(ctx):
        disk = ctx['disk']
        if disk['queue_depth'] > 5:
            return f"Disk I/O is congested with {disk['queue_depth']} pending requests. The current {disk['algorithm']} algorithm is processing them sequentially."
        return "Disk controller is operating efficiently with minimal latency."

explanation_engine = ExplanationEngine()
