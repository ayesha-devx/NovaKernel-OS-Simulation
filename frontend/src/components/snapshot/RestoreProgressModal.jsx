import React from 'react';
import { LuRotateCcw, LuTriangleAlert, LuShieldCheck, LuActivity } from 'react-icons/lu';

const RestoreProgressModal = ({ progress }) => {
  if (!progress) return null;

  return (
    <div className="fixed inset-0 z-[20000] bg-[#020617]/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="max-w-2xl w-full space-y-12 relative">
        {/* Background Scanning Lines */}
        <div className="absolute inset-x-0 -top-40 -bottom-40 pointer-events-none overflow-hidden opacity-10">
           <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(56,189,248,0.2)_2px,rgba(56,189,248,0.2)_4px)] bg-[length:100%_4px] animate-pulse" />
        </div>

        {/* Header HUD */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-primary-500/20 flex items-center justify-center">
              <LuRotateCcw className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
            <div className="absolute inset-0 border-4 border-t-primary-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin duration-[3s]" />
          </div>
          
          <div className="space-y-2 text-center">
            <h2 className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter uppercase">
              System <span className="text-primary-500 underline decoration-primary-500/30 underline-offset-8 italic">Rehydration</span>
            </h2>
            <p className="text-primary-400/60 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.5em] animate-pulse">
              Restoring Snapshot: {progress.id}
            </p>
          </div>
        </div>

        {/* Stage Visualization */}
        <div className="bg-slate-900/50 border border-white/5 p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-6 sm:space-y-8 relative overflow-hidden group">
          {/* Progress Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Active Sequence</p>
              <p className="text-base sm:text-xl font-bold text-white uppercase tracking-tight italic">
                {progress.stage.replace(/_/g, ' ')}...
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-3xl sm:text-5xl font-black text-white italic drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{progress.progress}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 w-full bg-slate-950 rounded-full border border-white/10 overflow-hidden p-1 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary-700 via-primary-500 to-primary-300 rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
              style={{ width: `${progress.progress}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_2s_infinite] skew-x-12" />
            </div>
          </div>

          {/* Subsystem Health Checks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {['MEMORY', 'PROCESSES', 'SCHEDULER', 'STORAGE'].map((sub, i) => {
               const isActive = progress.progress > (i * 25);
               return (
                 <div key={sub} className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-500 ${isActive ? 'bg-primary-500/10 border-primary-500/20 text-primary-400' : 'bg-slate-950 border-white/5 text-slate-700'}`}>
                    <LuShieldCheck className={`w-3 h-3 ${isActive ? 'text-primary-500' : 'text-slate-800'}`} />
                    <span className="text-[9px] font-black tracking-widest">{sub}</span>
                 </div>
               );
             })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-center sm:text-left">
          <LuTriangleAlert className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
          <p className="text-[10px] font-bold text-amber-200/60 uppercase leading-relaxed tracking-wider">
            Critical System Warning: Global State Overwrite in progress. Subsystem threads are currently frozen for synchronization. Do not interrupt connection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RestoreProgressModal);
