import os
import json
import time
from datetime import datetime

class SnapshotStorage:
    """
    Manages persistence of NovaKernel snapshots.
    Handles file I/O, indexing, and storage cleanup.
    """
    def __init__(self, base_dir="storage/snapshots"):
        self.base_dir = base_dir
        self.max_snapshots = 15
        self._ensure_storage()

    def _ensure_storage(self):
        """Creates the storage directory if it doesn't exist."""
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir, exist_ok=True)

    def save_snapshot(self, snapshot_id, data):
        """Persists a snapshot to disk as JSON."""
        try:
            filename = f"{snapshot_id}.json"
            filepath = os.path.join(self.base_dir, filename)
            
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2)
                
            # Perform auto-cleanup of oldest snapshots
            self._cleanup_old_snapshots()
            
            return True, filepath
        except Exception as e:
            return False, str(e)

    def load_snapshot(self, snapshot_id):
        """Reads a snapshot from disk."""
        try:
            filename = f"{snapshot_id}.json"
            filepath = os.path.join(self.base_dir, filename)
            
            if not os.path.exists(filepath):
                return None, "Snapshot file not found."
                
            with open(filepath, 'r') as f:
                data = json.load(f)
                
            return data, None
        except Exception as e:
            return None, str(e)

    def list_snapshots(self):
        """Returns a list of all available snapshots with metadata."""
        snapshots = []
        try:
            for filename in os.listdir(self.base_dir):
                if filename.endswith(".json"):
                    filepath = os.path.join(self.base_dir, filename)
                    # We only read the metadata part to keep it fast
                    with open(filepath, 'r') as f:
                        # Lightweight read: just the first few lines to get metadata
                        # But for simplicity in this simulator, we load the whole thing 
                        # as snapshots aren't huge yet.
                        data = json.load(f)
                        metadata = data.get("metadata", {})
                        snapshots.append({
                            "id": filename.replace(".json", ""),
                            "timestamp": metadata.get("timestamp"),
                            "label": metadata.get("label"),
                            "version": metadata.get("kernel_version"),
                            "uptime": metadata.get("uptime"),
                            "boot_state": metadata.get("boot_state"),
                            "size_kb": os.path.getsize(filepath) // 1024
                        })
            
            # Sort by timestamp descending
            snapshots.sort(key=lambda x: x["timestamp"] if x["timestamp"] else 0, reverse=True)
            return snapshots
        except Exception as e:
            print(f"STORAGE_ERROR: {str(e)}")
            return []

    def delete_snapshot(self, snapshot_id):
        """Deletes a snapshot file."""
        try:
            filename = f"{snapshot_id}.json"
            filepath = os.path.join(self.base_dir, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
        except Exception:
            return False

    def _cleanup_old_snapshots(self):
        """Deletes the oldest snapshots if the limit is exceeded."""
        snapshots = self.list_snapshots()
        if len(snapshots) > self.max_snapshots:
            for old_snap in snapshots[self.max_snapshots:]:
                self.delete_snapshot(old_snap["id"])

# Global Instance
snapshot_storage = SnapshotStorage()
