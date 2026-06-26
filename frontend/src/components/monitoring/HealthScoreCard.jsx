import React from 'react';
import { motion } from 'framer-motion';

const HealthScoreCard = React.memo(({ score, status, watchdog }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (s) => {
    if (s >= 95) return 'text-emerald-400';
    if (s >= 75) return 'text-cyan-400';
    if (s >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="glass bg-slate-900/40 border border-white/5 p-4 sm:p-8 rounded-3xl sm:rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16" />
      
      <div className="relative mb-6">
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80" cy="80" r={radius}
            stroke="currentColor" strokeWidth="12"
            fill="transparent"
            className="text-white/5"
          />
          <motion.circle
            cx="80" cy="80" r={radius}
            stroke="currentColor" strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={getScoreColor(score)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black tracking-tighter ${getScoreColor(score)}`}>
            {Math.round(score)}
          </span>
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">
            SCORE
          </span>
        </div>
      </div>

      <div className="text-center">
        <div className={`text-sm font-black uppercase tracking-[0.2em] mb-1 ${getScoreColor(score)}`}>
          {status}
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${watchdog === 'OK' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'} shadow-[0_0_8px_currentColor]`} />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Watchdog: {watchdog}
          </span>
        </div>
      </div>
    </div>
  );
});

export default HealthScoreCard;
