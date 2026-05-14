import time
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus

# Module Imports
from os_modules.process_manager import process_manager
from os_modules.memory_manager import memory_manager
from os_modules.file_system import fs_engine
from os_modules.disk_scheduler import disk_scheduler
from os_modules.deadlock_detector import deadlock_detector
from hardware.arduino_controller import arduino_controller
from kernel.lifecycle_engine import lifecycle_engine
from os_modules.cpu_scheduler import scheduler_engine

class CommandRouter:
    """
    KERNEL COMMAND ROUTER.
    Maps shell tokens to existing NovaKernel subsystem methods.
    """
    
    def __init__(self):
        self.commands = {
            # Process Management
            "ps": self.cmd_ps,
            "spawn": self.cmd_spawn,
            "kill": self.cmd_kill,
            "pause": self.cmd_pause,
            "resume": self.cmd_resume,
            "fork": self.cmd_fork,
            "priority": self.cmd_priority,
            "top": self.cmd_top,
            
            # Scheduler
            "algo": self.cmd_algo,
            "quantum": self.cmd_quantum,
            "dispatch": self.cmd_dispatch,
            "queue-status": self.cmd_queue_status,
            
            # Memory
            "memmap": self.cmd_memmap,
            "malloc": self.cmd_malloc,
            "free": self.cmd_free,
            "ram-status": self.cmd_ram_status,
            "frag": self.cmd_frag,
            
            # File System
            "ls": self.cmd_ls,
            "touch": self.cmd_touch,
            "write": self.cmd_write,
            "cat": self.cmd_cat,
            "rm": self.cmd_rm,
            "inode-table": self.cmd_inode_table,
            
            # Deadlock
            "deadlock-test": self.cmd_deadlock_test,
            "resolve-deadlock": self.cmd_resolve_deadlock,
            "resource-status": self.cmd_resource_status,
            
            # Disk
            "disk-read": self.cmd_disk_read,
            "disk-write": self.cmd_disk_write,
            "disk-algo": self.cmd_disk_algo,
            "disk-queue": self.cmd_disk_queue,
            
            # Hardware
            "hardware-status": self.cmd_hardware_status,
            "trigger-alarm": self.cmd_trigger_alarm,
            "reset-board": self.cmd_reset_board,
            "simulation-mode": self.cmd_simulation_mode,
            "real-mode": self.cmd_real_mode,
            
            # System
            "help": self.cmd_help,
            "uptime": self.cmd_uptime,
            "sysinfo": self.cmd_sysinfo,
            "reboot": self.cmd_reboot,
            "journal": self.cmd_journal,
            "resources": self.cmd_resource_status,
            "rag": self.cmd_rag,
            "stat": self.cmd_stat,
            "buzz": self.cmd_buzz,
            "clear-memory": self.cmd_clear_memory,
            "simulate-load": self.cmd_simulate_load,
            "simulate_load": self.cmd_simulate_load,
            "stop-scheduler": self.cmd_stop_scheduler,
            "reset-simulation": self.cmd_reset_simulation,
            "disk-reset": self.cmd_disk_reset,
            "request-resource": self.cmd_request_resource,
            "release-resource": self.cmd_release_resource,
            "trigger-deadlock": self.cmd_trigger_deadlock
        }

    def route(self, parsed):
        if not parsed:
            return "ERROR: Empty command."
            
        cmd_name = parsed["command"]
        if cmd_name not in self.commands:
            return f"ERROR: Unknown command '{cmd_name}'. Type 'help' for available commands."
            
        try:
            return self.commands[cmd_name](parsed["args"], parsed["kwargs"])
        except Exception as e:
            import traceback
            print(f"--- KERNEL RECURSION DIAGNOSTIC ---")
            traceback.print_exc()
            return f"ERROR executing '{cmd_name}': {str(e)}"

    # --- PROCESS COMMANDS ---
    def cmd_ps(self, args, kwargs):
        procs = process_manager.get_all_processes()
        if not procs:
            return "No active processes."
        
        output = "PID\tNAME\t\tPRIO\tSTATE\t\tBURST\tMEMORY\n"
        output += "------------------------------------------------------------\n"
        for p in procs:
            output += f"{p['pid']}\t{p['name'][:10]:<10}\t{p['priority']}\t{p['state']:<10}\t{p['burst_remaining']}\t{p['memory_required']}MB\n"
        return output

    def cmd_spawn(self, args, kwargs):
        name = args[0] if args else "process"
        priority = int(kwargs.get("priority", 5))
        burst = float(kwargs.get("burst", 10.0))
        memory = int(kwargs.get("memory", 128))
        
        proc = process_manager.create_process(name, priority, burst, memory)
        if proc:
            return f"SUCCESS: Process '{name}' spawned with PID {proc.pid}."
        return "ERROR: Could not spawn process (Insufficient resources?)"

    def cmd_kill(self, args, kwargs):
        if not args: return "ERROR: Missing PID."
        pid = int(args[0])
        if process_manager.delete_process(pid):
            return f"SUCCESS: PID {pid} terminated."
        return f"ERROR: PID {pid} not found."

    def cmd_pause(self, args, kwargs):
        if not args: return "ERROR: Missing PID."
        pid = int(args[0])
        res = process_manager.update_process_state(pid, "WAITING")
        if isinstance(res, dict) and "error" in res:
            return f"ERROR: {res['error']}"
        return f"SUCCESS: PID {pid} paused."

    def cmd_resume(self, args, kwargs):
        if not args: return "ERROR: Missing PID."
        pid = int(args[0])
        res = process_manager.update_process_state(pid, "READY")
        if isinstance(res, dict) and "error" in res:
            return f"ERROR: {res['error']}"
        return f"SUCCESS: PID {pid} resumed."

    def cmd_fork(self, args, kwargs):
        if not args: return "ERROR: Missing parent PID."
        pid = int(args[0])
        child = process_manager.fork_process(pid)
        if child:
            return f"SUCCESS: Forked child PID {child['pid']} from parent {pid}."
        return f"ERROR: Fork failed for PID {pid}."

    def cmd_priority(self, args, kwargs):
        if len(args) < 2: return "Usage: priority <pid> <new_prio>"
        pid, prio = int(args[0]), int(args[1])
        with kernel_state.lock:
            if pid in kernel_state.processes:
                kernel_state.processes[pid].priority = prio
                return f"SUCCESS: PID {pid} priority updated to {prio}."
        return f"ERROR: PID {pid} not found."

    def cmd_top(self, args, kwargs):
        return self.cmd_ps(args, kwargs)

    # --- SCHEDULER COMMANDS ---
    def cmd_algo(self, args, kwargs):
        if not args: 
            return f"Current Scheduler Algorithm: {kernel_state.scheduler_state['current_algorithm']}"
        algo = args[0].upper()
        # Mocking the call to scheduler BP logic
        from routes.scheduler import scheduler_bp # We might need a better way to trigger this
        from os_modules.cpu_scheduler import scheduler_engine
        scheduler_engine.set_algorithm(algo)
        return f"SUCCESS: Algorithm switched to {algo}."

    def cmd_quantum(self, args, kwargs):
        if not args:
            return f"Current Time Quantum: {kernel_state.scheduler_state['quantum']}s"
        q = float(args[0])
        from os_modules.cpu_scheduler import scheduler_engine
        scheduler_engine.set_quantum(q)
        return f"SUCCESS: Time Quantum updated to {q}s."

    def cmd_dispatch(self, args, kwargs):
        from os_modules.cpu_scheduler import scheduler_engine
        scheduler_engine.start()
        return "SUCCESS: Scheduler Dispatch Engine started."

    def cmd_queue_status(self, args, kwargs):
        q = kernel_state.ready_queue
        return f"Ready Queue: {q}\nTotal Count: {len(q)}"

    # --- MEMORY COMMANDS ---
    def cmd_memmap(self, args, kwargs):
        with memory_manager.lock:
            blocks = memory_manager.blocks
            output = "START\tEND\tSIZE\tPID\tLABEL\n"
            output += "--------------------------------------------------\n"
            for b in blocks:
                output += f"{b.start_address}\t{b.end_address}\t{b.size}MB\t{b.pid if b.pid else 'FREE'}\t{b.process_name if b.process_name else 'EMPTY'}\n"
            return output

    def cmd_malloc(self, args, kwargs):
        if not args: return "Usage: malloc <size_mb> [label]"
        size = int(args[0])
        label = args[1] if len(args) > 1 else "manual_alloc"
        if memory_manager.allocate(None, label, size):
            return f"SUCCESS: Allocated {size}MB for {label}."
        return f"ERROR: Failed to allocate {size}MB."

    def cmd_free(self, args, kwargs):
        if not args: return "Usage: free <pid_or_label>"
        target = args[0]
        try:
            pid = int(target)
            memory_manager.deallocate(pid)
            return f"SUCCESS: Memory for PID {pid} freed."
        except:
            # Try by label? Our memory manager might not support dealloc by label easily
            return "ERROR: Deallocation currently supports PID only via CLI."


    # --- FILE SYSTEM COMMANDS ---
    def cmd_ls(self, args, kwargs):
        state = fs_engine.get_state()
        files = state["directory"]
        if not files: return "Directory is empty."
        output = "INODE\tFILENAME\tSIZE\tCREATED\n"
        output += "--------------------------------------------------\n"
        for f in files:
            output += f"{f['inode_id']}\t{f['filename']:<12}\t{f['size']}MB\t{f['created_at']}\n"
        return output

    def cmd_touch(self, args, kwargs):
        if not args: return "ERROR: Missing filename."
        fname = args[0]
        if fs_engine.create_file(fname):
            return f"SUCCESS: File '{fname}' created."
        return f"ERROR: Failed to create '{fname}'."

    def cmd_write(self, args, kwargs):
        if len(args) < 2: return "Usage: write <filename> <content>"
        fname, content = args[0], args[1]
        if fs_engine.write_file(fname, content):
            return f"SUCCESS: Wrote to '{fname}'."
        return f"ERROR: File not found or write failed."

    def cmd_cat(self, args, kwargs):
        if not args: return "ERROR: Missing filename."
        content = fs_engine.read_file(args[0])
        if content is not None:
            return f"Content of '{args[0]}':\n{content}"
        return f"ERROR: File '{args[0]}' not found."

    def cmd_rm(self, args, kwargs):
        if not args: return "ERROR: Missing filename."
        if fs_engine.delete_file(args[0]):
            return f"SUCCESS: File '{args[0]}' deleted."
        return f"ERROR: Failed to delete file."

    def cmd_inode_table(self, args, kwargs):
        state = fs_engine.get_state()
        return str(state["directory"])

    # --- DEADLOCK COMMANDS ---
    def cmd_deadlock_test(self, args, kwargs):
        # Trigger the existing deadlock simulation logic if available
        # For now, manually trigger a check
        deadlock_detector.check_deadlock()
        return "SUCCESS: Deadlock detection sweep triggered."

    def cmd_resolve_deadlock(self, args, kwargs):
        from os_modules.deadlock_recovery import deadlock_recovery
        deadlock_recovery.recover()
        return "SUCCESS: Deadlock recovery sequence initiated."

    def cmd_resource_status(self, args, kwargs):
        return str(kernel_state.resources)

    # --- DISK COMMANDS ---
    def cmd_disk_read(self, args, kwargs):
        if not args: return "Usage: disk-read <track>"
        track = int(args[0])
        from os_modules.disk_request_manager import disk_request_manager
        disk_request_manager.add_request(track, "READ", pid=0)
        return f"SUCCESS: Disk READ request queued for track {track}."

    def cmd_disk_write(self, args, kwargs):
        if not args: return "Usage: disk-write <track>"
        track = int(args[0])
        from os_modules.disk_request_manager import disk_request_manager
        disk_request_manager.add_request(track, "WRITE", pid=0)
        return f"SUCCESS: Disk WRITE request queued for track {track}."

    def cmd_disk_algo(self, args, kwargs):
        if not args: return f"Disk Algo: {kernel_state.disk_state['current_algorithm']}"
        algo = args[0].upper()
        disk_scheduler.set_algorithm(algo)
        return f"SUCCESS: Disk algorithm set to {algo}."

    def cmd_disk_queue(self, args, kwargs):
        q = kernel_state.disk_state["queue"]
        if not q: return "Disk queue is empty."
        output = "ID\tTRACK\tTYPE\tPID\n"
        output += "----------------------------------------\n"
        for r in q:
            output += f"{r['id'][:8]}\t{r['track']}\t{r['type']}\t{r['pid']}\n"
        return output

    # --- HARDWARE COMMANDS ---
    def cmd_hardware_status(self, args, kwargs):
        return str(arduino_controller.simulation_mode)

    def cmd_trigger_alarm(self, args, kwargs):
        arduino_controller.deadlock_detected()
        return "SUCCESS: Hardware Alarm triggered."

    def cmd_reset_board(self, args, kwargs):
        arduino_controller.reset_all()
        return "SUCCESS: Hardware Board reset."

    def cmd_simulation_mode(self, args, kwargs):
        arduino_controller.toggle_simulation(True)
        return "SUCCESS: Hardware in SIMULATION mode."

    def cmd_real_mode(self, args, kwargs):
        arduino_controller.toggle_simulation(False)
        return "SUCCESS: Hardware in REAL mode (Attempting connection)."

    # --- SYSTEM COMMANDS ---
    def cmd_help(self, args, kwargs):
        help_text = "NovaKernel Shell v1.0 - Help System\n"
        help_text += "------------------------------------------\n"
        help_text += "PROCESS: ps, spawn, kill, pause, resume, fork, priority, top\n"
        help_text += "SCHED:   algo, quantum, dispatch, queue-status\n"
        help_text += "MEMORY:  memmap, malloc, free, ram-status, frag, clear-memory\n"
        help_text += "FS:      ls, touch, write, cat, rm, inode-table, stat <file>\n"
        help_text += "DISK:    disk-read, disk-write, disk-algo, disk-queue\n"
        help_text += "DIAG:    journal, resources, rag, buzz <sec>\n"
        help_text += "SYSTEM:  help, clear, uptime, sysinfo, reboot\n"
        return help_text

    def cmd_uptime(self, args, kwargs):
        ut = round(time.time() - kernel_state.boot_time, 2)
        return f"Kernel Uptime: {ut} seconds"

    def cmd_sysinfo(self, args, kwargs):
        return f"NovaKernel v{kernel_state.version}\nStatus: {kernel_state.status}\nUptime: {round(time.time() - kernel_state.boot_time, 2)}s"

    def cmd_reboot(self, args, kwargs):
        socket_bus.emit("SYSTEM", "REBOOT", "Kernel reboot initiated via shell.", "CRITICAL")
        # In a real kernel this would reboot, here we might just reset state
        process_manager.reset()
        return "Kernel state reset. Simulation restarted."

    def cmd_ram_status(self, args, kwargs):
        m = kernel_state.memory_map
        return f"RAM Usage: {m['used_ram']}/{m['total_ram']} MB ({m['fragmentation']}% fragmentation)"

    def cmd_frag(self, args, kwargs):
        return f"Memory Fragmentation: {kernel_state.memory_map['fragmentation']}%"

    def cmd_journal(self, args, kwargs):
        limit = int(args[0]) if args else 15
        logs = kernel_state.event_logs[-limit:]
        output = "TIMESTAMP\tMODULE\t\tMESSAGE\n"
        output += "------------------------------------------------------------\n"
        for log in logs:
            output += f"{log['timestamp']}\t{log['module']:<12}\t{log['message']}\n"
        return output

    def cmd_rag(self, args, kwargs):
        output = "Resource Allocation Graph (RAG) Snapshot\n"
        output += "------------------------------------------\n"
        for rid, r in kernel_state.resource_state["resources"].items():
            owner = f"PID {r['allocated_to']}" if r['allocated_to'] else "FREE"
            waiters = f"Waiters: {r['waiting_pids']}" if r['waiting_pids'] else ""
            output += f"[{rid}] {r['name']:<18} -> {owner} {waiters}\n"
        return output

    def cmd_stat(self, args, kwargs):
        if not args: return "Usage: stat <filename>"
        fname = args[0]
        state = fs_engine.get_state()
        files = state["directory"]
        target = next((f for f in files if f['filename'] == fname), None)
        if not target: return f"ERROR: File '{fname}' not found."
        
        output = f"File: {target['filename']}\n"
        output += f"Inode: {target['inode_id']}\n"
        output += f"Size: {target['size']} MB\n"
        output += f"Created: {target['created_at']}\n"
        output += f"Blocks: {target['blocks']}\n"
        return output

    def cmd_buzz(self, args, kwargs):
        duration = float(args[0]) if args else 0.5
        arduino_controller.trigger_buzzer(duration)
        return f"SUCCESS: Buzzer triggered for {duration}s."

    def cmd_clear_memory(self, args, kwargs):
        with kernel_state.lock:
            memory_manager.blocks = [memory_manager.blocks[0].__class__(0, 0, memory_manager.total_memory)]
            memory_manager.total_allocated = 0
            memory_manager._notify_update()
        return "SUCCESS: Memory table purged and reset."

    def cmd_simulate_load(self, args, kwargs):
        import sys
        old_limit = sys.getrecursionlimit()
        sys.setrecursionlimit(3000) # Boost buffer for batch serialization
        
        try:
            count = int(args[0]) if args else 10
            count = min(50, max(1, count))
            
            # Optimization: Temporarily suppress high-frequency broadcasts during batch spawn
            spawned = 0
            for i in range(count):
                name = f"stress_task_{i}"
                priority = (i % 10) + 1
                burst = 5.0 + (i % 20)
                memory = 32 + (i % 256)
                
                # Use process_manager directly
                if process_manager.create_process(name, priority, burst, memory):
                    spawned += 1
            
            # Single broadcast at the end of the batch
            socket_bus.broadcast_state()
            return f"SUCCESS: Simulated load initiated. {spawned}/{count} stress processes spawned."
        finally:
            sys.setrecursionlimit(old_limit) # Restore safety

    def cmd_stop_scheduler(self, args, kwargs):
        scheduler_engine.stop()
        return "SUCCESS: CPU Scheduler stopped."

    def cmd_reset_simulation(self, args, kwargs):
        scheduler_engine.stop()
        process_manager.reset()
        arduino_controller.reset_all()
        return "SUCCESS: Simulation state fully reset."

    def cmd_disk_reset(self, args, kwargs):
        from os_modules.disk_request_manager import disk_request_manager
        disk_request_manager.clear_queue()
        return "SUCCESS: Disk queue reset."

    def cmd_request_resource(self, args, kwargs):
        if len(args) < 2: return "Usage: request-resource <pid> <rid>"
        pid, rid = int(args[0]), args[1]
        from os_modules.resource_manager import resource_manager
        success, msg = resource_manager.request_resource(pid, rid)
        return f"{'SUCCESS' if success else 'WAITING'}: {msg} (PID {pid} -> {rid})"

    def cmd_release_resource(self, args, kwargs):
        if len(args) < 2: return "Usage: release-resource <pid> <rid>"
        pid, rid = int(args[0]), args[1]
        from os_modules.resource_manager import resource_manager
        success, msg = resource_manager.release_resource(pid, rid)
        return f"{'SUCCESS' if success else 'ERROR'}: {msg}"

    def cmd_trigger_deadlock(self, args, kwargs):
        """
        CINEMATIC DEADLOCK ORCHESTRATOR.
        Deterministically creates a circular wait for showcase mode.
        """
        # 1. Spawn processes
        p1 = process_manager.create_process("deadlock_node_A", 10, 100, 64)
        p2 = process_manager.create_process("deadlock_node_B", 10, 100, 64)
        
        if not p1 or not p2:
            return "ERROR: Could not spawn deadlock processes (Memory full?)"
            
        from os_modules.resource_manager import resource_manager
        
        # 2. Circular Wait Logic
        # P1 grabs R1, wants R2
        # P2 grabs R2, wants R1
        resource_manager.request_resource(p1.pid, "R1") # Success
        resource_manager.request_resource(p2.pid, "R2") # Success
        
        time.sleep(0.5) # Dramatic pause
        
        resource_manager.request_resource(p1.pid, "R2") # Blocked
        resource_manager.request_resource(p2.pid, "R1") # Blocked/Deadlock
        
        # 3. Trigger Detector
        deadlock_detector.check_deadlock()
        
        return "SUCCESS: Cinematic Deadlock Orchestrated (P1 holds R1, wants R2; P2 holds R2, wants R1)"

command_router = CommandRouter()
