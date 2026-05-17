import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useKernel } from '../context/KernelContext';
import { 
  LuPlay, LuPause, LuSquare, LuFastForward, 
  LuMonitor, LuSettings, LuActivity, LuCpu, 
  LuDatabase, LuHardDrive, LuTriangleAlert, LuCircleCheck,
  LuTerminal 
} from 'react-icons/lu';
import BootSequence from '../components/demo/BootSequence';

const DemoMode = () => {
  const { 
    kernelState, 
    startShowcase, 
    stopShowcase, 
    pauseShowcase, 
    resumeShowcase,
    setDemoSpeed 
  } = useKernel();
  
  const demo = kernelState.demo || { active: false, progress: 0, current_sequence: 'IDLE' };
  const [showBoot, setShowBoot] = useState(false);

  useEffect(() => {
    if (demo.active && demo.current_sequence === 'BOOT') {
      setShowBoot(true);
    } else {
      // Small delay before hiding boot sequence to finish animation
      if (demo.current_sequence !== 'BOOT' && showBoot) {
        setTimeout(() => setShowBoot(false), 2000);
      }
    }
  }, [demo.active, demo.current_sequence]);

  const sequences = [
    { id: 'BOOT', label: 'System Boot', icon: <LuSettings /> },
    { id: 'CPU', label: 'CPU Load', icon: <LuCpu /> },
    { id: 'MEMORY', label: 'RAM Stress', icon: <LuDatabase /> },
    { id: 'DISK', label: 'Disk I/O', icon: <LuHardDrive /> },
    { id: 'DEADLOCK', label: 'Deadlock/Recovery', icon: <LuTriangleAlert /> },
    { id: 'FINALIZE', label: 'Final Audit', icon: <LuCircleCheck /> }
  ];

  return (
    <DashboardLayout>
      <BootSequence 
        active={showBoot} 
        currentStep={demo.current_step} 
        progress={demo.progress} 
      />

      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <LuMonitor size={24} />
              </div>
              <h2 className="text-3xl font-bold text-text tracking-tight">Showcase Engine</h2>
            </div>
            <p className="text-text/50 text-sm">Cinematic orchestration of NovaOS's autonomous subsystems.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-text/30 font-bold uppercase tracking-widest block mb-1">Engine Status</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${demo.active ? 'border-primary/50 text-primary bg-primary/5' : 'border-white/10 text-text/30'}`}>
                {demo.active ? (demo.paused ? 'PAUSED' : 'ORCHESTRATING') : 'STANDBY'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-text/20">
               <LuActivity size={20} className={demo.active && !demo.paused ? 'animate-pulse text-primary' : ''} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
              
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-text uppercase tracking-widest mb-8">Demo Master Controls</h3>
                
                <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center gap-6">
                      {!demo.active ? (
                        <button 
                          onClick={startShowcase}
                          className="w-20 h-20 rounded-full bg-primary text-background flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:scale-110 transition-transform active:scale-95 group"
                        >
                          <LuPlay size={32} fill="currentColor" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={demo.paused ? resumeShowcase : pauseShowcase}
                            className="w-20 h-20 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary/5 transition-all active:scale-95"
                          >
                            {demo.paused ? <LuPlay size={32} fill="currentColor" /> : <LuPause size={32} fill="currentColor" />}
                          </button>
                          <button 
                            onClick={stopShowcase}
                            className="w-12 h-12 rounded-full border border-error/30 text-error flex items-center justify-center hover:bg-error/10 transition-all"
                          >
                            <LuSquare size={20} fill="currentColor" />
                          </button>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-xl font-bold text-text mb-1">
                          {demo.active ? `Scenario: ${demo.current_sequence}` : 'Ready for Launch'}
                        </p>
                        <p className="text-xs text-text/40 font-medium italic">
                          {demo.active ? demo.current_step : 'Click start to begin the automated showcase.'}
                        </p>
                      </div>
                   </div>

                   <div className="hidden sm:flex flex-col items-end gap-2">
                      <span className="text-[10px] text-text/30 font-bold uppercase tracking-widest">Playback Speed</span>
                      <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
                        {[0.5, 1, 2].map(speed => (
                          <button
                            key={speed}
                            onClick={() => setDemoSpeed(speed)}
                            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${demo.playback_speed === speed ? 'bg-primary text-background' : 'text-text/50 hover:bg-white/5'}`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                {/* Progress Visualizer */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-primary">STAGE {sequences.findIndex(s => s.id === demo.current_sequence) + 1}</span>
                        <span className="text-[10px] text-text/20">/</span>
                        <span className="text-[10px] text-text/40 font-bold">TOTAL 6</span>
                     </div>
                     <span className="text-xs font-mono text-primary font-bold">{demo.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${demo.progress}%` }}
                        className="h-full bg-gradient-to-r from-primary/40 to-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                     />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline View */}
            <div className="glass rounded-3xl p-8 border border-white/5">
               <h3 className="text-sm font-bold text-text uppercase tracking-widest mb-8">Showcase Timeline</h3>
               <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-white/5" />
                  
                  <div className="space-y-8 relative z-10">
                    {sequences.map((seq, idx) => {
                      const isActive = demo.current_sequence === seq.id;
                      const isCompleted = sequences.findIndex(s => s.id === demo.current_sequence) > idx;
                      
                      return (
                        <div key={seq.id} className={`flex items-start gap-6 transition-all duration-500 ${isActive ? 'scale-105' : (isCompleted ? 'opacity-50' : 'opacity-30')}`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg border transition-all duration-500 ${isActive ? 'bg-primary text-background border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' : (isCompleted ? 'border-primary/30 text-primary bg-primary/5' : 'border-white/5 text-text/20')}`}>
                            {seq.icon}
                          </div>
                          <div className="flex-1 pt-1">
                             <div className="flex justify-between items-center mb-1">
                                <h4 className={`text-sm font-bold tracking-wide ${isActive ? 'text-primary' : 'text-text/80'}`}>{seq.label}</h4>
                                {isActive && <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded font-black animate-pulse uppercase tracking-tighter">Active Sequence</span>}
                             </div>
                             <p className="text-[10px] text-text/40 font-medium">Orchestrated automated routine for the {seq.id} subsystem.</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>
          </div>

          {/* Side Info / Logs */}
          <div className="space-y-8">
            <div className="glass rounded-3xl p-6 border border-white/5">
               <h3 className="text-xs font-bold text-text uppercase tracking-widest mb-6 flex items-center gap-2">
                 <LuActivity size={14} className="text-primary" />
                 Showcase Telemetry
               </h3>
               <div className="space-y-4">
                  {[
                    { label: 'Uptime', value: `${demo.uptime || 0}s`, color: 'text-text' },
                    { label: 'Complexity', value: 'ADVANCED', color: 'text-primary' },
                    { label: 'Subsystems', value: 'SYNCED', color: 'text-success' },
                    { label: 'Recovery', value: 'ENABLED', color: 'text-success' },
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] text-text/30 font-bold uppercase">{stat.label}</span>
                      <span className={`text-xs font-mono font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col h-[400px]">
               <h3 className="text-xs font-bold text-text uppercase tracking-widest mb-6">Execution Log</h3>
               <div className="flex-1 overflow-y-auto space-y-3 font-mono">
                  {kernelState.logs.filter(l => l.module === 'DEMO').slice(-20).reverse().map((log, i) => (
                    <div key={i} className="text-[10px] leading-relaxed border-l-2 border-primary/20 pl-3">
                       <span className="text-text/20 block mb-0.5">[{new Date().toLocaleTimeString()}]</span>
                       <span className="text-text/70">{log.message}</span>
                    </div>
                  ))}
                  {kernelState.logs.filter(l => l.module === 'DEMO').length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 text-center">
                       <LuTerminal size={32} className="mb-2" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">No Logs Available</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DemoMode;
