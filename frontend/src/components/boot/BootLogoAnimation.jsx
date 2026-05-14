import React from 'react';

const BootLogoAnimation = () => {
  return (
    <div className="relative flex flex-col items-center justify-center pt-2 mb-1 scale-75 md:scale-90 font-orbitron">
      {/* Cinematic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan/5 blur-[80px] rounded-full animate-pulse" />
      
      {/* Technical HUD Rings */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Outer Energy Ring */}
        <div className="absolute inset-0 border-[1px] border-primary/20 rounded-full scale-110" />
        <div className="absolute inset-0 border-t-[3px] border-primary shadow-[0_0_15px_#9D00FF] rounded-full animate-spin [animation-duration:8s] [animation-timing-function:linear] scale-110" />
        
        {/* Rotating Outer Ring (Dashed) */}
        <div className="absolute inset-[-12px] border border-dashed border-cyan/20 rounded-full animate-spin-slow" />
        
        {/* Pulse Aura */}
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping [animation-duration:3s]" />
        
        {/* Inner Technical HUD Elements */}
        <div className="absolute inset-4 border border-white/5 rounded-full" />
        <div className="absolute inset-4 border-b-2 border-cyan/40 shadow-[0_5px_15px_-5px_#00D1FF] rounded-full animate-spin [animation-duration:5s] [animation-direction:reverse] [animation-timing-function:linear]" />
        
        {/* Central Logo Symbol (NK) */}
        <div className="relative z-10 flex flex-col items-center group">
          <div className="text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(157,0,255,0.8)] animate-pulse selection:text-cyan">
            NK
          </div>
          <div className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-transparent via-cyan to-transparent shadow-[0_0_12px_#00D1FF] rounded-full" />
          
          {/* Holographic Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
        </div>
      </div>
      
      <div className="mt-8 text-center relative">
        {/* Animated Light Sweep Line */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-[1px] overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
        </div>
        
        <h1 className="text-5xl font-black text-white uppercase tracking-[0.4em] italic leading-tight relative">
          <span className="relative z-10">Nova</span>
          <span className="text-primary drop-shadow-[0_0_15px_rgba(157,0,255,0.7)] relative z-10">Kernel</span>
          {/* Text Glow Pulse */}
          <div className="absolute inset-0 text-primary blur-md opacity-30 select-none pointer-events-none animate-pulse">NovaKernel</div>
        </h1>

        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/15" />
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-cyan rounded-full animate-flicker" />
            <p className="text-[9px] font-bold text-cyan/60 uppercase tracking-[0.7em] ml-2">
              Integrated Simulation Platform
            </p>
            <span className="w-1 h-1 bg-cyan rounded-full animate-flicker" />
          </div>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/15" />
        </div>
      </div>
    </div>
  );
};


export default React.memo(BootLogoAnimation);
