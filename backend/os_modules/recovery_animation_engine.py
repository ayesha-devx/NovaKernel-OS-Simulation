import time
import threading

# Animation Phase Constants
class Phase:
    DETECTION            = "DETECTION"
    ANALYZING            = "ANALYZING"
    VICTIM_SELECTED      = "VICTIM_SELECTED"
    RESOURCE_RELEASE     = "RESOURCE_RELEASE"
    PROCESS_TERMINATED   = "PROCESS_TERMINATED"
    RESOURCE_REALLOCATION = "RESOURCE_REALLOCATION"
    SYSTEM_STABILIZED    = "SYSTEM_STABILIZED"
    IDLE                 = "IDLE"

# Phase sequence for auto-orchestration
PHASE_SEQUENCE = [
    Phase.DETECTION,
    Phase.ANALYZING,
    Phase.VICTIM_SELECTED,
    Phase.RESOURCE_RELEASE,
    Phase.PROCESS_TERMINATED,
    Phase.RESOURCE_REALLOCATION,
    Phase.SYSTEM_STABILIZED,
]

# Duration (ms) each phase is held on the frontend
PHASE_DURATIONS = {
    Phase.DETECTION:             600,
    Phase.ANALYZING:             800,
    Phase.VICTIM_SELECTED:       700,
    Phase.RESOURCE_RELEASE:      600,
    Phase.PROCESS_TERMINATED:    500,
    Phase.RESOURCE_REALLOCATION: 700,
    Phase.SYSTEM_STABILIZED:     1000,
    Phase.IDLE:                  0,
}


class RecoveryAnimationEngine:
    """
    RECOVERY ANIMATION STATE ENGINE.
    Generates and emits animation phase packets over the socket bus.
    Keeps track of the current animation state so late-joining clients
    can catch up via REST.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._current_phase = Phase.IDLE
        self._current_metadata = {}
        self._phase_history = []          # Stored for replay
        self._replay_buffer = []          # Full recovery sequence for playback

    # ------------------------------------------------------------------ #
    #  Public API                                                          #
    # ------------------------------------------------------------------ #

    def emit_phase(self, phase: str, metadata: dict = None):
        """
        Emit a single animation phase to all connected clients.
        Stores the phase for replay.
        """
        from kernel.socket_bus import socket_bus

        payload = {
            "phase": phase,
            "timestamp": time.strftime("%H:%M:%S"),
            "epoch": time.time(),
            "duration_ms": PHASE_DURATIONS.get(phase, 500),
            "metadata": metadata or {}
        }

        with self._lock:
            self._current_phase = phase
            self._current_metadata = metadata or {}
            self._phase_history.append(payload)
            # Keep replay buffer for last full recovery sequence
            if phase == Phase.DETECTION:
                self._replay_buffer = [payload]   # Start fresh sequence
            else:
                self._replay_buffer.append(payload)

        socket_bus.emit_raw("RECOVERY_ANIMATION", payload)
        print(f"[RECOVERY_ANIMATION] Phase → {phase} | meta={metadata or {}}")

    def run_recovery_sequence(self, victim_pid: int, victim_name: str,
                               freed_resources: list, survivor_pids: list):
        """
        Orchestrate the full animated recovery sequence in a background thread.
        Emits each phase with the correct timing, non-blocking.
        """
        thread = threading.Thread(
            target=self._orchestrate,
            args=(victim_pid, victim_name, freed_resources, survivor_pids),
            daemon=True
        )
        thread.start()

    def get_current_state(self) -> dict:
        """REST-accessible: returns the current animation phase."""
        with self._lock:
            return {
                "phase": self._current_phase,
                "metadata": self._current_metadata
            }

    def get_replay_buffer(self) -> list:
        """Return stored phases for the last recovery sequence (for playback)."""
        with self._lock:
            return list(self._replay_buffer)

    def reset(self):
        """Clear animation state on system reset."""
        with self._lock:
            self._current_phase = Phase.IDLE
            self._current_metadata = {}
        self.emit_phase(Phase.IDLE, {})

    # ------------------------------------------------------------------ #
    #  Internal orchestration                                              #
    # ------------------------------------------------------------------ #

    def _orchestrate(self, victim_pid, victim_name, freed_resources, survivor_pids):
        """Runs in its own thread — emits the full phase sequence with timed delays."""
        try:
            self.emit_phase(Phase.DETECTION, {
                "deadlocked_pids": [victim_pid] + survivor_pids
            })
            time.sleep(0.6)

            self.emit_phase(Phase.ANALYZING, {
                "cycle_size": len([victim_pid] + survivor_pids)
            })
            time.sleep(0.8)

            self.emit_phase(Phase.VICTIM_SELECTED, {
                "victim_pid": victim_pid,
                "victim_name": victim_name
            })
            time.sleep(0.7)

            self.emit_phase(Phase.RESOURCE_RELEASE, {
                "victim_pid": victim_pid,
                "resources": freed_resources
            })
            time.sleep(0.6)

            self.emit_phase(Phase.PROCESS_TERMINATED, {
                "victim_pid": victim_pid
            })
            time.sleep(0.5)

            self.emit_phase(Phase.RESOURCE_REALLOCATION, {
                "survivor_pids": survivor_pids,
                "resources": freed_resources
            })
            time.sleep(0.7)

            self.emit_phase(Phase.SYSTEM_STABILIZED, {
                "survivor_pids": survivor_pids
            })
            time.sleep(1.0)

            # Return to idle
            self.emit_phase(Phase.IDLE, {})

        except Exception as e:
            print(f"[RECOVERY_ANIMATION] Orchestration error: {e}")
            self.emit_phase(Phase.IDLE, {})


# Global Instance
recovery_animation_engine = RecoveryAnimationEngine()
