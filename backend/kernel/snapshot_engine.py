import threading
import time
import uuid
from kernel.kernel_state import kernel_state
from kernel.state_serializer import state_serializer
from kernel.snapshot_storage import snapshot_storage

class SnapshotEngine:
    """
    Orchestration engine for NovaKernel snapshots and auto-checkpoints.
    Handles asynchronous capture to prevent UI blocking.
    """
    def __init__(self):
        self.socketio = None
        self.checkpoint_thread = None
        self.is_running = False

    def set_socket(self, socketio):
        self.socketio = socketio

    def create_snapshot(self, label="Manual Snapshot", is_checkpoint=False):
        """
        Triggers a snapshot creation.
        Runs the serialization and storage in a background thread.
        """
        snapshot_id = f"{'CHK' if is_checkpoint else 'SNAP'}_{uuid.uuid4().hex[:8]}"
        
        # Start background thread
        thread = threading.Thread(
            target=self._snapshot_worker,
            args=(snapshot_id, label, is_checkpoint),
            daemon=True
        )
        thread.start()
        
        return snapshot_id

    def _snapshot_worker(self, snapshot_id, label, is_checkpoint):
        """Internal worker for snapshot creation."""
        try:
            self._emit_progress(snapshot_id, "INITIALIZING", 10)
            
            # 1. Update State
            with kernel_state.lock:
                kernel_state.snapshot_state = "SAVING"
            
            # 2. Serialize State
            self._emit_progress(snapshot_id, "SERIALIZING", 30)
            data = state_serializer.serialize_kernel_state(kernel_state)
            
            if not data:
                raise Exception("Serialization failed.")
            
            # Add additional display metadata
            data["metadata"]["label"] = label
            data["metadata"]["is_checkpoint"] = is_checkpoint
            
            # 3. Store Snapshot
            self._emit_progress(snapshot_id, "STORING", 70)
            success, error = snapshot_storage.save_snapshot(snapshot_id, data)
            
            if not success:
                raise Exception(f"Storage failed: {error}")
            
            # 4. Finalize
            with kernel_state.lock:
                kernel_state.snapshot_state = "IDLE"
                kernel_state.active_snapshot_id = snapshot_id
                # Update history for UI
                kernel_state.snapshot_history = snapshot_storage.list_snapshots()
            
            self._emit_progress(snapshot_id, "COMPLETED", 100)
            
            # --- TRACE HOOK ---
            try:
                from monitoring.event_trace_engine import event_trace_engine
                event_trace_engine.trace(
                    subsystem="SNAPSHOT",
                    severity="SUCCESS",
                    category="SNAPSHOT",
                    title="Snapshot Created",
                    description=f"System state captured: {label}",
                    metadata={"snapshot_id": snapshot_id, "label": label, "is_checkpoint": is_checkpoint}
                )
            except: pass

            if self.socketio:
                self.socketio.emit("SNAPSHOT_CREATED", {
                    "id": snapshot_id,
                    "label": label,
                    "timestamp": data["metadata"]["timestamp"]
                })
                
        except Exception as e:
            print(f"SNAPSHOT_ENGINE_ERROR: {str(e)}")
            with kernel_state.lock:
                kernel_state.snapshot_state = "ERROR"
            
            # --- TRACE HOOK ---
            try:
                from monitoring.event_trace_engine import event_trace_engine
                event_trace_engine.trace(
                    subsystem="SNAPSHOT",
                    severity="ERROR",
                    category="SNAPSHOT",
                    title="Snapshot Failed",
                    description=f"Capture failed: {str(e)}",
                    metadata={"error": str(e)}
                )
            except: pass

            if self.socketio:
                self.socketio.emit("SNAPSHOT_FAILED", {"id": snapshot_id, "error": str(e)})

    def _emit_progress(self, snapshot_id, stage, progress):
        """Emits progress updates to the frontend."""
        if self.socketio:
            self.socketio.emit("SNAPSHOT_PROGRESS", {
                "id": snapshot_id,
                "stage": stage,
                "progress": progress
            })

    def start_checkpoint_system(self):
        """Starts the periodic auto-checkpoint thread."""
        if self.checkpoint_thread and self.checkpoint_thread.is_alive():
            return
            
        self.is_running = True
        self.checkpoint_thread = threading.Thread(target=self._checkpoint_loop, daemon=True)
        self.checkpoint_thread.start()

    def _checkpoint_loop(self):
        """Background loop for periodic checkpoints (every 5 minutes)."""
        while self.is_running:
            try:
                if kernel_state.checkpoint_enabled and kernel_state.status == "ACTIVE":
                    print("[SNAPSHOT] Creating periodic auto-checkpoint...")
                    self.create_snapshot(label="Auto Checkpoint", is_checkpoint=True)
                
                # Wait 5 minutes (300 seconds)
                # We check in 10s intervals to allow for faster shutdown
                for _ in range(30):
                    if not self.is_running: break
                    time.sleep(10)
                    
            except Exception as e:
                print(f"CHECKPOINT_LOOP_ERROR: {str(e)}")
                time.sleep(60)

# Global Instance
snapshot_engine = SnapshotEngine()
