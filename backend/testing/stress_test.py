import time
import random
import threading
from os_modules.process_manager import process_manager
from os_modules.cpu_scheduler import scheduler_engine
from kernel.kernel_state import kernel_state
from kernel.socket_bus import socket_bus

class KernelStressTester:
    """
    SYSTEM STRESS TESTING.
    Simulates high-load scenarios to validate kernel stability.
    """
    def __init__(self):
        self.is_active = False
        self.stats = {
            "start_time": 0,
            "processes_created": 0,
            "max_event_throughput": 0,
            "stability_score": 100
        }

    def run_stress_test(self, duration=60, intensity="HIGH"):
        """
        Starts a stress test for a specified duration.
        Intensity: LOW, MEDIUM, HIGH
        """
        self.is_active = True
        self.stats["start_time"] = time.time()
        socket_bus.emit("STRESS_TEST", "START", f"Starting kernel stress test ({intensity} intensity)...", "CRITICAL")
        
        # Start Scheduler if not running
        if not scheduler_engine.is_active:
            scheduler_engine.start()

        # Define creation delay based on intensity
        delay = 0.5 if intensity == "LOW" else 0.2 if intensity == "MEDIUM" else 0.05
        
        def test_loop():
            while self.is_active and (time.time() - self.stats["start_time"] < duration):
                # 1. Rapid Process Creation
                name = f"StressProc-{self.stats['processes_created']}"
                priority = random.randint(1, 10)
                burst = random.randint(5, 20)
                mem = random.randint(32, 256)
                
                proc = process_manager.create_process(name, priority, burst, mem)
                if proc:
                    self.stats["processes_created"] += 1
                
                # 2. Random Context Switching (by changing algorithms)
                if random.random() < 0.1:
                    algo = random.choice(["FIFO", "ROUND_ROBIN", "PRIORITY"])
                    scheduler_engine.set_algorithm(algo)
                
                # 3. Track Throughput
                current_throughput = kernel_state.socket_state["event_throughput"]
                self.stats["max_event_throughput"] = max(self.stats["max_event_throughput"], current_throughput)
                
                time.sleep(delay)
            
            self.stop()

        threading.Thread(target=test_loop, daemon=True).start()

    def stop(self):
        self.is_active = False
        uptime = time.time() - self.stats["start_time"]
        socket_bus.emit("STRESS_TEST", "STOP", 
                       f"Stress test completed. Created {self.stats['processes_created']} processes. Max Event Throughput: {self.stats['max_event_throughput']} e/s.", 
                       "SUCCESS", self.stats)

# Global Instance
stress_tester = KernelStressTester()
