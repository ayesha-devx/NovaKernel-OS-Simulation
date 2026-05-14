import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuActivity, 
  LuCpu, 
  LuDatabase, 
  LuHardDrive, 
  LuTerminal, 
  LuZap, 
  LuClock, 
  LuShield, 
  LuLayers,
  LuHistory,
  LuRadio,
  LuWifi,
  LuTriangleAlert,
  LuCheck,
  LuSettings,
  LuBrain,
  LuTrendingUp,
  LuShieldAlert,
  LuCompass
} from 'react-icons/lu';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useKernel } from '../context/KernelContext';

// --- STYLED SUB-COMPONENTS (MEMOIZED) ---

const StatCard = React.memo(({ title, value, unit, icon, color, trend, health }) => {
  const colors = {
    cyan: { text: '#00D1FF', bg: 'rgba(0, 209, 255, 0.1)', border: 'rgba(0, 209, 255, 0.3)', shadow: 'rgba(0, 209, 255, 0.2)' },
    purple: { text: '#9D00FF', bg: 'rgba(157, 0, 255, 0.1)', border: 'rgba(157, 0, 255, 0.3)', shadow: 'rgba(157, 0, 255, 0.2)' },
    emerald: { text: '#00FF9D', bg: 'rgba(0, 255, 157, 0.1)', border: 'rgba(0, 255, 157, 0.3)', shadow: 'rgba(0, 255, 157, 0.2)' },
    blue: { text: '#00D1FF', bg: 'rgba(0, 209, 255, 0.1)', border: 'rgba(0, 209, 255, 0.3)', shadow: 'rgba(0, 209, 255, 0.2)' },
    amber: { text: '#FFC857', bg: 'rgba(255, 200, 87, 0.1)', border: 'rgba(255, 200, 87, 0.3)', shadow: 'rgba(255, 200, 87, 0.2)' },
    rose: { text: '#FF4D6D', bg: 'rgba(255, 77, 109, 0.1)', border: 'rgba(255, 77, 109, 0.3)', shadow: 'rgba(255, 77, 109, 0.2)' }
  };

  const c = colors[color] || colors.cyan;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-[#0B1020]/60 border border-white/5 p-7 rounded-[2.5rem] relative overflow-hidden group backdrop-blur-xl transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.3)]"
      style={{ borderColor: c.border }}
    >
      {/* Cinematic Glow Background */}
      <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] -mr-12 -mt-12 group-hover:opacity-100 transition-opacity duration-700 opacity-40"
        style={{ backgroundColor: c.text }}
      />
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 shimmer-sweep opacity-0 group-hover:opacity-10 pointer-events-none" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-4 rounded-2xl border-2 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110"
          style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
        >
          <div className="drop-shadow-[0_0_8px_currentColor]">
            {icon}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className={`text-[9px] font-black uppercase tracking-[0.3em] font-mono ${health === 'critical' ? 'text-[#FF4D6D] animate-pulse' : 'text-slate-500'}`}>
            {health || 'Healthy'}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${health === 'critical' ? 'bg-[#FF4D6D] shadow-[0_0_10px_#FF4D6D]' : 'bg-[#00FF9D] shadow-[0_0_10px_#00FF9D]'} ${health === 'critical' && 'animate-ping'}`} />
            <div className="w-12 h-1 bg-[#050816] rounded-full overflow-hidden border border-white/5">
               <motion.div 
                 className="h-full"
                 style={{ backgroundColor: c.text, boxShadow: `0 0 10px ${c.text}` }}
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min(100, (value / (unit === '%' ? 1 : 100)) * 100)}%` }}
               />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 group-hover:text-white transition-colors">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          <span className="text-sm font-black text-slate-500 uppercase tracking-widest">{unit}</span>
        </div>
        {trend && (
          <div className="flex items-center gap-2 mt-3 bg-white/5 w-fit px-2 py-1 rounded-lg border border-white/5">
            <LuActivity size={12} className={trend > 0 ? 'text-[#00FF9D]' : 'text-[#FF4D6D]'} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${trend > 0 ? 'text-[#00FF9D]' : 'text-[#FF4D6D]'}`}>
              {trend > 0 ? '+' : ''}{trend}% SYNC
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
});

const TelemetryGraph = React.memo(({ data, color = "#22d3ee" }) => {
  const points = useMemo(() => {
    if (!data || data.length < 2) return "";
    const width = 400;
    const height = 100;
    const maxVal = 100;
    const stepX = width / (data.length - 1);
    
    return data.map((d, i) => {
      const x = i * stepX;
      const utilization = d?.data?.cpu?.utilization ?? 0;
      const y = height - (utilization / maxVal) * height;
      return `${x},${y}`;
    }).join(" ");
  }, [data]);

  const areaPath = useMemo(() => {
    if (!points) return "";
    return `M 0,100 L ${points} L 400,100 Z`;
  }, [points]);

  return (
    <div className="h-40 w-full relative group">
      <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Shadow/Glow Line */}
        <motion.polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          className="opacity-20 blur-sm"
        />

        {/* Main Line */}
        <motion.polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Area Fill */}
        <motion.path
          d={areaPath}
          fill="url(#graphGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        
        {/* Dynamic Scan Line */}
        <motion.line
          x1="0" y1="0" x2="0" y2="100"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 2"
          animate={{ x: [0, 400] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="opacity-30"
        />
      </svg>
      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-mono text-cyan-400 border border-white/5">
        LIVE_CPU_STREAM
      </div>
    </div>
  );
});

const FragmentationHeatmap = React.memo(({ blocks, total }) => {
  const blockSize = useMemo(() => Math.ceil(Math.sqrt(total || 144)), [total]);
  
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${blockSize}, 1fr)` }}>
      {Array.from({ length: total || 144 }).map((_, i) => {
        // Simple mapping of blocks to heatmap
        const isUsed = blocks && blocks.length > 0 && i < (blocks.length * 2); 
        
        return (
          <div 
            key={i}
            className={`aspect-square rounded-[1px] transition-all duration-500 ${
              isUsed 
                ? 'bg-cyan-500 shadow-[0_0_5px_rgba(34,211,238,0.3)] scale-[0.85]' 
                : 'bg-slate-800/50 hover:bg-slate-700'
            }`}
          />
        );
      })}
    </div>
  );
});

const TimelineEntry = React.memo(({ event }) => {
  const severityColors = {
    'INFO': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    'SUCCESS': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'WARNING': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'ERROR': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    'CRITICAL': 'text-purple-400 bg-purple-400/10 border-purple-400/20 border-2 animate-pulse'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0 group"
    >
      <div className="flex flex-col items-center pt-1">
        <div className="text-[9px] font-mono text-slate-500">
          {new Date(event.timestamp * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="w-[1px] h-full bg-white/5 mt-1" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border ${severityColors[event.severity] || severityColors.INFO}`}>
            {typeof event.event === 'object' ? 'EVENT_OBJ' : event.event}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {event.module}
          </span>
        </div>
        <p className="text-xs text-white/80 font-medium group-hover:text-white transition-colors">
          {typeof event.message === 'object' ? JSON.stringify(event.message) : event.message}
        </p>
        {event.pid && (
          <div className="text-[9px] font-mono text-cyan-400/60 mt-1">
            TARGET_PID: {event.pid}
          </div>
        )}
      </div>
    </motion.div>
  );
});

const CircularHealthScore = React.memo(({ score, status }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getScoreColor = (s) => {
    if (s >= 90) return '#00FF9D'; // Neon Green
    if (s >= 70) return '#00D1FF'; // Electric Cyan
    if (s >= 50) return '#FFC857'; // Warning Orange
    return '#FF4D6D'; // Danger Red
  };

  const color = getScoreColor(score);

  return (
    <div className="relative flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute inset-0 rounded-full blur-[40px] opacity-20" style={{ backgroundColor: color }}></div>
      
      <svg className="w-36 h-36 transform -rotate-90">
        {/* Background Track */}
        <circle
          cx="72" cy="72" r={radius}
          stroke="rgba(255,255,255,0.05)" strokeWidth="10"
          fill="transparent"
        />
        {/* Progress Arc */}
        <motion.circle
          cx="72" cy="72" r={radius}
          stroke={color} strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "circOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        {/* Scanning Orbit Dot */}
        <motion.circle
          cx="72" cy="72" r={radius}
          stroke="white" strokeWidth="2"
          fill="white"
          strokeDasharray={`1 ${circumference}`}
          animate={{ strokeDashoffset: [circumference, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ filter: 'drop-shadow(0 0 5px white)' }}
        />
      </svg>
      
      <div className="absolute flex flex-col items-center">
        <motion.span 
          key={score}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-black tracking-tighter"
          style={{ color, filter: `drop-shadow(0 0 10px ${color}66)` }}
        >
          {Math.round(score)}
        </motion.span>
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mt-1">
          {status}
        </span>
      </div>
    </div>
  );
});

const InsightCard = React.memo(({ insight }) => {
  const sevColor = {
    'INFO': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'WARNING': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'CRITICAL': 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
  }[insight.severity] || 'bg-white/5 text-white border-white/10';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-2xl border ${sevColor} flex gap-4 items-start`}
    >
      <div className="pt-1">
        <LuBrain size={18} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest">{insight.subsystem}</span>
          <span className="text-[9px] font-mono opacity-60">CONF: {insight.confidence}%</span>
        </div>
        <p className="text-xs font-bold leading-relaxed">{insight.message}</p>
      </div>
    </motion.div>
  );
});

const RiskIndicator = React.memo(({ label, value, color }) => (
  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
    <div className="flex justify-between items-center mb-3">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={`text-[10px] font-black uppercase text-${color}-400`}>{value}</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        className={`h-full bg-${color}-500 shadow-[0_0_10px_rgba(var(--${color}-rgb),0.5)]`}
        initial={{ width: 0 }}
        animate={{ 
          width: value === 'LOW' ? '25%' : value === 'MODERATE' ? '50%' : value === 'HIGH' ? '75%' : '100%' 
        }}
      />
    </div>
  </div>
));

// --- MAIN PAGE COMPONENT ---

const AnalyticsDashboard = () => {
  const { analytics, analyticsSummary, timeline = [], telemetry_stream = [], isConnected, memoryMap } = useKernel();
  
  const { 
    cpu_metrics = { utilization: 0, context_switches: 0, throughput: 0, active_processes: 0 }, 
    memory_metrics = { utilization: 0, fragmentation: 0, used_mb: 0, free_mb: 4096 }, 
    disk_metrics = { utilization: 0, queue_depth: 0, total_seek: 0, throughput: 0 }, 
    scheduler_metrics = { avg_wait: 0, avg_turnaround: 0, algorithm: 'FIFO' }, 
    hardware_metrics = { connected: false, simulation_mode: true, uptime: 0, command_throughput: 0 }, 
    filesystem_metrics = { file_count: 0, inode_usage: 0, storage_usage: 0, storage_total: 8192 },
    intelligence_state = {
      health_score: 100,
      health_status: "OPTIMAL",
      subsystem_scores: { cpu: 100, memory: 100, disk: 100, deadlock: 100 },
      forecasts: { cpu: {}, memory: {}, disk: {} },
      recommendations: [],
      deadlock_risk: "LOW",
      anomalies: []
    }
  } = analytics || {};

  const forecastData = useMemo(() => [
    { label: 'CPU Forecast', icon: <LuCpu />, data: intelligence_state.forecasts.cpu, color: 'cyan' },
    { label: 'RAM Forecast', icon: <LuDatabase />, data: intelligence_state.forecasts.memory, color: 'purple' },
    { label: 'Disk Forecast', icon: <LuHardDrive />, data: intelligence_state.forecasts.disk, color: 'blue' }
  ], [intelligence_state.forecasts]);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-6 p-8 bg-[#0B1020]/40 border border-[#9D00FF]/20 rounded-[3rem] relative overflow-hidden backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#9D00FF]/10 blur-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#00D1FF]/10 blur-[100px] translate-x-1/2 translate-y-1/2 rounded-full"></div>
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #9D00FF 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-4">
              <div className="p-4 bg-[#9D00FF]/10 text-[#9D00FF] rounded-2xl border-2 border-[#9D00FF]/30 shadow-[0_0_25px_rgba(157,0,255,0.3)] animate-pulse">
                <LuRadio size={28} />
              </div>
              <div>
                <h1 className="text-5xl font-black font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-3">
                  ANALYTICS DASHBOARD
                </h1>
                <p className="text-[#9D00FF] text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-80 flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#9D00FF] rounded-full animate-ping"></span>
                  Real-time System Telemetry & Heuristic Analysis Engine
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-10 relative z-10">
            <CircularHealthScore 
              score={intelligence_state.health_score} 
              status={intelligence_state.health_status} 
            />
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-[#050816]/60 p-3 rounded-3xl border border-[#00D1FF]/20 backdrop-blur-2xl shadow-inner">
                <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border transition-all duration-500 ${isConnected ? 'bg-[#00FF9D]/10 border-[#00FF9D]/30 text-[#00FF9D] shadow-[0_0_15px_rgba(0,255,157,0.2)]' : 'bg-[#FF4D6D]/10 border-[#FF4D6D]/30 text-[#FF4D6D]'}`}>
                  <LuWifi size={16} className={isConnected ? '' : 'animate-pulse'} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                    {isConnected ? 'SYNC: ACTIVE' : 'SYNC: OFFLINE'}
                  </span>
                </div>
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] shadow-inner">
                  UPTIME: <span className="text-white font-mono">{hardware_metrics?.uptime || 0}S</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard 
            title="CPU Usage" 
            value={cpu_metrics?.utilization || 0} 
            unit="%" 
            icon={<LuCpu size={20}/>} 
            color="cyan" 
            health={cpu_metrics?.utilization > 80 ? 'warning' : 'healthy'}
          />
          <StatCard 
            title="RAM Pressure" 
            value={memory_metrics?.utilization || 0} 
            unit="%" 
            icon={<LuDatabase size={20}/>} 
            color="purple" 
            health={memory_metrics?.utilization > 90 ? 'critical' : 'healthy'}
          />
          <StatCard 
            title="Active Tasks" 
            value={cpu_metrics?.active_processes || 0} 
            unit="PID" 
            icon={<LuActivity size={20}/>} 
            color="emerald" 
          />
          <StatCard 
            title="Disk Load" 
            value={disk_metrics?.utilization || 0} 
            unit="%" 
            icon={<LuHardDrive size={20}/>} 
            color="blue" 
          />
          <StatCard 
            title="Throughput" 
            value={cpu_metrics?.throughput || 0} 
            unit="TPS" 
            icon={<LuZap size={20}/>} 
            color="amber" 
          />
          <StatCard 
            title="Avg Wait" 
            value={scheduler_metrics?.avg_wait || 0} 
            unit="ms" 
            icon={<LuClock size={20}/>} 
            color="rose" 
          />
        </div>

        {/* Main Observatory Content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column: Performance & Memory */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Realtime Telemetry Charts */}
            <div className="glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-[0.2em]">
                  <LuActivity className="text-primary" /> Live CPU Stream
                </h3>
                <div className="flex gap-2">
                  {['1m', '5m', '15m'].map(t => (
                    <button key={t} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${t === '1m' ? 'bg-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <TelemetryGraph data={telemetry_stream} />
              
              <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-white/5">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Context Switches</div>
                  <div className="text-xl font-black text-white tracking-tighter tabular-nums">
                    {cpu_metrics?.context_switches?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Thread Efficiency</div>
                  <div className="text-xl font-black text-emerald-400 tracking-tighter tabular-nums">
                    {isConnected ? `${analyticsSummary?.health_score || 98.4}%` : '0.0%'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Interrupt Latency</div>
                  <div className="text-xl font-black text-cyan-400 tracking-tighter tabular-nums">
                    {hardware_metrics?.command_throughput ? Math.max(1, Math.round(10 / (hardware_metrics.command_throughput + 0.1))) : 12}ms
                  </div>
                </div>
              </div>
            </div>

            {/* Memory Fragmentation Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8">
                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-[0.2em] mb-6">
                  <LuLayers className="text-purple-400" /> Memory Heatmap
                </h3>
                <FragmentationHeatmap total={144} blocks={memoryMap?.blocks || []} />
                <div className="mt-6 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Start: 0x0000</span>
                  <span>End: 0x{((memory_metrics?.total_mb || 4096) * 1024).toString(16).toUpperCase()}</span>
                </div>
              </div>

              <div className="glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 flex flex-col h-full">
                <h3 className="text-sm font-black text-white flex items-center justify-between uppercase tracking-[0.2em] mb-6">
                  <span className="flex items-center gap-2"><LuBrain className="text-primary" /> AI Intelligence Panel</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                    <div className="w-1 h-1 rounded-full bg-primary animate-ping delay-100" />
                    <div className="w-1 h-1 rounded-full bg-primary animate-ping delay-200" />
                  </div>
                </h3>
                
                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                  {intelligence_state.recommendations.length > 0 ? (
                    intelligence_state.recommendations.map(insight => (
                      <InsightCard key={insight.id} insight={insight} />
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3 opacity-40">
                      <LuCompass size={24} className="animate-spin-slow" />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em]">Analyzing System Vectors...</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                      <LuShield size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white uppercase tracking-wider">Predictive Guard</div>
                      <div className="text-xs font-bold text-emerald-400/60 uppercase">Heuristics Stable</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Load Forecasting Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {forecastData.map(f => (
                <div key={f.label} className="glass bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                   <div className="flex items-center gap-2 mb-4">
                      <div className={`text-${f.color}-400 opacity-60`}>{f.icon}</div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</span>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                      {['10s', '30s', '60s'].map(time => (
                        <div key={time} className="bg-white/5 p-2 rounded-xl text-center border border-white/5">
                          <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">{time}</div>
                          <div className={`text-xs font-black text-${f.color}-400 tabular-nums`}>
                            {Math.round(f.data[time] || 0)}%
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Timeline & Subsystems */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* Timeline Feed */}
            <div className="glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 h-[600px] flex flex-col">
              <h3 className="text-sm font-black text-white flex items-center justify-between uppercase tracking-[0.2em] mb-6">
                <span className="flex items-center gap-2"><LuHistory className="text-amber-400" /> Event Timeline</span>
                <span className="text-[10px] text-slate-500 font-mono">LIVE_T_LOG</span>
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                <AnimatePresence initial={false}>
                  {timeline.length > 0 ? (
                    [...timeline].reverse().map(event => (
                      <TimelineEntry key={event.id} event={event} />
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                      <LuRadio size={32} className="animate-pulse opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-center">Waiting for Kernel Events...</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Risk Matrix Panel */}
            <div className="glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-[0.2em] mb-6">
                <LuShieldAlert className="text-rose-400" /> Risk Matrix
              </h3>
              <div className="grid gap-4">
                <RiskIndicator label="Deadlock Risk" value={intelligence_state.deadlock_risk} color={intelligence_state.deadlock_risk === 'LOW' ? 'emerald' : intelligence_state.deadlock_risk === 'MODERATE' ? 'amber' : 'rose'} />
                <RiskIndicator label="Memory Stress" value={memory_metrics.utilization > 80 ? 'CRITICAL' : memory_metrics.utilization > 60 ? 'HIGH' : 'LOW'} color={memory_metrics.utilization > 80 ? 'rose' : memory_metrics.utilization > 60 ? 'amber' : 'emerald'} />
                <RiskIndicator label="Scheduler Load" value={cpu_metrics.utilization > 80 ? 'HIGH' : 'LOW'} color={cpu_metrics.utilization > 80 ? 'rose' : 'emerald'} />
                <RiskIndicator label="Disk Congestion" value={disk_metrics.queue_depth > 5 ? 'HIGH' : 'LOW'} color={disk_metrics.queue_depth > 5 ? 'rose' : 'emerald'} />
              </div>
            </div>

            {/* Subsystem Quick Status */}
            <div className="glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-[0.2em] mb-6">
                <LuSettings className="text-slate-400" /> Subsystems
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'FS_ENGINE', status: 'Active', load: filesystem_metrics?.inode_usage || 0, color: 'emerald' },
                  { name: 'DISK_CTRL', status: disk_metrics?.queue_depth > 0 ? 'Busy' : 'Idle', load: disk_metrics?.queue_depth || 0, color: disk_metrics?.queue_depth > 5 ? 'amber' : 'cyan' },
                  { name: 'HARDWARE_HAL', status: hardware_metrics?.connected ? 'Online' : 'Simulated', load: hardware_metrics?.command_throughput || 0, color: hardware_metrics?.connected ? 'emerald' : 'blue' },
                ].map(sub => (
                  <div key={sub.name} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full bg-${sub.color}-500 shadow-[0_0_8px_currentColor]`} />
                      <div>
                        <div className="text-[10px] font-black text-white uppercase tracking-wider">{sub.name}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase">{sub.status}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-white tabular-nums">{sub.load}</div>
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">IO_OPS</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsDashboard;
