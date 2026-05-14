import random
import time

# Strategy name constants
class Strategy:
    LOWEST_PRIORITY        = "LOWEST_PRIORITY"
    LOWEST_CPU_USAGE       = "LOWEST_CPU_USAGE"
    YOUNGEST_PROCESS       = "YOUNGEST_PROCESS"
    RANDOM                 = "RANDOM"
    MINIMUM_RESOURCES_HELD = "MINIMUM_RESOURCES_HELD"
    # Future: AI_RECOMMENDED = "AI_RECOMMENDED"

ALL_STRATEGIES = [
    Strategy.LOWEST_PRIORITY,
    Strategy.LOWEST_CPU_USAGE,
    Strategy.YOUNGEST_PROCESS,
    Strategy.RANDOM,
    Strategy.MINIMUM_RESOURCES_HELD,
]


class VictimSelector:
    """
    MODULAR VICTIM SELECTION ENGINE.
    Supports multiple deterministic + stochastic strategies.
    Pluggable architecture for future AI-recommended selection.
    """

    def select(self, candidate_pids: list, strategy: str = Strategy.LOWEST_PRIORITY) -> tuple:
        """
        Select a victim PID from candidates using the given strategy.
        Returns: (victim_pid, reason_string) or (None, error_string)
        """
        from kernel.kernel_state import kernel_state

        if not candidate_pids:
            return None, "No candidate PIDs provided."

        with kernel_state.lock:
            # Filter to only processes that still exist
            valid_candidates = [
                pid for pid in candidate_pids
                if pid in kernel_state.processes
            ]

        if not valid_candidates:
            return None, "No valid living processes among candidates."

        print(f"[VICTIM_SELECTOR] Strategy={strategy} | Candidates={valid_candidates}")

        try:
            if strategy == Strategy.LOWEST_PRIORITY:
                return self._lowest_priority(valid_candidates)
            elif strategy == Strategy.LOWEST_CPU_USAGE:
                return self._lowest_cpu_usage(valid_candidates)
            elif strategy == Strategy.YOUNGEST_PROCESS:
                return self._youngest_process(valid_candidates)
            elif strategy == Strategy.RANDOM:
                return self._random(valid_candidates)
            elif strategy == Strategy.MINIMUM_RESOURCES_HELD:
                return self._minimum_resources_held(valid_candidates)
            else:
                print(f"[VICTIM_SELECTOR] Unknown strategy '{strategy}', falling back to LOWEST_PRIORITY")
                return self._lowest_priority(valid_candidates)
        except Exception as e:
            print(f"[VICTIM_SELECTOR] Error in strategy '{strategy}': {e} — falling back to first candidate")
            return valid_candidates[0], f"Fallback: {str(e)}"

    # ------------------------------------------------------------------ #
    #  Strategy Implementations                                            #
    # ------------------------------------------------------------------ #

    def _lowest_priority(self, pids: list) -> tuple:
        """Highest priority NUMBER = lowest priority process = cheapest to kill."""
        from kernel.kernel_state import kernel_state
        with kernel_state.lock:
            victim = max(pids, key=lambda pid: kernel_state.processes[pid].priority)
            p = kernel_state.processes[victim]
        reason = f"Lowest priority process (priority={p.priority})"
        print(f"[VICTIM_SELECTOR] {Strategy.LOWEST_PRIORITY} → PID {victim} ({reason})")
        return victim, reason

    def _lowest_cpu_usage(self, pids: list) -> tuple:
        """Kill the process with fewest execution slices (proxy for low CPU usage)."""
        from kernel.kernel_state import kernel_state
        with kernel_state.lock:
            victim = min(pids, key=lambda pid: len(getattr(kernel_state.processes[pid], 'execution_slices', [])))
            p = kernel_state.processes[victim]
        cpu_slices = len(getattr(p, 'execution_slices', []))
        reason = f"Lowest CPU usage (execution slices={cpu_slices})"
        print(f"[VICTIM_SELECTOR] {Strategy.LOWEST_CPU_USAGE} → PID {victim} ({reason})")
        return victim, reason

    def _youngest_process(self, pids: list) -> tuple:
        """Kill the most recently created process (highest PID as proxy)."""
        victim = max(pids)
        reason = f"Youngest process (PID={victim}, highest PID)"
        print(f"[VICTIM_SELECTOR] {Strategy.YOUNGEST_PROCESS} → PID {victim} ({reason})")
        return victim, reason

    def _random(self, pids: list) -> tuple:
        """Non-deterministic random selection."""
        victim = random.choice(pids)
        reason = f"Random selection from {len(pids)} candidates"
        print(f"[VICTIM_SELECTOR] {Strategy.RANDOM} → PID {victim} ({reason})")
        return victim, reason

    def _minimum_resources_held(self, pids: list) -> tuple:
        """Kill the process holding the fewest resources (minimises rollback cost)."""
        from kernel.kernel_state import kernel_state
        with kernel_state.lock:
            resources = kernel_state.resource_state["resources"]

            def count_held(pid):
                return sum(
                    1 for res in resources.values()
                    if res.get("allocated_to") is not None and int(res["allocated_to"]) == int(pid)
                )

            victim = min(pids, key=count_held)
            held = count_held(victim)

        reason = f"Holds fewest resources ({held} held)"
        print(f"[VICTIM_SELECTOR] {Strategy.MINIMUM_RESOURCES_HELD} → PID {victim} ({reason})")
        return victim, reason


# Global Instance
victim_selector = VictimSelector()
