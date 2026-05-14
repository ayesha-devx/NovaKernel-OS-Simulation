import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProcess } from '../../context/KernelContext';

const GanttChart = () => {
  const { processes, schedulerState, uptime } = useProcess();
  const scrollRef = useRef(null);

  // Filter processes that have at least one execution slice
  const activeProcesses = processes.filter(p => p.execution_slices && p.execution_slices.length > 0);
  
  // Sort by arrival time for consistent vertical ordering
  const sortedProcesses = [...activeProcesses].sort((a, b) => a.arrival_time - b.arrival_time);

  // Calculate timeline bounds
  const now = uptime || 0;
  const startTime = activeProcesses.length > 0 
    ? Math.min(...activeProcesses.map(p => p.arrival_time)) 
    : now - 10;
  
  const endTime = activeProcesses.length > 0
    ? Math.max(now, ...activeProcesses.map(p => {
        const lastSlice = p.execution_slices[p.execution_slices.length - 1];
        return lastSlice.end || now;
      }))
    : now;

  const duration = Math.max(10, endTime - startTime + 5);
  const pxPerSec = 50; // Zoom factor

  return (
    <div className="glass-premium border border-white/10 rounded-[2.5rem] p-10 overflow-hidden relative shadow-[0_0_50px_rgba(157,0,255,0.05)]">
      <div className="absolute inset-0 scanline-overlay opacity-5 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 relative z-10">
        <div>
          <h2 className="text-xl font-black text-white font-orbitron tracking-[0.2em] uppercase">EXEC_TIMELINE_ENGINE</h2>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 font-orbitron">Holographic_Gantt_Chart_Visualizer</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
           {[
             { label: 'Running', color: '#00FF9D' },
             { label: 'Quantum', color: '#9D00FF' },
             { label: 'Waiting', color: '#FFC857' },
             { label: 'Terminated', color: '#FF4D6D' }
           ].map((legend, i) => (
             <div key={i} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-sm shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: legend.color, boxShadow: `0 0 10px ${legend.color}44` }} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron">{legend.label}</span>
             </div>
           ))}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="overflow-x-auto pb-6 custom-scrollbar relative"
      >
        <div 
          className="relative min-h-[350px] border-l border-white/5"
          style={{ width: duration * pxPerSec }}
        >
          {/* Timeline Grid System */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: `${pxPerSec}px 40px` }} />

          {/* Time markers */}
          {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
            <div 
              key={i}
              className="absolute top-0 bottom-0 border-l border-white/[0.03] flex flex-col justify-end pb-3"
              style={{ left: i * pxPerSec }}
            >
              <span className="text-[8px] font-mono-cyber text-slate-700 ml-1.5">{i}s</span>
            </div>
          ))}

          {/* Process Rows */}
          <div className="pt-10 space-y-6">
            {sortedProcesses.map((p, rowIdx) => (
              <div key={p.pid} className="relative h-12 flex items-center group/row">
                {/* Process Label (Pinned to left of row) */}
                <div className="flex-shrink-0 w-40 pr-6 z-10 bg-[#050816]/90 backdrop-blur-xl rounded-r-2xl border-r border-white/5 group-hover/row:border-primary/30 transition-colors">
                  <p className="text-[10px] font-black text-white font-orbitron uppercase tracking-tight truncate group-hover/row:text-primary transition-colors">{p.name}</p>
                  <p className="text-[8px] font-mono-cyber text-slate-600 mt-0.5 font-black uppercase">LINK_0x{p.pid.toString(16).toUpperCase()}</p>
                </div>

                <div className="relative flex-grow h-full ml-4">
                    {/* Arrival/Life Line */}
                    <div 
                    className="absolute h-[1px] bg-white/[0.03] border-t border-dashed border-white/10 top-1/2 -translate-y-1/2"
                    style={{ 
                        left: (p.arrival_time - startTime) * pxPerSec,
                        width: (now - p.arrival_time) * pxPerSec
                    }}
                    />

                    {/* Execution Slices */}
                    {p.execution_slices.map((slice, sliceIdx) => {
                    const sliceStart = (slice.start - startTime) * pxPerSec;
                    const sliceDuration = ((slice.end || now) - slice.start) * pxPerSec;
                    const isRunning = !slice.end;
                    
                    return (
                        <motion.div
                        key={sliceIdx}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        className={`absolute h-10 top-1 rounded-xl flex items-center justify-center overflow-hidden border group/slice transition-all duration-500 ${
                            isRunning 
                            ? 'bg-success/20 border-success shadow-[0_0_20px_rgba(0,255,157,0.2)]' 
                            : 'bg-primary/20 border-primary/40'
                        }`}
                        style={{ 
                            left: sliceStart,
                            width: Math.max(4, sliceDuration)
                        }}
                        >
                        {/* Internal Scanline for active slices */}
                        {isRunning && (
                             <motion.div 
                               animate={{ x: [-100, 200] }}
                               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                               className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                             />
                        )}
                        <span className={`text-[8px] font-black font-mono-cyber truncate px-2 relative z-10 ${isRunning ? 'text-success' : 'text-primary/60'}`}>
                            {((slice.end || now) - slice.start).toFixed(1)}s
                        </span>
                        </motion.div>
                    );
                    })}

                    {/* Completion Pulse */}
                    {p.completion_time && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute w-3 h-3 rounded-full bg-error shadow-[0_0_15px_#FF4D6D] border-2 border-white/20 top-1/2 -translate-y-1/2 z-10"
                        style={{ left: (p.completion_time - startTime) * pxPerSec - 6 }}
                    />
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Master Temporal Scanline (Current Time) */}
          <motion.div 
            className="absolute top-0 bottom-0 w-[2px] bg-primary z-20 shadow-[0_0_15px_#9D00FF]"
            style={{ left: (now - startTime) * pxPerSec }}
          >
             {/* Glowing Head */}
            <div className="absolute top-0 -left-[5px] w-3 h-3 rounded-full bg-primary shadow-[0_0_20px_#9D00FF] border-2 border-white/50" />
            
            {/* Telemetry Label */}
            <div className="absolute -top-10 -left-1/2 -translate-x-1/2 whitespace-nowrap bg-primary/20 backdrop-blur-md border border-primary/40 px-3 py-1 rounded-lg">
                <span className="text-[9px] font-mono-cyber font-black text-white">T+{now.toFixed(1)}s</span>
            </div>
            
            {/* Scanline Pulse Trail */}
            <motion.div 
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute top-0 bottom-0 -left-4 w-4 bg-gradient-to-r from-transparent to-primary/20"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
