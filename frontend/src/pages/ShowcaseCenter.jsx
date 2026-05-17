import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useKernel } from '../context/KernelContext';
import { toast } from 'react-toastify';
import { 
  LuPlay, 
  LuPause, 
  LuSquare, 
  LuChevronRight, 
  LuCpu, 
  LuHardDrive, 
  LuActivity, 
  LuShieldAlert, 
  LuTerminal,
  LuClock,
  LuHistory,
  LuMonitor,
  LuEye
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShowcaseCenter = () => {
  const { showcase, startShowcase, stopShowcase, pauseShowcase, resumeShowcase } = useKernel();
  const [availableScenarios, setAvailableScenarios] = useState([]);
  const [isLaunching, setIsLaunching] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/showcase/scenarios');
        setAvailableScenarios(res.data);
      } catch (err) {
        console.error("Failed to load scenarios");
        toast.error("Subsystem Link Failure: Showcase Registry Unreachable");
      }
    };
    fetchScenarios();
  }, []);

  // Sync launching state with global showcase activity
  useEffect(() => {
    if (showcase?.active) {
      setIsLaunching(null);
    }
  }, [showcase?.active]);

  const handleStart = async (id) => {
    if (showcase?.active || isLaunching) return;
    setIsLaunching(id);
    try {
      await startShowcase(id);
      toast.success("Orchestration Engine Engaged", { theme: 'dark' });
      // Note: isLaunching is cleared by the useEffect when showcase.active becomes true
    } catch (err) {
      toast.error("Orchestration Failed");
      setIsLaunching(null);
    }
  };

  const getIcon = (id) => {
    switch (id) {
      case 'deadlock_demo': return <LuShieldAlert className="w-6 h-6 text-error-400" />;
      case 'scheduler_demo': return <LuCpu className="w-6 h-6 text-primary" />;
      case 'memory_demo': return <LuActivity className="w-6 h-6 text-success-400" />;
      case 'disk_demo': return <LuHardDrive className="w-6 h-6 text-warning-400" />;
      default: return <LuTerminal className="w-6 h-6 text-text/40" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Cinematic Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-magenta/5 to-transparent rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative glass-premium rounded-[2.5rem] p-10 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(157,0,255,0.05)]">
             <div className="absolute inset-0 scanline-overlay opacity-20" />
             <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 blur-[120px] -mr-40 -mt-40" />
             
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
               <div className="space-y-4">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border shadow-[0_0_20px_rgba(157,0,255,0.2)]">
                        <LuMonitor className="text-primary neon-text" size={32} />
                    </div>
                    <div>
                      <h1 className="text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">SHOWCASE CENTER</h1>
                      <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${showcase?.active ? 'bg-success shadow-[0_0_10px_#00FF9D]' : 'bg-slate-500 shadow-[0_0_10px_rgba(255,255,255,0.2)]'} indicator-pulse`} />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">NovaOS Presentation Orchestrator v1.3</p>
                      </div>
                    </div>
                 </div>
                 <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-19">
                   Orchestrating high-fidelity system audits and autonomous execution sequences. Perfecting stakeholder presentations through high-speed automation and cinematic subsystem visualizers.
                 </p>
               </div>
               
               <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                 <div className="flex items-center gap-3 px-6 py-2.5 bg-black/40 rounded-xl border border-white/5 font-orbitron">
                    <div className={`w-2 h-2 rounded-full ${showcase?.active ? 'bg-success shadow-[0_0_12px_#00FF9D]' : 'bg-white/20'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                       STATUS: <span className={showcase?.active ? 'text-success' : 'text-white/40'}>{showcase?.active ? 'ORCHESTRATING' : 'READY_STANDBY'}</span>
                    </span>
                 </div>
               </div>
             </div>
          </div>
        </motion.div>

        {/* Active Scenario Banner */}
        <AnimatePresence>
          {showcase?.active && (
            <motion.div 
              initial={{ height: 0, opacity: 0, scale: 0.95 }}
              animate={{ height: 'auto', opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.95 }}
              className="glass border-primary/30 rounded-[2rem] p-8 mb-8 overflow-hidden relative"
            >
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="flex-1 space-y-6 w-full">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Active Sequence</span>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{showcase.scenario_id?.replace('_', ' ')}</h2>
                    </div>
                    <span className="text-3xl font-black text-primary italic font-mono">{showcase.progress}%</span>
                  </div>
                  
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${showcase.progress}%` }}
                    />
                  </div>

                  <div className="bg-black/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
                    <div className="flex items-start gap-4">
                      <LuTerminal className="w-5 h-5 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="text-white font-mono italic text-sm leading-relaxed mb-4">"{showcase.last_narration}"</p>
                        
                        {/* JUMP TO VIEW BUTTON */}
                        <button 
                          onClick={() => {
                            const id = showcase.scenario_id?.toLowerCase() || "";
                            if (id.includes('scheduler')) navigate('/scheduler');
                            else if (id.includes('deadlock')) navigate('/deadlock');
                            else if (id.includes('memory')) navigate('/memory');
                            else if (id.includes('disk')) navigate('/disk-scheduling');
                            else if (id.includes('hardware')) navigate('/hardware');
                          }}
                          className="flex items-center gap-2 text-[10px] font-black text-primary hover:text-white transition-colors uppercase tracking-[0.2em]"
                        >
                          <LuEye className="w-4 h-4" /> View Live Subsystem Action
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 w-full md:w-64">
                  {showcase.paused ? (
                    <button onClick={resumeShowcase} className="flex-1 p-4 bg-success-500 text-white rounded-xl transition-all flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-lg shadow-success-500/20">
                      <LuPlay className="w-5 h-5" /> Resume
                    </button>
                  ) : (
                    <button onClick={pauseShowcase} className="flex-1 p-4 bg-warning-500 text-white rounded-xl transition-all flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-lg shadow-warning-500/20">
                      <LuPause className="w-5 h-5" /> Pause
                    </button>
                  )}
                  <button onClick={stopShowcase} className="flex-1 p-4 bg-error-500/10 text-error-500 border border-error-500/30 rounded-xl transition-all flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest hover:bg-error-500 hover:text-white">
                    <LuSquare className="w-5 h-5" /> Terminate
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scenario Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableScenarios.map((scenario) => (
            <motion.div 
              key={scenario.id}
              whileHover={!showcase?.active ? { scale: 1.02, translateY: -5 } : {}}
              whileTap={!showcase?.active ? { scale: 0.98 } : {}}
              className={`relative group glass border-white/5 rounded-[2rem] p-8 flex flex-col gap-6 transition-all ${!showcase?.active ? 'cursor-pointer hover:border-primary/30' : 'opacity-50 cursor-not-allowed'} ${showcase?.scenario_id === scenario.id ? 'border-primary/50 bg-primary/5' : ''}`}
              onClick={() => handleStart(scenario.id)}
            >
              <div className="flex justify-between items-start">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                  {getIcon(scenario.id)}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-text/30 uppercase tracking-widest">
                   <LuClock className="w-3 h-3" /> {scenario.steps * 3}s
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors uppercase tracking-tighter">{scenario.title}</h3>
                <p className="text-xs text-text/40 leading-relaxed font-medium">{scenario.description}</p>
              </div>

              <div className="mt-4 pt-6 border-t border-white/5 flex justify-between items-center">
                 <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-text/40 uppercase tracking-widest">
                    {scenario.steps} Automation Steps
                 </div>
                 <div className={`p-2 rounded-xl ${(showcase?.active && showcase?.scenario_id === scenario.id) || isLaunching === scenario.id ? 'bg-primary animate-spin' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'} transition-all`}>
                    {isLaunching === scenario.id ? <LuActivity className="w-5 h-5" /> : <LuChevronRight className="w-5 h-5" />}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cinematic Logs Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 glass rounded-[2rem] border-white/5 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black flex items-center gap-3 text-text/40 tracking-[0.3em] uppercase">
                  <LuHistory className="w-4 h-4 text-primary" />
                  Orchestration Timeline
                </h3>
              </div>
              
              <div className="h-64 overflow-y-auto space-y-3 pr-4 custom-scrollbar">
                {showcase?.logs?.length > 0 ? (
                  showcase.logs.map((log, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx}
                      className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 font-mono text-[11px]"
                    >
                      <span className="text-text/20">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-white font-medium">{log}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-text/20 space-y-4">
                    <LuTerminal className="w-16 h-16 opacity-20" />
                    <p className="text-xs uppercase tracking-[0.2em] font-black">Waiting for system signal...</p>
                  </div>
                )}
              </div>
           </div>

           <div className="glass rounded-[2rem] border-white/5 p-8 flex flex-col justify-center items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                 <LuShieldAlert className="text-primary animate-pulse" size={48} />
                 <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-dashed animate-[spin_10s_linear_infinite]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">ORCHESTRATION MODE</h3>
                <p className="text-[10px] text-text/40 leading-relaxed uppercase tracking-widest px-4">Execute high-fidelity system audits and autonomous orchestration sequences for stakeholders.</p>
              </div>
              <button 
                onClick={() => toast.info("System Audit Mode requires Level 4 Clearance. Access Denied.", { theme: 'dark' })}
                className="w-full py-4 bg-white/5 hover:bg-primary text-white rounded-2xl transition-all font-black uppercase text-[10px] tracking-[0.3em] border border-white/10 hover:border-primary"
              >
                Launch System Audit
              </button>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ShowcaseCenter;
