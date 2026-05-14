import React from 'react';

const BootPhaseIndicator = ({ state }) => {
  const phases = [
    { id: 'INIT', label: 'INITIALIZING', threshold: 'INITIALIZING' },
    { id: 'LOAD', label: 'LOADING', threshold: 'LOADING_MODULES' },
    { id: 'SYNC', label: 'SYNCING', threshold: 'SYNCING_HAL' },
    { id: 'VERIFY', label: 'VERIFYING', threshold: 'VERIFYING_KERNEL' },
    { id: 'READY', label: 'ACTIVE', threshold: 'ACTIVE' }
  ];

  const getStateIndex = (s) => {
    const states = ['OFFLINE', 'INITIALIZING', 'LOADING_MODULES', 'SYNCING_HAL', 'STARTING_ANALYTICS', 'STARTING_AI', 'VERIFYING_KERNEL', 'ACTIVE', 'SAFE_MODE'];
    return states.indexOf(s);
  };

  const currentIndex = getStateIndex(state || 'OFFLINE');

  return (
    <div className="flex items-center justify-center gap-3 mb-4 font-orbitron">
      {phases.map((phase, idx) => {
        const phaseIndex = getStateIndex(phase.threshold);
        const isActive = currentIndex >= phaseIndex;
        const isCurrent = state === phase.threshold;
        const isCompleted = currentIndex > phaseIndex || (state === 'ACTIVE' && phase.id === 'READY');
        
        return (
          <React.Fragment key={phase.id}>
            <div className={`
              relative flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-xl border transition-all duration-700
              ${isActive 
                ? isCompleted 
                  ? 'bg-cyan/10 border-cyan/40 text-cyan shadow-[0_0_20px_rgba(0,209,255,0.2)]' 
                  : 'bg-primary/10 border-primary/40 text-primary shadow-[0_0_20px_rgba(157,0,255,0.3)]'
                : 'bg-white/5 border-white/10 text-white/20'}
              ${isCurrent ? 'scale-110 z-10 bg-primary/20 animate-indicator-pulse' : 'scale-100'}
            `}>
              {/* Module ID */}
              <span className={`text-[9px] font-black tracking-[0.25em] ${isActive ? (isCompleted ? 'text-cyan' : 'text-primary') : 'text-white/20'}`}>
                {phase.id}
              </span>
              
              {/* Status Dot */}
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                isActive 
                  ? isCompleted 
                    ? 'bg-cyan shadow-[0_0_10px_#00D1FF]' 
                    : 'bg-primary animate-pulse shadow-[0_0_10px_#9D00FF]' 
                  : 'bg-white/10'
              }`} />

              {/* Active Step Scan Pulse */}
              {isCurrent && (
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent animate-scanline" />
                </div>
              )}
            </div>
            
            {/* Connector */}
            {idx < phases.length - 1 && (
              <div className="relative w-10 h-[2px] overflow-hidden rounded-full bg-white/5">
                <div 
                  className={`absolute inset-0 transition-all duration-1000 ${isCompleted ? 'bg-cyan shadow-[0_0_10px_#00D1FF]' : 'bg-primary/40'}`} 
                  style={{ width: isActive ? '100%' : '0%' }}
                />
                {isActive && !isCompleted && (
                   <div className="absolute inset-0 w-1/2 bg-white/40 animate-shimmer" />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};


export default React.memo(BootPhaseIndicator);
