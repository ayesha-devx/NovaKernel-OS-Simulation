import React from 'react';

const BootProgressBar = ({ progress, status }) => {
  return (
    <div className="w-full max-w-3xl space-y-3 font-space">
      <div className="flex justify-between items-end px-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_4px_#9D00FF]" />
             <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/70">
               System Status
             </p>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.1em] italic font-orbitron">
            {status || 'Initializing...'}
            <span className="inline-block w-1.5 h-4 bg-cyan ml-2 animate-terminal-cursor shadow-[0_0_6px_#00D1FF]" />
          </h2>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40 italic tracking-tighter tabular-nums font-orbitron">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className="relative h-4 w-full glass-premium rounded-full overflow-hidden border-white/10 p-[3px] group">
        <div 
          className="relative h-full bg-gradient-to-r from-cyan via-primary to-magenta rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_0_20px_rgba(157,0,255,0.4)] overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      <div className="flex justify-between items-center px-3">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-cyan rounded-full animate-ping" />
            <span className="text-[8px] font-bold text-cyan/50 uppercase tracking-[0.2em]">Neural_Link</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/5 pl-6">
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Vector_Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};



export default React.memo(BootProgressBar);
