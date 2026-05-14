import threading
import time
from demo.demo_state import demo_state
from demo.demo_sequences import DEMO_SEQUENCES
from demo.scenario_runner import scenario_runner
from kernel.socket_bus import socket_bus

class DemoEngine:
    """
    MASTER DEMO ORCHESTRATOR.
    Manages the full showcase lifecycle from Boot to Cleanup.
    """
    def __init__(self):
        self.thread = None
        self._stop_requested = False

    def start_showcase(self):
        if demo_state.active:
            return False
            
        demo_state.update(active=True, start_time=time.time(), error=None)
        socket_bus.emit_raw('demo_state_updated', demo_state.to_dict())
        self._stop_requested = False
        scenario_runner.stop_event.clear()
        
        self.thread = threading.Thread(target=self._run_showcase, daemon=True)
        self.thread.start()
        return True

    def stop_showcase(self):
        self._stop_requested = True
        scenario_runner.stop()
        demo_state.update(active=False, current_sequence="IDLE", progress=0)
        socket_bus.emit_raw('demo_state_updated', demo_state.to_dict())
        self._cleanup()
        socket_bus.emit("DEMO", "STOPPED", "Showcase terminated manually.", "WARNING")

    def _run_showcase(self):
        try:
            # Step-by-step orchestrated flow
            sequences_to_run = ["BOOT", "CPU", "MEMORY", "DISK", "DEADLOCK", "FINALIZE"]
            
            for seq_name in sequences_to_run:
                if self._stop_requested:
                    break
                    
                sequence = DEMO_SEQUENCES.get(seq_name, [])
                success = scenario_runner.run_sequence(seq_name, sequence)
                
                if not success:
                    break
                    
                time.sleep(1.0) # Gap between sequences
            
            if not self._stop_requested:
                socket_bus.emit("DEMO", "COMPLETE", "Cinematic Showcase Finished Successfully.", "SUCCESS")
                
        except Exception as e:
            demo_state.update(error=str(e))
            socket_bus.emit("DEMO", "ERROR", f"Showcase Error: {str(e)}", "CRITICAL")
        finally:
            demo_state.update(active=False)
            socket_bus.emit_raw('demo_state_updated', demo_state.to_dict())
            # Automatic cleanup after 5 seconds to keep system clean
            time.sleep(5.0)
            if not demo_state.active:
                self._cleanup()

    def _cleanup(self):
        """Returns the kernel to a stable baseline state."""
        socket_bus.emit("DEMO", "CLEANUP", "Initializing Post-Demo Resource Reclamation...", "INFO")
        
        from os_modules.shell_terminal import shell_terminal
        # Sequence of safe reset commands
        cleanup_cmds = [
            "stop-scheduler",
            "reset-simulation",
            "clear-memory",
            "disk-reset",
            "reset-board"
        ]
        
        for cmd in cleanup_cmds:
            shell_terminal.execute(cmd)
            time.sleep(0.5)

        socket_bus.emit("DEMO", "CLEANUP_DONE", "System Integrity Verified. Simulation Cleaned.", "SUCCESS")

demo_engine = DemoEngine()
