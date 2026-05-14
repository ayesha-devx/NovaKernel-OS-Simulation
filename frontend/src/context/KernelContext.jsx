import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import axios from 'axios';

const KernelContext = createContext();

const SOCKET_URL = 'http://127.0.0.1:5000';
const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const KernelProvider = ({ children }) => {
  // Unified Global Kernel State (Single Source of Truth)
  const [kernelState, setKernelState] = useState({
    system: { version: '1.0.0', status: 'OFFLINE', uptime: 0, health: 100, hardware_connected: false, subsystems: {} },
    processes: [],
    ready_queue: [],
    scheduler: { current_algorithm: 'FIFO', is_running: false, is_paused: false, current_process: null, quantum: 2.0, quantum_left: 0 },
    memory: { blocks: [], total_ram: 4096, used_ram: 0, fragmentation: 0, external_fragmentation: 0, largest_free_block: 4096 },
    filesystem: { files: {}, inodes: [], used_disk: 0, total_disk: 8192 },
    deadlock: { is_deadlocked: false, detected_pids: [], resource_cycles: [] },
    resources: { resources: {} },
    socket: { connected_clients: 0, event_throughput: 0 },
    metrics: { cpu_utilization: 0, ram_pressure: 0, process_throughput: 0, avg_wait_time: 0, avg_turnaround_time: 0 },
    logs: [],
    disk: { current_track: 0, head_direction: 1, is_moving: false, current_algorithm: 'FCFS', queue: [], active_request: null, completed_requests: [], max_tracks: 100, head_path: [] },
    disk_metrics: { total_seek_distance: 0, avg_seek_distance: 0.0, total_requests_completed: 0, throughput: 0.0, disk_utilization: 0.0 },
    hardware: {
      connected: false,
      simulation_mode: true,
      led_states: { 1: {}, 2: {}, 3: {} },
      special_leds: { DEADLOCK: false, DISK: false, TERMINATION: false },
      buzzer_active: false,
      command_history: []
    },
    analytics: {
      cpu_metrics: { utilization: 0, context_switches: 0, throughput: 0, active_processes: 0, process_states: {} },
      memory_metrics: { utilization: 0, fragmentation: 0, used_mb: 0, free_mb: 0, block_count: 0 },
      disk_metrics: { utilization: 0, queue_depth: 0, total_seek: 0, avg_seek: 0, throughput: 0 },
      scheduler_metrics: { avg_wait: 0, avg_turnaround: 0, queue_length: 0, algorithm: 'FIFO' },
      hardware_metrics: { connected: false, simulation_mode: true, uptime: 0, command_throughput: 0 },
      filesystem_metrics: { file_count: 0, inode_usage: 0, storage_usage: 0, storage_total: 8192 },
      timeline: [],
      telemetry: [],
      intelligence_state: {
        health_score: 100,
        health_status: "OPTIMAL",
        subsystem_scores: { cpu: 100, memory: 100, disk: 100, deadlock: 100 },
        forecasts: {
          cpu: { "10s": 0, "30s": 0, "60s": 0 },
          memory: { "10s": 0, "30s": 0, "60s": 0 },
          disk: { "10s": 0, "30s": 0, "60s": 0 }
        },
        recommendations: [],
        deadlock_risk: "LOW",
        anomalies: []
      }
    },
    showcase: {
      active: false,
      scenario_id: null,
      current_step: 0,
      total_steps: 0,
      paused: false,
      last_narration: "Awaiting orchestration...",
      progress: 0,
      is_completed: false,
      logs: []
    },
    boot: { state: 'OFFLINE', progress: 0, logs: [], ready: false },
    snapshotHistory: [],
    snapshotProgress: null,
    restoreProgress: null,
    isRestoring: false,
    checkpointEnabled: true
  });

  const [monitoringData, setMonitoringData] = useState({
    performance: { metrics: {}, timestamp: 0 },
    diagnostics: { health: 'HEALTHY', score: 100, subsystems: {}, warnings: [], watchdog: 'OK', timestamp: 0 },
    socket: { metrics: {}, health_score: 100, warnings: [], traffic: [], timestamp: 0 },
    trace: { events: [], warnings: [], health: { status: 'STABLE', event_rate: 0 }, timestamp: 0 },
    leakDetector: { warnings: [], stability_score: 100, resource_scores: {}, pressure_levels: {}, timestamp: 0 },
    watchdog: { score: 100, stalled: [], heartbeats: {}, uptime: 0, status: 'EXCELLENT', timestamp: 0 },
    profiler: { score: 100, rates: { socket_throughput: 0, telemetry_pressure: 0 }, latencies: {}, history: { throughput: [], pressure: [] }, status: 'OPTIMAL', timestamp: 0 }
  });

  const [fps, setFps] = useState(60);
  const [renderPressure, setRenderPressure] = useState('LOW');
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);

  const [halLogs, setHalLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // AI Chat Persistence State
  const [aiMessages, setAiMessages] = useState([
    { 
      role: 'assistant', 
      content: '### 🧠 NovaKernel Neural Link Established\n\nGreetings, Operator. I am your **integrated AI Copilot**. I have established real-time uplinks to the Scheduler, Memory Manager, and Disk Subsystems.\n\n*   **Status**: Active\n*   **Subsystems**: Synchronized\n*   **Telemetry**: Live\n\nHow can I assist with your kernel operations today?', 
      timestamp: Date.now() 
    }
  ]);

  // Sync state helper
  const syncState = useCallback((newState) => {
    if (!newState) return;
    setKernelState(prev => ({
      ...prev,
      ...newState,
    }));
  }, []);

  // WebSocket Manager
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      toast.success('Kernel Connection Established', { icon: '🚀' });
      socket.emit('REQUEST_BOOT_STATUS');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setKernelState(prev => ({ 
        ...prev, 
        system: { ...prev.system, status: 'DISCONNECTED' },
        processes: [],
        ready_queue: [],
        deadlock: { is_deadlocked: false, detected_pids: [], resource_cycles: [] }
      }));
    });

    socket.on('kernel_state_updated', (data) => {
      syncState(data);
      setIsLoading(false);
    });

    socket.on('kernel_event', (event) => {
      setKernelState(prev => ({
        ...prev,
        logs: [...prev.logs.slice(-199), event]
      }));
      
      const silentEvents = ['DISK_ACTIVE', 'HEAD_MOVE'];
      const isSilent = silentEvents.some(type => event.message.includes(type)) || event.event_type === 'DISK_ACTIVE';

      if (!isSilent) {
        if (event.severity === 'CRITICAL' || event.severity === 'ERROR') {
            toast.error(event.message, { theme: 'dark' });
        } else if (event.severity === 'SUCCESS') {
            toast.success(event.message, { theme: 'dark' });
        }
      }
    });

    socket.on('HAL_LOG', (log) => {
        setHalLogs(prev => [log, ...prev].slice(0, 50));
    });

    socket.on('HARDWARE_STATE_UPDATE', (data) => {
        setKernelState(prev => ({
            ...prev,
            hardware: data
        }));
    });

    socket.on('SHOWCASE_STATE', (data) => {
      setKernelState(prev => ({ ...prev, showcase: data.payload }));
    });
    
    socket.on('SNAPSHOT_STATE_UPDATE', (data) => {
      setKernelState(prev => ({ ...prev, ...data }));
    });

    socket.on('SNAPSHOT_LIST', (data) => {
      setKernelState(prev => ({ 
        ...prev, 
        snapshotHistory: data.snapshots 
      }));
    });

    socket.on('SNAPSHOT_PROGRESS', (data) => {
      setKernelState(prev => ({
        ...prev,
        snapshotProgress: data
      }));
    });

    socket.on('RESTORE_PROGRESS', (data) => {
      setKernelState(prev => ({
        ...prev,
        restoreProgress: data,
        isRestoring: data.progress < 100
      }));
    });

    socket.on('SNAPSHOT_RESTORED', () => {
      setKernelState(prev => ({ ...prev, isRestoring: false, restoreProgress: null }));
    });

    socket.on('CHECKPOINT_STATE', (data) => {
      setKernelState(prev => ({ ...prev, checkpointEnabled: data.enabled }));
    });
    
    socket.on('BOOT_STATE_UPDATE', (data) => {
      setKernelState(prev => ({
        ...prev,
        boot: {
          ...prev.boot,
          state: data.state,
          progress: data.progress,
          logs: data.logs ? data.logs : prev.boot.logs,
          ready: data.ready !== undefined ? data.ready : prev.boot.ready
        }
      }));
    });

    socket.on('BOOT_LOG_APPEND', (log) => {
      setKernelState(prev => ({
        ...prev,
        boot: {
          ...prev.boot,
          logs: [...prev.boot.logs.slice(-199), log]
        }
      }));
    });

    socket.on('BOOT_SEQUENCE_COMPLETE', (data) => {
      console.log("[BOOT] Sequence Complete received:", data);
      setKernelState(prev => ({
        ...prev,
        boot: {
          ...prev.boot,
          progress: 100,
          ready: true
        }
      }));
    });

    socket.on('logs_cleared', () => {
      setKernelState(prev => ({ ...prev, logs: [] }));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('kernel_state_updated');
      socket.off('kernel_event');
      socket.off('HAL_LOG');
      socket.off('HARDWARE_STATE_UPDATE');
      socket.close();
    };
  }, [syncState]);

  // Dedicated Monitoring Listeners
  const handlePerf = useCallback((data) => {
    setMonitoringData(prev => ({ ...prev, performance: data }));
  }, []);

  const handleDiag = useCallback((data) => {
    setMonitoringData(prev => ({ ...prev, diagnostics: data }));
  }, []);

  const handleSocketTelemetry = useCallback((data) => {
    // Throttle UI updates for socket telemetry to prevent flickering
    const now = Date.now();
    if (now - (window._lastSocketUpdate || 0) < 200) return;
    window._lastSocketUpdate = now;
    setMonitoringData(prev => ({ ...prev, socket: data }));
  }, []);

  const handleTraceUpdate = useCallback((data) => {
    setMonitoringData(prev => {
        // Capped history: keep last 100
        const prevEvents = prev?.trace?.events || [];
        const newEvents = data?.events || [];
        
        const mergedEvents = [...prevEvents, ...newEvents]
            .sort((a, b) => b.timestamp - a.timestamp) // Newest first
            .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Keep newest unique
            .slice(0, 100);

        return { 
            ...prev, 
            trace: { 
                events: mergedEvents,
                warnings: data?.warnings || [],
                health: data?.health || { status: 'STABLE', event_rate: 0 },
                timestamp: data?.timestamp || Date.now() / 1000
            } 
        };
    });
  }, []);

  const clearTraceHistory = useCallback(() => {
    if (socketRef.current) {
        socketRef.current.emit('CLEAR_TRACE_HISTORY');
    }
    setMonitoringData(prev => ({
        ...prev,
        trace: {
            ...prev.trace,
            events: [],
            warnings: []
        }
    }));
  }, []);

  const handleLeakUpdate = useCallback((data) => {
    setMonitoringData(prev => ({ ...prev, leakDetector: { ...data, timestamp: Date.now() / 1000 } }));
  }, []);

  const handleWatchdogUpdate = useCallback((data) => {
    setMonitoringData(prev => ({ ...prev, watchdog: { ...data, timestamp: Date.now() / 1000 } }));
  }, []);

  const handleResourcePressure = useCallback((warning) => {
    // High priority toast for critical resource pressure
    if (warning.severity === 'CRITICAL') {
        toast.warning(`[${warning.subsystem}] ${warning.message}`, {
            position: "bottom-right",
            autoClose: 5000,
            theme: "dark",
            icon: "⚠️"
        });
    }
  }, []);

  const handleProfilerUpdate = useCallback((data) => {
    setMonitoringData(prev => ({ ...prev, profiler: { ...data, timestamp: Date.now() / 1000 } }));
  }, []);

  const requestWatchdogSync = useCallback(() => {
    if (socketRef.current) {
        socketRef.current.emit('request_watchdog_sync');
    }
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    socket.on('PERFORMANCE_UPDATE', handlePerf);
    socket.on('DIAGNOSTICS_UPDATE', handleDiag);
    socket.on('SOCKET_TELEMETRY_UPDATE', handleSocketTelemetry);
    socket.on('TRACE_EVENT_UPDATE', handleTraceUpdate);
    socket.on('TRACE_HISTORY_CLEARED', () => {
        setMonitoringData(prev => ({
            ...prev,
            trace: { ...prev.trace, events: [], warnings: [] }
        }));
    });
    socket.on('RUNTIME_STABILITY_UPDATE', handleLeakUpdate);
    socket.on('WATCHDOG_HEALTH_UPDATE', handleWatchdogUpdate);
    socket.on('RESOURCE_PRESSURE_UPDATE', handleResourcePressure);
    socket.on('TRACE_EVENT_REMOVE', (data) => {
        setMonitoringData(prev => ({
            ...prev,
            trace: {
                ...prev.trace,
                events: prev.trace.events.filter(e => !String(e.id).startsWith(data.prefix))
            }
        }));
    });

    socket.on('PROFILER_METRICS_UPDATE', handleProfilerUpdate);
    socket.on('ANALYTICS_METRICS_UPDATE', (data) => {
      setKernelState(prev => ({
        ...prev,
        analytics: data,
        timeline: data.timeline || prev.timeline,
        telemetry_stream: data.telemetry || prev.telemetry_stream
      }));
    });

    return () => {
      socket.off('PERFORMANCE_UPDATE', handlePerf);
      socket.off('DIAGNOSTICS_UPDATE', handleDiag);
      socket.off('SOCKET_TELEMETRY_UPDATE', handleSocketTelemetry);
      socket.off('TRACE_EVENT_UPDATE', handleTraceUpdate);
      socket.off('TRACE_HISTORY_CLEARED');
      socket.off('RUNTIME_STABILITY_UPDATE', handleLeakUpdate);
      socket.off('WATCHDOG_HEALTH_UPDATE', handleWatchdogUpdate);
      socket.off('RESOURCE_PRESSURE_UPDATE', handleResourcePressure);
      socket.off('PROFILER_METRICS_UPDATE', handleProfilerUpdate);
      socket.off('ANALYTICS_METRICS_UPDATE');
    };
  }, [handlePerf, handleDiag, handleSocketTelemetry, handleTraceUpdate, handleLeakUpdate, handleWatchdogUpdate, handleResourcePressure, handleProfilerUpdate, isConnected]);

  // FPS Monitoring Logic
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let requestId;

    const tick = () => {
        frameCount++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
            const currentFps = Math.round((frameCount * 1000) / (now - lastTime));
            setFps(currentFps);
            
            // Heuristic for render pressure
            if (currentFps < 30) setRenderPressure('HIGH');
            else if (currentFps < 50) setRenderPressure('MEDIUM');
            else setRenderPressure('LOW');

            frameCount = 0;
            lastTime = now;
        }
        requestId = requestAnimationFrame(tick);
    };

    requestId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(requestId);
  }, []);

  // Socket Latency Ping
  useEffect(() => {
    if (!isConnected || !socketRef.current) return;
    const interval = setInterval(() => {
      socketRef.current.emit('PING_STAMP', { timestamp: Date.now() });
    }, 5000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Initial Request
  useEffect(() => {
    if (isConnected && socketRef.current) {
      socketRef.current.emit('REQUEST_MONITORING_DATA');
      socketRef.current.emit('REQUEST_HARDWARE_STATE');
    }
  }, [isConnected]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/kernel/state`);
        syncState(res.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to connect to NovaKernel Backend');
        setIsLoading(false);
      }
    };
    fetchData();
  }, [syncState]);

  // Fallback: If still offline after connection, try again every 3 seconds until we get a state
  useEffect(() => {
    if (isConnected && kernelState.boot.state === 'OFFLINE') {
      const timer = setInterval(() => {
        if (socketRef.current && isConnected) {
          socketRef.current.emit('REQUEST_BOOT_STATUS');
        }
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [isConnected, kernelState.boot.state]);


  // Actions
  const createProcess = useCallback(async (data) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/process/create`, data);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create process');
      throw err;
    }
  }, []);

  const updateProcessState = useCallback(async (pid, state) => {
    try {
      await axios.put(`${API_BASE_URL}/process/state/${pid}`, { state });
    } catch (err) {
      toast.error('State transition failed');
    }
  }, []);

  const deleteProcess = useCallback(async (pid) => {
    try {
      await axios.delete(`${API_BASE_URL}/process/delete/${pid}`);
    } catch (err) {
      toast.error('Deletion failed');
    }
  }, []);

  const schedulerAction = useCallback(async (action, data = {}) => {
    try {
      await axios.post(`${API_BASE_URL}/scheduler/${action}`, data);
    } catch (err) {
      toast.error(`Scheduler ${action} failed`);
    }
  }, []);

  const toggleHardwareSimulation = useCallback((enabled) => {
    if (socketRef.current) {
        socketRef.current.emit('SWITCH_HAL_MODE', { enabled });
    } else {
        // Fallback to REST if socket not available (though it should be)
        axios.post(`${API_BASE_URL}/hardware/simulation`, { enabled })
            .catch(err => toast.error('Failed to toggle simulation mode'));
    }
  }, []);

  const askAI = async (query) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/query`, { query });
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response,
        timestamp: response.data.timestamp * 1000,
        intent: response.data.intent
      }]);
      return response;
    } catch (error) {
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I've lost connection to the kernel intelligence engine. Please check if the backend is running.",
        timestamp: Date.now(),
        error: true
      }]);
      throw error;
    }
  };

  // --- SHOWCASE CONTROLS ---
  const startShowcase = async (scenarioId) => {
    try {
      await axios.post(`${API_BASE_URL}/showcase/start/${scenarioId}`);
      toast.success(`Showcase Started: ${scenarioId}`);
    } catch (err) {
      toast.error("Failed to start showcase");
    }
  };

  const stopShowcase = async () => {
    try {
      setKernelState(prev => ({ ...prev, showcase: { ...prev.showcase, active: false } }));
      await axios.post(`${API_BASE_URL}/showcase/stop`);
      toast.info("Showcase Terminated");
    } catch (err) {
      toast.error("Failed to stop showcase");
    }
  };

  const pauseShowcase = async () => {
    try {
      setKernelState(prev => ({ ...prev, showcase: { ...prev.showcase, paused: true } }));
      await axios.post(`${API_BASE_URL}/showcase/pause`);
    } catch (err) {
      toast.error("Failed to pause showcase");
    }
  };

  const resumeShowcase = async () => {
    try {
      setKernelState(prev => ({ ...prev, showcase: { ...prev.showcase, paused: false } }));
      await axios.post(`${API_BASE_URL}/showcase/resume`);
    } catch (err) {
      toast.error("Failed to resume showcase");
    }
  };

  const addMessage = (role, content) => {
    setAiMessages(prev => [...prev, { role, content, timestamp: Date.now() }]);
  };

  // Helper: Build Process Tree
  const buildProcessTree = useCallback((procList) => {
    if (!procList || !Array.isArray(procList)) return [];
    const idMap = {};
    procList.forEach(p => { idMap[p.pid] = { ...p, children: [] }; });
    const roots = [];
    procList.forEach(p => {
      if (p.parent_pid && idMap[p.parent_pid]) {
        idMap[p.parent_pid].children.push(idMap[p.pid]);
      } else {
        roots.push(idMap[p.pid]);
      }
    });
    return roots;
  }, []);

  // Helper: Find process by PID safely
  const getProcessByPid = useCallback((pid) => {
    if (!pid || !kernelState.processes) return null;
    if (Array.isArray(kernelState.processes)) {
      return kernelState.processes.find(p => p.pid === pid) || null;
    }
    return kernelState.processes[pid] || null;
  }, [kernelState.processes]);

  // MEMOIZED DERIVED STATES
  const mappedProcesses = useMemo(() => {
    return Object.values(kernelState.processes || {}).map(p => {
      let slices = (p.execution_slices || []).map(s => ({ start: s[0], end: s[1] }));
      if (p.state === 'RUNNING' && p.last_start_time) {
          slices.push({ start: p.last_start_time, end: kernelState.system.uptime });
      }
      return {
          ...p,
          waiting_duration: p.waiting_time,
          execution_slices: slices
      };
    });
  }, [kernelState.processes]);

  const treeData = useMemo(() => buildProcessTree(mappedProcesses), [buildProcessTree, mappedProcesses]);

  const readyQueue = useMemo(() => {
    return (kernelState.ready_queue || []).map(pid => {
        const p = getProcessByPid(pid);
        if (!p) return null;
        let slices = (p.execution_slices || []).map(s => ({ start: s[0], end: s[1] }));
        if (p.state === 'RUNNING' && p.last_start_time) {
            slices.push({ start: p.last_start_time, end: kernelState.system.uptime });
        }
        return {
            ...p,
            waiting_duration: p.waiting_time,
            execution_slices: slices
        };
    }).filter(Boolean);
  }, [kernelState.ready_queue, getProcessByPid]);

  const schedulerState = useMemo(() => ({
    ...kernelState.scheduler,
    is_active: kernelState.scheduler.is_running,
    algorithm: kernelState.scheduler.current_algorithm,
    is_paused: kernelState.scheduler.is_paused || false,
    quantum: kernelState.scheduler.quantum || 2.0,
    quantum_remaining: kernelState.scheduler.quantum_left || 0,
    current_process: (() => {
        const p = getProcessByPid(kernelState.scheduler.current_process);
        if (!p) return null;
        let slices = (p.execution_slices || []).map(s => ({ start: s[0], end: s[1] }));
        if (p.state === 'RUNNING' && p.last_start_time) {
            slices.push({ start: p.last_start_time, end: kernelState.system.uptime });
        }
        return {
            ...p,
            waiting_duration: p.waiting_time,
            execution_slices: slices
        };
    })(),
    metrics: kernelState.metrics
  }), [kernelState.scheduler, kernelState.metrics, getProcessByPid]);

  const memoryMap = useMemo(() => ({
    ...kernelState.memory,
    stats: {
        total_memory: kernelState.memory?.total_ram || 4096,
        used_memory: kernelState.memory?.used_ram || 0,
        fragmentation_percentage: kernelState.memory?.fragmentation || 0
    }
  }), [kernelState.memory]);

  const memoryStats = useMemo(() => ({
    total_memory: kernelState.memory?.total_ram || 4096,
    used_memory: kernelState.memory?.used_ram || 0,
    utilization: Math.round(((kernelState.memory?.used_ram || 0) / (kernelState.memory?.total_ram || 4096)) * 100) || 0,
    fragmentation_percentage: kernelState.memory?.fragmentation || 0,
    external_fragmentation: kernelState.memory?.external_fragmentation || 0,
    current_algorithm: kernelState.memory?.current_algorithm || 'FIRST_FIT',
    largest_free_block: kernelState.memory?.largest_free_block ?? ((kernelState.memory?.total_ram || 4096) - (kernelState.memory?.used_ram || 0))
  }), [kernelState.memory, kernelState.scheduler?.current_algorithm]);

  const filesystemState = useMemo(() => ({
    ...kernelState.filesystem,
    stats: {
        total_disk_mb: kernelState.filesystem?.total_disk || 8192,
        used_disk_mb: kernelState.filesystem?.used_disk || 0,
        utilization: Math.round(((kernelState.filesystem?.used_disk || 0) / (kernelState.filesystem?.total_disk || 8192)) * 100) || 0,
        free_blocks: Math.floor(((kernelState.filesystem?.total_disk || 8192) - (kernelState.filesystem?.used_disk || 0)) / 64),
        inode_usage: Object.keys(kernelState.filesystem?.files || {}).length
    },
    directory: Object.values(kernelState.filesystem?.files || {}),
    blocks: kernelState.filesystem?.blocks || Array(128).fill(null),
    logs: (kernelState.logs || []).filter(l => l.module === 'FILE_SYSTEM')
  }), [kernelState.filesystem, kernelState.logs]);

  const analyticsSummary = useMemo(() => ({
    cpu_utilization: kernelState.metrics?.cpu_utilization || 0,
    ram_pressure: kernelState.metrics?.ram_pressure || 0,
    health_score: kernelState.system?.health || 100,
    memory_utilization: kernelState.metrics?.ram_pressure || 0,
    disk_utilization: Math.min(100, Math.max(0, ((kernelState.filesystem?.used_disk || 0) / (kernelState.filesystem?.total_disk || 8192)) * 100)) || 0,
    process_count: Array.isArray(kernelState.processes) ? kernelState.processes.length : Object.keys(kernelState.processes || {}).length
  }), [kernelState.metrics, kernelState.system?.health, kernelState.filesystem?.used_disk, kernelState.filesystem?.total_disk, kernelState.processes]);

  const stats = useMemo(() => ({
    total: Object.keys(kernelState.processes || {}).length,
    running: Object.values(kernelState.processes || {}).filter(p => p.state === 'RUNNING').length,
    ready: Object.values(kernelState.processes || {}).filter(p => p.state === 'READY').length,
    waiting: Object.values(kernelState.processes || {}).filter(p => p.state === 'WAITING').length,
    terminated: Object.values(kernelState.processes || {}).filter(p => p.state === 'TERMINATED').length
  }), [kernelState.processes]);

  const refreshState = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kernel/state`);
      syncState(response.data);
    } catch (err) {
      console.error("Failed to refresh kernel state:", err);
    }
  }, [syncState]);

  return (
    <KernelContext.Provider value={{
      // Global State
      isConnected,
      isLoading,
      error,
      kernelState,
      
      // Subsystem States
      system: kernelState.system,
      processes: mappedProcesses,
      readyQueue,
      schedulerState,
      memoryMap,
      memoryStats,
      filesystemState,
      deadlock: kernelState.deadlock,
      resources: kernelState.resources?.resources || {},
      uptime: kernelState.system.uptime,
      treeData,
      logs: kernelState.logs || [],
      analyticsSummary,
      
      // Full Analytics
      analytics: kernelState.analytics,
      metrics: kernelState.metrics,
      timeline: kernelState.timeline || [],
      telemetry_stream: kernelState.telemetry_stream || [],

      // Legacy & Compatibility
      queueMode: kernelState.scheduler?.current_algorithm || 'FIFO',
      queueStats: {
          length: kernelState.ready_queue?.length || 0,
          average_waiting_time: kernelState.metrics?.avg_wait_time || 0,
          current_algorithm: kernelState.scheduler?.current_algorithm || 'FIFO'
      },
      schedulerMetrics: {
          ...kernelState.metrics,
          avg_waiting_time: kernelState.metrics?.avg_wait_time || 0,
          throughput: kernelState.metrics?.process_throughput || 0
      },
      
      disk: kernelState.disk || { current_track: 0, queue: [], completed_requests: [], current_algorithm: 'FCFS', head_path: [] },
      diskMetrics: kernelState.disk_metrics || { total_seek_distance: 0, avg_seek_distance: 0, throughput: 0 },
      hardwareState: kernelState.hardware,
      halLogs,

      // Actions
      createProcess,
      updateProcessState,
      deleteProcess,
      startScheduler: () => schedulerAction('start'),
      pauseScheduler: () => schedulerAction('pause'),
      resumeScheduler: () => schedulerAction('resume'),
      stopScheduler: () => schedulerAction('stop'),
      updateSchedulerAlgo: (algorithm) => schedulerAction('algorithm', { algorithm }),
      updateQuantum: (quantum) => schedulerAction('quantum', { quantum }),
      updateQueueMode: (algorithm) => schedulerAction('algorithm', { algorithm }),
      dequeueProcess: () => schedulerAction('step'),
      clearQueue: () => axios.post(`${API_BASE_URL}/queue/clear`),
      resetSimulation: () => schedulerAction('reset'),
      forkProcess: (pid) => axios.post(`${API_BASE_URL}/process/fork/${pid}`),
      clearLogs: async () => {
        setKernelState(prev => ({ ...prev, logs: [] }));
        try {
          await axios.delete(`${API_BASE_URL}/process/logs/clear`);
        } catch (e) {
          console.error("Log purge failed:", e);
        }
      },

      executeShellCommand: (command) => axios.post(`${API_BASE_URL}/shell/execute`, { command }),
      getShellSession: () => axios.get(`${API_BASE_URL}/shell/session`),
      addDiskRequest: (track, op = "READ") => axios.post(`${API_BASE_URL}/disk/request`, { track, type: op }),
      setDiskAlgorithm: (algorithm) => axios.post(`${API_BASE_URL}/disk/algorithm`, { algorithm }),
      simulateDiskLoad: (count = 10) => axios.post(`${API_BASE_URL}/disk/simulate`, { count }),
      resetDiskQueue: () => axios.post(`${API_BASE_URL}/disk/reset`),
      askAI,
      aiMessages,
      addMessage,
      aiIntelligence: kernelState.analytics?.ai_intelligence || kernelState.analytics?.intelligence_state || {},
      refreshState,
      toggleHardwareSimulation,
      startShowcase: (scenarioId) => axios.post(`${API_BASE_URL}/showcase/start/${scenarioId}`),
      stopShowcase: () => axios.post(`${API_BASE_URL}/showcase/stop`),
      pauseShowcase: () => axios.post(`${API_BASE_URL}/showcase/pause`),
      resumeShowcase: () => axios.post(`${API_BASE_URL}/showcase/resume`),
      showcase: kernelState.showcase,
      socket: socketRef.current,
      monitoringData,
      setMonitoringData,
      clearTraceHistory,
      requestWatchdogSync,
      fps,
      renderPressure,
      showDebugOverlay,
      setShowDebugOverlay,
      stats
    }}>
      {children}
    </KernelContext.Provider>
  );
};

export const useKernel = () => {
  const context = useContext(KernelContext);
  if (!context) {
    throw new Error('useKernel must be used within a KernelProvider');
  }
  return context;
};

export const useProcess = useKernel;
