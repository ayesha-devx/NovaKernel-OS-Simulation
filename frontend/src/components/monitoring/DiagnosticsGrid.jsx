import React from 'react';
import { LuCheck, LuActivity, LuTriangleAlert, LuClock } from 'react-icons/lu';

const DiagnosticsGrid = React.memo(({ subsystems }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ONLINE': return <LuCheck className="text-emerald-400" />;
      case 'OFFLINE': return <LuActivity className="text-rose-400" />;
      case 'PAUSED': return <LuClock className="text-amber-400" />;
      default: return <LuTriangleAlert className="text-slate-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(subsystems).map(([name, status]) => (
        <div key={name} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-white/10 transition-all">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{name}</span>
            <span className="text-xs font-bold text-white uppercase mt-0.5">{status}</span>
          </div>
          <div className="text-lg">
            {getStatusIcon(status)}
          </div>
        </div>
      ))}
    </div>
  );
});

export default DiagnosticsGrid;
