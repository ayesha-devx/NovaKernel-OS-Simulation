from flask_socketio import emit
from kernel.snapshot_engine import snapshot_engine
from kernel.restore_engine import restore_engine
from kernel.snapshot_storage import snapshot_storage
from kernel.kernel_state import kernel_state

def register_snapshot_events(socketio):
    """Registers handlers for snapshot and restore operations."""
    
    @socketio.on('CREATE_SNAPSHOT')
    def handle_create_snapshot(data):
        label = data.get('label', 'Manual Snapshot')
        snapshot_id = snapshot_engine.create_snapshot(label=label)
        emit('SNAPSHOT_STARTED', {"id": snapshot_id})

    @socketio.on('RESTORE_SNAPSHOT')
    def handle_restore_snapshot(data):
        snapshot_id = data.get('id')
        if not snapshot_id:
            emit('ERROR', {"message": "No snapshot ID provided."})
            return
            
        success = restore_engine.restore_snapshot(snapshot_id)
        if success:
            emit('RESTORE_STARTED', {"id": snapshot_id})
        else:
            emit('ERROR', {"message": "Failed to initiate restore."})

    @socketio.on('LIST_SNAPSHOTS')
    def handle_list_snapshots():
        snapshots = snapshot_storage.list_snapshots()
        emit('SNAPSHOT_LIST', {"snapshots": snapshots})

    @socketio.on('DELETE_SNAPSHOT')
    def handle_delete_snapshot(data):
        snapshot_id = data.get('id')
        if snapshot_storage.delete_snapshot(snapshot_id):
            snapshots = snapshot_storage.list_snapshots()
            emit('SNAPSHOT_LIST', {"snapshots": snapshots})
            emit('SUCCESS', {"message": f"Snapshot {snapshot_id} deleted."})

    @socketio.on('TOGGLE_CHECKPOINTS')
    def handle_toggle_checkpoints(data):
        enabled = data.get('enabled', True)
        with kernel_state.lock:
            kernel_state.checkpoint_enabled = enabled
        emit('CHECKPOINT_STATE', {"enabled": enabled})

    @socketio.on('REQUEST_SNAPSHOT_STATUS')
    def handle_request_status():
        """Returns the current snapshot history and system state."""
        snapshots = snapshot_storage.list_snapshots()
        emit('SNAPSHOT_STATUS_UPDATE', {
            "history": snapshots,
            "checkpoint_enabled": kernel_state.checkpoint_enabled,
            "last_restore_time": kernel_state.last_restore_time,
            "active_snapshot_id": kernel_state.active_snapshot_id
        })
