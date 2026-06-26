import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiDisc, FiNavigation, FiZap, FiActivity } from 'react-icons/fi';

const DiskTrajectory = ({ kernelState }) => {
  const diskState = kernelState?.disk || { current_track: 0, head_path: [], queue: [], current_algorithm: 'FCFS' };
  const headPath = diskState.head_path || [];
  const currentTrack = diskState.current_track || 0;
  const activeRequest = diskState.active_request;
  const currentAlgo = diskState.current_algorithm || 'FCFS';

  // 1. Map head path to SVG coordinates
  // X = relative time (index in path), Y = track (0-99)
  const pathPoints = useMemo(() => {
    const maxPoints = 50;
    const recentPath = headPath.slice(-maxPoints);
    const height = 300;
    const width = 600;
    
    return recentPath.map((track, i) => ({
      x: (i / (maxPoints - 1)) * width,
      y: height - (track / 99) * height,
      track
    }));
  }, [headPath]);

  const linePath = useMemo(() => {
    if (pathPoints.length < 2) return "";
    return `M ${pathPoints.map(p => `${p.x},${p.y}`).join(" L ")}`;
  }, [pathPoints]);

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <FiDisc size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Disk Trajectory</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">Seek Optimization Map</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
           <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">Algo: {currentAlgo}</span>
        </div>
      </div>

      {/* ── Main Trajectory Area ────────────────────────────────────────── */}
      <div className="flex-grow p-4 sm:p-10 flex items-center justify-center relative overflow-hidden">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="grid grid-cols-10 h-full w-full">
             {[...Array(10)].map((_, i) => <div key={i} className="border-r border-white/20 h-full" />)}
           </div>
           <div className="grid grid-rows-10 h-full w-full absolute inset-0">
             {[...Array(10)].map((_, i) => <div key={i} className="border-b border-white/20 w-full" />)}
           </div>
        </div>

        {/* The Graph */}
        <div className="relative w-full max-w-[600px] h-[300px]">
           <svg viewBox="0 0 600 300" className="w-full h-full overflow-visible">
              {/* Reference Lines (Track 0, 50, 99) */}
              <line x1="0" y1="0" x2="600" y2="0" className="stroke-white/10" strokeWidth="1" />
              <line x1="0" y1="150" x2="600" y2="150" className="stroke-white/5" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="0" y1="300" x2="600" y2="300" className="stroke-white/10" strokeWidth="1" />
              
              <text x="-30" y="305" className="fill-white/20 text-[10px] font-black">0</text>
              <text x="-35" y="10" className="fill-white/20 text-[10px] font-black">99</text>
              <text x="-40" y="155" className="fill-white/20 text-[10px] font-black">50</text>

              {/* Trajectory Path */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                d={linePath}
                className="stroke-amber-500 stroke-[3] fill-none drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                transition={{ duration: 1, ease: "easeOut" }}
              />

              {/* Head Pointer */}
              {pathPoints.length > 0 && (
                <motion.g
                  animate={{ 
                    x: pathPoints[pathPoints.length-1].x, 
                    y: pathPoints[pathPoints.length-1].y 
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <circle r="6" className="fill-white stroke-amber-500 stroke-[2] shadow-[0_0_15px_#f59e0b]" />
                  <motion.circle 
                    r="12" 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="fill-none stroke-amber-500/50 stroke-[1]" 
                  />
                </motion.g>
              )}

              {/* Active Target Indicator */}
              {activeRequest && (
                <g>
                  <line 
                    x1="0" y1={300 - (activeRequest.track / 99) * 300} 
                    x2="600" y2={300 - (activeRequest.track / 99) * 300} 
                    className="stroke-primary/20 stroke-[1] animate-pulse" 
                    strokeDasharray="10,5"
                  />
                  <rect 
                    x="580" y={290 - (activeRequest.track / 99) * 300} 
                    width="20" height="20" rx="4"
                    className="fill-primary/20 stroke-primary/50" 
                  />
                </g>
              )}
           </svg>
        </div>

        {/* Head Info Overlay */}
        <div className="absolute top-4 right-4 glass border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col gap-1 scale-90 sm:scale-100 origin-top-right z-10">
           <div className="flex items-center gap-2">
              <FiNavigation className="text-amber-500 shrink-0" size={14}/>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Head Position</span>
           </div>
           <p className="text-lg sm:text-2xl font-black text-white">Track {currentTrack}</p>
           <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Seek Direction: {diskState.head_direction > 0 ? 'Increasing' : 'Decreasing'}</p>
        </div>
      </div>

      {/* ── Disk Stats ─────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-8 py-4 sm:py-5 bg-white/2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-8">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Total Seek</span>
          <div className="flex items-center gap-2 text-amber-500">
             <FiZap size={12}/>
             <span className="text-xs font-black uppercase">{kernelState?.disk_metrics?.total_seek_distance || 0} Tracks</span>
          </div>
        </div>
        <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 pl-0 sm:pl-8">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Queue Depth</span>
          <div className="flex items-center gap-2">
             <FiActivity className="text-sky-500" size={12}/>
             <span className="text-xs font-black text-white uppercase">{diskState.queue?.length || 0} Requests</span>
          </div>
        </div>
        <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 pl-0 sm:pl-8">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Throughput</span>
          <div className="flex items-center gap-2 text-emerald-400">
             <span className="text-xs font-black uppercase">{kernelState?.disk_metrics?.throughput?.toFixed(2) || 0} req/s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiskTrajectory;
