import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useProcess } from '../context/KernelContext';
import { 
  LuDatabase, 
  LuActivity, 
  LuHardDrive, 
  LuSettings,
  LuTerminal,
  LuRefreshCw,
  LuZap,
  LuShieldAlert,
  LuLayers
} from 'react-icons/lu';
import MemoryMap from '../components/memory/MemoryMap';
import { MemoryMetrics, MemoryHealthMonitor, FragmentationMatrix } from '../components/memory/MemoryStats';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
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

const Memory = () => {
  const { memoryStats = {}, memoryMap = { blocks: [] }, schedulerState = {}, isLoading } = useProcess();

  const setAlgorithm = async (algo) => {
    try {
      await axios.post(`${API_BASE_URL}/memory/algorithm`, { algorithm: algo });
      toast.success(`Memory policy: ${algo} active`);
    } catch (err) {
      toast.error("Kernel error");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="MEMORY_ORCHESTRATOR">
        <div className="flex items-center justify-center h-[60vh]">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_30px_rgba(157,0,255,0.5)]"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative min-h-screen">
        {/* Cinematic Atmospheric Layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[15%] -left-[10%] w-[600px] h-[600px] bg-primary/10 blur-[180px] rounded-full animate-pulse-slow opacity-50" />
            <div className="absolute bottom-[10%] -right-[5%] w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full animate-pulse opacity-40" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-0 cyber-grid opacity-[0.02]" />
        </div>

        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 space-y-12 pb-20"
        >
            {/* Cinematic RAM Control Banner */}
            <motion.div variants={itemVariants} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-magenta/5 to-transparent rounded-3xl sm:rounded-[3rem] blur-3xl opacity-30 group-hover:opacity-60 transition-opacity" />
                <div className="relative glass-premium rounded-3xl sm:rounded-[3rem] p-4 sm:p-8 md:p-12 border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(157,0,255,0.05)]">
                   <div className="absolute inset-0 scanline-overlay opacity-30" />
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
                   
                   <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-12 relative z-10">
                      <div className="space-y-4 sm:space-y-6 w-full lg:w-auto">
                        <div className="flex items-center gap-4 sm:gap-8">
                           <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border shadow-[0_0_30px_rgba(157,0,255,0.2)] shrink-0">
                               <LuDatabase className="text-primary neon-text" size={24} />
                           </div>
                           <div>
                             <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-2">MEMORY MANAGER</h1>
                             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                 <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_12px_#00D1FF] indicator-pulse" />
                                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest font-orbitron">Kernel_Memory_Active</span>
                                 </div>
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest sm:tracking-[0.4em] font-orbitron opacity-60">Physical_Address_Mode: ACTIVE</span>
                             </div>
                           </div>
                        </div>
                        <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-0 sm:ml-28">
                          Advanced physical memory allocation orchestrator. Managing real-time paging, segmentation, and structural integrity of the kernel heap.
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 bg-black/40 p-4 rounded-2xl sm:rounded-[2rem] border border-white/5 backdrop-blur-md w-full lg:w-auto">
                         <div className="text-center px-4 sm:px-8 border-r border-white/5 flex-1 sm:flex-none">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-orbitron">Current_Policy</p>
                            <p className="text-base sm:text-lg font-black text-white font-orbitron neon-text-cyan">{memoryStats.current_algorithm?.replace('_', ' ')}</p>
                         </div>
                         <div className="text-center px-4 sm:px-8 flex-1 sm:flex-none">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-orbitron">Heap_Status</p>
                            <p className="text-base sm:text-lg font-black text-success font-orbitron neon-text-success">SYNCHRONIZED</p>
                         </div>
                      </div>
                   </div>
                </div>
            </motion.div>

            {/* Top Metrics Grid */}
            <motion.div variants={itemVariants}>
                <MemoryMetrics />
            </motion.div>

            {/* Main Diagnostics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
               {/* Left Column: RAM Map Visualizer (8 cols) */}
               <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6 lg:space-y-12">
                  <div className="glass-premium rounded-3xl sm:rounded-[3.5rem] border border-white/10 p-4 sm:p-8 md:p-12 relative overflow-hidden group shadow-[0_0_50px_rgba(0,209,255,0.05)]">
                    <div className="absolute inset-0 scanline-overlay opacity-10" />
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 sm:mb-12 gap-6 sm:gap-8 relative z-10">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3 sm:gap-4 font-orbitron tracking-tight">
                          <LuLayers className="text-secondary neon-text-cyan shrink-0" size={24} /> HOLOGRAPHIC_RAM_MAP
                        </h3>
                        <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-[0.4em] font-orbitron opacity-60">Physical_Sector_Diagnostic_Visualizer</p>
                      </div>
                      
                      <div className="flex bg-black/60 p-1.5 rounded-[1.2rem] border border-white/10 shadow-2xl backdrop-blur-xl w-full md:w-auto justify-between">
                        {[
                          { id: 'FIRST_FIT', icon: <LuZap size={14} /> },
                          { id: 'BEST_FIT', icon: <LuActivity size={14} /> }
                        ].map((algo) => (
                          <button 
                            key={algo.id}
                            onClick={() => setAlgorithm(algo.id)} 
                            className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[8px] sm:text-[9px] font-black tracking-wider sm:tracking-widest transition-all font-orbitron"
                            style={memoryStats.current_algorithm === algo.id ? { background: 'linear-gradient(to right, var(--color-cyan), #2563EB)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 0 30px rgba(0,209,255,0.4)' } : { color: '#64748b' }}
                          >
                            {algo.icon}
                            {algo.id.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <MemoryMap />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
                     <FragmentationMatrix />
                     <MemoryHealthMonitor />
                  </div>
               </motion.div>

               {/* Right Column: Kernel Control & Journal (4 cols) */}
               <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6 lg:space-y-12">
                  <div className="glass-premium rounded-3xl sm:rounded-[3rem] border border-white/10 p-4 sm:p-8 md:p-10 relative overflow-hidden group shadow-[0_0_40px_rgba(255,77,109,0.05)]">
                     <div className="absolute inset-0 scanline-overlay opacity-10 pointer-events-none" />
                     
                     <div className="flex items-center gap-4 sm:gap-5 mb-8 sm:mb-10">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-error/20 border border-error/30 flex items-center justify-center neon-border-error shadow-[0_0_20px_rgba(255,77,109,0.2)] shrink-0">
                            <LuSettings className="text-error neon-text-error" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black text-white font-orbitron tracking-[0.2em] uppercase">KERNEL_CONTROL</h3>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 font-orbitron">Privileged_Instruction_Node</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="p-4 sm:p-6 rounded-[2rem] bg-error/5 border border-error/10 relative group/btn overflow-hidden">
                           <div className="absolute inset-0 bg-error/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                           <p className="text-[9px] font-black text-error uppercase tracking-[0.3em] mb-4 font-orbitron text-center">CRITICAL_ACTION_REQUIRED</p>
                           <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={async () => {
                              if (window.confirm("CONFIRM_MEMORY_PURGE: All allocated blocks will be de-referenced. Proceed?")) {
                                await axios.post(`${API_BASE_URL}/memory/reset`);
                                toast.info("RAM Reset Synchronized");
                              }
                            }}
                            className="w-full py-5 bg-gradient-to-r from-error to-[#B91C1C] text-white rounded-2xl font-black text-[11px] font-orbitron tracking-[0.3em] shadow-xl shadow-error/20 flex items-center justify-center gap-3 relative z-10"
                          >
                            <LuRefreshCw size={16} className="animate-spin-slow" />
                            RESET_RAM_STATE
                          </motion.button>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                           <LuShieldAlert className="text-slate-500 shrink-0" size={16} />
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono-cyber leading-relaxed">
                              Warning: RAM state purge is an irreversible kernel operation. All physical address mappings will be destroyed.
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="glass-premium rounded-3xl sm:rounded-[3rem] border border-white/10 p-4 sm:p-8 md:p-10 relative overflow-hidden group shadow-[0_0_40px_rgba(0,209,255,0.05)] h-fit">
                     <div className="absolute inset-0 scanline-overlay opacity-5 pointer-events-none" />
                     
                     <div className="flex items-center gap-4 sm:gap-5 mb-8 sm:mb-10">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center neon-border-secondary shrink-0">
                            <LuTerminal className="text-secondary neon-text-cyan" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black text-white font-orbitron tracking-[0.2em] uppercase">PHYS_JOURNAL</h3>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 font-orbitron">Memory_Transaction_Log</p>
                        </div>
                     </div>

                     <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {memoryMap.blocks?.filter(b => b.status === 'ALLOCATED').length > 0 ? (
                           memoryMap.blocks?.filter(b => b.status === 'ALLOCATED').map((b, i) => (
                             <motion.div 
                               key={i} 
                               initial={{ x: -20, opacity: 0 }}
                               animate={{ x: 0, opacity: 1 }}
                               transition={{ delay: i * 0.05 }}
                               className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-primary/30 transition-all group/item"
                             >
                                <div className="w-2.5 h-2.5 rounded-full bg-primary group-hover/item:shadow-[0_0_10px_#9D00FF] transition-all" />
                                <div className="flex-1 min-w-0">
                                   <p className="text-[10px] font-black text-white uppercase tracking-wider font-orbitron truncate">{b.process_name}</p>
                                   <p className="text-[8px] text-slate-500 font-mono-cyber uppercase font-black">ADDR: 0x{b.start_address.toString(16).toUpperCase().padStart(4, '0')}</p>
                                </div>
                                <div className="text-right">
                                   <span className="text-[10px] font-black text-primary font-mono-cyber">{b.size}MB</span>
                                   <div className="w-full h-[1px] bg-primary/20 mt-1" />
                                </div>
                             </motion.div>
                           ))
                        ) : (
                          <div className="py-20 text-center opacity-30">
                             <LuDatabase className="mx-auto mb-4" size={32} />
                             <p className="text-[10px] font-black font-orbitron uppercase tracking-widest">Journal_Empty</p>
                          </div>
                        )}
                     </div>
                  </div>
               </motion.div>
            </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Memory;
