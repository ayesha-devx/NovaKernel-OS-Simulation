import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiZap, FiActivity, FiClock } from 'react-icons/fi';
import { useProcess } from '../../context/KernelContext';

const CPUPanel = () => {
  const { schedulerState } = useProcess();
  const { current_process, quantum_remaining, algorithm, is_active } = schedulerState;

  return (
    <div className="relative glass-premium border border-white/10 rounded-[2.5rem] p-10 overflow-hidden h-full group shadow-[0_0_50px_rgba(0,209,255,0.05)]">
      <div className="absolute inset-0 scanline-overlay opacity-10 pointer-events-none" />
      
      {/* Dynamic Core Atmosphere */}
      <AnimatePresence>
        {is_active && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,209,255,0.08),transparent_70%)]" />
             <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent animate-shimmer" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 relative ${
              is_active 
                ? 'bg-secondary/20 text-secondary neon-border-secondary' 
                : 'bg-white/5 text-slate-700'
            }`}>
              {is_active && (
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-secondary rounded-2xl blur-xl"
                  />
              )}
              <FiCpu size={28} className={is_active ? "neon-text-cyan relative z-10" : "relative z-10"} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-[0.3em] font-orbitron uppercase">Core_Alpha_Exec</h2>
              <div className="flex items-center gap-3 mt-1">
                 <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full border bg-black/40 border-white/5">
                    <span className={`w-1.5 h-1.5 rounded-full ${is_active ? 'bg-secondary shadow-[0_0_8px_#00D1FF] indicator-pulse' : 'bg-slate-700'}`} />
                    <span className={`text-[8px] font-black uppercase tracking-widest font-orbitron ${is_active ? 'text-secondary' : 'text-slate-500'}`}>
                      {is_active ? 'STATUS: ONLINE' : 'STATUS: STANDBY'}
                    </span>
                 </div>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest font-mono-cyber">V3.0.4_KERNEL_SYS</span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {algorithm === 'ROUND_ROBIN' && is_active && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="text-right glass-premium bg-primary/10 border-primary/20 px-5 py-2 rounded-2xl"
              >
                <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-0.5 font-orbitron">Quantum_Flux</p>
                <motion.p 
                  key={quantum_remaining}
                  initial={{ scale: 1.2, color: '#9D00FF' }}
                  animate={{ scale: 1, color: '#fff' }}
                  className="text-xl font-mono-cyber font-black drop-shadow-[0_0_8px_rgba(157,0,255,0.5)]"
                >
                  {quantum_remaining}s
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-grow flex items-center justify-center relative">
          {/* Energy Rings Visualization */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
             <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-64 h-64 border border-dashed border-secondary/30 rounded-full"
             />
             <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute w-80 h-80 border border-dotted border-primary/20 rounded-full"
             />
          </div>

          <AnimatePresence mode="wait">
            {!current_process ? (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-center space-y-6 relative z-10"
              >
                <div className="w-40 h-40 rounded-full border-2 border-white/5 flex items-center justify-center relative group/idle">
                   <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                   <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20"
                   />
                   <FiZap size={48} className="text-slate-700 group-hover/idle:text-primary transition-colors duration-500" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">Awaiting_Instructions</p>
                    <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mt-2">Core_Idle_Pattern_Detected</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={current_process.pid}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg relative z-10"
              >
                <div className="glass-premium bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group/process shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-success to-transparent shadow-[0_0_10px_#00FF9D]" />
                  
                  <div className="flex justify-between items-end mb-10">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-[9px] font-black text-success uppercase tracking-[0.3em] px-4 py-1.5 bg-success/10 border border-success/30 rounded-full font-orbitron shadow-[0_0_15px_rgba(0,255,157,0.1)]">PROTOCOL_EXECUTION</span>
                        <div className="h-1 w-1 rounded-full bg-slate-600" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono-cyber">SEG_0x{current_process.pid}</span>
                      </div>
                      <h3 className="text-6xl font-black text-white font-orbitron tracking-tighter uppercase leading-none neon-text">{current_process.name}</h3>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 font-orbitron">Burst_Remain</p>
                       <p className="text-5xl font-mono-cyber font-black text-success drop-shadow-[0_0_15px_rgba(0,255,157,0.6)]">{current_process.burst_remaining}s</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((current_process.burst_time - current_process.burst_remaining) / current_process.burst_time) * 100}%` }}
                        className="h-full bg-gradient-to-r from-success/50 via-success to-secondary rounded-full shadow-[0_0_15px_#00FF9D]"
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] font-orbitron">
                      <span>Progress: <span className="text-white">{Math.round(((current_process.burst_time - current_process.burst_remaining) / current_process.burst_time) * 100)}%</span></span>
                      <span>Total_Burst: <span className="text-white">{current_process.burst_time}s</span></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-x-8 gap-y-6 mt-10 pt-8 border-t border-white/5">
                    <div className="group/metric">
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-wider mb-1.5 font-orbitron group-hover/metric:text-warning transition-colors whitespace-nowrap">Wait_Time</p>
                      <p className="text-sm font-mono-cyber font-black text-white">{current_process.waiting_time}s</p>
                    </div>
                    <div className="group/metric">
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-wider mb-1.5 font-orbitron group-hover/metric:text-primary transition-colors whitespace-nowrap">Priority_Rank</p>
                      <p className="text-sm font-mono-cyber font-black text-primary">#{current_process.priority}</p>
                    </div>
                    <div className="group/metric">
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-wider mb-1.5 font-orbitron group-hover/metric:text-secondary transition-colors whitespace-nowrap">Exec_Mode</p>
                      <p className="text-sm font-mono-cyber font-black text-secondary truncate">{algorithm.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  
                  {/* Glass Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent pointer-events-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Realtime Telemetry Grid */}
        <div className="mt-10 grid grid-cols-2 gap-6 relative z-10">
           <motion.div 
             whileHover={{ y: -5, scale: 1.02 }}
             className="glass-premium bg-white/[0.03] border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center text-center gap-4 shadow-[0_0_30px_rgba(0,0,0,0.2)]"
           >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <FiActivity className="text-primary neon-text" size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-wider font-orbitron">Logic_Load</p>
                <p className="text-xl font-mono-cyber font-black text-white">{schedulerState.metrics?.cpu_utilization || 0}%</p>
              </div>
           </motion.div>
           <motion.div 
             whileHover={{ y: -5, scale: 1.02 }}
             className="glass-premium bg-white/[0.03] border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center text-center gap-4 shadow-[0_0_30px_rgba(0,0,0,0.2)]"
           >
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center border border-warning/20 flex-shrink-0">
                  <FiClock className="text-warning neon-text-warning" size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-wider font-orbitron">Context_Switches</p>
                <p className="text-xl font-mono-cyber font-black text-white">{schedulerState.metrics?.context_switches || 0}</p>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CPUPanel;
