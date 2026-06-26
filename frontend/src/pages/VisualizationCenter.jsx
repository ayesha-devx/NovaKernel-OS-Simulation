import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useKernel } from '../context/KernelContext';
import GanttChart from '../components/visualization/GanttChart';
import QueueVisualizer from '../components/visualization/QueueVisualizer';
import TopologyGraph from '../components/visualization/TopologyGraph';
import MemoryVisualizer from '../components/visualization/MemoryVisualizer';
import DiskTrajectory from '../components/visualization/DiskTrajectory';
import DeadlockGraphVisualizer from '../components/visualization/DeadlockGraphVisualizer';
import { FiEye, FiActivity, FiZap, FiGrid } from 'react-icons/fi';

const VisualizationCenter = () => {
  const { kernelState } = useKernel();

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Cinematic Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-magenta/5 to-transparent rounded-3xl sm:rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative glass-premium rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-10 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(157,0,255,0.05)]">
             <div className="absolute inset-0 scanline-overlay opacity-20" />
             <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 blur-[120px] -mr-40 -mt-40" />
             
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 relative z-10">
               <div className="space-y-4 w-full lg:w-auto">
                 <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border shrink-0 shadow-[0_0_20px_rgba(157,0,255,0.2)]">
                        <FiEye className="text-primary neon-text" size={24} />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">KERNEL OBSERVATORY</h1>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_#00FF9D] indicator-pulse" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">Advanced Realtime Visualization & Observability Engine</p>
                          </div>
                      </div>
                    </div>
                 </div>
                 <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-0 sm:ml-19">
                   Holographic telemetry and resource allocation maps. Synchronizing kernel state with the visual buffer for sub-millisecond observability precision.
                 </p>
               </div>
               
               <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-10 w-full lg:w-auto">
                 <div className="bg-[#050816]/60 border border-[#00FF9D]/20 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-[1.5rem] flex items-center gap-4 backdrop-blur-2xl shadow-inner group hover:border-[#00FF9D]/40 transition-all w-full sm:w-auto">
                   <div className="p-2 bg-[#00FF9D]/10 rounded-lg">
                     <FiActivity className="text-[#00FF9D] drop-shadow-[0_0_8px_#00FF9D]" size={20} />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Telemetry Stream</span>
                     <span className="text-[11px] font-black text-[#00FF9D] uppercase tracking-widest drop-shadow-[0_0_5px_#00FF9D]">Synchronized</span>
                   </div>
                 </div>
                 
                 <div className="bg-[#050816]/60 border border-[#FFC857]/20 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-[1.5rem] flex items-center gap-4 backdrop-blur-2xl shadow-inner group hover:border-[#FFC857]/40 transition-all w-full sm:w-auto">
                   <div className="p-2 bg-[#FFC857]/10 rounded-lg">
                     <FiZap className="text-[#FFC857] drop-shadow-[0_0_8px_#FFC857]" size={20} />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Sync Heartbeat</span>
                     <span className="text-[11px] font-black text-[#FFC857] uppercase tracking-widest drop-shadow-[0_0_5px_#FFC857]">Active (0.5s)</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </motion.div>

        {/* ── Dashboard Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-auto">
          
          {/* Top Row: Gantt Chart (Full Width) */}
          <div className="xl:col-span-12 h-[320px] sm:h-[450px]">
             <GanttChart kernelState={kernelState} />
          </div>

          {/* Middle Row: Queue & Topology */}
          <div className="xl:col-span-7 h-[480px] sm:h-[500px]">
             <QueueVisualizer kernelState={kernelState} />
          </div>
          <div className="xl:col-span-5 h-[400px] sm:h-[500px]">
             <TopologyGraph kernelState={kernelState} />
          </div>

          {/* Bottom Row: Memory, Disk, Deadlock */}
          <div className="xl:col-span-4 h-[350px] sm:h-[450px]">
             <MemoryVisualizer kernelState={kernelState} />
          </div>
          <div className="xl:col-span-4 h-[400px] sm:h-[450px]">
             <DiskTrajectory kernelState={kernelState} />
          </div>
          <div className="xl:col-span-4 h-[400px] sm:h-[450px]">
             <DeadlockGraphVisualizer kernelState={kernelState} />
          </div>

        </div>

        {/* ── Footer Status ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:px-8 sm:py-4 glass border border-white/10 rounded-2xl sm:rounded-[2rem]">
           <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                 <FiGrid className="text-white/20" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Observability Nodes: 6 Active</span>
              </div>
              <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">Performance Nominal (60 FPS Render)</span>
              </div>
           </div>
           <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] text-center">NovaOS Visualization Layer v3.2</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VisualizationCenter;
