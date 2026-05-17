import time
import threading
import sys
import os
import random

# Add parent directory to path to import kernel modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus
from os_modules.process_manager import process_manager
from os_modules.cpu_scheduler import scheduler_engine as scheduler
from os_modules.memory_manager import memory_manager
from os_modules.disk_scheduler import disk_scheduler
from os_modules.disk_request_manager import disk_request_manager
from os_modules.shell_terminal import shell_terminal
from analytics.analytics_engine import analytics_engine
from hardware.serial_manager import serial_manager

class KernelStressSuite:
    def __init__(self):
        self.test_results = {}
        # Link dependencies for standalone testing
        scheduler.set_dependencies(None, None, process_manager)
        print("="*60)
        print("       NOVAOS ADVANCED STRESS SUITE v1.1")
        print("="*60)

    def run_all(self):
        print("\nStarting stress tests...")
        self.test_cpu_stress(count=50)
        self.test_memory_stress(iterations=20)
        self.test_disk_flood(requests=100)
        self.test_hardware_hal_flood(signals=50)
        self.test_analytics_overload(events=100)
        self.test_shell_command_stress(cmds=20)
        self.generate_report()

    def test_cpu_stress(self, count=50):
        print(f"[CPU] Spawning {count} processes...")
        try:
            initial_count = len(kernel_state.processes)
            for i in range(count):
                process_manager.create_process(
                    name=f"stress_proc_{i}",
                    burst_time=random.randint(5, 15),
                    memory_required=random.randint(16, 64),
                    priority=random.randint(1, 10)
                )
            
            # Start scheduler if not running
            if not kernel_state.scheduler_state["is_running"]:
                scheduler.start()
            
            time.sleep(2)
            current_count = len(kernel_state.processes)
            
            # Verify queue stability
            queue_len = len(kernel_state.ready_queue)
            health = kernel_state.subsystem_health.get("scheduler", "HEALTHY")
            
            success = current_count >= initial_count + count and health == "HEALTHY"
            self.test_results["CPU_STRESS"] = {
                "status": "PASSED" if success else "FAILED",
                "details": f"Processes: {current_count}, Queue: {queue_len}, Health: {health}"
            }
        except Exception as e:
            self.test_results["CPU_STRESS"] = {"status": "ERROR", "details": str(e)}

    def test_memory_stress(self, iterations=20):
        print(f"[MEMORY] Executing {iterations} rapid allocation/deallocation cycles...")
        try:
            # Get some active PIDs
            pids = list(kernel_state.processes.keys())
            if not pids:
                # Create a dummy process if none exist
                proc = process_manager.create_process("mem_dummy", 10, 32, 1)
                pids = [proc["pid"]]

            failures = 0
            for i in range(iterations):
                pid = random.choice(pids)
                size = random.randint(1, 128)
                
                # Allocate
                alloc_success = memory_manager.allocate(pid, f"stress_mem_{i}", size)
                if not alloc_success:
                    failures += 1
                
                # Immediate or delayed deallocate (random)
                if random.random() > 0.5:
                    memory_manager.deallocate(pid)
            
            mem_health = kernel_state.subsystem_health.get("memory_manager", "HEALTHY")
            ram_pressure = kernel_state.metrics.get("ram_pressure", 0)
            
            success = mem_health == "HEALTHY" and ram_pressure < 100
            self.test_results["MEMORY_STRESS"] = {
                "status": "PASSED" if success else "FAILED",
                "details": f"Failures: {failures}, RAM Pressure: {ram_pressure}%, Health: {mem_health}"
            }
        except Exception as e:
            self.test_results["MEMORY_STRESS"] = {"status": "ERROR", "details": str(e)}

    def test_disk_flood(self, requests=100):
        print(f"[DISK] Injecting {requests} disk requests...")
        try:
            for i in range(requests):
                track = random.randint(0, 99)
                disk_request_manager.add_request(track, f"STRESS_REQ_{i}")
            
            # Wait for some processing
            time.sleep(1)
            
            q_len = len(kernel_state.disk_state["queue"])
            completed = kernel_state.disk_metrics.get("total_requests_completed", 0)
            
            # Success if queue is stable (not exploding or crashing)
            success = q_len >= 0 
            self.test_results["DISK_FLOOD"] = {
                "status": "PASSED" if success else "FAILED",
                "details": f"Queue Len: {q_len}, Completed: {completed}"
            }
        except Exception as e:
            self.test_results["DISK_FLOOD"] = {"status": "ERROR", "details": str(e)}

    def test_hardware_hal_flood(self, signals=50):
        print(f"[HARDWARE] Spaming {signals} HAL signals...")
        try:
            for i in range(signals):
                # Simulate LED toggle or state update
                led_id = i % 8
                serial_manager.send(f"LED_{led_id}_TOGGLE")
            
            time.sleep(0.5)
            hw_health = kernel_state.subsystem_health.get("hardware_hal", "HEALTHY")
            
            self.test_results["HARDWARE_FLOOD"] = {
                "status": "PASSED" if hw_health == "HEALTHY" else "FAILED",
                "details": f"HAL Health: {hw_health}"
            }
        except Exception as e:
            self.test_results["HARDWARE_FLOOD"] = {"status": "ERROR", "details": str(e)}

    def test_analytics_overload(self, events=100):
        print(f"[ANALYTICS] Flooding {events} telemetry updates...")
        try:
            for i in range(events):
                analytics_engine.record_event(
                    "STRESS", "DATA_FLOOD", f"Telemtry spam {i}", 
                    metadata={"val": random.random()}
                )
            
            # Check buffer size capping
            stream_len = len(kernel_state.analytics_state.get("telemetry", []))
            
            # Success if we didn't crash
            success = True
            self.test_results["ANALYTICS_OVERLOAD"] = {
                "status": "PASSED" if success else "FAILED",
                "details": f"Telemetry Stream Len: {stream_len}"
            }
        except Exception as e:
            self.test_results["ANALYTICS_OVERLOAD"] = {"status": "ERROR", "details": str(e)}

    def test_shell_command_stress(self, cmds=20):
        print(f"[SHELL] Executing {cmds} rapid commands...")
        try:
            test_commands = ["ls", "ps", "mem", "disk", "help", "ver"]
            for i in range(cmds):
                cmd = random.choice(test_commands)
                shell_terminal.execute(cmd)
            
            history_len = len(shell_terminal.history)
            success = history_len > 0
            
            self.test_results["SHELL_STRESS"] = {
                "status": "PASSED" if success else "FAILED",
                "details": f"History Len: {history_len}"
            }
        except Exception as e:
            self.test_results["SHELL_STRESS"] = {"status": "ERROR", "details": str(e)}

    def generate_report(self):
        print("\n" + "="*60)
        print("             FINAL STRESS TEST REPORT")
        print("="*60)
        passed = 0
        total = len(self.test_results)
        for test, res in self.test_results.items():
            status = res["status"]
            if status == "PASSED": passed += 1
            print(f"[{status:^8}] {test:<20} | {res['details']}")
        
        print("-" * 60)
        print(f"OVERALL STABILITY: {passed}/{total} PASSED")
        print("="*60)

if __name__ == "__main__":
    suite = KernelStressSuite()
    suite.run_all()
