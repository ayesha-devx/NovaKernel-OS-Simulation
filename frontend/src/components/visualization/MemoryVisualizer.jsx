import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDatabase, FiBox, FiAlertCircle } from 'react-icons/fi';

const MemoryVisualizer = ({ kernelState }) => {
  const memoryMap = kernelState?.memory || { blocks: [], total_ram: 4096, used_ram: 0, fragmentation: 0 };
  const blocks = memoryMap.blocks || [];
  const totalRam = memoryMap.total_ram;
  const usedRam = memoryMap.used_ram;
  const frag = memoryMap.fragmentation;

  // 1. Calculate Grid Representation
  // We'll divide the RAM into 64 segments for the heatmap
  const segments = 64;
  const segmentSize = totalRam / segments;

  const heatmap = useMemo(() => {
    const grid = Array(segments).fill(null).map(() => ({
      status: 'FREE',
      pid: null,
      label: 'EMPTY',
      intensity: 0
    }));

    blocks.forEach(block => {
      const startSeg = Math.floor(block.start_address / segmentSize);
      const endSeg = Math.ceil(block.end_address / segmentSize);
      
      for (let i = startSeg; i < endSeg; i++) {
        if (i < segments) {
          grid[i] = {
            status: block.pid ? 'ALLOCATED' : 'FREE',
            pid: block.pid,
            label: block.process_name || 'SYSTEM',
            intensity: 1
          };
        }
      }
    });

    return grid;
  }, [blocks, segmentSize, segments]);

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-3xl sm:rounded-[2rem] overflow-hidden backdrop-blur-xl">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-500 flex items-center justify-center">
            <FiDatabase size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Memory Heatmap</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">Physical Address Space V2</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[9px] font-black uppercase tracking-widest">
           <div className="flex items-center gap-2 text-emerald-400">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
             <span>Active Allocation</span>
           </div>
           <div className="flex items-center gap-2 text-white/20">
             <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
             <span>Free Block</span>
           </div>
        </div>
      </div>

      {/* ── Main Heatmap Area ─────────────────────────────────────────── */}
      <div className="flex-grow p-4 sm:p-8 flex flex-col gap-4 sm:gap-8 justify-center">
        
        {/* Heatmap Grid */}
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-2">
           {heatmap.map((seg, i) => (
             <motion.div
               key={i}
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ 
                 scale: 1, 
                 opacity: 1,
                 backgroundColor: seg.status === 'ALLOCATED' ? 'rgba(167, 139, 250, 0.4)' : 'rgba(255, 255, 255, 0.03)'
               }}
               className={`aspect-square rounded-lg border transition-all duration-300 group relative ${
                 seg.status === 'ALLOCATED' ? 'border-violet-500/40 shadow-[0_0_15px_rgba(167,139,250,0.1)]' : 'border-white/5'
               }`}
             >
               {/* Tooltip on hover */}
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none min-w-[120px]">
                  <p className="text-[9px] font-black text-white uppercase tracking-widest">{seg.label}</p>
                  <p className="text-[8px] font-bold text-white/40 uppercase">Segment: {i * segmentSize}MB - {(i+1)*segmentSize}MB</p>
                  {seg.pid && <p className="text-[8px] font-bold text-violet-400 uppercase mt-1">Owner: PID {seg.pid}</p>}
               </div>
               
               {/* Allocation Glow */}
               {seg.status === 'ALLOCATED' && (
                 <motion.div 
                   animate={{ opacity: [0.2, 0.5, 0.2] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-violet-400/20 blur-sm rounded-lg" 
                 />
               )}
             </motion.div>
           ))}
        </div>

        {/* Fragmentation Meter */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <FiAlertCircle className={frag > 30 ? 'text-amber-500 animate-pulse' : 'text-white/20'} size={14} />
                 <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Fragmentation Analysis</span>
              </div>
              <span className={`text-xs font-black ${frag > 30 ? 'text-amber-500' : 'text-white/60'}`}>{frag.toFixed(1)}%</span>
           </div>
           
           <div className="h-2 w-full bg-white/5 rounded-full border border-white/10 overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${frag}%` }}
                className="h-full bg-gradient-to-r from-amber-500/40 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              />
              {/* Markers */}
              <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none opacity-20">
                 {[...Array(10)].map((_, i) => <div key={i} className="w-[1px] h-1 bg-white" />)}
              </div>
           </div>
        </div>
      </div>

      {/* ── Resource Footer ───────────────────────────────────────────── */}
      <div className="p-4 sm:px-8 sm:py-5 bg-white/2 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Total Ram</span>
          <div className="flex items-center gap-2">
             <FiBox className="text-violet-500" size={12}/>
             <span className="text-xs font-black text-white uppercase">{totalRam}MB</span>
          </div>
        </div>
        <div className="flex flex-col border-l-0 sm:border-l border-white/5 pl-0 sm:pl-6">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Used Mem</span>
          <div className="flex items-center gap-2">
             <FiDatabase className="text-sky-500" size={12}/>
             <span className="text-xs font-black text-white uppercase">{usedRam}MB</span>
          </div>
        </div>
        <div className="flex flex-col border-l-0 sm:border-l border-white/5 pl-0 sm:pl-6">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Free Blocks</span>
          <div className="flex items-center gap-2 text-emerald-400">
             <span className="text-xs font-black uppercase">{totalRam - usedRam}MB</span>
          </div>
        </div>
        <div className="flex flex-col border-l-0 sm:border-l border-white/5 pl-0 sm:pl-6">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Utilization</span>
          <div className="flex items-center gap-2 text-primary">
             <span className="text-xs font-black uppercase">{((usedRam/totalRam)*100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryVisualizer;
