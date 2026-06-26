import React from 'react';
import { LuTerminal, LuMaximize2, LuRefreshCcw } from 'react-icons/lu';

const TerminalPanel = () => {
  return (
    <div className="glass-premium rounded-3xl sm:rounded-[2rem] border border-white/10 flex flex-col h-full overflow-hidden relative group shadow-[0_0_50px_rgba(157,0,255,0.1)]">
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 scanline-overlay opacity-20 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="px-4 sm:px-8 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center neon-border">
            <LuTerminal className="text-primary neon-text" size={18} />
          </div>
          <div>
            <span className="text-[10px] font-black text-text/80 uppercase tracking-[0.2em] sm:tracking-[0.4em] font-orbitron">Kernel_Root_Shell</span>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">VERSION_LINK: V1.1.0-STABLE-KERNEL</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-4 text-slate-500">
            <button className="hover:text-primary transition-all hover:scale-110"><LuRefreshCcw size={14} /></button>
            <button className="hover:text-primary transition-all hover:scale-110"><LuMaximize2 size={14} /></button>
          </div>
          <div className="h-6 w-px bg-white/5" />
          <div className="flex gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-warning/40 border border-warning/20"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_12px_rgba(255,77,109,0.5)]"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-8 font-mono-cyber text-[12px] overflow-y-auto space-y-3 relative z-10 bg-black/40 terminal-flicker">
        <div className="text-success font-black tracking-widest opacity-80 animate-pulse">
            [SYS_OK] NOVA_KERNEL V1.1.0-STABLE-KERNEL LOADED
        </div>
        <div className="text-slate-500 tracking-wider">Establishing encrypted uplink to Hardware HAL...</div>
        <div className="text-secondary font-bold tracking-widest opacity-90">
            [LINK] UPLINK_ESTABLISHED :: PORT_5000_SYNC
        </div>
        <div className="text-slate-500 tracking-wider">Authentication verified. Root privileges granted.</div>
        <div className="text-slate-500 tracking-wider">Welcome to the Nova Command Center. System is nominal.</div>
        
        <div className="pt-6 flex items-center gap-3">
          <span className="text-primary font-black neon-text drop-shadow-[0_0_10px_rgba(157,0,255,0.5)]">nova@kernel:~$</span>
          <span className="text-white opacity-90 tracking-widest font-bold">systemctl status hypervisor</span>
          <span className="w-2.5 h-5 bg-primary shadow-[0_0_12px_rgba(157,0,255,1)] animate-terminal-cursor"></span>
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;
