import time
import threading
from kernel.socket_bus import socket_bus
from os_modules.command_router import command_router
from demo.demo_state import demo_state

class ScenarioRunner:
    """
    DEMO SCENARIO EXECUTIONER.
    Parses sequences and invokes existing kernel methods safely.
    """
    def __init__(self):
        self.stop_event = threading.Event()

    def execute_step(self, step):
        if self.stop_event.is_set():
            return False

        action = step.get("action")
        delay = step.get("delay", 1.0) / demo_state.playback_speed
        
        # 1. Log to UI
        if action == "LOG" or "message" in step:
            msg = step.get("message", "")
            socket_bus.emit("DEMO", "PROGRESS", msg, "INFO")
            demo_state.update(current_step=msg)

        # 2. Execute Shell Command
        if action == "CMD":
            cmd = step.get("command")
            socket_bus.emit("DEMO", "COMMAND", f"Exec: {cmd}", "SUCCESS")
            
            # Use command_router to parse and execute safely
            from os_modules.shell_terminal import shell_terminal
            shell_terminal.execute(cmd)

        # 3. Handle Progress
        if "progress" in step:
            demo_state.update(progress=step["progress"])
            socket_bus.emit_raw('demo_state_updated', demo_state.to_dict())

        # 4. Wait
        time.sleep(delay)
        
        # Check for pause
        while demo_state.paused and not self.stop_event.is_set():
            time.sleep(0.5)
            
        return not self.stop_event.is_set()

    def run_sequence(self, name, sequence):
        demo_state.update(current_sequence=name, progress=0)
        socket_bus.emit_raw('demo_state_updated', demo_state.to_dict())
        socket_bus.emit("DEMO", "SEQUENCE_START", f"Starting {name} Showcase...", "SUCCESS")
        
        for step in sequence:
            if not self.execute_step(step):
                break
        
        return not self.stop_event.is_set()

    def stop(self):
        self.stop_event.set()

scenario_runner = ScenarioRunner()
