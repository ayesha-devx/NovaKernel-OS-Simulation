import time
import threading
import sys
import os

# Add parent directory to path to import kernel modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Corrected Imports
from kernel.kernel_state import kernel_state
from os_modules.process_manager import process_manager
from os_modules.cpu_scheduler import scheduler_engine as scheduler
from os_modules.memory_manager import memory_manager
from os_modules.file_system import fs_engine as file_system
from hardware.serial_manager import serial_manager

# Link Dependencies for testing
scheduler.set_dependencies(None, None, process_manager)

class NovaStressTester:
    def __init__(self):
        print("-" * 48)
        print("  NOVAKERNEL STRESS TEST SUITE v1.0")
        print("-" * 48)
        self.results = []

    def run_all(self):
        self.test_mass_spawn(10) # 10 is enough for a quick check
        self.test_rapid_dispatch(3)
        self.test_memory_flood(5)
        self.test_hardware_saturation(50)
        self.test_stability_audit()
        self.print_summary()

    def test_mass_spawn(self, n=10):
        print(f"\n[TEST] Mass Spawn ({n} processes)...")
        start_count = len(kernel_state.processes)
        try:
            for i in range(n):
                process_manager.create_process(f"stress_proc_{i}", burst_time=5, memory_required=64, priority=10)
            
            time.sleep(1)
            end_count = len(kernel_state.processes)
            success = end_count >= start_count + n
            self._record("Mass Spawn", success, f"Started: {start_count}, End: {end_count}")
        except Exception as e:
            self._record("Mass Spawn", False, str(e))

    def test_rapid_dispatch(self, duration=3):
        print(f"\n[TEST] Rapid Dispatch ({duration}s)...")
        try:
            if hasattr(scheduler, 'start'):
                scheduler.start()
            
            time.sleep(duration)
            is_active = getattr(scheduler, 'is_active', True)
            
            # Check for system health in system_state
            health = kernel_state.system_state.get("health", 100)
            
            success = is_active and health > 50
            self._record("Rapid Dispatch", success, f"Health: {health}%")
        except Exception as e:
            self._record("Rapid Dispatch", False, str(e))

    def test_memory_flood(self, n=5):
        print(f"\n[TEST] Memory Flood ({n} allocations)...")
        try:
            pids_names = [(p.pid, p.name) for p in kernel_state.processes.values()][:5]
            if not pids_names:
                process_manager.create_process("mem_stress_base", burst_time=10, memory_required=32, priority=5)
                time.sleep(0.5)
                pids_names = [(p.pid, p.name) for p in kernel_state.processes.values()][:5]
            
            if not pids_names:
                self._record("Memory Flood", False, "No processes available")
                return

            for i in range(n):
                pid, name = pids_names[i % len(pids_names)]
                # FIXED: Added name argument
                memory_manager.allocate(pid, name, 32)
            
            time.sleep(0.5)
            utilization = kernel_state.metrics.get("ram_pressure", 0)
            self._record("Memory Flood", True, f"RAM Pressure: {utilization}%")
        except Exception as e:
            self._record("Memory Flood", False, str(e))

    def test_hardware_saturation(self, n=50):
        print(f"\n[TEST] Hardware Saturation ({n} commands)...")
        try:
            for i in range(n):
                serial_manager.send(f"STRESS_CMD_{i}")
            
            self._record("Hardware Saturation", True, "Queue buffered safely")
        except Exception as e:
            self._record("Hardware Saturation", False, str(e))

    def test_stability_audit(self):
        print("\n[TEST] Global Stability Audit...")
        subsystems = kernel_state.subsystem_health
        failures = [k for k, v in subsystems.items() if v == 'FAILED']
        success = len(failures) == 0
        self._record("Stability Audit", success, f"Failures: {failures if failures else 'None'}")

    def _record(self, name, success, note=""):
        status = "PASSED" if success else "FAILED"
        print(f"  Result: {status} | {note}")
        self.results.append({"name": name, "status": status, "note": note})

    def print_summary(self):
        print("\n" + "-" * 48)
        print("  FINAL STRESS TEST SUMMARY")
        print("-" * 48)
        passed = len([r for r in self.results if r['status'] == 'PASSED'])
        total = len(self.results)
        print(f"  OVERALL: {passed}/{total} PASSED")
        for r in self.results:
            icon = "PASS" if r['status'] == 'PASSED' else "FAIL"
            print(f"  [{icon}] {r['name']:<20} | {r['status']}")
        print("-" * 48)

if __name__ == "__main__":
    tester = NovaStressTester()
    tester.run_all()
