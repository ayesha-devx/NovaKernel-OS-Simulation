import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useKernel } from '../context/KernelContext';
import logoN from '../assets/logo-n.png';
import { 
  LuCpu, 
  LuActivity, 
  LuHardDrive, 
  LuShieldCheck, 
  LuServer, 
  LuLayers,
  LuTerminal,
  LuZap,
  LuRadiation,
  LuMonitor,
  LuBoxes,
  LuWifi,
  LuShieldAlert,
  LuBrainCircuit,
  LuMousePointer2,
  LuNetwork
} from 'react-icons/lu';

// --- Local UI Components ---

const MetricCard = ({ title, value, icon, color = "primary", trend, sparkline = [] }) => {
  const colorMap = {
    primary: "text-primary card-theme-primary bg-primary/5",
    purple: "text-accent-purple card-theme-purple bg-accent-purple/5",
    success: "text-success card-theme-success bg-success/5",
    warning: "text-warning card-theme-warning bg-warning/5",
    error: "text-error card-theme-error bg-error/5",
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.03 }}
      className={`relative overflow-hidden glass-premium p-6 rounded-[2rem] ${colorMap[color]} group transition-all duration-500`}
    >
      <div className="absolute inset-0 shimmer-sweep opacity-0 group-hover:opacity-20 transition-opacity" />
      
      {/* Corner Glow */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity ${color === 'primary' ? 'bg-primary' : 'bg-accent-purple'}`} />

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className={`p-3 rounded-2xl border transition-all duration-500 ${
          color === 'primary' ? 'bg-primary/10 border-primary/30 text-primary group-hover:shadow-[0_0_15px_rgba(157,0,255,0.3)]' :
          color === 'purple' ? 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]' :
          color === 'success' ? 'bg-success/10 border-success/30 text-success group-hover:shadow-[0_0_15px_rgba(0,255,157,0.3)]' :
          'bg-white/5 border-white/10 text-white group-hover:border-primary/50 group-hover:neon-border'
        }`}>
          {icon}
        </div>
        {trend && (
          <div className="flex flex-col items-end">
             <span className={`text-[10px] font-mono-cyber font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border border-white/5 bg-white/5 ${color === 'primary' ? 'text-primary' : 'text-accent-purple'}`}>
              {trend}
            </span>
          </div>
        )}
      </div>
      <div className="relative z-10">
        <h4 className="text-[10px] font-orbitron font-black uppercase tracking-[0.3em] text-slate-500 mb-2 group-hover:text-slate-300 transition-colors">
          {title}
        </h4>
        <div className="text-4xl font-black font-orbitron tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 group-hover:neon-text transition-all duration-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
          {value}
        </div>
      </div>
      
      {/* Mini Sparkline with Gradient */}
      <div className="mt-6 h-10 flex items-end gap-1.5 opacity-30 group-hover:opacity-100 transition-all duration-700">
        {[...Array(12)].map((_, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${Math.random() * 80 + 20}%` }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse', delay: i * 0.08 }}
            className={`w-full rounded-t-sm shadow-[0_0_10px_rgba(0,245,255,0.3)] ${
              color === 'primary' ? 'bg-gradient-to-t from-primary/20 to-primary' : 
              color === 'purple' ? 'bg-gradient-to-t from-accent-purple/20 to-accent-purple' : 
              'bg-gradient-to-t from-white/20 to-white'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

const RadialProgress = ({ value, label, size = 150, color = "#00F5FF", icon: Icon }) => {
  const radius = (size / 2) - 15;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center group">
      {/* Animated Glow Rings */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ backgroundColor: color }}
      />
      
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <defs>
          <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="10"
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#grad-${label})`}
          strokeWidth="10"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: "circOut" }}
          fill="transparent"
          strokeLinecap="round"
          filter="url(#glow)"
          className="drop-shadow-[0_0_15px_rgba(0,245,255,0.6)]"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
        <div className="relative">
            <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 blur-md opacity-50"
                style={{ color }}
            >
                {Icon && <Icon className="text-2xl" />}
            </motion.div>
            {Icon && <Icon className="text-2xl mb-1 relative" style={{ color }} />}
        </div>
        <span className="text-2xl font-black font-orbitron text-white neon-text tracking-tighter">{value}%</span>
      </div>
      <span className="mt-6 text-[10px] font-orbitron font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
};

const WaveformMonitor = ({ color = "#00F5FF" }) => (
  <div className="flex items-center gap-0.5 h-6">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ height: [4, 16, 8, 24, 4] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
        className="w-0.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    ))}
  </div>
);

// --- Main Page Component ---

const KernelOverview = () => {
  const { metrics = {}, isConnected, system = {}, logs = [], kernelState = {} } = useKernel();
  const { uptime = 0, health = 100, hardware_connected = false, subsystems = {} } = system;

  const recentLogs = useMemo(() => logs.slice(-15).reverse(), [logs]);
  const subsystemList = useMemo(() => [
    { id: 'process_manager', name: 'PROC_MGR', icon: <LuServer /> },
    { id: 'scheduler', name: 'CPU_SCHED', icon: <LuCpu /> },
    { id: 'memory_manager', name: 'MEM_MGR', icon: <LuLayers /> },
    { id: 'file_system', name: 'FS_IO', icon: <LuHardDrive /> },
    { id: 'network_stack', name: 'NET_STACK', icon: <LuNetwork /> },
    { id: 'security_core', name: 'SEC_CORE', icon: <LuShieldCheck /> },
  ], []);

  // Format uptime for counter
  const [displayUptime, setDisplayUptime] = useState(uptime);
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setDisplayUptime(uptime);
  }, [uptime]);

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout title="KERNEL CONTROL CENTER">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background" />
        <div className="scanline-overlay opacity-10" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-6 pb-12"
      >
        {/* 1️⃣ Compact Hero Header */}
        <motion.div 
            variants={itemVariants}
            className="relative holographic-panel p-10 rounded-[2.5rem] border border-primary/40 overflow-hidden group shadow-[0_0_50px_rgba(0,245,255,0.15)]"
        >
            {/* Animated Aura Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent-purple/10 opacity-30" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent-purple/20 rounded-full blur-[100px] animate-pulse-slow" />

            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <LuShieldCheck size={180} className="text-primary indicator-pulse" />
            </div>
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                <div className="flex items-center gap-10">
                    {/* Core Visualization */}
                    <div className="relative group ml-8 lg:ml-2">
                        {/* Outer Orbit */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[-35px] rounded-full border border-dashed border-primary/30"
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_15px_#9D00FF]" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 bg-secondary rounded-full shadow-[0_0_15px_#00D1FF]" />
                        </motion.div>
                        
                        {/* Middle Scanner Ring */}
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[-20px] rounded-full border-2 border-accent-purple/50 border-t-transparent border-b-transparent"
                        />

                        {/* Inner High-Speed Ring */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[-5px] rounded-full border-2 border-secondary/60 border-l-transparent border-r-transparent"
                        />

                        {/* Central Core */}
                        <div className="relative w-24 h-24 rounded-full bg-black/60 backdrop-blur-xl flex items-center justify-center border-2 border-primary shadow-[0_0_40px_rgba(157,0,255,0.5)] overflow-hidden">
                            {/* Core Energy Pulse */}
                            <motion.div 
                                animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.2, 0.8, 0.2] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-secondary/50 rounded-full blur-md"
                            />
                            
                            {/* Icon Pulse */}
                            <motion.div
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
                                className="relative z-10"
                            >
                                <LuZap className="text-4xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="text-center lg:text-left">
                        <div className="flex flex-col gap-2 mb-6">
                            <div className="flex items-center gap-5">
                                <motion.h1 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="text-6xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none"
                                >
                                    NOVA OVERVIEW
                                </motion.h1>
                            </div>
                            <motion.h3 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                className="text-2xl font-black text-secondary font-orbitron tracking-[0.2em] neon-text-cyan uppercase leading-none opacity-90 ml-9 mt-1"
                            >
                                V1.0.0 STABLE OS
                            </motion.h3>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="flex items-center gap-3 px-4 py-1.5 glass-premium bg-primary/10 rounded-full border border-primary/30 shadow-[0_0_15px_rgba(157,0,255,0.2)] hover:shadow-[0_0_20px_rgba(157,0,255,0.4)] transition-all"
                            >
                                <LuActivity className="text-primary text-xs" />
                                <span className="text-[10px] font-black font-mono-cyber text-primary uppercase tracking-[0.2em]">CORE_STATUS:</span>
                                <span className="text-[10px] font-black font-mono-cyber text-primary neon-text">READY_OPTIMAL</span>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="flex items-center gap-3 px-4 py-1.5 glass-premium bg-secondary/10 rounded-full border border-secondary/30 shadow-[0_0_15px_rgba(0,209,255,0.2)] hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] transition-all"
                            >
                                <LuTerminal className="text-secondary text-xs" />
                                <span className="text-[10px] font-black font-mono-cyber text-secondary uppercase tracking-[0.2em]">BOOT_TIME:</span>
                                <span className="text-[10px] font-black font-mono-cyber text-white">{formatUptime(displayUptime)}</span>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="flex items-center gap-3 px-4 py-1.5 glass-premium bg-secondary/10 rounded-full border border-secondary/30 shadow-[0_0_15px_rgba(0,209,255,0.2)] hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] transition-all"
                            >
                                <LuShieldCheck className="text-secondary text-xs" />
                                <span className="text-[10px] font-black font-mono-cyber text-secondary uppercase tracking-[0.2em]">INTEGRITY:</span>
                                <span className="text-[10px] font-black font-mono-cyber text-white">{health}%</span>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex gap-8 items-center bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl"
                >
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-orbitron font-black text-slate-400 uppercase tracking-[0.4em] mb-2">LINK_PROTOCOL</span>
                        <div className={`px-5 py-2.5 rounded-2xl border-2 flex items-center gap-4 transition-all duration-500 ${isConnected ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_rgba(0,245,255,0.3)]' : 'bg-error/20 border-error/40 text-error shadow-[0_0_20px_rgba(255,77,109,0.3)]'}`}>
                            <LuWifi className={isConnected ? 'animate-pulse text-lg' : 'text-lg'} />
                            <span className="text-sm font-black font-orbitron tracking-[0.2em]">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-16 bg-white/10 mx-2" />
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-orbitron font-black text-slate-400 uppercase tracking-[0.4em] mb-2">TELEMETRY_LOAD</span>
                        <div className="flex items-center gap-4">
                            <WaveformMonitor color="#FF00E5" />
                            <span className="text-2xl font-black font-orbitron text-white neon-text">LOW</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>

        {/* 2️⃣ Dense Top Metric Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <MetricCard 
             title="CORE_COMPUTE" 
             value={`${metrics.cpu_utilization}%`} 
             icon={<LuCpu size={20} />} 
             color="primary" 
             trend="+2.4% SEC" 
           />
           <MetricCard 
             title="MEMORY_PRESSURE" 
             value={`${metrics.ram_pressure}%`} 
             icon={<LuActivity size={20} />} 
             color="primary" 
             trend="STABLE" 
           />
           <MetricCard 
             title="LOGIC_FLOW" 
             value={metrics.process_throughput} 
             icon={<LuBoxes size={20} />} 
             color="success" 
             trend="OPS/MIN" 
           />
           <MetricCard 
             title="HARDWARE_SYNC" 
             value={hardware_connected ? "ACTIVE" : "VOID"} 
             icon={<LuHardDrive size={20} />} 
             color={hardware_connected ? "primary" : "warning"} 
             trend="REALTIME"
           />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3️⃣ Main Analytics Section + 4️⃣ Realtime Telemetry Feed */}
            <div className="lg:col-span-2 space-y-6">
                {/* Analytics Section */}
                <motion.div 
                    variants={itemVariants}
                    className="glass-premium bg-panel-dark/40 rounded-3xl p-8 card-theme-primary relative overflow-hidden transition-all duration-500"
                >
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex flex-col">
                            <h3 className="text-xs font-orbitron font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                                <LuBrainCircuit className="text-primary" /> SYSTEM_ANALYTICS_HUB
                            </h3>
                            <span className="text-[9px] font-mono-cyber text-slate-500 uppercase tracking-widest mt-1">Realtime telemetry visualization engine</span>
                        </div>
                        <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary/20" />
                             <div className="w-2 h-2 rounded-full bg-primary/40" />
                             <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,245,255,1)]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <RadialProgress value={metrics.cpu_utilization} label="CPU_LOAD" color="#FF00E5" icon={LuCpu} />
                        <RadialProgress value={metrics.ram_pressure} label="MEM_PRES" color="#00F5FF" icon={LuLayers} />
                        <div className="flex flex-col justify-center gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-orbitron font-bold uppercase tracking-widest">
                                    <span className="text-slate-500">I/O_THROUGHPUT</span>
                                    <span className="text-primary">{kernelState.socket?.event_throughput || 0} E/S</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        animate={{ width: `${Math.min((kernelState.socket?.event_throughput || 0) * 10, 100)}%` }}
                                        className="h-full bg-primary shadow-[0_0_10px_rgba(0,245,255,0.5)]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-orbitron font-bold uppercase tracking-widest">
                                    <span className="text-slate-500">THREAD_POOL</span>
                                    <span className="text-accent-purple">88.4%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        animate={{ width: '88.4%' }}
                                        className="h-full bg-accent-purple shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-orbitron font-bold uppercase tracking-widest">
                                    <span className="text-slate-500">NETWORK_LATENCY</span>
                                    <span className="text-success">2ms</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        animate={{ width: '15%' }}
                                        className="h-full bg-success shadow-[0_0_10px_rgba(0,255,157,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-orbitron font-bold text-slate-500 uppercase tracking-widest">PROCESS_LATENCY_HISTOGRAM</span>
                            <WaveformMonitor color="#38BDF8" />
                        </div>
                        <div className="h-32 w-full flex items-end gap-1.5">
                            {[...Array(40)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.random() * 60 + 20}%` }}
                                    transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                                    className="flex-1 bg-gradient-to-t from-primary/5 to-primary/40 rounded-t-sm border-t border-primary/30"
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Telemetry Feed */}
                <motion.div 
                    variants={itemVariants}
                    className="glass-premium bg-panel-darker/80 rounded-[2.5rem] p-10 card-theme-primary relative overflow-hidden flex flex-col h-[500px]"
                >
                    {/* Scanline and Grid for Terminal */}
                    <div className="absolute inset-0 scanline-overlay opacity-20 pointer-events-none" />
                    <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />

                    <div className="flex justify-between items-center mb-8 shrink-0 relative z-10">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-orbitron font-black text-white flex items-center gap-3 uppercase tracking-[0.5em]">
                                <LuTerminal className="text-primary neon-text" /> KERNEL_TELEMETRY_LOG
                            </h3>
                            <p className="text-[10px] font-mono-cyber text-slate-500 uppercase tracking-widest mt-1">Direct stream from hypervisor bus v11.0</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 text-[10px] font-black font-mono-cyber text-primary">
                                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,245,255,1)] animate-pulse" />
                                LIVE_FEED
                            </div>
                            <button className="text-[10px] font-orbitron font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5">
                                PURGE_BUFFER
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-2 relative z-10 overflow-y-auto scrollbar-hide mask-fade-bottom font-mono-cyber p-4 bg-black/40 rounded-2xl border border-white/5">
                        <AnimatePresence initial={false}>
                            {recentLogs.map((log, idx) => (
                                <motion.div 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    key={log.id || idx} 
                                    className={`flex items-start gap-5 px-5 py-2.5 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group`}
                                >
                                    <span className="text-[10px] text-slate-600 min-w-[85px] tabular-nums mt-1">{log.timestamp}</span>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border min-w-[90px] text-center uppercase ${
                                        log.severity === 'SUCCESS' ? 'text-success border-success/20 bg-success/10' :
                                        log.severity === 'WARNING' ? 'text-warning border-warning/20 bg-warning/10' :
                                        log.severity === 'ERROR' ? 'text-error border-error/20 bg-error/10' :
                                        'text-primary border-primary/20 bg-primary/10'
                                    }`}>
                                        {log.module}
                                    </span>
                                    <div className="text-xs text-slate-300 flex-1 leading-relaxed group-hover:text-white transition-colors">
                                        <span className="text-primary font-bold mr-2">»</span>
                                        {typeof log.message === 'object' ? JSON.stringify(log.message) : log.message}
                                        {idx === 0 && <span className="terminal-cursor shadow-[0_0_8px_rgba(0,245,255,1)]" />}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* 5️⃣ Right-side Monitoring Stack */}
            <div className="space-y-6">
                {/* AI & Smart Insights */}
                <motion.div variants={itemVariants} className="glass-premium bg-accent-purple/5 rounded-3xl p-6 card-theme-purple relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <LuBrainCircuit size={60} className="text-accent-purple" />
                    </div>
                    <h3 className="text-[10px] font-orbitron font-black text-accent-purple mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                        <LuBrainCircuit /> AI_KERNEL_INSIGHTS
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-accent-purple/10 border border-accent-purple/20 rounded-2xl relative">
                            <div className="absolute top-2 right-2 flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-accent-purple animate-ping" />
                            </div>
                            <p className="text-[11px] font-space text-slate-300 leading-relaxed">
                                <span className="text-accent-purple font-bold mr-1">ANALYSIS:</span> 
                                Memory fragmentation is increasing in Sector 7. Recommend automated compaction cycle.
                            </p>
                        </div>
                        <button className="w-full py-3 bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple text-[10px] font-orbitron font-black rounded-xl border border-accent-purple/30 transition-all uppercase tracking-widest">
                             EXECUTE_OPTIMIZATION
                        </button>
                    </div>
                </motion.div>

                {/* Subsystem Stack */}
                <motion.div variants={itemVariants} className="glass-premium bg-panel-dark/40 rounded-3xl p-6 card-theme-primary">
                    <h3 className="text-[10px] font-orbitron font-black text-slate-400 mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                        <LuMonitor className="text-primary" /> SYSTEM_NODE_MONITOR
                    </h3>
                    <div className="space-y-3">
                        {subsystemList.map((sub, i) => (
                            <motion.div 
                                key={i} 
                                whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-black/20 text-slate-500 group-hover:text-primary transition-colors">{sub.icon}</div>
                                    <span className="text-[10px] font-orbitron font-bold text-white/70 uppercase tracking-widest group-hover:text-white transition-colors">{sub.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <div className={`w-1.5 h-1.5 rounded-full ${subsystems[sub.id] === 'HEALTHY' ? 'bg-success shadow-[0_0_8px_rgba(0,255,157,1)]' : 'bg-warning shadow-[0_0_8px_rgba(255,200,87,1)]'} indicator-pulse`} />
                                     <span className={`text-[8px] font-mono-cyber font-bold uppercase ${subsystems[sub.id] === 'HEALTHY' ? 'text-success' : 'text-warning'}`}>
                                        {subsystems[sub.id] || 'SYNCING'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Network Activity */}
                <motion.div variants={itemVariants} className="glass-premium bg-panel-dark/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                    <h3 className="text-[10px] font-orbitron font-black text-slate-400 mb-4 flex items-center gap-3 uppercase tracking-[0.2em]">
                        <LuNetwork className="text-electric-blue" /> TRAFFIC_HUB
                    </h3>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <span className="text-xl font-black font-orbitron text-white">42.8 <span className="text-[10px] text-slate-500">MB/S</span></span>
                        </div>
                        <div className="h-8 flex items-end gap-1">
                            {[...Array(10)].map((_, i) => (
                                <motion.div 
                                    key={i}
                                    animate={{ height: [`${Math.random() * 100}%`, `${Math.random() * 100}%`] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    className="w-1 bg-electric-blue/40 rounded-t-sm"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-orbitron font-black text-slate-500 uppercase tracking-widest">
                            <span>RECV</span>
                            <span className="text-electric-blue">12.5 MB/S</span>
                        </div>
                        <div className="flex justify-between text-[8px] font-orbitron font-black text-slate-500 uppercase tracking-widest">
                            <span>SENT</span>
                            <span className="text-accent-purple">30.3 MB/S</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* 6️⃣ Kernel Subsystem Status Grid - Full Width Bottom */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
             {subsystemList.map((sub, i) => (
                <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05, borderColor: 'rgba(0, 245, 255, 0.6)', backgroundColor: 'rgba(0, 245, 255, 0.05)' }}
                    className="glass-premium bg-white/5 p-6 rounded-[1.5rem] border border-white/10 flex flex-col items-center gap-4 group transition-all duration-500 relative overflow-hidden"
                >
                    <div className="absolute inset-0 shimmer-sweep opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="text-2xl text-slate-500 group-hover:text-primary group-hover:drop-shadow-[0_0_12px_rgba(0,245,255,0.8)] transition-all duration-500">
                        {sub.icon}
                    </div>
                    <div className="text-center relative z-10">
                        <p className="text-[10px] font-orbitron font-black text-white/80 group-hover:text-white uppercase tracking-widest transition-colors">{sub.name}</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${subsystems[sub.id] === 'HEALTHY' ? 'bg-success shadow-[0_0_8px_rgba(0,255,157,1)]' : 'bg-warning shadow-[0_0_8px_rgba(255,200,87,1)]'} animate-pulse`} />
                            <span className={`text-[8px] font-black font-mono-cyber uppercase ${subsystems[sub.id] === 'HEALTHY' ? 'text-success' : 'text-warning'}`}>
                                {subsystems[sub.id] || 'SYNCING'}
                            </span>
                        </div>
                    </div>
                </motion.div>
             ))}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default KernelOverview;

