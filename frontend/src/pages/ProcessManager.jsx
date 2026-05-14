import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProcessCreationForm from '../components/process/ProcessCreationForm';
import PCBTable from '../components/process/PCBTable';
import EventLogPanel from '../components/dashboard/EventLogPanel';
import ProcessStatistics from '../components/dashboard/ProcessStatistics';
import ProcessTreePanel from '../components/process/ProcessTreePanel';
import { LuTrash2, LuCpu, LuTerminal } from 'react-icons/lu';
import { useKernel } from '../context/KernelContext';
import { motion } from 'framer-motion';

const ProcessManager = () => {
  const { isLoading, resetSimulation } = useKernel();

  return (
    <DashboardLayout>
      <div className="relative min-h-screen">
        {/* Ambient Atmosphere Layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full animate-pulse opacity-50" />
            <div className="absolute bottom-[10%] -right-[5%] w-[400px] h-[400px] bg-secondary/10 blur-[120px] rounded-full animate-pulse-slow opacity-50" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
        </div>

        <div className="relative z-10 space-y-10 pb-20">
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
                          <LuCpu className="text-primary neon-text" size={32} />
                      </div>
                      <div>
                        <h1 className="text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">PROCESS MANAGER</h1>
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(0,255,157,0.8)] indicator-pulse" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">Kernel_PCB_Synchronization_Active</p>
                        </div>
                      </div>
                   </div>
                   <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-19">
                     Realtime hypervisor lifecycle management protocol. Interfacing with kernel-space PCB allocation tables and process state synchronization nodes.
                   </p>
                 </div>
                 
                 <div className="flex flex-col items-end gap-6">
                    <div className="flex items-center gap-8 px-6 py-3 glass-premium rounded-2xl border border-white/5 bg-white/[0.02]">
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron">Telemetry_Link</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(157,0,255,1)]" />
                                <span className="text-xs font-mono font-black text-white">L-882_CONNECTED</span>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron">Sync_Flux</span>
                            <span className="text-sm font-black text-secondary neon-text">842 OPS/S</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            if (window.confirm("CRITICAL ACTION: This will purge ALL processes, reset memory, and clear the deadlock state. Continue?")) {
                                resetSimulation();
                            }
                        }}
                        className="group/btn relative px-8 py-3.5 bg-error/10 hover:bg-error/20 text-error border border-error/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] font-orbitron transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        <div className="flex items-center gap-3 relative z-10">
                            <LuTrash2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                            <span>Hard_Kernel_Reset</span>
                        </div>
                    </button>
                 </div>
               </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <ProcessStatistics />
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form and Tree (4 cols) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="xl:col-span-4 space-y-8 flex flex-col"
            >
              <div className="flex-none">
                <ProcessCreationForm />
              </div>
              <div className="min-h-[400px]">
                <ProcessTreePanel />
              </div>
            </motion.div>

            {/* Right Column: PCB Table and Logs (8 cols) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="xl:col-span-8 space-y-8 flex flex-col"
            >
              <div className="min-h-[500px]">
                <PCBTable />
              </div>
              <div className="min-h-[300px]">
                <EventLogPanel />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProcessManager;
