import time
import random
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus
from os_modules.process_manager import process_manager
from os_modules.cpu_scheduler import scheduler_engine
from os_modules.deadlock_detector import deadlock_detector
from os_modules.deadlock_recovery import deadlock_recovery
from os_modules.disk_scheduler import disk_scheduler
from analytics.analytics_engine import analytics_engine
from hardware.hardware_event_bridge import hardware_event_bridge

class ScenarioRunner:
    """
    Executes raw kernel actions. 
    This is the only module allowed to touch kernel subsystems during a showcase.
    """
    def execute(self, action_id):
        print(f"[SHOWCASE_RUNNER] Executing Action: {action_id}")
        
        # 1. System Cleanup / Reset
        if action_id == "clear_all":
            process_manager.reset()
            with kernel_state.lock:
                kernel_state.disk_state["queue"] = []
                kernel_state.deadlock_state["is_deadlocked"] = False
                kernel_state.deadlock_state["resource_cycles"] = []
            socket_bus.broadcast_state()

        # 2. Deadlock Scenario Actions
        elif action_id == "spawn_p10_p20":
            process_manager.create_process("P10_Alpha", 5, 20, 256)
            process_manager.create_process("P20_Beta", 5, 20, 256)

        elif action_id == "allocate_ab":
            with kernel_state.lock:
                # Force allocation of Resource A to P10 and B to P20
                res = kernel_state.resource_state["resources"]
                pids = list(kernel_state.processes.keys())
                if len(pids) >= 2:
                    res["R1"]["allocated_to"] = pids[-2] # P10
                    res["R2"]["allocated_to"] = pids[-1] # P20
            socket_bus.broadcast_state()

        elif action_id == "trigger_circular_wait":
            with kernel_state.lock:
                res = kernel_state.resource_state["resources"]
                pids = list(kernel_state.processes.keys())
                if len(pids) >= 2:
                    # Circular Wait: P10 waits for R2, P20 waits for R1
                    res["R2"]["waiting_pids"].append(pids[-2])
                    res["R1"]["waiting_pids"].append(pids[-1])
                    kernel_state.processes[pids[-2]].state = "WAITING"
                    kernel_state.processes[pids[-1]].state = "WAITING"
            socket_bus.broadcast_state()

        elif action_id == "emit_alarm":
            hardware_event_bridge.on_deadlock()
            socket_bus.emit("HARDWARE", "ALARM", "CRITICAL: System Resource Cycle Detected!", "CRITICAL")

        elif action_id == "run_recovery":
            # Call existing recovery logic
            deadlock_recovery.auto_recover()

        # 3. Scheduler Scenario Actions
        elif action_id == "set_rr":
            scheduler_engine.set_algorithm("RR")
            with kernel_state.lock:
                kernel_state.scheduler_state["time_quantum"] = 2

        elif action_id == "set_priority":
            scheduler_engine.set_algorithm("PRIORITY")

        elif action_id == "spawn_burst":
            for i in range(8):
                name = f"Burst_Task_{i}"
                process_manager.create_process(name, random.randint(1, 10), random.randint(5, 15), 128)

        # 4. Memory Scenario Actions
        elif action_id == "spawn_memory_burst":
            for i in range(6):
                name = f"Mem_App_{i}"
                process_manager.create_process(name, 5, 30, random.choice([256, 512, 1024]))

        elif action_id == "leak_cleanup":
            pids = list(kernel_state.processes.keys())
            if pids:
                # Terminate half of them
                for pid in pids[::2]:
                    process_manager.delete_process(pid)

        # 5. Disk Scenario Actions
        elif action_id == "set_scan":
            disk_scheduler.set_algorithm("SCAN")

        elif action_id == "set_cscan":
            disk_scheduler.set_algorithm("C-SCAN")

        elif action_id == "spawn_disk_load":
            for _ in range(12):
                disk_scheduler._schedule_next() # Helper to inject or use existing API
                # Actually use the correct API
                from os_modules.disk_request_manager import disk_request_manager
                disk_request_manager.add_request(random.randint(0, 99))

        # 6. Hardware Scenario Actions
        elif action_id == "enable_hw":
            from hardware.hardware_state import hardware_state_manager
            hardware_state_manager.simulation_mode = True
            socket_bus.emit("HARDWARE", "SYNC", "Hardware simulation active.", "SUCCESS")

        elif action_id == "pulse_hw":
            hardware_event_bridge.on_disk_activity()
            hardware_event_bridge.on_process_created(9999)

        # 7. Stabilization
        elif action_id == "stabilize":
            socket_bus.emit("SHOWCASE", "SUCCESS", "Scenario completed. System stabilizing.", "SUCCESS")
            analytics_engine.record_event("SHOWCASE_ENGINE", "SCENARIO_COMPLETE", "Automatic showcase finished.", "SUCCESS")

        socket_bus.broadcast_state()

# Global Instance
scenario_runner = ScenarioRunner()
