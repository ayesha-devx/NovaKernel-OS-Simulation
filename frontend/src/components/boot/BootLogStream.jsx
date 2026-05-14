import React, { useRef, useEffect } from 'react';

const BootLogStream = ({ logs = [] }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full h-full glass-premium border-white/5 rounded-2xl overflow-hidden relative group font-mono">
      {/* Terminal Header */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/5 flex items-center justify-between px-6 z-10">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-danger/40 shadow-[0_0_5px_#FF4D6D]" />
          <div className="w-2 h-2 rounded-full bg-warning/40 shadow-[0_0_5px_#FFC857]" />
          <div className="w-2 h-2 rounded-full bg-green/40 shadow-[0_0_5px_#00FF9D]" />
        </div>
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_#9D00FF]" />
           <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.5em]">Subsystem_Telemetry_Stream</span>
        </div>
      </div>

      {/* Scanning Line Effect */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden opacity-10">
        <div className="w-full h-[3px] bg-primary blur-sm absolute top-0 animate-scanline" />
      </div>

      {/* Log Content */}
      <div 
        ref={scrollRef}
        className="h-full pt-10 pb-6 px-6 overflow-y-auto space-y-2 font-mono text-[10px] scrollbar-hide relative selection:bg-primary/20"
      >
        {logs.length === 0 && (
          <div className="flex items-center gap-3 text-white/10 italic">
            <div className="w-1.5 h-1.5 rounded-full bg-white/10 animate-ping" />
            Awaiting kernel initialization vector...
          </div>
        )}
        
        {logs.map((log, index) => (
          <div key={index} className="flex gap-4 items-start group/line hover:bg-white/[0.02] transition-colors py-1 rounded px-2 animate-fade-in">
            <span className="text-white/20 tabular-nums whitespace-nowrap font-bold">[{log.timestamp}]</span>
            <div className={`
              flex-shrink-0 px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest
              ${log.severity === 'SUCCESS' ? 'bg-green/10 text-green shadow-[0_0_8px_rgba(0,255,157,0.2)]' : 
                log.severity === 'ERROR' ? 'bg-danger/10 text-danger shadow-[0_0_8px_rgba(255,77,109,0.2)]' : 
                log.severity === 'WARN' ? 'bg-warning/10 text-warning shadow-[0_0_8px_rgba(255,200,87,0.2)]' : 
                'bg-cyan/10 text-cyan shadow-[0_0_8px_rgba(0,209,255,0.2)]'}
            `}>
              {log.severity}
            </div>
            <span className={`
              font-medium tracking-wide leading-relaxed
              ${log.severity === 'SUCCESS' ? 'text-green/80' : 
                log.severity === 'ERROR' ? 'text-danger/80' : 
                log.severity === 'WARN' ? 'text-warning/80' : 
                'text-cyan/80'}
            `}>
              {log.message}
            </span>
          </div>
        ))}
        
        {/* Blinking Cursor */}
        <div className="flex gap-3 items-center px-2 mt-4 opacity-50">
           <span className="text-primary font-bold">{'>'}</span>
           <div className="w-2 h-4 bg-primary animate-terminal-cursor shadow-[0_0_10px_#9D00FF]" />
        </div>
      </div>
      
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,22,0.4)_100%)] pointer-events-none" />
      
      {/* Scanline pattern */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20" />
    </div>
  );
};


export default React.memo(BootLogStream);
