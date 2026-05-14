import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLayers, FiCpu, FiTrendingUp, FiSettings } from 'react-icons/fi';

const QueueVisualizer = ({ kernelState }) => {
  const processes = Array.isArray(kernelState?.processes)
    ? kernelState.processes
    : Object.values(kernelState?.processes || {});
  
  const readyQueueIds = kernelState?.ready_queue || [];
  const currentPid = kernelState?.scheduler?.current_process;
  const currentAlgo = kernelState?.scheduler?.current_algorithm || 'FIFO';
  const quantumLeft = kernelState?.scheduler?.quantum_left || 0;
  const totalQuantum = kernelState?.scheduler?.quantum || 2.0;

  // 1. Get process details for the queue
  const queueData = useMemo(() => {
    return readyQueueIds.map(pid => {
      const p = processes.find(proc => proc.pid === pid);
      return p || { pid, name: 'Unknown', priority: 5, status_color: '#9CA3AF' };
    });
  }, [readyQueueIds, processes]);

  const activeProcess = useMemo(() => {
    return processes.find(p => p.pid === currentPid);
  }, [currentPid, processes]);

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <FiLayers size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Ready Queue</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
              Policy: <span className="text-amber-500">{currentAlgo}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Depth: {queueData.length}</span>
           </div>
        </div>
      </div>

      {/* ── Main Animation Area ─────────────────────────────────────────── */}
      <div className="flex-grow flex flex-col md:flex-row p-8 gap-8 items-center justify-center overflow-hidden">
        
        {/* Ready Queue Track */}
        <div className="flex-grow w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden h-[200px] flex items-center">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none" />
           
           <div className="flex gap-4 items-center">
             <AnimatePresence mode="popLayout">
               {queueData.length === 0 && (
                 <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                   className="w-full text-center text-white/20 text-[10px] font-black uppercase tracking-[0.3em]"
                 >
                   Queue Empty — CPU Idle
                 </motion.div>
               )}
               {queueData.map((p, idx) => (
                 <motion.div
                   key={p.pid}
                   layout
                   initial={{ opacity: 0, x: 50, scale: 0.9 }}
                   animate={{ opacity: 1, x: 0, scale: 1 }}
                   exit={{ opacity: 0, x: -100, scale: 0.8 }}
                   transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                   className="flex-shrink-0 w-24 h-32 glass border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-between group hover:border-primary/50 transition-colors"
                 >
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40">
                      {idx + 1}
                   </div>
                   <div className="flex flex-col items-center">
                     <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate w-full text-center">{p.name}</span>
                     <span className="text-[8px] font-bold text-white/30 uppercase">P{p.pid}</span>
                   </div>
                   <div 
                     className="w-full h-1.5 rounded-full" 
                     style={{ backgroundColor: p.status_color || '#10b981' }}
                   />
                 </motion.div>
               ))}
             </AnimatePresence>
           </div>
        </div>

        {/* Dispatch Arrow */}
        <div className="flex flex-col items-center justify-center">
           <div className="w-12 h-1 bg-gradient-to-r from-white/10 to-primary rounded-full animate-pulse" />
           <span className="text-[8px] font-black text-primary uppercase tracking-widest mt-2">Dispatch</span>
        </div>

        {/* CPU Processor Slot */}
        <div className="flex-shrink-0 relative">
          <div className={`w-40 h-40 rounded-[2.5rem] border-4 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${
            activeProcess ? 'border-primary/40 bg-primary/5 shadow-[0_0_50px_rgba(34,211,238,0.15)]' : 'border-white/10 bg-white/2'
          }`}>
            <AnimatePresence mode="wait">
              {activeProcess ? (
                <motion.div 
                  key={activeProcess.pid}
                  initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary relative">
                    <FiCpu size={32} className="animate-spin-slow" />
                    {currentAlgo === 'ROUND_ROBIN' && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="32" cy="32" r="30"
                          className="stroke-primary/10 fill-none"
                          strokeWidth="4"
                        />
                        <motion.circle
                          cx="32" cy="32" r="30"
                          className="stroke-primary fill-none"
                          strokeWidth="4"
                          strokeDasharray="188.5"
                          animate={{ strokeDashoffset: 188.5 * (1 - (quantumLeft / totalQuantum)) }}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-white uppercase tracking-wider">{activeProcess.name}</p>
                    <p className="text-[8px] font-bold text-primary/60">PID {activeProcess.pid}</p>
                  </div>
                  <div className="flex gap-1">
                     <span className="text-[8px] font-black text-white/40 bg-white/10 px-2 py-0.5 rounded-full uppercase">
                       {activeProcess.burst_remaining.toFixed(1)}s Rem
                     </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center text-white/20"
                >
                  <FiCpu size={40} className="opacity-20 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">CPU IDLE</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* CPU Labels */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 px-4 py-1 rounded-full border border-white/10">
             <div className={`w-1.5 h-1.5 rounded-full ${activeProcess ? 'bg-primary animate-pulse' : 'bg-white/10'}`} />
             <span className="text-[9px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">Core 0: Execution Unit</span>
          </div>
        </div>

      </div>

      {/* ── Algo Stats ─────────────────────────────────────────────────── */}
      <div className="px-8 py-4 bg-white/2 border-t border-white/5 grid grid-cols-3 gap-8">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Queue Policy</span>
          <div className="flex items-center gap-2">
             <FiTrendingUp className="text-primary" size={12}/>
             <span className="text-xs font-black text-white uppercase">{currentAlgo}</span>
          </div>
        </div>
        <div className="flex flex-col border-l border-white/5 pl-8">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Time Quantum</span>
          <div className="flex items-center gap-2">
             <FiSettings className="text-amber-500" size={12}/>
             <span className="text-xs font-black text-white uppercase">{totalQuantum}s</span>
          </div>
        </div>
        <div className="flex flex-col border-l border-white/5 pl-8">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Avg Wait Time</span>
          <div className="flex items-center gap-2 text-emerald-400">
             <span className="text-xs font-black uppercase">{kernelState?.metrics?.avg_wait_time || 0}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueVisualizer;
