import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useKernel } from '../context/KernelContext';
import { 
  LuTerminal, 
  LuCpu, 
  LuDatabase, 
  LuHardDrive, 
  LuShieldAlert, 
  LuClock,
  LuChevronRight,
  LuCommand
} from 'react-icons/lu';

const ShellTerminal = () => {
  const { 
    executeShellCommand, 
    analyticsSummary: analytics, 
    hardwareState, 
    deadlock,
    disk,
    schedulerState: scheduler,
    isLoading 
  } = useKernel();

  const [input, setInput] = useState('');
  const [output, setOutput] = useState([
    { type: 'system', text: 'NovaOS [Version 1.1.0] (c) 2026 DeepMind OS Corp.' },
    { type: 'system', text: 'Kernel Command Interface active. Type "help" for a list of commands.' },
    { type: 'system', text: '' }
  ]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const { getShellSession } = useKernel();
  
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const res = await getShellSession();
      if (res.data.session && res.data.session.length > 0) {
        const formattedSession = [];
        res.data.session.forEach(entry => {
           formattedSession.push({ type: 'prompt', text: `root@novaos:~# ${entry.command}` });
           formattedSession.push({ 
             type: entry.result.status, 
             text: entry.result.output,
             executionTime: entry.result.execution_time
           });
        });
        setOutput(prev => [...prev, ...formattedSession].slice(-200));
      }
    } catch (err) {
      console.error("Failed to load shell session", err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [output]);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleCommand = async (e) => {
    if (e.key === 'Enter') {
      const command = input.trim();
      if (!command) return;

      // Add to local UI output
      setOutput(prev => [...prev, { type: 'prompt', text: `root@novaos:~# ${command}` }].slice(-200));
      
      // Update history
      setHistory(prev => [command, ...prev]);
      setHistoryIndex(-1);
      setInput('');
      setIsExecuting(true);

      try {
        const res = await executeShellCommand(command);
        const data = res.data;

        if (data.status === 'clear') {
          setOutput([]);
        } else {
          setOutput(prev => [...prev, { 
            type: data.status, 
            text: data.output,
            executionTime: data.execution_time
          }].slice(-200));
        }
      } catch (err) {
        setOutput(prev => [...prev, { type: 'error', text: 'ERROR: Connection to kernel lost or command timed out.' }].slice(-200));
      } finally {
        setIsExecuting(false);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion could be added here
    }
  };

  if (isLoading) return <div>Loading Shell...</div>;

  return (
    <DashboardLayout title="SHELL TERMINAL">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Cinematic Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-magenta/5 to-transparent rounded-3xl sm:rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative glass-premium rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-10 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(157,0,255,0.05)]">
             <div className="absolute inset-0 scanline-overlay opacity-20" />
             <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 blur-[120px] -mr-40 -mt-40" />
             
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 relative z-10">
               <div className="space-y-4 w-full lg:w-auto">
                 <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border shrink-0 shadow-[0_0_20px_rgba(157,0,255,0.2)]">
                        <LuTerminal className="text-primary neon-text" size={24} />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">SHELL TERMINAL</h1>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_#00FF9D] indicator-pulse" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">Kernel Command Interface & Shell Subsystem v1.0</p>
                          </div>
                      </div>
                    </div>
                 </div>
                 <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-0 sm:ml-19">
                   Direct binary interface to the NovaOS executive. Executing privileged operations and system-wide orchestration via secured shell protocols.
                 </p>
               </div>
               
               <div className="flex items-center justify-between sm:justify-start gap-4 p-3 w-full lg:w-auto bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto px-6 py-2.5 bg-black/40 rounded-xl border border-white/5 font-orbitron">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_12px_#00FF9D]" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                          SHELL_SESSION: <span className="text-success">ACTIVE</span>
                       </span>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[700px]">
        
        {/* Terminal Area */}
        <div 
          className="lg:col-span-8 h-[450px] lg:h-auto glass bg-slate-950/80 rounded-3xl sm:rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          onClick={focusInput}
        >
          {/* Header */}
          <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 sm:px-6 justify-between shrink-0">
             <div className="flex items-center gap-2">
                <LuTerminal className="text-primary" size={14} />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">novaos_shell_v1.0</span>
             </div>
             <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/40 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
             </div>
          </div>

          {/* Output Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar font-mono text-xs sm:text-[13px] leading-relaxed">
             <AnimatePresence initial={false}>
               {output.map((line, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="mb-1"
                 >
                   {line.type === 'prompt' ? (
                     <span className="text-cyan-400 font-bold">{line.text}</span>
                   ) : line.type === 'error' ? (
                     <div className="text-red-400 bg-red-400/5 px-2 py-1 rounded-md border border-red-400/10 inline-block my-1 italic">
                       {line.text}
                     </div>
                   ) : line.type === 'system' ? (
                     <span className="text-slate-500 italic">{line.text}</span>
                   ) : (
                     <div className="text-slate-200 whitespace-pre-wrap">
                        {line.text}
                        {line.executionTime && (
                           <span className="ml-3 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                             [{line.executionTime}ms]
                           </span>
                        )}
                     </div>
                   )}
                 </motion.div>
               ))}
             </AnimatePresence>
             
             {/* Active Prompt */}
             <div className="flex items-start sm:items-center mt-2 group">
                <span className="text-cyan-400 font-bold shrink-0">root@novaos:~#&nbsp;</span>
                <input 
                  ref={inputRef}
                  autoFocus
                  spellCheck={false}
                  className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:opacity-20"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleCommand}
                  disabled={isExecuting}
                />
             </div>
             <div ref={terminalEndRef} />
          </div>

          {/* Decorative Corner */}
          <div className="absolute bottom-4 right-6 pointer-events-none opacity-20">
             <LuChevronRight className="text-primary animate-pulse" size={32} />
          </div>
        </div>

        {/* Status Side Panels */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           
           {/* System Health Panel */}
           <div className="glass bg-slate-900/40 border border-white/5 rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <LuShieldAlert className="text-primary" />
                 <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Kernel Observability</h3>
              </div>
              <div className="space-y-4">
                 <StatusItem label="CPU LOAD" value={`${analytics.cpu_utilization}%`} icon={<LuCpu className="text-cyan-400" />} progress={analytics.cpu_utilization} />
                 <StatusItem label="RAM USAGE" value={`${analytics.memory_utilization}%`} icon={<LuDatabase className="text-blue-400" />} progress={analytics.memory_utilization} />
                 <StatusItem label="DISK UTIL" value={`${analytics.disk_utilization}%`} icon={<LuHardDrive className="text-emerald-400" />} progress={analytics.disk_utilization} />
              </div>
           </div>

           {/* Hardware State Panel */}
            <div className="glass bg-slate-900/40 border border-white/5 rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 backdrop-blur-2xl">
               <div className="flex items-center gap-3 mb-6">
                  <LuCommand className="text-orange-400" />
                  <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Hardware HAL Interface</h3>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                     <span className="text-white/40">SCHEDULER STATUS</span>
                     <span className={scheduler?.is_running ? 'text-emerald-500 animate-pulse' : 'text-slate-500'}>
                        {scheduler?.is_running ? 'RUNNING' : 'INACTIVE'}
                     </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold">
                     <span className="text-white/40">SIMULATION MODE</span>
                     <span className={hardwareState.simulation_mode ? 'text-primary' : 'text-slate-500'}>
                        {hardwareState.simulation_mode ? 'ENABLED' : 'DISABLED'}
                     </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold">
                     <span className="text-white/40">DEADLOCK STATUS</span>
                     <span className={deadlock.is_deadlocked ? 'text-red-500 animate-pulse' : 'text-emerald-500'}>
                        {deadlock.is_deadlocked ? 'CRITICAL' : 'NOMINAL'}
                     </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold">
                     <span className="text-white/40">DISK CONTROLLER</span>
                     <span className={disk.is_moving ? 'text-cyan-400' : 'text-slate-500'}>
                        {disk.is_moving ? 'SEEKING' : 'IDLE'}
                     </span>
                  </div>
               </div>
            </div>

           {/* Command Tips */}
           <div className="h-[300px] lg:h-auto glass bg-slate-900/40 border border-white/5 rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 backdrop-blur-2xl flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                 <LuClock className="text-slate-500" />
                 <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Quick Commands</h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                 <CommandTip cmd="spawn chrome priority=10" desc="Create a high priority task" />
                 <CommandTip cmd="algo rr" desc="Switch to Round Robin scheduler" />
                 <CommandTip cmd="touch notes.txt" desc="Create a file on virtual disk" />
                 <CommandTip cmd="malloc 256" desc="Test memory allocation" />
                 <CommandTip cmd="deadlock-test" desc="Simulate resource contention" />
              </div>
           </div>

        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

const StatusItem = ({ label, value, icon, progress }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
       <div className="flex items-center gap-2">
          {icon}
          <span className="text-white/60">{label}</span>
       </div>
       <span className="text-white">{value}</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
       <motion.div 
         initial={{ width: 0 }}
         animate={{ width: `${progress}%` }}
         className="h-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
       />
    </div>
  </div>
);

const CommandTip = ({ cmd, desc }) => (
  <div className="p-3 bg-black/20 rounded-xl border border-white/5 hover:border-primary/20 transition-all group cursor-pointer">
     <code className="text-cyan-400 text-[11px] font-bold group-hover:text-cyan-300">{cmd}</code>
     <p className="text-[9px] text-white/30 mt-1 uppercase tracking-widest">{desc}</p>
  </div>
);

export default ShellTerminal;
