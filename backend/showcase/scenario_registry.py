# Registry of cinematic scenarios for NovaKernel Showcase
SCENARIOS = {
    "deadlock_demo": {
        "title": "Deadlock & Recovery Intelligence",
        "description": "Watch the kernel simulate a resource conflict, detect a circular wait, and resolve it autonomously.",
        "steps": [
            {
                "narration": "Initializing Deadlock Showcase. Monitoring Resource Allocation Graph.",
                "action": "clear_all",
                "delay": 2
            },
            {
                "narration": "Spawning competing high-priority threads (P10 and P20).",
                "action": "spawn_p10_p20",
                "delay": 3
            },
            {
                "narration": "P10 has acquired Resource A. P20 has acquired Resource B.",
                "action": "allocate_ab",
                "delay": 2
            },
            {
                "narration": "System is now entering a state of Circular Wait. Deadlock imminent.",
                "action": "trigger_circular_wait",
                "delay": 4
            },
            {
                "narration": "ALARM: Deadlock detected in Subsystem Core. Hardware LEDs flashing.",
                "action": "emit_alarm",
                "delay": 3
            },
            {
                "narration": "AI Assistant is analyzing the cycle. Identifying victim processes.",
                "action": "ai_diagnose",
                "delay": 4
            },
            {
                "narration": "Recovery Engine engaged. Terminating victim to restore stability.",
                "action": "run_recovery",
                "delay": 3
            },
            {
                "narration": "Deadlock resolved. Resources released. System health returning to 100%.",
                "action": "stabilize",
                "delay": 2
            }
        ]
    },
    "scheduler_demo": {
        "title": "Multilevel Scheduling Showcase",
        "description": "Visualizing preemption and context switching across multiple scheduling algorithms.",
        "steps": [
            { "narration": "Setting scheduler to Round Robin with 2ms quantum.", "action": "set_rr", "delay": 2 },
            { "narration": "Injecting burst of 10 simulation processes.", "action": "spawn_burst", "delay": 3 },
            { "narration": "Observing preemption cycles and context switch overhead.", "action": "monitor_preemption", "delay": 5 },
            { "narration": "Switching to Priority scheduling to observe starvation handling.", "action": "set_priority", "delay": 3 }
        ]
    },
    "memory_demo": {
        "title": "Dynamic Memory Orchestration",
        "description": "Visualize memory allocation, fragmentation growth, and automatic garbage collection.",
        "steps": [
            { "narration": "System memory is currently clean. Preparing for heavy allocation burst.", "action": "clear_all", "delay": 2 },
            { "narration": "Spawning processes with varying memory requirements to create holes.", "action": "spawn_memory_burst", "delay": 4 },
            { "narration": "Observing external fragmentation in the real-time memory heatmap.", "action": "none", "delay": 3 },
            { "narration": "Terminating sparse processes to simulate memory leaks and cleanup.", "action": "leak_cleanup", "delay": 4 },
            { "narration": "Memory pressure stabilized. Subsystem health at 100%.", "action": "stabilize", "delay": 2 }
        ]
    },
    "disk_demo": {
        "title": "Disk Trajectory Analytics",
        "description": "Watch the magnetic head simulate SCAN and SSTF trajectories across the disk surface.",
        "steps": [
            { "narration": "Setting disk algorithm to SCAN (Elevator).", "action": "set_scan", "delay": 2 },
            { "narration": "Injecting 15 random track requests across the cylinder.", "action": "spawn_disk_load", "delay": 3 },
            { "narration": "Observing head movement and seek time optimization.", "action": "none", "delay": 6 },
            { "narration": "Switching to C-SCAN to demonstrate circular seek efficiency.", "action": "set_cscan", "delay": 4 }
        ]
    },
    "hardware_demo": {
        "title": "Hardware HAL Synchronization",
        "description": "Demonstrating the Digital Twin synchronization between kernel events and physical hardware LEDs.",
        "steps": [
            { "narration": "Enabling Hardware Simulation Mode. Synchronizing LED mapping.", "action": "enable_hw", "delay": 2 },
            { "narration": "Simulating high-speed I/O. Watch the activity LEDs pulse.", "action": "pulse_hw", "delay": 4 },
            { "narration": "Triggering system-wide alarm state. Redlining hardware registers.", "action": "emit_alarm", "delay": 3 },
            { "narration": "Hardware integrity verified. Resuming normal operations.", "action": "stabilize", "delay": 2 }
        ]
    }
}
