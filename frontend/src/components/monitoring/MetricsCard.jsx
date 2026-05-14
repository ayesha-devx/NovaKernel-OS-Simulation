import React from 'react';

const MetricsCard = React.memo(({ title, value, unit, icon, color }) => {
  const colorClasses = {
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10',
    purple: 'text-purple-400 border-purple-500/20 bg-purple-500/10',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
    rose: 'text-rose-400 border-rose-500/20 bg-rose-500/10',
  };

  const selectedColor = colorClasses[color] || colorClasses.cyan;

  return (
    <div className="glass bg-slate-900/40 border border-white/5 p-4 rounded-3xl group hover:border-white/10 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-xl border ${selectedColor}`}>
          {icon}
        </div>
        <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest pt-1">
          {unit}
        </div>
      </div>
      <div>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <div className="text-xl font-black text-white tabular-nums tracking-tighter">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </div>
      </div>
    </div>
  );
});

export default MetricsCard;
