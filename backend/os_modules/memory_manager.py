import time
import threading
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus

class MemoryBlock:
    def __init__(self, block_id, start_address, size, status="FREE", pid=None, process_name=None, algo=None):
        self.block_id = block_id
        self.start_address = start_address
        self.end_address = start_address + size - 1
        self.size = size
        self.status = status # "FREE" or "ALLOCATED"
        self.pid = pid
        self.process_name = process_name
        self.allocation_algo = algo
        self.timestamp = time.strftime("%H:%M:%S")

    def to_dict(self):
        return {
            "block_id": self.block_id,
            "start_address": self.start_address,
            "end_address": self.end_address,
            "size": self.size,
            "status": self.status,
            "pid": self.pid,
            "process_name": self.process_name,
            "allocation_algo": self.allocation_algo,
            "timestamp": self.timestamp
        }

class MemoryManager:
    def __init__(self, total_memory=4096):
        self.total_memory = total_memory
        self.blocks = [MemoryBlock(0, 0, total_memory)] # Start with one large free block
        self.next_block_id = 1
        self.algorithm = "FIRST_FIT" # Default: FIRST_FIT or BEST_FIT
        
        self.lock = threading.RLock()
        
        # Statistics
        self.allocation_failures = 0
        
        # Sync with kernel state
        self._sync_state()

    def _sync_state(self):
        with kernel_state.lock:
            stats = self.get_statistics()
            kernel_state.memory_map["total_ram"] = self.total_memory
            kernel_state.memory_map["blocks"] = [b.to_dict() for b in self.blocks]
            kernel_state.memory_map["used_ram"] = stats["used_memory"]
            kernel_state.memory_map["fragmentation"] = stats["fragmentation_percentage"]
            kernel_state.memory_map["external_fragmentation"] = stats["external_fragmentation"]
            kernel_state.memory_map["largest_free_block"] = stats["largest_free_block"]
            kernel_state.memory_map["current_algorithm"] = self.algorithm
            kernel_state.metrics["ram_pressure"] = stats["utilization"]
        
    def set_dependencies(self, socketio, event_logger):
        pass # Compatibility

    def set_algorithm(self, algo):
        if algo in ["FIRST_FIT", "BEST_FIT"]:
            with kernel_state.lock:
                with self.lock:
                    old_algo = self.algorithm
                    self.algorithm = algo
                    socket_bus.emit("MEMORY_MANAGER", "ALGO_SWITCH", f"Allocation algorithm switched: {old_algo} -> {algo}", "WARNING")
                    
                    # --- TRACE HOOK ---
                    try:
                        from monitoring.event_trace_engine import event_trace_engine
                        event_trace_engine.trace(
                            subsystem="MEMORY",
                            severity="INFO",
                            category="MEMORY",
                            title="Allocation Policy Switched",
                            description=f"Memory policy changed from {old_algo} to {algo}",
                            metadata={"old_algo": old_algo, "new_algo": algo}
                        )
                    except: pass

                    self._notify_update()
            return True
        return False

    def allocate(self, pid, name, size):
        with kernel_state.lock:
            with self.lock:
                target_block_idx = -1
                
                if self.algorithm == "FIRST_FIT":
                    target_block_idx = self._find_first_fit(size)
                elif self.algorithm == "BEST_FIT":
                    target_block_idx = self._find_best_fit(size)
                    
                if target_block_idx == -1:
                    self.allocation_failures += 1
                    socket_bus.emit("MEMORY_MANAGER", "ALLOC_FAILED", 
                                f"Allocation FAILED for {name} (PID: {pid}). Insufficient contiguous RAM ({size}MB requested).", 
                                "ERROR", {"pid": pid, "size": size})
                    
                    # --- TRACE HOOK ---
                    try:
                        from monitoring.event_trace_engine import event_trace_engine
                        event_trace_engine.trace(
                            subsystem="MEMORY",
                            severity="ERROR",
                            category="MEMORY",
                            title="Memory Allocation Failed",
                            description=f"Insufficient contiguous RAM for PID {pid} ({size}MB requested)",
                            metadata={"pid": pid, "requested_size": size, "algorithm": self.algorithm}
                        )
                    except: pass
                    return False
                
                # Split the block
                free_block = self.blocks[target_block_idx]
                
                # Create new allocated block
                allocated_block = MemoryBlock(
                    block_id=self.next_block_id,
                    start_address=free_block.start_address,
                    size=size,
                    status="ALLOCATED",
                    pid=pid,
                    process_name=name,
                    algo=self.algorithm
                )
                self.next_block_id += 1
                
                # Update the original free block
                if free_block.size > size:
                    free_block.start_address += size
                    free_block.size -= size
                    # Insert the allocated block before the updated free block
                    self.blocks.insert(target_block_idx, allocated_block)
                else:
                    # Perfect fit, replace the block
                    self.blocks[target_block_idx] = allocated_block
                    
                socket_bus.emit("MEMORY_MANAGER", "ALLOC_SUCCESS", 
                               f"Allocated {size}MB to {name} (PID: {pid}) at 0x{allocated_block.start_address:04X} using {self.algorithm}.", 
                               "SUCCESS", {"pid": pid, "size": size, "address": allocated_block.start_address})
                
                # --- TRACE HOOK ---
                try:
                    from monitoring.event_trace_engine import event_trace_engine
                    event_trace_engine.trace(
                        subsystem="MEMORY",
                        severity="SUCCESS",
                        category="MEMORY",
                        title="Memory Allocated",
                        description=f"PID {pid} assigned {size}MB at 0x{allocated_block.start_address:04X}",
                        metadata={"pid": pid, "size": size, "address": allocated_block.start_address, "algo": self.algorithm}
                    )
                except: pass

                # ANALYTICS TIMELINE HOOK
                from analytics.analytics_engine import analytics_engine
                analytics_engine.record_event(
                    module="MEMORY_MANAGER",
                    event_type="MEMORY_ALLOCATED",
                    message=f"Allocated {size}MB to {name} (PID {pid})",
                    pid=pid,
                    metadata={"size": size, "address": allocated_block.start_address}
                )

                self._notify_update()
                return True

    def deallocate(self, pid):
        with kernel_state.lock:
            with self.lock:
                found = False
                for block in self.blocks:
                    if block.pid == pid and block.status == "ALLOCATED":
                        block.status = "FREE"
                        block.pid = None
                        block.process_name = None
                        block.allocation_algo = None
                        found = True
                
                if found:
                    self._merge_adjacent_free_blocks()
                    socket_bus.emit("MEMORY_MANAGER", "DEALLOC", f"Memory released for PID: {pid}. Adjacent free blocks merged.", "INFO", {"pid": pid})
                    
                    # --- TRACE HOOK ---
                    try:
                        from monitoring.event_trace_engine import event_trace_engine
                        event_trace_engine.trace(
                            subsystem="MEMORY",
                            severity="INFO",
                            category="MEMORY",
                            title="Memory Released",
                            description=f"All blocks freed for PID {pid}",
                            metadata={"pid": pid}
                        )
                    except: pass

                    # ANALYTICS TIMELINE HOOK
                    from analytics.analytics_engine import analytics_engine
                    analytics_engine.record_event(
                        module="MEMORY_MANAGER",
                        event_type="MEMORY_FREED",
                        message=f"Released all memory blocks for PID {pid}",
                        pid=pid
                    )

                    self._notify_update()
                return found

    def _find_first_fit(self, size):
        for i, block in enumerate(self.blocks):
            if block.status == "FREE" and block.size >= size:
                return i
        return -1

    def _find_best_fit(self, size):
        best_idx = -1
        min_waste = float('inf')
        
        for i, block in enumerate(self.blocks):
            if block.status == "FREE" and block.size >= size:
                waste = block.size - size
                if waste < min_waste:
                    min_waste = waste
                    best_idx = i
        return best_idx

    def _merge_adjacent_free_blocks(self):
        if not self.blocks: return
        
        new_blocks = []
        current_block = self.blocks[0]
        
        for i in range(1, len(self.blocks)):
            next_block = self.blocks[i]
            if current_block.status == "FREE" and next_block.status == "FREE":
                # Merge
                current_block.size += next_block.size
                current_block.end_address = next_block.end_address
            else:
                new_blocks.append(current_block)
                current_block = next_block
        
        new_blocks.append(current_block)
        self.blocks = new_blocks

    def get_statistics(self):
        with self.lock:
            # Calculate metrics directly from blocks to prevent sync drift
            used_memory = sum(b.size for b in self.blocks if b.status == "ALLOCATED")
            free_blocks = [b for b in self.blocks if b.status == "FREE"]
            free_memory = sum(b.size for b in free_blocks)
            
            largest_free = 0
            external_frag = 0
            
            if free_blocks:
                largest_free = max(b.size for b in free_blocks)
                # External fragmentation is the total free space that isn't the largest contiguous block
                external_frag = free_memory - largest_free
                
            utilization = (used_memory / self.total_memory) * 100 if self.total_memory > 0 else 0
            
            return {
                "total_memory": self.total_memory,
                "used_memory": used_memory,
                "free_memory": free_memory,
                "utilization": round(utilization, 2),
                "external_fragmentation": external_frag,
                "fragmentation_percentage": round((external_frag / self.total_memory) * 100, 2) if self.total_memory > 0 else 0,
                "largest_free_block": largest_free,
                "allocation_failures": self.allocation_failures,
                "current_algorithm": self.algorithm,
                "block_count": len(self.blocks)
            }

    def _notify_update(self):
        self._sync_state()
        socket_bus.broadcast_state()

memory_manager = MemoryManager()
