import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCpu, FiActivity, FiMaximize2, FiZoomIn, FiZoomOut } from 'react-icons/fi';

const GanttChart = ({ kernelState }) => {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(20); // pixels per second
  const [autoScroll, setAutoScroll] = useState(true);

  // 1. Extract Processes & Slices
  const processes = useMemo(() => {
    const raw = Array.isArray(kernelState?.processes)
      ? kernelState.processes
      : Object.values(kernelState?.processes || {});
    
    // Sort by arrival time
    return [...raw].sort((a, b) => a.arrival_time - b.arrival_time);
  }, [kernelState?.processes]);

  const uptime = kernelState?.system?.uptime || 0;
  const startTime = useMemo(() => Math.max(0, uptime - 60), [uptime > 60 ? Math.floor(uptime / 10) : 0]); // Window stabilization

  // 2. Constants
  const rowHeight = 40;
  const headerHeight = 30;
  const labelWidth = 120;

  // 3. Auto-scroll logic
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [uptime, autoScroll, zoom]);

  // 4. Render Execution Slices
  const renderProcessRow = (proc, idx) => {
    const slices = proc.execution_slices || [];
    const arrivalX = (proc.arrival_time - startTime) * zoom;
    
    return (
      <div 
        key={proc.pid} 
        className="relative border-b border-white/5 flex items-center" 
        style={{ height: rowHeight }}
      >
        {/* Arrival Marker */}
        <div 
          className="absolute h-full w-[2px] bg-sky-500/20 z-0"
          style={{ left: arrivalX }}
        />

        {/* Execution Bars */}
        {slices.map((slice, sIdx) => {
          const sStart = slice[0];
          const sEnd = slice[1] || uptime;
          const left = (sStart - startTime) * zoom;
          const width = (sEnd - sStart) * zoom;

          if (left + width < 0) return null;

          return (
            <motion.div
              key={sIdx}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              className="absolute h-6 rounded-md shadow-lg shadow-emerald-500/10 border border-emerald-500/30"
              style={{
                left,
                width: Math.max(2, width),
                backgroundColor: proc.status_color || '#10b981',
                top: (rowHeight - 24) / 2
              }}
            >
              <div className="w-full h-full bg-gradient-to-b from-white/20 to-transparent flex items-center px-1 overflow-hidden">
                <span className="text-[8px] font-black text-white whitespace-nowrap opacity-40">
                  {proc.pid}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Currently Running Extension (Active Slice) */}
        {proc.state === 'RUNNING' && (
           <div 
             className="absolute h-6 bg-emerald-400/60 border border-emerald-400 rounded-md animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]"
             style={{
               left: (proc.last_start_time - startTime) * zoom,
               width: (uptime - proc.last_start_time) * zoom,
               top: (rowHeight - 24) / 2
             }}
           />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <FiActivity size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Execution Gantt</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">Realtime Timeline Engine</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
            <button onClick={() => setZoom(z => Math.max(5, z - 5))} className="p-2 hover:bg-white/10 rounded-lg text-white/60 transition-all"><FiZoomOut size={14}/></button>
            <span className="text-[10px] font-black text-white/40 w-12 text-center uppercase tracking-widest">{zoom}px/s</span>
            <button onClick={() => setZoom(z => Math.min(100, z + 5))} className="p-2 hover:bg-white/10 rounded-lg text-white/60 transition-all"><FiZoomIn size={14}/></button>
          </div>

          <button 
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              autoScroll ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            {autoScroll ? 'Sync: Live' : 'Sync: Manual'}
          </button>
        </div>
      </div>

      {/* ── Chart Area ────────────────────────────────────────────────────── */}
      <div className="flex flex-grow overflow-hidden">
        {/* Y-Axis Labels (Fixed) */}
        <div className="w-[140px] flex-shrink-0 border-r border-white/10 bg-white/2 shadow-xl z-10">
          <div style={{ height: headerHeight }} className="border-b border-white/10 bg-white/5 flex items-center px-4">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Process PCB</span>
          </div>
          <div className="overflow-hidden">
             {processes.map(proc => (
               <div key={proc.pid} style={{ height: rowHeight }} className="border-b border-white/5 px-4 flex flex-col justify-center">
                 <span className="text-[10px] font-black text-white truncate uppercase tracking-tighter">
                   {proc.name}
                 </span>
                 <div className="flex items-center gap-2">
                   <span className="text-[8px] font-bold text-white/30 uppercase">PID {proc.pid}</span>
                   <div className={`w-1 h-1 rounded-full ${proc.state === 'TERMINATED' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Scrollable Timeline */}
        <div 
          ref={containerRef}
          className="flex-grow overflow-x-auto scrollbar-hide select-none"
          onWheel={() => setAutoScroll(false)}
        >
          <div className="relative min-h-full" style={{ width: Math.max(800, (uptime - startTime + 5) * zoom) }}>
            {/* Timeline Header */}
            <div style={{ height: headerHeight }} className="border-b border-white/10 bg-white/5 flex items-end relative">
               {Array.from({ length: 60 }).map((_, i) => {
                 const t = Math.floor(startTime) + i;
                 return (
                   <div key={t} className="absolute border-l border-white/10 h-2" style={{ left: (t - startTime) * zoom }}>
                     <span className="absolute top-[-15px] left-1 text-[8px] font-mono text-white/20">
                       {t}s
                     </span>
                   </div>
                 );
               })}
            </div>

            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
               {Array.from({ length: 60 }).map((_, i) => (
                 <div key={i} className="absolute h-full border-l border-white/5" style={{ left: i * zoom }} />
               ))}
            </div>

            {/* Process Rows */}
            <div className="relative">
               {processes.map((proc, idx) => renderProcessRow(proc, idx))}
            </div>

            {/* Current Time Needle */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-primary shadow-[0_0_10px_#22d3ee] z-20 pointer-events-none"
              style={{ left: (uptime - startTime) * zoom }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-2 py-1 bg-primary text-black text-[9px] font-black rounded-t-lg">
                NOW
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Stats ───────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-white/10 bg-white/2 flex flex-wrap gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <FiCpu className="text-emerald-500" size={12}/>
          <span className="text-[10px] font-bold text-white/60 uppercase">Context Switches:</span>
          <span className="text-[10px] font-black text-emerald-400">{kernelState?.scheduler?.context_switches || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiClock className="text-sky-500" size={12}/>
          <span className="text-[10px] font-bold text-white/60 uppercase">Total Uptime:</span>
          <span className="text-[10px] font-black text-sky-400">{uptime.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
