import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import CPUPanel from '../components/scheduling/CPUPanel';
import SchedulerControls from '../components/scheduling/SchedulerControls';
import GanttChart from '../components/scheduling/GanttChart';
import ReadyQueuePanel from '../components/scheduling/ReadyQueuePanel';
import { useProcess } from '../context/KernelContext';
import { LuTrendingUp, LuActivity, LuClock, LuCircleCheck, LuTimer } from 'react-icons/lu';

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

const Scheduler = () => {
  const { schedulerMetrics } = useProcess();

  const metricCards = [
    { label: 'Avg_Waiting_Time', value: `${schedulerMetrics.avg_waiting_time}s`, icon: <LuClock />, color: '#FFC857', glow: 'rgba(255, 200, 87, 0.3)' },
    { label: 'Avg_Turnaround', value: `${schedulerMetrics.avg_turnaround_time}s`, icon: <LuTrendingUp />, color: '#D900FF', glow: 'rgba(217, 0, 255, 0.3)' },
    { label: 'CPU_Utilization', value: `${schedulerMetrics.cpu_utilization}%`, icon: <LuActivity />, color: '#00D1FF', glow: 'rgba(0, 209, 255, 0.3)' },
    { label: 'Units_Completed', value: schedulerMetrics.throughput, icon: <LuCircleCheck />, color: '#00FF9D', glow: 'rgba(0, 255, 157, 0.3)' },
  ];

  return (
    <DashboardLayout>
      <div className="relative min-h-screen">
        {/* Ambient Atmosphere Layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[10%] -right-[5%] w-[600px] h-[600px] bg-primary/10 blur-[180px] rounded-full animate-pulse-slow opacity-60" />
            <div className="absolute bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full animate-pulse opacity-40" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
        </div>

        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 space-y-8 pb-20"
        >
            {/* Cinematic CPU Orchestration Header */}
            <motion.div variants={itemVariants} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-secondary/5 to-transparent rounded-3xl sm:rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative glass-premium rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-10 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(157,0,255,0.05)]">
                   <div className="absolute inset-0 scanline-overlay opacity-20" />
                   <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] -mr-40 -mt-40" />
                   
                   <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-10 relative z-10">
                     <div className="space-y-4 w-full lg:w-auto">
                       <div className="flex items-center gap-4 sm:gap-6">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center neon-border-secondary shrink-0">
                              <LuTimer className="text-secondary neon-text-cyan" size={24} />
                          </div>
                          <div>
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">SCHEDULER</h1>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_12px_#00D1FF] indicator-pulse" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">Execution_Orchestrator_Active</p>
                            </div>
                          </div>
                       </div>
                       <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-0 sm:ml-22">
                         Advanced CPU lifecycle management protocol. Interfacing with multi-core dispatch queues and real-time execution pipelines.
                       </p>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto">
                        {metricCards.map((card, idx) => (
                           <motion.div 
                             key={idx} 
                             whileHover={{ scale: 1.05, y: -5 }}
                             className="relative glass-premium bg-white/[0.02] border border-white/5 px-4 py-3.5 sm:px-8 sm:py-5 rounded-2xl sm:rounded-[2rem] overflow-hidden group/card shadow-[0_0_20px_rgba(0,0,0,0.2)]"
                           >
                              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-20 transition-opacity">
                                 {card.icon}
                              </div>
                              <div className="flex flex-col gap-1">
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider sm:tracking-[0.2em] font-orbitron">{card.label}</span>
                                 <div className="flex items-baseline gap-2">
                                     <p className="text-xl sm:text-2xl font-black font-orbitron text-white tracking-tight">{card.value}</p>
                                     <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card.color, boxShadow: `0 0 10px ${card.color}` }} />
                                 </div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 h-1 opacity-20" style={{ background: `linear-gradient(to right, transparent, ${card.color}, transparent)` }} />
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
                           </motion.div>
                        ))}
                     </div>
                   </div>
                </div>
            </motion.div>

            {/* Main Orchestration Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
              {/* Left Column: Execution Chamber & Pipeline (8 cols) */}
              <motion.div 
                variants={itemVariants}
                className="lg:col-span-8 space-y-6 lg:space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 min-h-0 md:min-h-[500px]">
                  <CPUPanel />
                  <ReadyQueuePanel minimal />
                </div>
                
                <div className="relative group">
                    <div className="absolute -inset-4 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <GanttChart />
                </div>
              </motion.div>

              {/* Right Column: Mode Selection & Controls (4 cols) */}
              <motion.div 
                variants={itemVariants}
                className="lg:col-span-4"
              >
                <SchedulerControls />
              </motion.div>
            </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Scheduler;
