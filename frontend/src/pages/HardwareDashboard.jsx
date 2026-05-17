import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuCpu, LuActivity, LuZap, LuTerminal, LuSettings, LuPower, LuHistory } from 'react-icons/lu';
import { useKernel } from '../context/KernelContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import VirtualLedBoard from '../components/hardware/VirtualLedBoard';

const HardwareDashboard = () => {
  const { hardwareState, halLogs, toggleHardwareSimulation } = useKernel();
  const [activeTab, setActiveTab] = useState('monitor');

  if (!hardwareState) return <div className="p-20 text-white">Initializing Hardware HAL...</div>;

  const stats = [
    { label: 'Mode', value: hardwareState.mode || (hardwareState.simulation_mode ? 'SIMULATION' : 'REAL'), icon: LuPower, color: hardwareState.simulation_mode ? 'text-amber-400' : 'text-emerald-400' },
    { label: 'Status', value: hardwareState.status || 'SIMULATION', icon: LuActivity, color: hardwareState.status === 'READY' ? 'text-emerald-400' : 'text-amber-400' },
    { label: 'Port', value: hardwareState.port || 'VIRTUAL', icon: LuSettings, color: 'text-primary' },
    { label: 'Latency', value: `${hardwareState.latency_ms}ms`, icon: LuZap, color: 'text-cyan-400' },
  ];

  return (
    <DashboardLayout title="HARDWARE HAL">
      <div className="space-y-8 pb-12">
      {/* Cinematic Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group mb-12"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-magenta/5 to-transparent rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
        <div className="relative glass-premium rounded-[2.5rem] p-10 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(157,0,255,0.05)]">
           <div className="absolute inset-0 scanline-overlay opacity-20" />
           <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 blur-[120px] -mr-40 -mt-40" />
           
           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
             <div className="space-y-4">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border">
                      <LuCpu className="text-primary neon-text" size={32} />
                  </div>
                  <div>
                    <h1 className="text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">HARDWARE HAL</h1>
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(0,255,157,0.8)] indicator-pulse" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">NovaOS Hardware Abstraction Layer v1.1</p>
                    </div>
                  </div>
               </div>
               <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-19">
                 Interfacing with virtualized I/O registers and physical device drivers. Monitoring real-time latency and command throughput across kernel-to-hardware bridges.
               </p>
             </div>
             
             <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
               <button 
                 onClick={() => toggleHardwareSimulation(true)}
                 className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] font-orbitron transition-all ${hardwareState.simulation_mode ? 'bg-primary text-white shadow-[0_0_20px_rgba(157,0,255,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
               >
                 Simulation_Mode
               </button>
               <button 
                 onClick={() => toggleHardwareSimulation(false)}
                 className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] font-orbitron transition-all ${!hardwareState.simulation_mode ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
               >
                 Real_Hardware
               </button>
             </div>
           </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="glass p-6 rounded-3xl border border-white/5 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{stat.label}</p>
                <p className={`text-xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color.replace('text', 'bg').replace('-400', '-500/10')}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-400px)]">
        {/* Left Column: Board Simulation */}
        <div className="lg:col-span-8 space-y-8 flex flex-col">
          <div className="glass rounded-[3rem] border border-white/5 p-12 flex-1 relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="mb-12 text-center">
               <h3 className="text-sm font-black text-white uppercase tracking-[0.4em]">Digital Twin Virtual Board</h3>
               <p className="text-[10px] text-white/20 uppercase tracking-widest mt-2">Real-time IO Synchronization Engine</p>
            </div>

            <VirtualLedBoard />
          </div>
        </div>

        {/* Right Column: Logs & Commands */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           {/* Command Stream */}
           <div className="glass rounded-[2.5rem] border border-white/5 p-6 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-6 px-2">
                 <div className="flex items-center gap-3">
                    <LuTerminal className="text-primary" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Hardware Logs</h3>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase">Live</span>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar px-2">
                 <AnimatePresence initial={false}>
                    {halLogs.map((log, i) => (
                       <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                       >
                          <div className="flex items-center justify-between mb-1">
                             <span className={`text-[8px] font-black uppercase ${log.severity === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {log.event_type || 'SYSTEM'}
                             </span>
                             <span className="text-[8px] font-mono text-white/20">{log.timestamp}</span>
                          </div>
                          <p className="text-[10px] text-white/70 leading-relaxed font-mono">{log.message}</p>
                       </motion.div>
                    ))}
                 </AnimatePresence>
                 {halLogs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                       <LuHistory size={32} />
                       <p className="text-[10px] font-black uppercase tracking-widest">No Recent Activity</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Command History */}
           <div className="glass rounded-[2.5rem] border border-white/5 p-6 h-1/3 overflow-hidden flex flex-col">
              <div className="flex items-center gap-3 mb-6 px-2">
                 <LuZap className="text-cyan-400" />
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">Command Stream</h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 font-mono px-2">
                 {(hardwareState.command_history || []).map((cmd, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-white/5 text-[9px]">
                       <span className="text-white/40">[{cmd.timestamp}]</span>
                       <span className="text-primary font-bold">{cmd.command}</span>
                       <span className="text-white/20">ACK</span>
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

export default HardwareDashboard;
