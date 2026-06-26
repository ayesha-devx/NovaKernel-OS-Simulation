import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import TerminalPanel from '../components/dashboard/TerminalPanel';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import ReadyQueuePanel from '../components/scheduling/ReadyQueuePanel';
import { LuActivity, LuCpu, LuDatabase, LuHardDrive, LuShieldCheck, LuZap, LuRadio, LuNetwork } from 'react-icons/lu';
import { useKernel } from '../context/KernelContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const Dashboard = () => {
  const { kernelState, analyticsSummary, system } = useKernel();
  
  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Cinematic Header Banner */}
        <motion.div variants={itemVariants} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-magenta/10 to-transparent rounded-3xl sm:rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative glass-premium rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 border border-white/10 overflow-hidden">
             <div className="absolute inset-0 scanline-overlay opacity-20" />
             <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] -mr-32 -mt-32" />
             
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border">
                         <LuShieldCheck className="text-primary neon-text" size={24} />
                     </div>
                     <h1 className="text-2xl sm:text-4xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase">DASHBOARD</h1>
                  </div>
                   <p className="text-text/40 text-[10px] font-black uppercase tracking-[0.4em] sm:ml-13 ml-0">NOVA_KERNEL V1.0.0-STABLE-KERNEL</p>
                </div>
                
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 sm:gap-8 w-full lg:w-auto justify-between sm:justify-start">
                   <div className="flex flex-col items-start sm:items-end gap-1">
                     <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(0,255,157,0.8)] indicator-pulse" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-orbitron">Kernel_Sync</span>
                     </div>
                     <span className="text-xl font-black text-white neon-text">STABLE</span>
                   </div>
                   <div className="h-12 w-px bg-white/10 hidden md:block" />
                   <div className="flex flex-col items-start sm:items-end gap-1">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-orbitron">Protocol_Link</span>
                     <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-lg border border-secondary/20">
                         <LuRadio className="text-secondary text-xs animate-pulse" />
                         <span className="text-xs font-mono font-bold text-secondary uppercase">Active_Link</span>
                     </div>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* High-Tech Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Kernel Processes" 
            value={analyticsSummary.process_count || 0} 
            subValue="active threads" 
            icon={<LuActivity className="neon-text" />} 
            trend={analyticsSummary.process_count > 0 ? "STABLE" : "IDLE"} 
            color="primary" 
          />
          <StatCard 
            title="Core Utilization" 
            value={`${Math.round(analyticsSummary.cpu_utilization || 0)}%`} 
            subValue="logic load" 
            icon={<LuCpu className="neon-text-cyan" />} 
            trend={analyticsSummary.cpu_utilization > 80 ? "CRITICAL" : "OPTIMAL"} 
            color={analyticsSummary.cpu_utilization > 80 ? "error" : "secondary"} 
          />
          <StatCard 
            title="Logic Pressure" 
            value={`${Math.round(analyticsSummary.ram_pressure || 0)}%`} 
            subValue="segmental load" 
            icon={<LuDatabase className="neon-text" />} 
            trend={analyticsSummary.ram_pressure > 70 ? "STRESSED" : "STABLE"} 
            color={analyticsSummary.ram_pressure > 70 ? "warning" : "primary"} 
          />
          <StatCard 
            title="Kernel Integrity" 
            value={`${system?.health || 100}%`} 
            subValue="system score" 
            icon={<LuZap className="neon-text-cyan" />} 
            trend={system?.health === 100 ? "READY" : "REPAIR"} 
            color={system?.health === 100 ? "success" : "warning"} 
          />
        </motion.div>

        {/* Telemetry Visualizer Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
                {/* Advanced Scheduler Visualization */}
                <div className="holographic-panel rounded-3xl sm:rounded-[2rem] p-1">
                    <div className="glass-premium rounded-3xl sm:rounded-[1.9rem] p-4 sm:p-6 border-none h-full">
                        <ReadyQueuePanel minimal={true} />
                    </div>
                </div>

                {/* Real-time Telemetry Flux */}
                <div className="holographic-panel rounded-3xl sm:rounded-[2rem] p-1 h-[450px]">
                    <div className="glass-premium rounded-3xl sm:rounded-[1.9rem] p-4 sm:p-6 border-none h-full">
                        <ActivityFeed />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
                {/* Kernel Status Sidebar Widget */}
                <div className="glass-premium rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 border border-white/10 relative overflow-hidden group h-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(157,0,255,0.8)]" />
                        <h3 className="text-lg font-black text-white font-orbitron uppercase tracking-widest">System_Monitor</h3>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {[
                            { label: 'Core_Status', value: system?.status || 'INIT', color: 'text-primary' },
                            { label: 'Hypervisor_Uptime', value: `${system?.uptime || 0}s`, color: 'text-white' },
                            { label: 'Hardware_Sync', value: system?.hardware_connected ? 'CONNECTED' : 'EMULATED', color: system?.hardware_connected ? 'text-success' : 'text-slate-500' },
                            { label: 'Encryption_Key', value: 'SHA-512', color: 'text-slate-500' },
                            { label: 'Logic_Flow', value: 'OPTIMAL', color: 'text-secondary' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 group/row">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover/row:text-slate-400 transition-colors">{item.label}</span>
                                <span className={`text-xs font-mono font-bold ${item.color} group-hover/row:scale-105 transition-transform`}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Network_Flux</p>
                                <div className="flex items-center gap-2">
                                    <LuNetwork className="text-secondary animate-pulse" />
                                    <span className="text-sm font-black text-white font-orbitron">0.8 Gbps</span>
                                </div>
                            </div>
                            <div className="h-8 w-32 relative">
                                <div className="absolute inset-0 bg-secondary/10 rounded-lg" />
                                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary shadow-[0_0_8px_rgba(0,209,255,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Cinematic Terminal Integration */}
        <motion.div variants={itemVariants} className="h-80 relative">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl sm:rounded-[2.5rem] blur-2xl" />
            <TerminalPanel />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
