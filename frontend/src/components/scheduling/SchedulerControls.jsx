import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiSquare, FiRefreshCw, FiClock, FiSettings, FiActivity } from 'react-icons/fi';
import { useProcess } from '../../context/KernelContext';

const SchedulerControls = () => {
  const { 
    schedulerState, 
    startScheduler, 
    pauseScheduler, 
    resumeScheduler, 
    stopScheduler, 
    updateSchedulerAlgo, 
    updateQuantum,
    resetSimulation
  } = useProcess();

  const { is_active, is_paused, algorithm, quantum } = schedulerState;

  const algorithms = [
    { id: 'FIFO', name: 'FIFO_STACK_PROTOCOL', desc: 'First-In First-Out Execution' },
    { id: 'ROUND_ROBIN', name: 'CYC_QUANTUM_MODE', desc: 'Time-Sliced Round Robin' },
    { id: 'PRIORITY', name: 'RANK_PREEMPT_MODE', desc: 'Preemptive Priority Logic' }
  ];

  return (
    <div className="space-y-8">
      {/* Simulation Master Controls */}
      <div className="glass-premium p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
        <div className="absolute inset-0 scanline-overlay opacity-5 pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border">
                <FiSettings className="text-primary neon-text" size={20} />
            </div>
            <div>
                <h3 className="text-xs font-black text-white font-orbitron uppercase tracking-[0.3em]">Master_Control</h3>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">Execution_System_Interface</p>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 relative z-10">
          {!is_active ? (
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={startScheduler}
              className="col-span-2 flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-magenta text-white border border-white/20 py-5 rounded-[1.5rem] transition-all duration-500 group shadow-[0_0_20px_rgba(157,0,255,0.3)] hover:shadow-[0_0_40px_rgba(157,0,255,0.5)] overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/30" />
              <FiPlay className="text-xl animate-pulse" />
              <span className="font-black uppercase tracking-[0.2em] text-[11px] font-orbitron">Initialize_Kernel_Engine</span>
            </motion.button>
          ) : (
            <>
              {is_paused ? (
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resumeScheduler}
                  className="flex items-center justify-center gap-2 bg-success/20 hover:bg-success text-success hover:text-black border border-success/30 py-5 rounded-[1.5rem] transition-all duration-500 group font-orbitron shadow-[0_0_15px_rgba(0,255,157,0.1)] hover:shadow-[0_0_25px_rgba(0,255,157,0.4)]"
                >
                  <FiPlay />
                  <span className="font-black uppercase tracking-widest text-[10px]">Resume</span>
                </motion.button>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={pauseScheduler}
                  className="flex items-center justify-center gap-2 bg-warning/20 hover:bg-warning text-warning hover:text-black border border-warning/30 py-5 rounded-[1.5rem] transition-all duration-500 group font-orbitron shadow-[0_0_15px_rgba(255,200,87,0.1)] hover:shadow-[0_0_25px_rgba(255,200,87,0.4)]"
                >
                  <FiPause />
                  <span className="font-black uppercase tracking-widest text-[10px]">Pause</span>
                </motion.button>
              )}
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={stopScheduler}
                className="flex items-center justify-center gap-2 bg-error/20 hover:bg-error text-error hover:text-black border border-error/30 py-5 rounded-[1.5rem] transition-all duration-500 group font-orbitron shadow-[0_0_15px_rgba(255,77,109,0.1)] hover:shadow-[0_0_25px_rgba(255,77,109,0.4)]"
              >
                <FiSquare />
                <span className="font-black uppercase tracking-widest text-[10px]">Stop</span>
              </motion.button>
            </>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetSimulation}
            className="col-span-2 flex items-center justify-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] text-slate-500 hover:text-white border border-white/5 hover:border-white/20 py-4 rounded-[1.5rem] transition-all mt-4 font-orbitron group"
          >
            <FiRefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
            <span className="font-black uppercase tracking-widest text-[9px]">Cold_Boot_Simulation</span>
          </motion.button>
        </div>
      </div>

      {/* Advanced Algorithm Selection */}
      <div className="glass-premium p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center neon-border-secondary">
                <FiActivity className="text-secondary neon-text-cyan" size={20} />
            </div>
            <div>
                <h3 className="text-xs font-black text-white font-orbitron uppercase tracking-[0.3em]">Execution_Modes</h3>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">Algorithm_Selection_Protocol</p>
            </div>
        </div>

        <div className="space-y-4">
          {algorithms.map(algo => (
            <motion.button
              key={algo.id}
              whileHover={{ x: 4 }}
              onClick={() => updateSchedulerAlgo(algo.id)}
              className={`w-full text-left p-5 rounded-[1.5rem] border transition-all duration-500 relative overflow-hidden group/algo ${
                algorithm === algo.id 
                  ? 'bg-gradient-to-r from-primary/20 to-magenta/10 border-primary shadow-[0_0_25px_rgba(157,0,255,0.2)]' 
                  : 'bg-white/[0.02] border-white/5 text-slate-500 hover:bg-white/[0.05] hover:border-white/20'
              }`}
            >
              <div className="relative z-10">
                  <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-black font-orbitron tracking-widest ${algorithm === algo.id ? 'text-white' : 'text-slate-400 group-hover/algo:text-slate-300'}`}>
                        {algo.name}
                      </span>
                      {algorithm === algo.id && (
                          <motion.div 
                            layoutId="active-indicator"
                            className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#9D00FF]"
                          />
                      )}
                  </div>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest group-hover/algo:text-slate-500">{algo.desc}</p>
              </div>
              
              {algorithm === algo.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
              )}
            </motion.button>
          )) }
        </div>
      </div>

      {/* Quantum Temporal Adjustments */}
      <AnimatePresence>
        {algorithm === 'ROUND_ROBIN' && (
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-premium p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl"
            >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <FiClock className="text-secondary neon-text-cyan" />
                    <h3 className="text-xs font-black text-white font-orbitron uppercase tracking-[0.2em]">Temporal_Quantum</h3>
                </div>
                <div className="px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-lg">
                    <span className="text-secondary font-mono-cyber font-black text-sm">{quantum}s</span>
                </div>
            </div>
            
            <div className="px-2">
                <input 
                    type="range" 
                    min="0.5" 
                    max="10" 
                    step="0.5" 
                    value={quantum}
                    onChange={(e) => updateQuantum(e.target.value)}
                    className="w-full accent-secondary bg-white/5 h-2 rounded-full appearance-none cursor-pointer border border-white/5"
                />
            </div>
            
            <div className="flex justify-between mt-6 text-[8px] font-black text-slate-600 uppercase tracking-widest font-orbitron">
                <span className="group-hover:text-secondary transition-colors">Fast_Burst (0.5s)</span>
                <span className="group-hover:text-secondary transition-colors">Slow_Exec (10s)</span>
            </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchedulerControls;
