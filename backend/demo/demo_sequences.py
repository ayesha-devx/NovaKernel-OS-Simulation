DEMO_SEQUENCES = {
    "BOOT": [
        {"action": "LOG", "message": "Initializing NovaKernel v1.1.0-STABLE...", "delay": 1.0, "progress": 10},
        {"action": "LOG", "message": "Loading Scheduler Engine [RR, FIFO, PRIO]...", "delay": 1.5, "progress": 25},
        {"action": "LOG", "message": "Mounting Virtual File System (8GB)...", "delay": 1.0, "progress": 45},
        {"action": "LOG", "message": "Connecting Hardware HAL (Digital Twin)...", "delay": 1.2, "progress": 65},
        {"action": "LOG", "message": "Starting Analytics & Heuristic Engine...", "delay": 1.0, "progress": 85},
        {"action": "LOG", "message": "Kernel Online. Ready for Demonstration.", "delay": 1.5, "progress": 100},
    ],
    
    "CPU": [
        {"action": "CMD", "command": "algo ROUND_ROBIN", "delay": 1.0, "progress": 10},
        {"action": "CMD", "command": "simulate-load 10", "delay": 2.0, "progress": 40},
        {"action": "LOG", "message": "Observing Round Robin context switching...", "delay": 3.0, "progress": 70},
        {"action": "CMD", "command": "dispatch", "delay": 1.0, "progress": 100},
    ],
    
    "MEMORY": [
        {"action": "LOG", "message": "Demonstrating Memory Fragmentation...", "delay": 1.0, "progress": 10},
        {"action": "CMD", "command": "malloc 512 system_core", "delay": 1.0, "progress": 30},
        {"action": "CMD", "command": "malloc 256 temp_buffer", "delay": 1.0, "progress": 50},
        {"action": "CMD", "command": "free system_core", "delay": 2.0, "progress": 80},
        {"action": "LOG", "message": "Hole detected in memory map.", "delay": 2.0, "progress": 100},
    ],
    
    "DISK": [
        {"action": "LOG", "message": "Initiating Disk I/O Flood...", "delay": 1.0, "progress": 10},
        {"action": "CMD", "command": "disk-read 12", "delay": 0.5},
        {"action": "CMD", "command": "disk-read 88", "delay": 0.5},
        {"action": "CMD", "command": "disk-read 45", "delay": 0.5},
        {"action": "CMD", "command": "disk-read 1", "delay": 0.5, "progress": 60},
        {"action": "CMD", "command": "disk-algo SCAN", "delay": 2.0, "progress": 100},
    ],
    
    "DEADLOCK": [
        {"action": "LOG", "message": "Simulating Resource Contention...", "delay": 1.0, "progress": 10},
        {"action": "LOG", "message": "Orchestrating Circular Wait (PID A holds R1, wants R2; PID B holds R2, wants R1)", "delay": 2.0, "progress": 40},
        {"action": "CMD", "command": "trigger-deadlock", "delay": 2.0, "progress": 70},
        {"action": "LOG", "message": "Deadlock Detected! Analyzing Resource Allocation Graph...", "delay": 2.0, "progress": 85},
        {"action": "CMD", "command": "resolve-deadlock", "delay": 4.0, "progress": 100},
    ],
    
    "FINALIZE": [
        {"action": "LOG", "message": "Showcase Sequence Complete.", "delay": 1.0, "progress": 50},
        {"action": "LOG", "message": "System Stabilized. Analytics Nominal.", "delay": 2.0, "progress": 100},
    ]
}
