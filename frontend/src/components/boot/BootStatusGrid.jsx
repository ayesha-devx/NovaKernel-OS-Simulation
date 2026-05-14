import React from 'react';

const StatusBadge = ({ label, active, warning, isCompleted }) => (
  <div className={`
    group relative flex flex-col gap-1.5 p-2.5 rounded-xl border transition-all duration-700 font-orbitron
    ${active 
      ? isCompleted
        ? 'bg-cyan/5 border-cyan/30 text-cyan shadow-[inset_0_0_20px_rgba(0,209,255,0.05)]'
        : 'bg-primary/5 border-primary/30 text-primary shadow-[inset_0_0_20px_rgba(157,0,255,0.05)]' 
      : warning
      ? 'bg-danger/5 border-danger/30 text-danger'
      : 'bg-white/2 border-white/5 text-white/10'}
  `}>
    {/* Glassmorphism Background */}
    <div className="absolute inset-0 bg-white/[0.01] backdrop-blur-sm rounded-xl -z-10" />

    {/* Tech Corner Accents */}
    {active && (
      <>
        <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${isCompleted ? 'border-cyan/50' : 'border-primary/50'} rounded-tl-lg`} />
        <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${isCompleted ? 'border-cyan/50' : 'border-primary/50'} rounded-br-lg`} />
      </>
    )}
    
    {/* Shimmer Sweep on Hover */}
    <div className="absolute inset-0 shimmer-sweep opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${active ? (isCompleted ? 'text-cyan/60' : 'text-primary/60') : 'text-white/10'}`}>
          {isCompleted ? 'VERIFIED' : active ? 'PROCESSING' : 'PENDING'}
        </span>
      </div>
      <div className={`
        w-3 h-3 rounded-full transition-all duration-500
        ${isCompleted ? 'bg-cyan shadow-[0_0_15px_#00D1FF]' : 
          active ? 'bg-primary shadow-[0_0_15px_#9D00FF] animate-pulse' : 
          warning ? 'bg-danger shadow-[0_0_15px_#FF4D6D] animate-pulse' : 'bg-white/5'}
      `} />
    </div>

    {/* Verification Progress Blocks */}
    <div className="flex gap-1.5 h-1.5 w-full overflow-hidden mt-1">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div 
          key={i} 
          className={`h-full flex-1 rounded-sm transition-all duration-1000 ${
            isCompleted ? 'bg-cyan/40' : active ? 'bg-primary/40 animate-pulse' : 'bg-white/5'
          }`}
          style={{ transitionDelay: `${i * 50}ms`, animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  </div>
);

const BootStatusGrid = ({ state }) => {
  const subsystems = [
    { id: 'core', label: 'Kernel Core', threshold: 'INITIALIZING' },
    { id: 'vfs', label: 'Virtual FS', threshold: 'LOADING_MODULES' },
    { id: 'hal', label: 'Hardware HAL', threshold: 'SYNCING_HAL' },
    { id: 'analytics', label: 'Analytics', threshold: 'STARTING_ANALYTICS' },
    { id: 'ai', label: 'AI Engine', threshold: 'STARTING_AI' },
    { id: 'integrity', label: 'Integrity', threshold: 'VERIFYING_KERNEL' }
  ];

  const getStateIndex = (s) => {
    const states = ['OFFLINE', 'INITIALIZING', 'LOADING_MODULES', 'SYNCING_HAL', 'STARTING_ANALYTICS', 'STARTING_AI', 'VERIFYING_KERNEL', 'ACTIVE', 'SAFE_MODE'];
    return states.indexOf(s);
  };

  const currentIndex = getStateIndex(state || 'OFFLINE');

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {subsystems.map((sub, idx) => {
        const subIndex = getStateIndex(sub.threshold);
        return (
          <StatusBadge 
            key={sub.id} 
            label={sub.label} 
            active={currentIndex >= subIndex}
            isCompleted={currentIndex > subIndex || state === 'ACTIVE'}
            warning={state === 'SAFE_MODE' && currentIndex >= subIndex}
          />
        );
      })}
    </div>
  );
};


export default React.memo(BootStatusGrid);
