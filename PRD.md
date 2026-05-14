# NovaKernel — Next-Generation Operating System Simulation
## Product Requirements Document (PRD)

**Project Name:** NovaKernel  
**Tagline:** *Next-Generation Operating System Simulation*  
**Project Type:** Educational Operating System Kernel Simulation Platform  
**Category:** System Software / Operating Systems / Simulation  
**Academic Year:** 2025–2026  
**Developed By:** Ayesha Topiwala, Christina Dsouza, Prathmesh Sawant, Sam Nadar  
**Technology Stack:** React.js + Flask + Arduino Integration

---

## 1. Project Vision
NovaKernel is a next-generation Operating System simulation platform designed to visually demonstrate how real operating systems manage processes, memory, files, CPU scheduling, deadlocks, disk scheduling, and inter-process communication in real time.

The platform combines:
* Real-time kernel simulation
* Advanced visualizations
* Interactive shell terminal
* AI-assisted recommendations
* Hardware integration using Arduino
* Professional dashboard UI

---

## 2. Problem Statement
Traditional operating system learning is highly theoretical and difficult to visualize. Students struggle to understand process scheduling, memory allocation, deadlocks, etc. Existing tools are outdated or lack interactivity. NovaKernel solves this by providing live, animated, and hardware-integrated system behavior.

---

## 3. Objectives
### Primary
* Simulate core OS kernel modules
* Visualize internal operations in real time
* Build a highly interactive and professional-grade simulator

### Secondary
* Integrate hardware indicators using Arduino
* Implement advanced analytics and comparison tools
* Create a real terminal-like shell interface

---

## 4. Target Users
* Computer Engineering students
* Faculty and evaluators
* OS enthusiasts

---

## 5. Project Scope
### Core Modules
1. Process Manager (PCB, PID, states)
2. Ready Queue Manager (FIFO, Priority)
3. CPU Scheduler (FCFS, SJF, RR, etc.)
4. Memory Manager (Paging, Page Replacement)
5. File System (Inode simulation, Linux-like paths)

### Advanced Modules
6. Deadlock Detection (Banker's Algorithm, RAG)
7. Disk Scheduling (SCAN, C-SCAN, LOOK)
8. IPC & Synchronization (Mutex, Semaphore)
9. Analytics & Visualization Engine

### Additional Systems
11. Shell & Scripting Interface (Xterm.js)
12. Replay System
13. AI Recommendation Engine
14. Arduino Hardware Integration (Serial Communication)

---

## 6. Functional Requirements (Key Highlights)

### 6.1 Process Manager
* **PCB Fields:** PID, Name, Arrival Time, Burst Time, Priority, State, Memory Required, Parent PID, Program Counter.
* **States:** New, Ready, Running, Waiting, Terminated.

### 6.2 CPU Scheduler
* **Algorithms:** FCFS, SJF, SRTF, Round Robin, Priority (with Aging).
* **Metrics:** Waiting Time, Turnaround Time, Response Time, Throughput, CPU Utilization.

### 6.3 Memory Manager
* **Algorithms:** First Fit, Best Fit, Worst Fit, Next Fit.
* **Virtual Memory:** Page tables, FIFO, LRU, Optimal replacement.

### 6.4 Deadlock Detection
* **Banker's Algorithm**, Resource Allocation Graph (RAG), Recovery by killing processes or rollback.

---

## 7. AI & Smart Features
* **AI Scheduler Recommendation:** Analyze process attributes and suggest the best algorithm.
* **Anomaly Detection:** Detect CPU starvation, thrashing, and deadlock risks.

---

## 8. Hardware Integration (Arduino)
* **Serial Communication:** 9600 baud rate.
* **LED Mapping:**
    * Red: Ready
    * Green: Running
    * Yellow: Waiting
    * White: Terminated
    * Blue: Deadlock

---

## 9. UI/UX Requirements
* **Themes:** Dark (Primary), Light, Matrix, High Contrast.
* **Layout:** Dashboard with Process Table, Gantt Chart, System Stats, and Terminal.

---

## 10. Technology Stack
* **Frontend:** React.js, Tailwind CSS, Framer Motion, Chart.js, D3.js, Socket.IO Client.
* **Backend:** Python, Flask, Flask-SocketIO, PySerial.
* **Hardware:** Arduino Uno.

---

## 11. Folder Structure
```plaintext
NovaKernel/
├── frontend/
├── backend/
├── arduino/
├── saves/
├── exports/
└── docs/
```

---

## 12. Success Criteria
* All mandatory modules function correctly.
* Real-time visualization works smoothly.
* Hardware integration (LEDs) functions properly.
* UI appears professional and interactive.
