import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useKernel } from '../context/KernelContext';
import { io } from 'socket.io-client';
import { 
  FiAlertTriangle, FiShield, FiCpu, FiLayers, FiZap, FiActivity,
  FiRefreshCw, FiPlay, FiTerminal, FiBarChart2, FiTarget, FiChevronDown
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import RecoveryTimeline from '../components/deadlock/RecoveryTimeline';

const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL   = 'http://127.0.0.1:5000';

// ── Phase visual config ─────────────────────────────────────────────────────
const PHASE_STYLES = {
  IDLE:                  { label: 'Monitoring',             color: 'text-white/30',   bg: 'bg-white/5',         border: 'border-white/10'  },
  DETECTION:             { label: 'Deadlock Detected',      color: 'text-danger',     bg: 'bg-danger/15',       border: 'border-danger/40' },
  ANALYZING:             { label: 'Analyzing Cycle',        color: 'text-warning',    bg: 'bg-warning/10',      border: 'border-warning/30' },
  VICTIM_SELECTED:       { label: 'Victim Selected',        color: 'text-warning',    bg: 'bg-warning/10',      border: 'border-warning/30' },
  RESOURCE_RELEASE:      { label: 'Releasing Resources',    color: 'text-cyan',       bg: 'bg-cyan/10',         border: 'border-cyan/30' },
  PROCESS_TERMINATED:    { label: 'Process Terminated',     color: 'text-danger',     bg: 'bg-danger/10',       border: 'border-danger/30' },
  RESOURCE_REALLOCATION: { label: 'Reallocating Resources', color: 'text-primary',    bg: 'bg-primary/10',      border: 'border-primary/30' },
  SYSTEM_STABILIZED:     { label: 'System Stabilized',      color: 'text-success',    bg: 'bg-success/10',      border: 'border-success/30' },
};

const STRATEGIES = [
  { value: 'LOWEST_PRIORITY',        label: 'Lowest Priority' },
  { value: 'LOWEST_CPU_USAGE',       label: 'Lowest CPU Usage' },
  { value: 'YOUNGEST_PROCESS',       label: 'Youngest Process' },
  { value: 'RANDOM',                 label: 'Random' },
  { value: 'MINIMUM_RESOURCES_HELD', label: 'Min Resources Held' },
];

// ── DeadlockDetection Page ──────────────────────────────────────────────────
const DeadlockDetection = () => {
  const { deadlock, resources, kernelState } = useKernel();
  const processes = Array.isArray(kernelState?.processes)
    ? kernelState.processes
    : Object.values(kernelState?.processes || {});
  const existingProcessPids = new Set(processes.map(p => p.pid));

  const [animPhase, setAnimPhase]       = useState('IDLE');
  const [animMeta,  setAnimMeta]        = useState({});
  const [analytics, setAnalytics]       = useState(null);
  const [strategy,  setStrategy]        = useState('LOWEST_PRIORITY');
  const [showStrategy, setShowStrategy] = useState(false);
  const socketRef = useRef(null);

  const isDeadlocked = deadlock?.is_deadlocked || false;
  const phaseStyle = PHASE_STYLES[animPhase] || PHASE_STYLES.IDLE;

  // ── Animation socket listener ─────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { reconnectionAttempts: 5 });
    socketRef.current = socket;

    socket.on('RECOVERY_ANIMATION', (data) => {
      setAnimPhase(data.phase || 'IDLE');
      setAnimMeta(data.metadata || {});
    });

    return () => socket.close();
  }, []);

  // ── Analytics fetch ───────────────────────────────────────────────────
  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/deadlock/analytics`);
      setAnalytics(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchAnalytics();
    const iv = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(iv);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────
  const handleSimulate = async () => {
    try {
      await axios.post(`${API_BASE_URL}/deadlock/simulate`);
      toast.warning('⚡ Deadlock Simulation Initiated');
    } catch { toast.error('Simulation failed'); }
  };

  const handleAutoRecover = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/deadlock/recover/auto`, { strategy });
      if (res.data.success) { toast.success(res.data.message); fetchAnalytics(); }
      else                   toast.error(res.data.message);
    } catch { toast.error('Recovery failed'); }
  };

  const handleReset = async () => {
    try {
      await axios.post(`${API_BASE_URL}/deadlock/reset`);
      toast.success('Kernel Reset Complete');
      setAnimPhase('IDLE');
      fetchAnalytics();
    } catch { toast.error('Reset failed'); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">

        {/* Cinematic Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-magenta/5 to-transparent rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative glass-premium rounded-[2.5rem] p-10 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(157,0,255,0.05)]">
             <div className="absolute inset-0 scanline-overlay opacity-20" />
             <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 blur-[120px] -mr-40 -mt-40" />
             
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
               <div className="space-y-4">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border">
                        <FiShield className={isDeadlocked ? 'text-danger neon-text animate-pulse' : 'text-success neon-text-cyan'} size={32} />
                    </div>
                    <div>
                      <h1 className="text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">DEADLOCK DETECTION</h1>
                      <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${isDeadlocked ? 'bg-danger shadow-[0_0_10px_#FF4D6D]' : 'bg-success shadow-[0_0_10px_#00FF9D]'} indicator-pulse`} />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">Resource Allocation Graph & Recovery Engine V3.0</p>
                      </div>
                    </div>
                 </div>
                 <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-19">
                   Real-time cycle detection and automated recovery orchestration. Monitoring resource acquisition patterns to prevent kernel-level circular wait conditions.
                 </p>
               </div>
               
               <div className="flex flex-wrap gap-3 items-center">
                 {/* Strategy selector */}
                 <div className="relative">
                   <button
                     onClick={() => setShowStrategy(s => !s)}
                     className="px-5 py-3 bg-surface/40 hover:bg-surface/60 border border-white/10 text-white/80 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 glass group"
                   >
                     <FiTarget size={12} className="group-hover:text-cyan transition-colors" />
                     <span className="opacity-60">Strategy:</span> {STRATEGIES.find(s => s.value === strategy)?.label}
                     <FiChevronDown size={10} className={`transition-transform duration-300 ${showStrategy ? 'rotate-180' : ''}`} />
                   </button>
                   <AnimatePresence>
                     {showStrategy && (
                       <motion.div
                         initial={{ opacity: 0, y: -8, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: -8, scale: 0.95 }}
                         className="absolute right-0 top-full mt-2 z-50 glass-premium border border-primary/30 rounded-xl p-2 min-w-[220px] shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
                       >
                         {STRATEGIES.map(s => (
                           <button
                             key={s.value}
                             onClick={() => { setStrategy(s.value); setShowStrategy(false); }}
                             className={`w-full text-left px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all mb-1 last:mb-0 ${
                               strategy === s.value
                                 ? 'bg-primary/20 text-primary border border-primary/30'
                                 : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                             }`}
                           >
                             {s.label}
                           </button>
                         ))}
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>

                 <button onClick={handleSimulate}
                   className="px-6 py-3 bg-warning/10 hover:bg-warning/20 border border-warning/30 text-warning rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 neon-border-warning hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,200,87,0.1)]">
                   <FiPlay className="fill-current" /> Simulate Deadlock
                 </button>
                 <button onClick={handleAutoRecover}
                   className="px-6 py-3 bg-success/10 hover:bg-success/20 border border-success/30 text-success rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 neon-border-green hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,255,157,0.1)]">
                   <FiZap className="fill-current" /> Auto Recover
                 </button>
                 <button onClick={handleReset}
                   className="px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 neon-border hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(157,0,255,0.1)]">
                   <FiRefreshCw /> Reset System
                 </button>
               </div>
             </div>
          </div>
        </motion.div>

        {/* ── Animation Phase Banner ──────────────────────────────── */}
        <AnimatePresence>
          {animPhase !== 'IDLE' && (
            <motion.div
              key={animPhase}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className={`flex items-center gap-4 px-6 py-5 rounded-2xl border glass-premium ${phaseStyle.bg} ${phaseStyle.border.replace('border-', 'neon-border-') || 'neon-border'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${phaseStyle.bg} border ${phaseStyle.border}`}>
                <FiActivity className={`${phaseStyle.color} animate-pulse`} size={20} />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-black uppercase tracking-[0.2em] ${phaseStyle.color} font-orbitron`}>
                  Recovery Engine <span className="opacity-40 px-2">//</span> {phaseStyle.label}
                </p>
                <div className="flex gap-4 mt-1">
                  {animMeta.victim_pid && (
                    <p className="text-[10px] text-white/60 font-mono flex items-center gap-1.5">
                      <span className="text-danger font-bold">VICTIM_IDENTIFIED:</span> 
                      <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">PID {animMeta.victim_pid}</span>
                      {animMeta.victim_name ? <span className="opacity-40 italic">({animMeta.victim_name})</span> : ''}
                    </p>
                  )}
                  {animMeta.resources?.length > 0 && (
                    <p className="text-[10px] text-white/60 font-mono flex items-center gap-1.5">
                      <span className="text-warning font-bold">RESOURCES_LOCKED:</span>
                      <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{animMeta.resources.join(', ')}</span>
                    </p>
                  )}
                </div>
              </div>
              {/* Progress dots */}
              <div className="flex gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                {['DETECTION','ANALYZING','VICTIM_SELECTED','RESOURCE_RELEASE',
                  'PROCESS_TERMINATED','RESOURCE_REALLOCATION','SYSTEM_STABILIZED'].map((p, i) => {
                  const phaseIndex = Object.keys(PHASE_STYLES).indexOf(animPhase);
                  const isPast = phaseIndex >= i + 1;
                  const isCurrent = phaseIndex === i + 1;
                  
                  return (
                    <div
                      key={p}
                      className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                        isPast
                          ? 'bg-success shadow-[0_0_10px_rgba(0,255,157,0.5)]'
                          : isCurrent
                          ? `${phaseStyle.color.replace('text-', 'bg-')} animate-pulse shadow-[0_0_15px_currentColor]`
                          : 'bg-white/10'
                      }`}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Graph */}
          <div className="lg:col-span-8 space-y-6">
            <div className={`relative glass-premium border rounded-[2.5rem] p-10 overflow-hidden min-h-[580px] flex flex-col transition-all duration-700 ${
              isDeadlocked ? 'neon-border-danger bg-danger/5 shadow-[0_0_100px_rgba(255,77,109,0.1)]' : 'border-white/10'
            }`}>
              {/* Grid Background */}
              <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
              <div className="absolute inset-0 bg-radial-gradient from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-3">
                  <FiActivity className="text-primary animate-pulse" />
                  Resource Allocation Graph (RAG)
                  <span className="h-[1px] w-12 bg-white/10 ml-2"></span>
                </h2>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 glass">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan shadow-[0_0_10px_#00D1FF]" />
                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">Process</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 glass">
                    <div className="w-2.5 h-2.5 rounded-full bg-warning shadow-[0_0_10px_#FFC857]" />
                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">Resource</span>
                  </div>
                </div>
              </div>

              <div className="flex-grow relative flex items-center justify-center z-10">
                <RAGVisualization
                  resources={resources}
                  deadlock={deadlock}
                  processes={processes}
                  existingProcessPids={existingProcessPids}
                  animPhase={animPhase}
                  animMeta={animMeta}
                />
              </div>

              <AnimatePresence>
                {isDeadlocked && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-danger/5 pointer-events-none z-0"
                  >
                    <div className="absolute inset-0 scanline-overlay opacity-20" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Analytics Strip */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Deadlocks',  value: analytics.total_deadlocks,       color: 'text-danger',   border: 'neon-border-danger' },
                  { label: 'Recoveries',        value: analytics.successful_recoveries, color: 'text-success',  border: 'neon-border-green' },
                  { label: 'Success Rate',      value: `${analytics.success_rate_pct}%`,color: 'text-cyan',     border: 'neon-border-cyan' },
                  { label: 'Avg Recovery',      value: `${analytics.avg_recovery_time_s}s`, color: 'text-primary',  border: 'neon-border' },
                ].map(stat => (
                  <motion.div 
                    key={stat.label} 
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    className={`glass border rounded-2xl p-5 relative overflow-hidden group ${stat.border}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
                    <p className={`text-3xl font-black ${stat.color} font-orbitron neon-text relative z-10`}>{stat.value}</p>
                    <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em] mt-2 relative z-10">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 space-y-6">

            {/* Status card */}
            <div className={`glass-premium border rounded-[2.5rem] p-8 transition-all duration-500 relative overflow-hidden group ${
              isDeadlocked ? 'neon-border-danger bg-danger/5 shadow-[0_0_50px_rgba(255,77,109,0.15)]' : 'border-white/10'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-all" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isDeadlocked
                    ? 'bg-danger/20 text-danger shadow-[0_0_30px_rgba(255,77,109,0.4)] animate-pulse border border-danger/30'
                    : 'bg-success/20 text-success shadow-[0_0_30px_rgba(0,255,157,0.3)] border border-success/30'
                }`}>
                  <FiAlertTriangle size={28} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">System Status</p>
                  <p className={`text-3xl font-black tracking-tighter uppercase font-orbitron ${isDeadlocked ? 'text-danger neon-text' : 'text-success neon-text-cyan'}`}>
                    {isDeadlocked ? 'DEADLOCKED' : 'STABLE'}
                  </p>
                </div>
              </div>

              {isDeadlocked ? (
                <div className="space-y-5 relative z-10">
                  <div className="p-5 bg-danger/10 border border-danger/20 rounded-2xl holographic-panel">
                    <p className="text-xs font-bold text-danger mb-2 flex items-center gap-2">
                      <FiTerminal size={14} className="animate-pulse" /> CIRCULAR WAIT DETECTED
                    </p>
                    <p className="text-[10px] text-danger/80 leading-relaxed uppercase tracking-[0.2em] font-mono-cyber">
                      SYSTEM HALTED. CYCLE IDENTIFIED IN PROCESS CHAIN. PIDS: {deadlock.detected_pids.join(', ')}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl glass">
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-2 font-black">Active Recovery Strategy</p>
                    <p className="text-xs font-black text-primary font-orbitron">
                      {STRATEGIES.find(s => s.value === strategy)?.label}
                    </p>
                  </div>
                  <button
                    onClick={handleAutoRecover}
                    className="w-full py-5 bg-danger text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-[0_0_40px_rgba(255,77,109,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/btn"
                  >
                    <FiZap className="group-hover:animate-bounce" /> 
                    <span className="neon-text">Initiate Recovery Sequence</span>
                  </button>
                </div>
              ) : (
                <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] glass flex flex-col items-center gap-4 relative z-10 overflow-hidden">
                  <div className="absolute inset-0 shimmer-sweep opacity-10" />
                  <FiShield className="text-success/20" size={40} />
                  <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-[0.3em] text-center">
                    Resources are balanced. <br/>
                    <span className="text-success/60">Graph integrity verified.</span>
                  </p>
                </div>
              )}
            </div>

            {/* Resource Registry */}
            <div className="glass-premium border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/5 blur-[60px] pointer-events-none" />
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <FiLayers className="text-cyan" />
                Resource Registry
              </h3>
              <div className="space-y-3">
                {Object.values(resources || {}).map((res) => (
                  <motion.div 
                    key={res.id} 
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group glass"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center text-[10px] font-black border border-warning/20 group-hover:neon-border-warning transition-all shadow-[0_0_10px_rgba(255,200,87,0.1)]">
                        {res.id}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white/90 uppercase tracking-wider font-orbitron group-hover:text-warning transition-colors">{res.name}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-[0.2em] font-mono-cyber mt-0.5 ${
                          res.allocated_to && existingProcessPids.has(res.allocated_to) ? 'text-primary' : 'text-white/20'
                        }`}>
                          {res.allocated_to && existingProcessPids.has(res.allocated_to)
                            ? `OWNER: PID ${res.allocated_to}` : 'STATUS: AVAILABLE'}
                        </span>
                      </div>
                    </div>
                    {(() => {
                      const uniqueWaiters = Array.from(new Set(res.waiting_pids || []))
                        .filter(pid => existingProcessPids.has(Number(pid)));
                      return uniqueWaiters.length > 0 && (
                        <div className="px-3 py-1 bg-danger/10 border border-danger/30 text-danger rounded-lg text-[9px] font-black animate-pulse shadow-[0_0_10px_rgba(255,77,109,0.2)]">
                          {uniqueWaiters.length} QUEUED
                        </div>
                      );
                    })()}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Timeline Panel (full width below graph) ─────────────── */}
        <RecoveryTimeline />

      </div>
    </DashboardLayout>
  );
};

// ── RAG Visualization ───────────────────────────────────────────────────────
const RAGVisualization = ({ resources, deadlock, processes, existingProcessPids, animPhase, animMeta }) => {
  const nodes = [];
  const edges = [];

  const resourceList = Object.values(resources || {});

  // Resource nodes in circle
  resourceList.forEach((res, idx) => {
    const total = resourceList.length || 1;
    const angle = (idx / total) * 2 * Math.PI;
    nodes.push({
      id: res.id, name: res.name, type: 'resource',
      x: 400 + Math.cos(angle) * 180,
      y: 300 + Math.sin(angle) * 180,
    });
  });

  // Process nodes & edges
  const pids = new Set();
  resourceList.forEach(res => {
    if (res.allocated_to && existingProcessPids.has(res.allocated_to)) pids.add(res.allocated_to);
    res.waiting_pids.forEach(p => { if (existingProcessPids.has(p)) pids.add(p); });
  });

  const pidList = Array.from(pids);
  pidList.forEach((pid, idx) => {
    const total = pidList.length || 1;
    const angle = (idx / total) * 2 * Math.PI + Math.PI / 4;
    nodes.push({
      id: `P${pid}`, name: `PID ${pid}`, type: 'process',
      x: 400 + Math.cos(angle) * 80,
      y: 300 + Math.sin(angle) * 80,
      pid,
    });
  });

  resourceList.forEach(res => {
    if (res.allocated_to && existingProcessPids.has(res.allocated_to)) {
      edges.push({ from: res.id, to: `P${res.allocated_to}`, type: 'allocation' });
    }
    Array.from(new Set(res.waiting_pids || [])).forEach(pid => {
      if (existingProcessPids.has(Number(pid))) {
        edges.push({ from: `P${pid}`, to: res.id, type: 'request' });
      }
    });
  });

  const victimPid = animMeta?.victim_pid;

  const getEdgeStyle = (edge) => {
    const isCycle = deadlock?.resource_cycles?.some(cycle =>
      cycle.includes(edge.from) && cycle.includes(edge.to)
    );
    if (isCycle) return 'stroke-danger stroke-[3] animate-pulse filter drop-shadow-[0_0_5px_#FF4D6D]';
    return edge.type === 'allocation' ? 'stroke-success/40 stroke-[1.5]' : 'stroke-warning/40 stroke-[1.5]';
  };

  const getNodeHighlight = (node) => {
    if (victimPid && node.pid === victimPid) {
      return { fill: 'rgba(255,77,109,0.3)', stroke: '#FF4D6D', glow: 'drop-shadow(0 0 12px #FF4D6D)' };
    }
    if (node.type === 'process') return { fill: 'rgba(0,209,255,0.1)', stroke: '#00D1FF', glow: 'drop-shadow(0 0 8px rgba(0,209,255,0.4))' };
    return { fill: 'rgba(255,200,87,0.1)', stroke: '#FFC857', glow: 'drop-shadow(0 0 8px rgba(255,200,87,0.4))' };
  };

  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      <defs>
        <marker id="arrow-success" markerWidth="10" markerHeight="10" refX="25" refY="5" orient="auto">
          <path d="M0,0 L0,10 L10,5 Z" fill="#00FF9D" />
        </marker>
        <marker id="arrow-warning" markerWidth="10" markerHeight="10" refX="25" refY="5" orient="auto">
          <path d="M0,0 L0,10 L10,5 Z" fill="#FFC857" />
        </marker>
        <marker id="arrow-danger" markerWidth="10" markerHeight="10" refX="25" refY="5" orient="auto">
          <path d="M0,0 L0,10 L10,5 Z" fill="#FF4D6D" />
        </marker>
      </defs>

      {edges.map((edge) => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode   = nodes.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return null;
        const isCycle = deadlock?.resource_cycles?.some(cycle =>
          cycle.includes(edge.from) && cycle.includes(edge.to)
        );
        const color = isCycle ? 'danger' : (edge.type === 'allocation' ? 'success' : 'warning');
        return (
          <motion.line
            key={`${edge.from}-${edge.to}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
            className={getEdgeStyle(edge)}
            markerEnd={`url(#arrow-${color})`}
            strokeDasharray={edge.type === 'request' ? '4,4' : '0'}
          />
        );
      })}

      {nodes.map((node) => {
        const hl = getNodeHighlight(node);
        return (
          <motion.g key={node.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="cursor-pointer">
            <circle
              cx={node.x} cy={node.y} r={22}
              fill={hl.fill} stroke={hl.stroke} strokeWidth={2}
              style={{ filter: hl.glow || undefined }}
              className="transition-all duration-300"
            />
            <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle"
              className="fill-white text-[9px] font-black font-orbitron pointer-events-none">
              {node.id}
            </text>
            <text x={node.x} y={node.y + 40} textAnchor="middle"
              className="fill-white/60 text-[8px] font-black uppercase tracking-[0.2em] font-mono-cyber pointer-events-none">
              {node.type === 'process' ? node.name : node.name.split(' ')[0]}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
};

export default DeadlockDetection;
