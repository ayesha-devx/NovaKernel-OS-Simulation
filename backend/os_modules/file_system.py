import time
import uuid
import math
import threading
from datetime import datetime
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus

class Inode:
    def __init__(self, inode_id, filename, owner="system", owner_pid=None):
        self.inode_id = inode_id
        self.filename = filename
        self.owner = owner
        self.owner_pid = owner_pid
        self.size = 0  # in MB
        self.created_at = datetime.now().isoformat()
        self.modified_at = datetime.now().isoformat()
        self.blocks = []  # List of block indices
        self.permissions = "rw-r--r--"
        self.status = "ACTIVE"
        self.is_locked = False

    def to_dict(self):
        return {
            "inode_id": self.inode_id,
            "filename": self.filename,
            "owner": self.owner,
            "owner_pid": self.owner_pid,
            "size": self.size,
            "created_at": self.created_at,
            "modified_at": self.modified_at,
            "blocks": self.blocks,
            "permissions": self.permissions,
            "status": self.status,
            "is_locked": self.is_locked,
            "block_count": len(self.blocks)
        }

class FileSystem:
    def __init__(self, total_disk_mb=8192, block_size_mb=64):
        self.total_disk_mb = total_disk_mb
        self.block_size_mb = block_size_mb
        self.total_blocks = total_disk_mb // block_size_mb
        
        # Disk Map: List of block owners (None if free)
        self.blocks = [None] * self.total_blocks
        
        # Inode Table: Mapping inode_id -> Inode object
        self.inode_table = {}
        
        # Directory: Mapping filename -> inode_id
        self.directory = {}
        
        # File Contents: Simulating raw data storage
        self.file_data = {} # inode_id -> string content
        
        self.logs = []
        self.event_logger = None
        self.lock = threading.RLock()
        
        self._sync_state()

    def _sync_state(self):
        state = self.get_state()
        kernel_state.file_system_state["files"] = {f["filename"]: f for f in state["directory"]}
        kernel_state.file_system_state["used_disk"] = state["stats"]["used_disk_mb"]
        kernel_state.file_system_state["total_disk"] = state["stats"]["total_disk_mb"]
        kernel_state.file_system_state["blocks"] = state["blocks"]

    def set_dependencies(self, socketio, event_logger):
        pass # Compatibility

    def _notify_update(self):
        self._sync_state()
        socket_bus.broadcast_state()

    def _log(self, message, severity="INFO"):
        socket_bus.emit("FILE_SYSTEM", "OPERATION", message, severity)

    def create_file(self, filename, owner="system", owner_pid=None):
        with kernel_state.lock:
            with self.lock:
                if filename in self.directory:
                    return {"success": False, "message": "File already exists"}
                
                if len(self.inode_table) >= 256: # Max inodes limit
                    return {"success": False, "message": "Inode table overflow"}

                inode_id = len(self.inode_table) + 1
                new_inode = Inode(inode_id, filename, owner, owner_pid)
                
                self.inode_table[inode_id] = new_inode
                self.directory[filename] = inode_id
                self.file_data[inode_id] = ""
                
                # --- Disk Integration ---
                from os_modules.disk_request_manager import disk_request_manager
                disk_request_manager.add_request(track=inode_id % 100, op_type="WRITE", pid=owner_pid)

                self._log(f"File '{filename}' created by PID {owner_pid} (Inode #{inode_id})", "SUCCESS")
                
                # ANALYTICS TIMELINE HOOK
                from analytics.analytics_engine import analytics_engine
                analytics_engine.record_event(
                    module="FILE_SYSTEM",
                    event_type="FILE_CREATED",
                    message=f"New file '{filename}' created (Inode {inode_id})",
                    pid=owner_pid,
                    metadata={"inode": inode_id}
                )

                self._notify_update()
                return {"success": True, "inode": new_inode.to_dict()}

    def write_file(self, filename, content):
        with kernel_state.lock:
            with self.lock:
                if filename not in self.directory:
                    return {"success": False, "message": "File not found"}
                
                inode_id = self.directory[filename]
                inode = self.inode_table[inode_id]
                
                # Calculate required blocks
                content_size_mb = len(content) * 0.001 # Simple simulation: 1 char = 1KB approx
                if content_size_mb < 1: content_size_mb = 1 # Min size
                
                required_blocks = math.ceil(content_size_mb / self.block_size_mb)
                
                # Check for free blocks
                free_block_indices = [i for i, owner in enumerate(self.blocks) if owner is None or owner == inode_id]
                
                if len(free_block_indices) < required_blocks:
                    return {"success": False, "message": "Disk space full"}

                # Release old blocks first
                for i in range(self.total_blocks):
                    if self.blocks[i] == inode_id:
                        self.blocks[i] = None
                
                # Allocate new blocks
                allocated = []
                for i in range(required_blocks):
                    block_idx = free_block_indices[i]
                    self.blocks[block_idx] = inode_id
                    allocated.append(block_idx)
                    
                inode.blocks = allocated
                inode.size = round(len(allocated) * self.block_size_mb, 2)
                inode.modified_at = datetime.now().isoformat()
                self.file_data[inode_id] = content
                
                # --- Disk Integration ---
                from os_modules.disk_request_manager import disk_request_manager
                for block in allocated[:3]: # Log up to 3 blocks to avoid flood
                    disk_request_manager.add_request(track=block % 100, op_type="WRITE", pid=inode.owner_pid)

                self._log(f"Wrote {len(content)} chars to '{filename}'. Allocated {required_blocks} blocks.")
                
                # ANALYTICS TIMELINE HOOK
                from analytics.analytics_engine import analytics_engine
                analytics_engine.record_event(
                    module="FILE_SYSTEM",
                    event_type="FILE_WRITTEN",
                    message=f"File '{filename}' updated ({inode.size}MB)",
                    metadata={"filename": filename, "size": inode.size}
                )

                self._notify_update()
                return {"success": True, "inode": inode.to_dict()}

    def read_file(self, filename):
        if filename not in self.directory:
            return {"success": False, "message": "File not found"}
        
        inode_id = self.directory[filename]
        inode = self.inode_table[inode_id]
        content = self.file_data.get(inode_id, "")
        
        # --- Disk Integration ---
        from os_modules.disk_request_manager import disk_request_manager
        if inode.blocks:
            disk_request_manager.add_request(track=inode.blocks[0] % 100, op_type="READ", pid=inode.owner_pid)
        else:
            disk_request_manager.add_request(track=inode_id % 100, op_type="READ", pid=inode.owner_pid)

        from analytics.analytics_engine import analytics_engine
        analytics_engine.record_event("FILE_SYSTEM", "FILE_READ", f"File '{filename}' read", metadata={"filename": filename})

        self._log(f"Read operation on '{filename}' (Inode #{inode_id})")
        return {
            "success": True, 
            "content": content,
            "metadata": inode.to_dict()
        }

    def delete_file(self, filename):
        with kernel_state.lock:
            with self.lock:
                if filename not in self.directory:
                    return {"success": False, "message": "File not found"}
                
                inode_id = self.directory[filename]
                
                # Free blocks
                freed_count = 0
                for i in range(self.total_blocks):
                    if self.blocks[i] == inode_id:
                        self.blocks[i] = None
                        freed_count += 1
                
                # Remove from tables
                del self.directory[filename]
                del self.inode_table[inode_id]
                if inode_id in self.file_data:
                    del self.file_data[inode_id]
                    
                # --- Disk Integration ---
                from os_modules.disk_request_manager import disk_request_manager
                disk_request_manager.add_request(track=inode_id % 100, op_type="WRITE", pid="SYS")

                from analytics.analytics_engine import analytics_engine
                analytics_engine.record_event("FILE_SYSTEM", "FILE_DELETED", f"File '{filename}' deleted", severity="WARNING", metadata={"filename": filename})

                self._log(f"Deleted '{filename}'. Freed Inode #{inode_id} and {freed_count} blocks.", "WARNING")
                self._notify_update()
                return {"success": True}

    def release_process_locks(self, pid):
        """Releases all file locks held by a process and generates logs."""
        with kernel_state.lock:
            with self.lock:
                released_count = 0
                for inode in self.inode_table.values():
                    if inode.owner_pid == pid and inode.is_locked:
                        inode.is_locked = False
                        released_count += 1
                
                if released_count > 0:
                    self._log(f"Released {released_count} file locks for terminating PID {pid}", "INFO")
                    self._notify_update()

    def get_state(self):
        used_blocks = sum(1 for b in self.blocks if b is not None)
        return {
            "stats": {
                "total_disk_mb": self.total_disk_mb,
                "used_disk_mb": used_blocks * self.block_size_mb,
                "free_disk_mb": (self.total_blocks - used_blocks) * self.block_size_mb,
                "total_blocks": self.total_blocks,
                "used_blocks": used_blocks,
                "free_blocks": self.total_blocks - used_blocks,
                "file_count": len(self.directory),
                "inode_usage": len(self.inode_table),
                "utilization": round((used_blocks / self.total_blocks) * 100, 2) if self.total_blocks > 0 else 0
            },
            "directory": [inode.to_dict() for inode in self.inode_table.values()],
            "blocks": self.blocks, # List of block owners
            "logs": self.logs
        }

# Global Instance
fs_engine = FileSystem()
