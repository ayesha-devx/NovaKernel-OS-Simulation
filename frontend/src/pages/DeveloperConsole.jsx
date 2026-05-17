import React from 'react';
import { motion } from 'framer-motion';
import { 
  LuMonitor, 
  LuShieldCheck, 
  LuDatabase,
  LuZap,
  LuTerminal
} from 'react-icons/lu';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useKernel } from '../context/KernelContext';
import HealthScoreCard from '../components/monitoring/HealthScoreCard';
import PerformanceGrid from '../components/monitoring/PerformanceGrid';
import DiagnosticsGrid from '../components/monitoring/DiagnosticsGrid';
import MonitoringWarnings from '../components/monitoring/MonitoringWarnings';
import QueueMonitor from '../components/monitoring/QueueMonitor';
import MemoryTrendChart from '../components/monitoring/MemoryTrendChart';
import SocketInspector from '../components/monitoring/SocketInspector';
import TraceTimeline from '../components/monitoring/TraceTimeline';
import LeakDetectorPanel from '../components/monitoring/LeakDetectorPanel';
import RuntimeProfilerPanel from '../components/monitoring/RuntimeProfilerPanel';

// NovaOS Developer Console - Primary Subsystem Auditor
const DeveloperConsole = () => {
  const { 
    monitoringData = {}, 
    isConnected, 
    socket, 
    showDebugOverlay, 
    setShowDebugOverlay 
  } = useKernel();
  
  React.useEffect(() => {
    if (socket) {
      socket.emit('START_MONITORING');
      socket.emit('REQUEST_MONITORING_DATA');
    }
    return () => {
      if (socket) {
        socket.emit('STOP_MONITORING');
      }
    };
  }, [socket]);
  
  const { 
    performance = { metrics: {} }, 
    diagnostics = { subsystems: {}, warnings: [] } 
  } = monitoringData;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700 pb-12">
        
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
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border shadow-[0_0_20px_rgba(157,0,255,0.2)]">
                        <LuMonitor className="text-primary neon-text" size={32} />
                    </div>
                    <div>
                      <h1 className="text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">DEVELOPER CONSOLE</h1>
                      <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success shadow-[0_0_10px_#00FF9D]' : 'bg-rose-500 shadow-[0_0_10px_#F43F5E]'} indicator-pulse`} />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">Kernel Diagnostics & Performance Observability v2.0</p>
                      </div>
                    </div>
                 </div>
                 <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-19">
                   Deep telemetry inspection and runtime subsystem auditing. Monitoring physical address mappings, memory pressure curves, and micro-kernel signal integrity.
                 </p>
               </div>
               
               <div className="flex flex-wrap items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                 <button 
                   onClick={() => setShowDebugOverlay?.(!showDebugOverlay)}
                   className={`px-6 py-2.5 rounded-xl border flex items-center gap-3 transition-all font-orbitron ${showDebugOverlay ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(157,0,255,0.2)]' : 'bg-slate-900/40 border-white/5 text-white/40 hover:text-white hover:bg-white/5'}`}
                 >
                   <LuTerminal size={14} className={showDebugOverlay ? 'animate-pulse' : ''} />
                   <span className="text-[9px] font-black uppercase tracking-widest">
                     {showDebugOverlay ? 'Debug: ON' : 'Debug: OFF'}
                   </span>
                 </button>

                 <div className={`px-6 py-2.5 rounded-xl flex items-center gap-3 border transition-all font-orbitron ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                   <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-rose-500 shadow-[0_0_8px_#F43F5E]'} animate-pulse`} />
                   <span className="text-[9px] font-black uppercase tracking-widest">
                     {isConnected ? 'UPLINK: ACTIVE' : 'UPLINK: OFFLINE'}
                   </span>
                 </div>
               </div>
             </div>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Diagnostics, Performance & Telemetry (8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            
            {/* Performance Grid: Top Level Telemetry */}
            <PerformanceGrid metrics={performance.metrics} />

            {/* Memory Pressure Trend Chart */}
            <div className="glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <LuDatabase className="text-purple-400" /> Memory Pressure Trends
              </h3>
              <div className="w-full">
                <MemoryTrendChart data={performance.metrics.memory_usage || []} />
              </div>
            </div>

            {/* Subsystem Diagnostics Grid */}
            <div className="glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <LuShieldCheck className="text-emerald-400" /> Subsystem Diagnostics
              </h3>
              <DiagnosticsGrid subsystems={diagnostics.subsystems || {}} />
            </div>

            {/* Live Scrolling Event Trace Timeline */}
            <div className="h-[500px]">
              <TraceTimeline />
            </div>

            {/* Websocket Connection Terminal debugger */}
            <div className="glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-1 overflow-hidden h-[600px]">
              <SocketInspector />
            </div>

          </div>

          {/* Right Column: Health Gauges, Event Feeds & Subsystem Audits (4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            
            {/* Subsystem Health Score Gauge Card */}
            <HealthScoreCard 
              score={diagnostics.score || 0} 
              status={diagnostics.health || 'UNKNOWN'} 
              watchdog={diagnostics.watchdog || 'OK'} 
            />

            {/* Queue Integrity Monitor */}
            <div className="glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <LuZap className="text-amber-400" /> Queue Integrity Monitoring
              </h3>
              <QueueMonitor metrics={performance.metrics} />
            </div>

            {/* Active Subsystem Leak Auditor */}
            <LeakDetectorPanel />

            {/* Rendering and pipeline throughput Profiler */}
            <div className="glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 flex flex-col">
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <LuTerminal className="text-primary-400" /> Runtime Profiler
               </h3>
               <RuntimeProfilerPanel />
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default DeveloperConsole;
