import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useKernel } from '../context/KernelContext';
import { 
  LuCamera, 
  LuRotateCcw, 
  LuHistory, 
  LuTrash2, 
  LuDownload, 
  LuShieldCheck, 
  LuActivity,
  LuHardDrive,
  LuClock
} from 'react-icons/lu';
import SnapshotCard from '../components/snapshot/SnapshotCard';
import SnapshotTimeline from '../components/snapshot/SnapshotTimeline';
import RestoreProgressModal from '../components/snapshot/RestoreProgressModal';
import DashboardLayout from '../components/layout/DashboardLayout';

const SnapshotCenter = () => {
  const context = useKernel();
  const kernelState = context?.kernelState || {};
  const socket = context?.socket;
  const [snapshotLabel, setSnapshotLabel] = useState("");
  
  console.log("SnapshotCenter: Mounting", { hasSocket: !!socket, state: kernelState });

  const history = kernelState.snapshotHistory || [];
  const isRestoring = kernelState.isRestoring || false;

  useEffect(() => {
    if (socket) {
      console.log("SnapshotCenter: Requesting list");
      socket.emit('LIST_SNAPSHOTS');
    }
  }, [socket]);

  const handleCreateSnapshot = () => {
    if (socket) {
      socket.emit('CREATE_SNAPSHOT', { label: snapshotLabel || "Manual System Snapshot" });
      setSnapshotLabel("");
    }
  };

  const handleToggleCheckpoints = () => {
    if (socket) {
      socket.emit('TOGGLE_CHECKPOINTS', { enabled: !kernelState.checkpointEnabled });
    }
  };

  return (
    <DashboardLayout title="SNAPSHOT CENTER">
      <div className="relative z-10 space-y-8 sm:space-y-10 pb-12 animate-in fade-in duration-700">
        {/* Cinematic Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-magenta/5 to-transparent rounded-3xl sm:rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative glass-premium rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-10 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(157,0,255,0.05)]">
             <div className="absolute inset-0 scanline-overlay opacity-20" />
             <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 blur-[120px] -mr-40 -mt-40" />
             
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 relative z-10">
               <div className="space-y-4 w-full lg:w-auto">
                 <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border shrink-0">
                        <LuCamera className="text-primary neon-text" size={28} />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">SNAPSHOT CENTER</h1>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(0,255,157,0.8)] indicator-pulse" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">Enterprise State Persistence & Restore Platform</p>
                          </div>
                      </div>
                    </div>
                 </div>
                 <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-0 sm:ml-19">
                   Hypervisor-level state persistence protocol. Capturing real-time kernel memory maps, process control blocks, and hardware register status for instant system restoration.
                 </p>
               </div>
               
               <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-4 sm:gap-6 w-full lg:w-auto">
                  <div className="flex items-center gap-8 px-4 sm:px-6 py-2.5 sm:py-3 glass-premium rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.02] justify-between sm:justify-start w-full sm:w-auto">
                      <div className="flex flex-col items-end gap-1">
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron">Storage_Status</span>
                           <div className="flex items-center gap-2">
                               <div className="w-1.5 h-4 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(157,0,255,1)]" />
                               <span className="text-xs font-mono font-black text-white">{history.length} / 15 SNAPSHOTS</span>
                           </div>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <div className="flex flex-col items-end gap-1">
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron">Sync_Flux</span>
                           <span className="text-sm font-black text-secondary neon-text uppercase">STABLE</span>
                      </div>
                  </div>

                  <button 
                      onClick={handleToggleCheckpoints}
                      className={`group/btn relative px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] font-orbitron transition-all hover:scale-105 active:scale-95 overflow-hidden border w-full sm:w-auto text-center flex items-center justify-center gap-3 ${kernelState.checkpointEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}
                  >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      <div className="flex items-center gap-3 relative z-10">
                          <LuShieldCheck size={16} className={kernelState.checkpointEnabled ? "animate-pulse" : ""} />
                          <span>Auto_Checkpoints: {kernelState.checkpointEnabled ? 'ENABLED' : 'DISABLED'}</span>
                      </div>
                  </button>
               </div>
             </div>
          </div>
        </motion.div>

        {/* Main Control Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Creation Control */}
          <div className="lg:col-span-4">
            <div className="glass-premium p-4 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-white/10 flex flex-col space-y-6 sm:space-y-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(157,0,255,0.8)]" />
                <h2 className="text-xl font-black text-white uppercase tracking-widest font-orbitron">
                  Capture_State
                </h2>
              </div>
              
              <p className="text-text/40 text-xs font-bold uppercase tracking-widest leading-loose relative z-10">
                Generate a hypervisor-level snapshot of all running processes, memory maps, and hardware registers.
              </p>

              <div className="space-y-4 sm:space-y-6 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 font-orbitron">Snapshot_Identifier</label>
                  <input 
                    type="text" 
                    value={snapshotLabel}
                    onChange={(e) => setSnapshotLabel(e.target.value)}
                    placeholder="E.G. PRE-STRESS_TEST_CAPTURE"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-mono text-sm placeholder:text-white/10"
                  />
                </div>

                <button 
                  onClick={handleCreateSnapshot}
                  disabled={kernelState.snapshotProgress}
                  className="group/btn relative w-full bg-primary/20 hover:bg-primary/30 disabled:opacity-30 disabled:cursor-not-allowed text-primary border border-primary/30 py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all font-black uppercase tracking-[0.3em] font-orbitron flex items-center justify-center gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  <LuCamera className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  <span>Initiate_Capture</span>
                </button>
              </div>

              {/* Snapshot Progress */}
              {kernelState.snapshotProgress && (
                <div className="mt-8 p-4 sm:p-6 bg-primary/10 border border-primary/20 rounded-xl sm:rounded-2xl animate-pulse relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-orbitron">
                      {kernelState.snapshotProgress.stage}_PROCESS...
                    </span>
                    <span className="text-xl font-black text-white font-orbitron">{kernelState.snapshotProgress.progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary shadow-[0_0_10px_rgba(157,0,255,1)] transition-all duration-500" 
                      style={{ width: `${kernelState.snapshotProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Restore Timeline */}
          <div className="lg:col-span-8">
            <div className="glass-premium p-4 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-white/10 flex flex-col space-y-6 sm:space-y-8 h-full relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 relative z-10 w-full">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-secondary rounded-full shadow-[0_0_15px_rgba(0,209,255,0.8)]" />
                  <h2 className="text-xl font-black text-white uppercase tracking-widest font-orbitron">
                    Restore_Timeline
                  </h2>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10 w-fit">
                  <LuClock className="w-3 h-3 text-secondary" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest font-orbitron">Retention: 15 Points</span>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl sm:rounded-[2rem] min-h-[250px] sm:min-h-[300px] relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <LuHistory className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] font-orbitron">No_Restore_Points_Found</p>
                  <p className="text-white/20 text-[10px] mt-2 uppercase tracking-widest font-bold font-orbitron">Capture system state to begin logging.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    {history.map((snapshot) => (
                      <SnapshotCard key={snapshot.id} snapshot={snapshot} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Restore Overlay */}
      {isRestoring && <RestoreProgressModal progress={kernelState.restoreProgress} />}
    </DashboardLayout>
  );
};

export default SnapshotCenter;
