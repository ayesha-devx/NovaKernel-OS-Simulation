import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuTerminal, LuTrash2, LuInfo, LuCircleCheck, LuTriangleAlert } from 'react-icons/lu';
import { useProcess } from '../../context/KernelContext';

const EventLogPanel = () => {
  const { logs, clearLogs } = useProcess();
  const logEndRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) {
        const container = logEndRef.current.parentNode;
        container.scrollTop = container.scrollHeight;
    }
  }, [logs]);

  const getLevelColor = (severity) => {
    switch(severity) {
      case 'SUCCESS': return 'text-success';
      case 'WARNING': return 'text-warning';
      case 'ERROR': return 'text-error';
      case 'CRITICAL': return 'text-error font-black';
      default: return 'text-primary';
    }
  };

  const getIcon = (severity) => {
    switch(severity) {
      case 'SUCCESS': return <LuCircleCheck size={12} />;
      case 'WARNING': return <LuTriangleAlert size={12} />;
      case 'ERROR':
      case 'CRITICAL': return <LuTriangleAlert size={12} />;
      default: return <LuInfo size={12} />;
    }
  };

  return (
    <div className="glass-premium rounded-3xl sm:rounded-[2.5rem] border border-white/10 flex flex-col h-full overflow-hidden font-mono-cyber relative group shadow-[0_0_40px_rgba(157,0,255,0.05)]">
      <div className="absolute inset-0 scanline-overlay opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center neon-border shrink-0">
            <LuTerminal className="text-primary neon-text" size={16} />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-text/80 uppercase tracking-[0.1em] xs:tracking-[0.2em] sm:tracking-[0.4em] font-orbitron block">Kernel_Telemetry_Flux</span>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">L-882_Secure_Logging_Node</p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-1 bg-success/10 rounded-full border border-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_#00FF9D] animate-pulse" />
                <span className="text-[8px] font-black text-success uppercase tracking-widest font-orbitron">STREAM_OK</span>
            </div>
            <button 
                onClick={clearLogs}
                className="text-slate-600 hover:text-error transition-all p-2 hover:bg-error/10 rounded-lg active:scale-90"
            >
                <LuTrash2 size={16} />
            </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-3 text-[12px] custom-scrollbar relative z-10 terminal-flicker bg-black/20">
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              key={log.id || i} 
              className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 leading-relaxed group/log hover:bg-white/[0.02] p-2 rounded-lg transition-colors border-l-2 border-transparent hover:border-primary/30"
            >
              <div className="flex items-center gap-3 sm:contents">
                <span className="text-slate-600 font-mono-cyber text-[10px] whitespace-nowrap opacity-60 group-hover/log:opacity-100 transition-opacity">[{log.timestamp}]</span>
                <div className={`flex items-center gap-2 font-black whitespace-nowrap tracking-wider ${getLevelColor(log.severity)}`}>
                  <span className="opacity-70">{getIcon(log.severity)}</span>
                  <span className="text-[10px] font-orbitron uppercase">{log.module}</span>
                </div>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/5 mx-1" />
              <span className="text-slate-300 font-mono-cyber tracking-tight group-hover/log:text-white transition-colors">
                {typeof log.message === 'object' ? JSON.stringify(log.message).substring(0, 100) : log.message}
                <span className="ml-2 w-1.5 h-3 inline-block bg-primary/30 animate-pulse" />
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={logEndRef} className="pt-4 flex items-center gap-2 text-primary opacity-40">
            <span className="text-[10px] font-black tracking-widest font-orbitron animate-pulse">&gt; WAITING_FOR_KERNEL_INPUT...</span>
            <div className="w-2 h-4 bg-primary animate-pulse shadow-[0_0_8px_#9D00FF]" />
        </div>
      </div>
    </div>
  );
};

export default EventLogPanel;
