import threading
import time
from showcase.showcase_state import showcase_state
from showcase.scenario_registry import SCENARIOS
from showcase.scenario_runner import scenario_runner
from showcase.timeline_sequencer import TimelineSequencer
from showcase.narration_engine import narration_engine
from kernel.socket_bus import socket_bus

class ShowcaseEngine:
    """
    Main Orchestration Layer for NovaKernel Cinematic Demos.
    """
    def __init__(self):
        self.sequencer = TimelineSequencer(scenario_runner)
        self.is_monitoring = False
        self.monitor_thread = None

    def start_showcase(self, scenario_id):
        print(f"[SHOWCASE] Launcher: {scenario_id}")
        success = self.sequencer.play(scenario_id)
        if success and not self.is_monitoring:
            self.start_sync_loop()
        return success

    def pause_showcase(self):
        self.sequencer.pause()

    def resume_showcase(self):
        self.sequencer.resume()

    def stop_showcase(self):
        self.sequencer.stop()

    def start_sync_loop(self):
        self.is_monitoring = True
        self.monitor_thread = threading.Thread(target=self._sync_loop, daemon=True)
        self.monitor_thread.start()

    def _sync_loop(self):
        """Broadcasts showcase state to frontend periodically."""
        while self.is_monitoring:
            # Always broadcast current state so frontend stays in sync
            socket_bus.emit_raw("SHOWCASE_STATE", {
                "event": "UPDATE",
                "payload": showcase_state.to_dict()
            })

            # Heartbeat for Watchdog
            try:
                from monitoring.runtime_watchdog import runtime_watchdog
                runtime_watchdog.heartbeat("showcase_engine")
            except: pass
            
            # Dynamic sleep: 0.5s when active, 2.0s when idle
            if not showcase_state.active and not showcase_state.is_completed:
                time.sleep(2.0)
            else:
                time.sleep(0.5)

    def get_available_scenarios(self):
        return [
            {"id": sid, "title": s['title'], "description": s['description'], "steps": len(s['steps'])}
            for sid, s in SCENARIOS.items()
        ]

# Global Instance
showcase_engine = ShowcaseEngine()
