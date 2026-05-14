# NovaKernel AI Assistant - Viva Assistant

class VivaAssistant:
    """
    Teaches OS concepts using LIVE NovaKernel state as examples.
    Provides educational clarity for demonstrations.
    """
    
    @staticmethod
    def teach_concept(concept_id, ctx):
        """Maps a conceptual ID to a live demonstration explanation."""
        concepts = {
            "FCFS": VivaAssistant._explain_fcfs(ctx),
            "RR": VivaAssistant._explain_rr(ctx),
            "DEADLOCK": VivaAssistant._explain_deadlock(ctx),
            "FRAGMENTATION": VivaAssistant._explain_fragmentation(ctx),
            "DISK_SCAN": VivaAssistant._explain_disk_scan(ctx),
            "COMMANDS": VivaAssistant._explain_commands(ctx),
            "LINUX": VivaAssistant._explain_linux(ctx)
        }
        return concepts.get(concept_id, "Concept explanation not yet implemented in Viva Mode.")

    @staticmethod
    def _explain_fcfs(ctx):
        ready = ctx['scheduler']['ready_count']
        return f"First-Come, First-Served (FCFS) processes tasks in arrival order. Currently, {ready} tasks are queued. Notice how if a large task arrives first, it blocks others—this is the 'Convoy Effect', which you can see in the current Gantt chart."

    @staticmethod
    def _explain_rr(ctx):
        algo = ctx['scheduler']['algorithm']
        return f"Round Robin (RR) ensures fairness by giving each process a small 'time quantum'. Currently, our kernel is using {algo}. If the quantum is too small, context switching overhead dominates; if too large, it behaves like FCFS."

    @staticmethod
    def _explain_deadlock(ctx):
        is_dl = ctx['deadlock']['is_deadlocked']
        status = "Currently detected!" if is_dl else "Not currently present."
        return f"Deadlock occurs when four conditions are met: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. {status} In NovaKernel, we visualize this using the Resource Allocation Graph."

    @staticmethod
    def _explain_fragmentation(ctx):
        frag = ctx['memory']['fragmentation']
        return f"Fragmentation is the 'wasted' memory space. We currently have {frag}% fragmentation. External fragmentation occurs when total free memory is enough for a process, but it is not contiguous."

    @staticmethod
    def _explain_disk_scan(ctx):
        algo = ctx['disk']['algorithm']
        return f"The Disk SCAN algorithm (Elevator) moves the head from one end to the other, servicing requests. Current algorithm is {algo}. This prevents 'starvation' of requests at the edges of the disk."

    @staticmethod
    def _explain_commands(ctx):
        return "Common OS commands include: 'ls' (list files), 'cd' (change directory), 'ps' (list processes), 'kill' (terminate process), and 'top' (monitor system). In NovaKernel, you can use similar commands like 'spawn', 'algo', and 'kill' in the Shell Terminal."

    @staticmethod
    def _explain_linux(ctx):
        return "Linux is a monolithic kernel, while NovaKernel is a educational simulation. Both share concepts like PCBs (Process Control Blocks), Schedulers, and Virtual Memory management, which you can see visualized in the various dashboards."

viva_assistant = VivaAssistant()
