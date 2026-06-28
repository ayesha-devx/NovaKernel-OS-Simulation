import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuX, 
  LuDatabase, 
  LuClock, 
  LuActivity, 
  LuHash,
  LuFingerprint,
  LuCalendar,
  LuGitFork,
  LuNetwork,
  LuLayers
} from 'react-icons/lu';
import ProcessStateBadge from '../process/ProcessStateBadge';

const DetailItem = ({ icon, label, value, color="text-primary" }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors">
    <div className={`${color} bg-white/5 p-2 rounded-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-text/40 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-text font-mono">{value}</p>
    </div>
  </div>
);

const ProcessDetailModal = ({ process, isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen || !process) return null;

  const states = ["NEW", "READY", "RUNNING", "WAITING", "TERMINATED"];
  const currentStateIdx = states.indexOf(process.state);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/90 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative w-full max-w-2xl glass border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/10 via-transparent to-transparent">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <LuActivity size={26} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text tracking-tight">{process.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">PID: {process.pid}</span>
                  <div className="w-1 h-1 rounded-full bg-text/20"></div>
                  <ProcessStateBadge state={process.state} />
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 text-text/40 hover:text-text transition-all active:scale-90"
            >
              <LuX size={22} />
            </button>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
            {/* 1. Core Resources Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <DetailItem icon={<LuActivity size={18} />} label="CPU Burst" value={`${process.burst_time}s`} />
              <DetailItem icon={<LuClock size={18} />} label="Execution" value={`${process.burst_remaining}s`} color="text-warning" />
              <DetailItem icon={<LuDatabase size={18} />} label="Memory Unit" value={`${process.memory_required}MB`} color="text-success" />
              <DetailItem icon={<LuHash size={18} />} label="Priority Lvl" value={process.priority} color="text-purple-400" />
              <DetailItem icon={<LuCalendar size={18} />} label="Timestamp" value={process.creation_timestamp} color="text-blue-400" />
              <DetailItem icon={<LuLayers size={18} />} label="Tree Depth" value={process.depth || 0} color="text-cyan-400" />
            </div>

            {/* 2. Process Lifecycle Timeline */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-text/40 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                Lifecycle Timeline
              </h3>
              <div className="flex items-center justify-between relative px-2 sm:px-4 py-2">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
                {states.map((state, idx) => {
                  const isCompleted = idx < currentStateIdx;
                  const isCurrent = idx === currentStateIdx;
                  
                  return (
                    <div key={state} className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
                      <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${
                        isCurrent 
                        ? 'bg-primary border-primary shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110 sm:scale-125' 
                        : isCompleted 
                        ? 'bg-success/20 border-success text-success' 
                        : 'bg-[#111827] border-white/10 text-text/20'
                      }`}>
                        {isCompleted ? <LuX size={12} className="rotate-45" /> : <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isCurrent ? 'bg-white' : 'bg-current'}`}></div>}
                      </div>
                      <span className={`text-[8px] sm:text-[9px] font-bold tracking-wider sm:tracking-widest ${isCurrent ? 'text-primary' : isCompleted ? 'text-success/60' : 'text-text/20'}`}>
                        {state}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 3. Hierarchy & Efficiency Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time & Efficiency Metrics */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Realtime Metrics</h3>
                    <div className="bg-white/2 rounded-2xl p-5 border border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-text/50">Waiting Time</span>
                            <span className="font-mono text-primary font-bold">{process.waiting_time}s</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-text/50">CPU Utilization</span>
                            <div className="flex items-center gap-2">
                                <span className={`font-mono font-bold ${process.state === 'RUNNING' ? 'text-success' : 'text-text/30'}`}>
                                    {process.state === 'RUNNING' ? '100%' : '0%'}
                                </span>
                                <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: process.state === 'RUNNING' ? '100%' : '0%' }}
                                        className="h-full bg-success"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-text/50">Kernel Sync Status</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-success/10 text-success uppercase">Active</span>
                        </div>
                    </div>
                </div>

                {/* Lineage & Family */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Family & Lineage</h3>
                    <div className="bg-cyan-500/5 rounded-2xl p-5 border border-cyan-500/10 space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-text/50">Parent Link</span>
                            <div className="flex items-center gap-2">
                                <LuFingerprint size={12} className="text-cyan-400" />
                                <span className="font-mono text-cyan-400 font-bold">
                                    {process.parent_pid ? `PID: ${process.parent_pid}` : 'SYSTEM ROOT'}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-text/50">Fork Relationship</span>
                            <span className="text-[10px] font-bold text-cyan-400/80">
                                {process.parent_pid ? 'Inherited PCB' : 'Primary PCB'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-text/50">Sub-Processes</span>
                            <span className="font-mono text-cyan-400 font-bold">{process.child_pids.length} Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Child Processes Visualization */}
            {process.child_pids.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-[10px] font-bold text-cyan-400/60 uppercase tracking-widest flex items-center gap-2">
                   <LuGitFork size={12} className="animate-pulse" /> Forked Child Units
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {process.child_pids.map(childPid => (
                    <div key={childPid} className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex flex-col items-center gap-1 hover:bg-cyan-500/10 transition-colors cursor-default">
                      <LuActivity size={14} className="text-cyan-400/50" />
                      <span className="font-mono text-xs text-cyan-400 font-bold">#{childPid}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Decoration */}
          <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
             <p className="text-[9px] text-text/20 uppercase tracking-[0.3em] font-medium">NovaOS Security Sandbox • Protected Process Memory</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProcessDetailModal;
