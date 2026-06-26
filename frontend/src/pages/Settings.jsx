import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LuSettings, 
  LuShield, 
  LuTimer, 
  LuDatabase, 
  LuHardDrive, 
  LuZap, 
  LuCheck, 
  LuRefreshCw,
  LuTerminal
} from 'react-icons/lu';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useKernel } from '../context/KernelContext';
import { toast } from 'react-toastify';

const Settings = () => {
  const kernelState = useKernel()?.kernelState || {};
  const [activeCategory, setActiveCategory] = useState('kernel');
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    { id: 'kernel', label: 'Kernel_Core', icon: <LuShield size={18} /> },
    { id: 'scheduler', label: 'Scheduler_CFG', icon: <LuTimer size={18} /> },
    { id: 'memory', label: 'Memory_MGMT', icon: <LuDatabase size={18} /> },
    { id: 'io', label: 'I/O_Subsystem', icon: <LuHardDrive size={18} /> },
    { id: 'ai', label: 'Neural_Engine', icon: <LuZap size={18} /> },
  ];

  const settingsMap = {
    kernel: [
      { label: "Kernel Logging Level", description: "Granularity of system-wide event captures", type: "select", options: ["Debug", "Info", "Warning", "Error", "Critical"] },
      { label: "Hardware Sync Interval", description: "Frequency of HAL-to-physical bridge synchronization", type: "range", min: 10, max: 1000, unit: "ms" },
      { label: "Watchdog Auto-Recovery", description: "Autonomous subsystem restart on hang detection", type: "toggle", default: true }
    ],
    scheduler: [
      { label: "Default Algorithm", description: "Initial CPU scheduling logic on boot", type: "select", options: ["FIFO", "Round Robin", "SJF", "Priority"] },
      { label: "Preemption Mode", description: "Allow higher priority tasks to interrupt running processes", type: "toggle", default: true },
      { label: "Time Quantum", description: "Standard CPU slice duration for RR algorithm", type: "number", min: 0.1, max: 10, step: 0.1, unit: "s" }
    ],
    memory: [
      { label: "Allocation Policy", description: "Heuristic used for finding free memory blocks", type: "select", options: ["First Fit", "Best Fit", "Worst Fit"] },
      { label: "Compaction Threshold", description: "Trigger automatic memory defragmentation", type: "range", min: 0, max: 100, unit: "%" },
      { label: "Protection Level", description: "Rigidity of page-level access control", type: "select", options: ["Standard", "High", "Military-Grade"] }
    ],
    io: [
      { label: "Disk Cache Size", description: "Reserved buffer for pending I/O operations", type: "number", min: 1, max: 512, unit: "MB" },
      { label: "Controller Speed", description: "Artificial latency for hardware simulation", type: "select", options: ["1x", "2x", "4x", "Unlimited"] }
    ],
    ai: [
      { label: "Inference Engine", description: "Primary model used for system analysis", type: "select", options: ["Gemini 1.5 Pro", "Gemini 1.5 Flash", "Local-Neural-Link"] },
      { label: "Heuristic Confidence", description: "Minimum threshold for AI-driven recommendations", type: "range", min: 50, max: 99, unit: "%" },
      { label: "Animation Intensity", description: "Global framer-motion transition speed multiplier", type: "select", options: ["Disabled", "Reduced", "Standard", "Performance"] },
    ]
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("System Configuration Synchronized", {
        icon: <LuCheck className="text-emerald-400" />
      });
    }, 1200);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Cinematic Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group mb-8 sm:mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-magenta/5 to-transparent rounded-3xl sm:rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative glass-premium rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-10 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(157,0,255,0.05)]">
             <div className="absolute inset-0 scanline-overlay opacity-20" />
             <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 blur-[120px] -mr-40 -mt-40" />
             
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 relative z-10">
               <div className="space-y-4 w-full lg:w-auto">
                 <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border shadow-[0_0_20px_rgba(157,0,255,0.2)] shrink-0">
                        <LuSettings className="text-primary neon-text" size={32} />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">SETTINGS</h1>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_#00FF9D] indicator-pulse" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">Global Kernel Parameters & Subsystem Tuning</p>
                          </div>
                      </div>
                    </div>
                 </div>
                 <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-0 sm:ml-16 lg:ml-19">
                   Adjusting core operational variables and subsystem thresholds. Ensure synchronization with the physical layer before committing high-priority state changes.
                 </p>
               </div>
               
               <div className="flex items-center justify-center sm:justify-start bg-white/5 p-3 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md w-full lg:w-auto">
                 <button 
                   onClick={handleSave}
                   disabled={isSaving}
                   className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] font-orbitron flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_20px_rgba(157,0,255,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
                 >
                   {isSaving ? <LuRefreshCw className="animate-spin" /> : <LuCheck />}
                   <span>{isSaving ? 'Synchronizing...' : 'Apply_Changes'}</span>
                 </button>
               </div>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar Nav */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none shrink-0">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ x: 5 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-auto lg:w-full flex items-center gap-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all border font-orbitron shrink-0 ${
                  activeCategory === cat.id 
                    ? 'bg-primary/20 border-primary/50 text-white shadow-[0_0_15px_rgba(157,0,255,0.15)]' 
                    : 'bg-white/2 border-white/5 text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={activeCategory === cat.id ? 'text-primary' : ''}>{cat.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
              </motion.button>
            ))}
            
            <div className="mt-4 lg:mt-12 p-4 sm:p-6 glass border-white/5 rounded-2xl sm:rounded-3xl opacity-40 shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <LuShield className="text-slate-500" size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Note</span>
              </div>
              <p className="text-[9px] font-bold leading-relaxed text-slate-500 uppercase tracking-wider">
                Changes to Kernel Core parameters may require a full system reboot to establish new physical address mappings.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <motion.div 
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-premium border-white/10 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-10 space-y-6 sm:space-y-10"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-2">
                 <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(157,0,255,1)]" />
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                   {categories.find(c => c.id === activeCategory)?.label} <span className="text-primary">Configuration</span>
                 </h2>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {settingsMap[activeCategory].map((setting, idx) => (
                  <div key={idx} className="group p-4 sm:p-6 bg-white/2 rounded-2xl sm:rounded-3xl border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors">{setting.label}</label>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">{setting.description}</p>
                      </div>

                      <div className="flex items-center w-full sm:w-auto sm:min-w-[240px]">
                        {setting.type === 'select' && (
                          <select className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/80 outline-none focus:border-primary transition-all">
                            {setting.options.map(opt => <option key={opt}>{opt}</option>)}
                          </select>
                        )}
                        {setting.type === 'toggle' && (
                          <div className="w-14 h-7 bg-white/10 rounded-full relative p-1 cursor-pointer hover:bg-white/20 transition-all border border-white/10">
                            <motion.div 
                              className="w-5 h-5 bg-primary rounded-full shadow-[0_0_10px_rgba(157,0,255,1)]"
                              animate={{ x: setting.default ? 28 : 0 }}
                            />
                          </div>
                        )}
                        {setting.type === 'range' && (
                          <div className="w-full space-y-3">
                            <input type="range" className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary" />
                            <div className="flex justify-between text-[9px] font-black text-slate-500 tracking-widest">
                              <span>MIN: {setting.min}</span>
                              <span>MAX: {setting.max}{setting.unit}</span>
                            </div>
                          </div>
                        )}
                        {setting.type === 'number' && (
                          <div className="flex items-center gap-3 w-full">
                            <input type="number" defaultValue={setting.min} className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/80 outline-none focus:border-primary" />
                            <span className="text-[9px] font-black text-slate-500">{setting.unit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 sm:pt-10 flex items-center gap-3 sm:gap-4 border-t border-white/5 opacity-40 group hover:opacity-100 transition-opacity">
                 <LuTerminal className="text-primary" />
                 <span className="text-[9px] font-mono-cyber text-slate-500 tracking-widest">COMMIT_HASH: 7F29B12-ALPHA-CFG</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
