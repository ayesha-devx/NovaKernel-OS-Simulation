import React from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiTrash2, FiSettings, FiActivity } from 'react-icons/fi';

const QueueControls = ({ mode, onModeChange, onClear, onDequeue, stats }) => {
  return (
    <div className="glass-premium rounded-[2rem] p-8 border border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 scanline-overlay opacity-5" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-sm font-black text-white font-orbitron uppercase tracking-widest flex items-center gap-3">
          <FiSettings className="text-primary animate-spin-slow" />
          Queue_Controls
        </h3>
        <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
          {['FIFO', 'PRIORITY'].map((algo) => (
            <button
              key={algo}
              onClick={() => onModeChange(algo)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black font-orbitron transition-all ${
                mode === algo 
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(157,0,255,0.4)] neon-border' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {algo}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
        <button
          onClick={onDequeue}
          disabled={stats.length === 0}
          className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all group/btn ${
            stats.length === 0 
              ? 'bg-white/5 border-white/5 opacity-30 cursor-not-allowed' 
              : 'bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 hover:border-secondary/40 shadow-[0_0_20px_rgba(0,209,255,0.05)]'
          }`}
        >
          <FiActivity className={stats.length === 0 ? 'text-slate-700' : 'text-secondary group-hover/btn:scale-110 group-hover/btn:drop-shadow-[0_0_8px_rgba(0,209,255,0.6)] transition-all'} size={20} />
          <span className={`text-[9px] font-black font-orbitron uppercase tracking-widest ${stats.length === 0 ? 'text-slate-700' : 'text-secondary'}`}>Dispatch_CPU</span>
        </button>
        <button
          onClick={onClear}
          disabled={stats.length === 0}
          className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all group/btn ${
            stats.length === 0 
              ? 'bg-white/5 border-white/5 opacity-30 cursor-not-allowed' 
              : 'bg-error/5 hover:bg-error/10 border border-error/20 hover:border-error/40 shadow-[0_0_20px_rgba(255,77,109,0.05)]'
          }`}
        >
          <FiTrash2 className={stats.length === 0 ? 'text-slate-700' : 'text-error group-hover/btn:scale-110 group-hover/btn:drop-shadow-[0_0_8px_rgba(255,77,109,0.6)] transition-all'} size={20} />
          <span className={`text-[9px] font-black font-orbitron uppercase tracking-widest ${stats.length === 0 ? 'text-slate-700' : 'text-error'}`}>Purge_Queue</span>
        </button>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-3 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/5" />
            <h4 className="text-[9px] uppercase tracking-[0.4em] text-slate-500 font-black font-orbitron">Kernel_Telemetry</h4>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/5" />
        </div>
        
        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-5">
          <div className="flex justify-between items-center group/item">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover/item:text-slate-400 transition-colors">Queue_Length</span>
            <span className="text-sm font-mono-cyber text-white font-black">{stats.length}</span>
          </div>
          <div className="flex justify-between items-center group/item">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover/item:text-slate-400 transition-colors">Avg_Wait_Flux</span>
            <span className="text-sm font-mono-cyber text-primary font-black neon-text">{stats.average_waiting_time}s</span>
          </div>
          <div className="flex justify-between items-center group/item">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover/item:text-slate-400 transition-colors">Max_Waiting_PTR</span>
            <span className="text-[10px] font-mono-cyber text-slate-300 truncate max-w-[120px] text-right font-bold italic">
              {stats.oldest_waiting_process || 'NULL'}
            </span>
          </div>
          <div className="pt-4 mt-2 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active_State</span>
            <span className="text-[10px] bg-secondary/10 text-secondary px-3 py-1 rounded-lg border border-secondary/20 font-black font-orbitron tracking-widest shadow-[0_0_10px_rgba(0,209,255,0.1)]">
              {stats.current_algorithm}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueControls;
