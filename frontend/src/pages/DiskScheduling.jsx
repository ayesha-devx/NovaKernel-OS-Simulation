import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useProcess } from '../context/KernelContext';
import { 
  LuHardDrive, 
  LuActivity, 
  LuSettings, 
  LuTerminal, 
  LuPlus, 
  LuRefreshCw, 
  LuTrendingUp,
  LuCpu,
  LuClock
} from 'react-icons/lu';
import StatCard from '../components/dashboard/StatCard';
import axios from 'axios';
import { toast } from 'react-toastify';

// --- SUB-COMPONENT: DISK PLATTER VISUALIZATION ---
const DiskPlatter = ({ currentTrack, queue, activeRequest, maxTracks = 100 }) => {
  const radius = 120;
  const tracks = Array.from({ length: 8 }, (_, i) => (i + 1) * (radius / 8));

  return (
    <div className="relative flex items-center justify-center h-80 w-80 mx-auto">
      {/* Platter Background with Deep Radial Gradient */}
      <div className="absolute inset-0 rounded-full bg-[#050816] border-2 border-[#9D00FF]/30 shadow-[0_0_60px_rgba(157,0,255,0.2)] overflow-hidden">
        {/* Animated Scanning Radial Effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ 
            background: 'conic-gradient(from 0deg, transparent 70%, #00D1FF 100%)',
            animation: 'spin 4s linear infinite'
          }} 
        />
        <div className="absolute inset-0 opacity-5 pointer-events-none cyber-grid-small"></div>
        <div className="absolute inset-[10%] rounded-full border border-[#00D1FF]/10"></div>
        <div className="absolute inset-[30%] rounded-full border border-[#00D1FF]/5"></div>
      </div>

      {/* Neon Tracks */}
      {tracks.map((r, i) => (
        <div 
          key={i} 
          className="absolute rounded-full border border-[#9D00FF]/10 shadow-[0_0_10px_rgba(157,0,255,0.05)]" 
          style={{ width: r * 2, height: r * 2 }}
        />
      ))}

      {/* Central Spindle Hub */}
      <div className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-[#0B1020] to-[#050816] border-2 border-[#9D00FF]/50 z-20 shadow-[0_0_20px_rgba(157,0,255,0.4)] flex items-center justify-center">
         <div className="w-4 h-4 rounded-full bg-[#00D1FF] animate-pulse shadow-[0_0_15px_#00D1FF]"></div>
         <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-20"></div>
      </div>

      {/* Futuristic Head Assembly */}
      <motion.div 
        className="absolute h-1.5 w-44 bg-gradient-to-r from-transparent via-[#9D00FF]/40 to-[#00D1FF] origin-left left-1/2 z-30 flex items-center justify-end"
        style={{ transformOrigin: '0% 50%' }}
        animate={{ 
          rotate: (currentTrack / maxTracks) * 360,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      >
        <div className="relative">
          <div className="w-6 h-6 bg-[#00D1FF] rounded-sm shadow-[0_0_25px_#00D1FF] flex items-center justify-center">
             <div className="w-1.5 h-3 bg-white/80 rounded-full shadow-[0_0_10px_white]"></div>
          </div>
          <div className="absolute -inset-2 border border-[#00D1FF]/50 rounded-lg animate-pulse"></div>
        </div>
      </motion.div>

      {/* Pending Requests on Platter (Neon Dots) */}
      {queue.map((req, idx) => (
        <motion.div
          key={req.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute w-2.5 h-2.5 rounded-full z-10"
          style={{
            backgroundColor: req.type === 'WRITE' ? '#FF4D6D' : '#00D1FF',
            left: `calc(50% + ${Math.cos((idx * 45) * (Math.PI / 180)) * ((req.track / maxTracks) * radius * 0.8 + 15)}px)`,
            top: `calc(50% + ${Math.sin((idx * 45) * (Math.PI / 180)) * ((req.track / maxTracks) * radius * 0.8 + 15)}px)`,
            boxShadow: `0 0 12px ${req.type === 'WRITE' ? '#FF4D6D' : '#00D1FF'}`,
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        />
      ))}
      
      {/* Active Request Pulse */}
      {activeRequest && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="absolute w-4 h-4 rounded-full z-20 border-2 border-white shadow-[0_0_20px_white]"
          style={{
            backgroundColor: activeRequest.type === 'WRITE' ? '#FF4D6D' : '#00D1FF',
            left: `calc(50% + ${Math.cos((currentTrack / maxTracks) * 2 * Math.PI) * ((activeRequest.track / maxTracks) * radius * 0.8 + 15)}px)`,
            top: `calc(50% + ${Math.sin((currentTrack / maxTracks) * 2 * Math.PI) * ((activeRequest.track / maxTracks) * radius * 0.8 + 15)}px)`,
          }}
        />
      )}
    </div>
  );
};

// --- SUB-COMPONENT: TRACK SEEK BAR ---
const TrackSeekBar = ({ currentTrack, maxTracks = 100, headPath = [] }) => {
  return (
    <div className="relative w-full h-28 bg-[#0B1020]/60 rounded-3xl border border-[#00D1FF]/20 p-8 overflow-hidden backdrop-blur-xl shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
      {/* Futuristic Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }}></div>
      
      {/* Background Grid Lines */}
      <div className="absolute inset-0 flex justify-between px-8 py-4 opacity-5 pointer-events-none">
        {Array.from({ length: 21 }, (_, i) => (
          <div key={i} className="w-[1px] h-full bg-[#00D1FF]"></div>
        ))}
      </div>

      <div className="relative h-full w-full flex items-center">
        {/* Main Track Line with Neon Glow */}
        <div className="w-full h-1 bg-[#9D00FF]/20 rounded-full relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#9D00FF]/50 via-[#00D1FF]/50 to-[#9D00FF]/50 blur-[2px]"></div>
        </div>

        {/* Dynamic Seek Trail Trail */}
        {headPath.length > 0 && (
          <div 
            className="absolute h-1.5 bg-gradient-to-r from-[#9D00FF] to-[#00D1FF] blur-[4px] rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(0,209,255,0.5)]"
            style={{ 
              left: `${(Math.min(...headPath, currentTrack) / maxTracks) * 100}%`,
              width: `${(Math.abs((Math.max(...headPath, currentTrack) - Math.min(...headPath, currentTrack))) / maxTracks) * 100}%`
            }}
          />
        )}

        {/* Current Head Indicator */}
        <motion.div 
          className="absolute z-20 flex flex-col items-center"
          animate={{ left: `${(currentTrack / maxTracks) * 100}%` }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
        >
          <div className="relative h-10 flex flex-col items-center">
            <div className="w-1.5 h-full bg-[#00D1FF] shadow-[0_0_15px_#00D1FF]"></div>
            <div className="absolute -top-1 w-3 h-3 bg-[#00D1FF] rotate-45 shadow-[0_0_10px_#00D1FF]"></div>
          </div>
          <div className="mt-3 bg-[#00D1FF] text-[#050816] px-2.5 py-1 rounded-md text-[9px] font-black font-mono shadow-[0_0_15px_rgba(0,209,255,0.5)] border border-white/30">
            TRACK {currentTrack.toString().padStart(2, '0')}
          </div>
        </motion.div>

        {/* Start/End Neon Markers */}
        <div className="absolute -bottom-2 left-0 text-[10px] font-black font-mono text-[#9D00FF] drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">00</div>
        <div className="absolute -bottom-2 right-0 text-[10px] font-black font-mono text-[#9D00FF] drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">{maxTracks-1}</div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const DiskScheduling = () => {
  const { 
    disk = {}, 
    diskMetrics = {}, 
    isLoading,
    addDiskRequest,
    setDiskAlgorithm,
    simulateDiskLoad,
    resetDiskQueue,
    refreshState // New: To force a sync
  } = useProcess();

  const [targetTrack, setTargetTrack] = useState(50);
  const [isSimulating, setIsSimulating] = useState(false);

  // Instant Sync on Mount
  useEffect(() => {
    console.log("[DISK_UI] Initializing Disk Module...");
    if (refreshState) refreshState();
  }, [refreshState]);

  const algorithms = ["FCFS", "SSTF", "SCAN", "C-SCAN"];

  const setAlgorithm = async (algo) => {
    try {
      await setDiskAlgorithm(algo);
      toast.success(`Algorithm: ${algo} active`);
    } catch (err) {
      toast.error("Kernel error");
    }
  };

  const addRequest = async (op = "READ") => {
    try {
      await addDiskRequest(targetTrack, op);
      toast.success(`${op} Request Queued at Track ${targetTrack}`);
    } catch (err) {
      toast.error("Failed to queue request");
    }
  };

  const onSimulateLoad = async () => {
    try {
      setIsSimulating(true);
      toast.info("Generating Random I/O Load...");
      await simulateDiskLoad(10);
      setTimeout(() => setIsSimulating(false), 1000);
    } catch (err) {
      setIsSimulating(false);
    }
  };

  const resetDisk = async () => {
    if (window.confirm("Purge Disk Queue?")) {
      await resetDiskQueue();
      toast.info("Disk State Reset");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="DISK SCHEDULER">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="DISK SCHEDULER">
      <div className="relative z-10 space-y-10 pb-12">
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
                        <LuHardDrive className="text-primary neon-text" size={32} />
                    </div>
                    <div>
                      <h1 className="text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">DISK SCHEDULING</h1>
                      <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_#00FF9D] indicator-pulse" />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">I/O_Traversal_Optimizer_v2</p>
                      </div>
                    </div>
                 </div>
                 <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-19">
                   Optimizing physical disk head traversal patterns using FCFS, SSTF, and SCAN protocols. Reducing rotational latency and seek time via intelligent request queuing.
                 </p>
               </div>
               
               <div className="flex items-center gap-8 px-6 py-3 glass-premium rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron">Controller_Status</span>
                      <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-4 ${disk.is_moving ? 'bg-primary animate-pulse shadow-[0_0_8px_#9D00FF]' : 'bg-success shadow-[0_0_8px_#00FF9D]'} rounded-full`} />
                          <span className="text-xs font-mono font-black text-white uppercase">{disk.is_moving ? 'SEEKING' : 'IDLE'}</span>
                      </div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron">Algorithm_Core</span>
                      <span className="text-sm font-black text-secondary neon-text uppercase">{disk.current_algorithm || 'FCFS'}</span>
                  </div>
               </div>
             </div>
          </div>
        </motion.div>
        <style>
          {`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .cyber-grid-small { background-image: radial-gradient(circle, #00D1FF 0.5px, transparent 0.5px); background-size: 10px 10px; }
            .neon-border-cyan { border-color: rgba(0, 209, 255, 0.3); box-shadow: 0 0 15px rgba(0, 209, 255, 0.1); }
            .neon-border-purple { border-color: rgba(157, 0, 255, 0.3); box-shadow: 0 0 15px rgba(157, 0, 255, 0.1); }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 209, 255, 0.3); border-radius: 10px; }
          `}
        </style>
        
        {/* Top Stats - Futuristic Cyber Deck Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="TOTAL SEEK" value={`${diskMetrics.total_seek_distance || 0}`} icon={<LuTrendingUp />} color="primary" />
          <StatCard title="AVG SEEK" value={`${diskMetrics.avg_seek_distance || 0}`} icon={<LuActivity />} color="magenta" />
          <StatCard title="THROUGHPUT" value={`${diskMetrics.throughput || 0} req/m`} icon={<LuHardDrive />} color="secondary" />
          <StatCard title="UTILIZATION" value={`${diskMetrics.disk_utilization || 0}%`} icon={<LuSettings />} color="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualizer Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#0B1020]/40 border border-[#9D00FF]/20 rounded-[2.5rem] p-10 backdrop-blur-3xl relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)]">
               {/* Deep Atmosphere Glows */}
               <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#9D00FF]/10 blur-[100px] rounded-full"></div>
               <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#00D1FF]/10 blur-[100px] rounded-full"></div>
               
               {/* Cyberpunk grid overlay */}
               <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #9D00FF 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
               
               <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h3 className="text-3xl font-black text-white flex items-center gap-4 tracking-tight">
                    <div className="p-3 bg-[#00D1FF]/10 rounded-2xl border border-[#00D1FF]/30">
                      <LuHardDrive className="text-[#00D1FF] drop-shadow-[0_0_8px_#00D1FF]" /> 
                    </div>
                    DISK CONTROLLER
                  </h3>
                  <p className="text-[#9D00FF] text-[10px] font-black mt-2 uppercase tracking-[0.4em] opacity-80 flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#9D00FF] rounded-full animate-pulse"></span>
                    Real-time Track Traversal Visualizer
                  </p>
                </div>
                
                <div className="flex bg-[#050816]/60 p-2 rounded-2xl border border-[#00D1FF]/20 backdrop-blur-md shadow-inner">
                  {algorithms.map(algo => (
                    <button 
                      key={algo}
                      onClick={() => setAlgorithm(algo)} 
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all relative overflow-hidden group ${disk.current_algorithm === algo ? 'text-[#050816]' : 'text-slate-500 hover:text-[#00D1FF]'}`}
                    >
                      {disk.current_algorithm === algo && (
                        <motion.div layoutId="algo-bg" className="absolute inset-0 bg-[#00D1FF] shadow-[0_0_25px_#00D1FF]" />
                      )}
                      <span className="relative z-10">{algo}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                <DiskPlatter 
                  currentTrack={disk.current_track || 0} 
                  queue={disk.queue || []} 
                  activeRequest={disk.active_request}
                />
                <div className="space-y-8">
                  <div className="p-8 bg-[#050816]/50 border border-[#00D1FF]/10 rounded-[2rem] backdrop-blur-md relative overflow-hidden group hover:border-[#00D1FF]/30 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LuActivity size={40} className="text-[#00D1FF]" />
                    </div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-[#00D1FF]"></span>
                      Controller Telemetry
                    </h4>
                    <div className="space-y-5">
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Track</span>
                          <span className="text-xl font-mono font-black text-[#00D1FF] drop-shadow-[0_0_8px_#00D1FF]">#{disk.current_track || 0}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Head Direction</span>
                          <span className="text-xs font-black text-white uppercase tracking-widest px-3 py-1 bg-[#9D00FF]/10 border border-[#9D00FF]/30 rounded-lg">{disk.head_direction === 1 ? 'UP / OUTER' : 'DOWN / INNER'}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">I/O Status</span>
                          <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${disk.is_moving ? 'bg-[#00FF9D] shadow-[0_0_10px_#00FF9D]' : 'bg-slate-700'} ${disk.is_moving && 'animate-pulse'}`}></div>
                             <span className={`text-xs font-black uppercase tracking-widest ${disk.is_moving ? 'text-[#00FF9D]' : 'text-slate-500'}`}>{disk.is_moving ? 'SEEKING' : 'READY'}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="p-8 bg-[#0B1020]/60 border border-[#9D00FF]/10 rounded-[2rem] backdrop-blur-md relative">
                    <h4 className="text-[11px] font-black text-[#9D00FF] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-[#9D00FF]"></span>
                      Manual Command Deck
                    </h4>
                    <div className="flex flex-col gap-6">
                       <div className="space-y-3">
                          <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest">
                             <span>Target Track Selection</span>
                             <span className="text-[#00D1FF]">{targetTrack}</span>
                          </div>
                          <div className="relative h-6 flex items-center">
                            <input 
                              type="range" 
                              min="0" 
                              max="99" 
                              value={targetTrack} 
                              onChange={(e) => setTargetTrack(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-[#050816] rounded-full appearance-none cursor-pointer accent-[#00D1FF]"
                            />
                            <div className="absolute top-0 h-1.5 bg-[#00D1FF]/20 pointer-events-none rounded-full" style={{ width: `${targetTrack}%` }}></div>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <button onClick={() => addRequest('READ')} className="flex-1 py-4 bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#00D1FF] hover:text-[#050816] hover:shadow-[0_0_30px_#00D1FF] transition-all duration-300 flex items-center justify-center gap-3">
                             <LuHardDrive size={16}/> READ
                          </button>
                          <button onClick={() => addRequest('WRITE')} className="flex-1 py-4 bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-[#FF4D6D] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#FF4D6D] hover:text-white hover:shadow-[0_0_30px_#FF4D6D] transition-all duration-300 flex items-center justify-center gap-3">
                             <LuPlus size={16}/> WRITE
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <TrackSeekBar 
                  currentTrack={disk.current_track || 0} 
                  headPath={disk.head_path || []}
                />
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-[#0B1020]/40 border border-[#FFC857]/10 rounded-[2.5rem] p-8 backdrop-blur-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFC857]/5 blur-3xl rounded-full"></div>
                  <h3 className="text-[10px] font-black text-slate-500 mb-8 flex items-center gap-3 uppercase tracking-[0.3em]">
                    <div className="p-2 bg-[#FFC857]/10 rounded-lg">
                      <LuActivity className="text-[#FFC857]" /> 
                    </div>
                    Seek Efficiency Core
                  </h3>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-4xl font-black text-white tracking-tighter">{diskMetrics.avg_seek_distance || 0}</span>
                          <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Tracks / OP</span>
                       </div>
                       <div className="h-16 w-[1px] bg-white/5 mx-4"></div>
                       <div className="flex flex-col items-end">
                          <span className="text-4xl font-black text-[#9D00FF] tracking-tighter drop-shadow-[0_0_10px_#9D00FF33]">{disk.completed_requests?.length || 0}</span>
                          <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Total Cycles</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        <span>Optimization Level</span>
                        <span className="text-[#00FF9D]">{(100 - Math.min(100, (diskMetrics.avg_seek_distance || 0) * 1.5)).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#050816] rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (diskMetrics.avg_seek_distance || 0) * 2)}%` }}
                          className="h-full bg-gradient-to-r from-[#9D00FF] to-[#00D1FF]" 
                        />
                      </div>
                    </div>
                  </div>
               </div>

               <div className="bg-[#0B1020]/40 border border-[#00FF9D]/10 rounded-[2.5rem] p-8 backdrop-blur-2xl flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00FF9D]/5 blur-3xl rounded-full"></div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-slate-500 flex items-center gap-3 uppercase tracking-[0.3em]">
                      <div className="p-2 bg-[#00FF9D]/10 rounded-lg">
                        <LuTrendingUp className="text-[#00FF9D]" /> 
                      </div>
                      Real-time I/O Load
                    </h3>
                    <span className="text-[9px] font-black text-[#00FF9D] animate-pulse uppercase tracking-widest bg-[#00FF9D]/10 px-2 py-1 rounded-md border border-[#00FF9D]/20">Live Feed</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-24">
                     {Array.from({ length: 24 }).map((_, i) => (
                       <motion.div 
                        key={i} 
                        initial={{ height: "20%" }}
                        animate={{ height: [`${20 + Math.random() * 40}%`, `${40 + Math.random() * 60}%`, `${20 + Math.random() * 40}%`] }}
                        transition={{ duration: 1 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
                        className="flex-1 bg-[#00FF9D]/20 rounded-t-sm border-t border-[#00FF9D]/40 group-hover:bg-[#00FF9D]/40 transition-colors" 
                       />
                     ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Right Sidebar: Queue & History */}
          <div className="space-y-8">
             <div className="bg-[#0B1020]/60 border border-[#00D1FF]/10 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden">
                 <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-white flex items-center gap-3 uppercase tracking-[0.2em]">
                    <LuSettings className="text-[#9D00FF]" /> 
                    Command Control
                  </h3>
                  <div className="flex gap-1 bg-[#050816]/60 p-1 rounded-xl border border-white/5">
                    <button onClick={refreshState} className="p-2 text-slate-500 hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 rounded-lg transition-all" title="Sync Telemetry">
                      <LuActivity size={14}/>
                    </button>
                    <button onClick={resetDisk} className="p-2 text-slate-500 hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/10 rounded-lg transition-all" title="Purge Controller Queue">
                      <LuRefreshCw size={14}/>
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={onSimulateLoad}
                    disabled={isSimulating}
                    className="w-full py-5 bg-gradient-to-r from-[#00D1FF]/10 to-[#9D00FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] rounded-[1.5rem] font-black text-[10px] tracking-[0.3em] shadow-lg hover:from-[#00D1FF]/20 hover:to-[#9D00FF]/20 transition-all flex items-center justify-center gap-4 uppercase group"
                  >
                    <LuHardDrive size={16} className="group-hover:scale-110 transition-transform" /> {isSimulating ? 'Initializing...' : 'Run Simulation Load'}
                  </button>
                </div>
             </div>

             {/* Active / Next Queue */}
             <div className="bg-[#0B1020]/60 border border-[#00D1FF]/10 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden">
                <h3 className="text-xs font-black text-slate-500 mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
                  <LuClock className="text-[#00D1FF]" /> 
                  I/O Wait Queue
                </h3>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                   {disk.active_request && (
                      <div className="p-6 bg-gradient-to-br from-[#00D1FF] to-[#00D1FF]/80 text-[#050816] rounded-2xl border border-[#00D1FF] shadow-[0_0_30px_rgba(0,209,255,0.3)] relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-3 opacity-20 rotate-12 group-hover:rotate-45 transition-transform">
                            <LuHardDrive size={40} />
                         </div>
                         <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-[#050816]/10 px-2 py-0.5 rounded">Current Process</span>
                            <span className="text-[10px] font-black font-mono">ID_{disk.active_request.id}</span>
                         </div>
                         <div className="flex items-center justify-between relative z-10">
                            <span className="text-xl font-black">{disk.active_request.type} TRACK {disk.active_request.track}</span>
                            <div className="animate-pulse">
                              <LuActivity size={20} />
                            </div>
                         </div>
                      </div>
                   )}

                   <div className="space-y-3">
                     {disk.queue?.length > 0 ? (
                        disk.queue.map((req, i) => (
                          <div key={req.id} className="flex items-center gap-4 p-4 bg-[#050816]/40 rounded-2xl border border-white/5 group hover:border-[#00D1FF]/30 transition-all duration-300">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 font-black text-xs ${req.type === 'WRITE' ? 'bg-[#FF4D6D]/10 border-[#FF4D6D]/20 text-[#FF4D6D] shadow-[0_0_10px_rgba(255,77,109,0.2)]' : 'bg-[#00D1FF]/10 border-[#00D1FF]/20 text-[#00D1FF] shadow-[0_0_10px_rgba(0,209,255,0.2)]'}`}>
                                {req.type[0]}
                             </div>
                             <div className="flex-1">
                                <p className="text-xs font-black text-white uppercase tracking-wider">TRACK {req.track}</p>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">PID: {req.pid}</p>
                             </div>
                             <div className="text-[10px] font-black text-slate-700 bg-black/30 px-2 py-1 rounded-md">
                               POS_{i + 1}
                             </div>
                          </div>
                        ))
                     ) : !disk.active_request && (
                        <div className="text-center py-12 bg-[#050816]/20 rounded-3xl border border-dashed border-white/10">
                           <LuHardDrive className="mx-auto text-slate-800 mb-4 opacity-50" size={32} />
                           <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.3em]">Standby Mode</p>
                           <p className="text-[9px] text-slate-700 font-bold mt-1">Awaiting I/O Requests</p>
                        </div>
                     )}
                   </div>
                </div>
             </div>

             {/* Completed Journal */}
             <div className="bg-[#0B1020]/60 border border-[#00FF9D]/10 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden">
                <h3 className="text-xs font-black text-slate-500 mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
                  <LuTerminal className="text-[#00FF9D]" /> 
                  I/O Journal Log
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   {disk.completed_requests?.slice().reverse().map((req, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 opacity-70 hover:opacity-100 hover:bg-white/10 transition-all duration-300">
                         <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                               <p className="text-[11px] font-black text-white uppercase tracking-wider">{req.type} AT TRACK_{req.track}</p>
                               <span className="text-[9px] font-black text-[#00FF9D] bg-[#00FF9D]/10 px-2 py-0.5 rounded border border-[#00FF9D]/20">SEEK: {req.seek_cost}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                               <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                className="h-full bg-gradient-to-r from-[#00FF9D]/60 to-[#00FF9D]/20" 
                               />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DiskScheduling;
