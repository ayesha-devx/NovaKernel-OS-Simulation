import time
from kernel.kernel_state import kernel_state

class ShowcaseState:
    """
    Isolated state manager for the NovaKernel Showcase Engine.
    Tracks playback, progress, and narration.
    Synchronizes with kernel_state for global telemetry consistency.
    """
    def __init__(self):
        self.active = False
        self.scenario_id = None
        self.current_step = 0
        self.total_steps = 0
        self.paused = False
        self.started_at = 0
        self.last_narration = "Awaiting orchestration..."
        self.progress = 0 # 0 to 100
        self.is_completed = False
        self.logs = []
        self._sync()

    def _sync(self):
        """Update the global kernel state with current showcase values."""
        try:
            with kernel_state.lock:
                kernel_state.showcase = self.to_dict()
        except:
            pass

    def start_scenario(self, scenario_id, total_steps):
        self.active = True
        self.scenario_id = scenario_id
        self.current_step = 0
        self.total_steps = total_steps
        self.paused = False
        self.started_at = time.time()
        self.is_completed = False
        self.progress = 0
        self.logs = [f"--- Scenario {scenario_id} Started ---"]
        self._sync()

    def update_step(self, step_num, narration):
        self.current_step = step_num
        self.last_narration = narration
        self.progress = int((step_num / self.total_steps) * 100)
        self.logs.append(f"[Step {step_num}] {narration}")
        self._sync()

    def complete(self):
        self.active = False
        self.is_completed = True
        self.progress = 100
        self.logs.append("--- Showcase Successfully Completed ---")
        self._sync()

    def reset(self):
        self.active = False
        self.scenario_id = None
        self.current_step = 0
        self.total_steps = 0
        self.paused = False
        self.started_at = 0
        self.last_narration = "Awaiting orchestration..."
        self.progress = 0
        self.is_completed = False
        self.logs = []
        self._sync()

    def to_dict(self):
        return {
            "active": self.active,
            "scenario_id": self.scenario_id,
            "current_step": self.current_step,
            "total_steps": self.total_steps,
            "paused": self.paused,
            "last_narration": self.last_narration,
            "progress": self.progress,
            "is_completed": self.is_completed,
            "logs": self.logs[-10:] # Last 10 logs
        }

showcase_state = ShowcaseState()

