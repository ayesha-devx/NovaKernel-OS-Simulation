import threading
import time
from showcase.showcase_state import showcase_state
from showcase.scenario_registry import SCENARIOS

class TimelineSequencer:
    """
    Orchestrates the timing and execution of cinematic scenarios.
    Handles the playback loop, delays, and state synchronization.
    """
    def __init__(self, runner):
        self.runner = runner
        self.playback_thread = None
        self._stop_event = threading.Event()
        self._pause_event = threading.Event()
        self._pause_event.set() # Start unpaused

    def play(self, scenario_id):
        if scenario_id not in SCENARIOS:
            print(f"[SHOWCASE] Error: Scenario {scenario_id} not found.")
            return False
            
        self.stop() # Reset any existing playback
        self._stop_event.clear()
        self._pause_event.set()
        
        scenario = SCENARIOS[scenario_id]
        showcase_state.start_scenario(scenario_id, len(scenario['steps']))
        
        self.playback_thread = threading.Thread(
            target=self._playback_loop, 
            args=(scenario,), 
            daemon=True
        )
        self.playback_thread.start()
        return True

    def _playback_loop(self, scenario):
        steps = scenario['steps']
        
        for i, step in enumerate(steps):
            if self._stop_event.is_set():
                break
                
            # Wait if paused
            self._pause_event.wait()
            
            # 1. Update State & Narration
            showcase_state.update_step(i + 1, step['narration'])
            
            # 2. Execute Action via Runner
            try:
                self.runner.execute(step['action'])
            except Exception as e:
                print(f"[SHOWCASE] Action Failure: {e}")
            
            # 3. Wait for delay with responsive checking
            delay = step.get('delay', 2)
            start_time = time.time()
            while time.time() - start_time < delay:
                if self._stop_event.is_set():
                    break
                # If paused during sleep, we wait here
                if not self._pause_event.is_set():
                    self._pause_event.wait()
                    # Reset start_time to effectively "pause" the countdown
                    start_time = time.time() - (time.time() - start_time) 
                
                time.sleep(0.1) # Check every 100ms
            
        if not self._stop_event.is_set():
            showcase_state.complete()
            self.runner.execute("stabilize") 

    def pause(self):
        self._pause_event.clear()
        showcase_state.paused = True

    def resume(self):
        self._pause_event.set()
        showcase_state.paused = False

    def stop(self):
        self._stop_event.set()
        self._pause_event.set() # Ensure loop isn't stuck in wait()
        if self.playback_thread:
            self.playback_thread.join(timeout=1.0)
        showcase_state.reset()
        self.runner.execute("clear_all") # Emergency cleanup
