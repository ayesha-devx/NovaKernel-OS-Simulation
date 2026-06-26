import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuHistory, LuCircleCheck, LuTriangleAlert, LuClock, LuZap } from 'react-icons/lu';
import { useKernel } from '../../context/KernelContext';

const ActivityFeed = () => {
  const { logs } = useKernel();

  const activities = (logs || []).slice(-10).reverse().map(log => ({
    type: log.severity.toLowerCase(),
    msg: log.message,
    time: log.timestamp || 'Now',
    module: log.module
  }));

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <LuCircleCheck className="text-success" />;
      case 'warning': return <LuTriangleAlert className="text-warning" />;
      case 'error': case 'critical': return <LuTriangleAlert className="text-error" />;
      default: return <LuClock className="text-primary" />;
    }
  };

  return (
    <div className="glass-premium rounded-3xl sm:rounded-[2.5rem] border border-white/10 flex flex-col h-full overflow-hidden relative group shadow-[0_0_40px_rgba(157,0,255,0.05)]">
      <div className="absolute inset-0 scanline-overlay opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="px-4 sm:px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center neon-border">
            <LuHistory className="text-primary neon-text" size={18} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-text/80 uppercase tracking-[0.2em] sm:tracking-[0.4em] font-orbitron">Live_Activity_Flux</h3>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Realtime_Telemetry_Stream</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 sm:px-4 py-1.5 glass-premium bg-primary/10 rounded-full border border-primary/30">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(157,0,255,1)] indicator-pulse" />
            <span className="text-[9px] text-primary font-black tracking-[0.2em] font-orbitron">SYNC_ACTIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 relative z-10 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {activities.length > 0 ? activities.map((activity, i) => (
            <motion.div 
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              className="flex items-start gap-3 sm:gap-5 p-3 sm:p-5 rounded-2xl border border-transparent hover:border-white/5 transition-all group/item relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
              
              <div className="relative mt-1 text-2xl opacity-60 group-hover/item:opacity-100 group-hover/item:scale-110 group-hover/item:drop-shadow-[0_0_12px_rgba(157,0,255,0.6)] transition-all">
                {getIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-primary/80 uppercase tracking-[0.2em] font-mono-cyber">{activity.module}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <LuZap className="text-[10px] text-secondary opacity-40" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono-cyber uppercase tracking-widest">{activity.time}</span>
                </div>
                <p className="text-[13px] text-text/60 leading-relaxed font-space group-hover/item:text-text transition-colors">
                  {typeof activity.msg === 'object' ? JSON.stringify(activity.msg) : activity.msg}
                </p>
              </div>
            </motion.div>
          )) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 grayscale py-12">
              <LuHistory size={48} className="mb-4 text-primary animate-spin-slow" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] font-orbitron">Zero_Flux_Detected</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <motion.button 
        whileHover={{ backgroundColor: 'rgba(157, 0, 255, 0.1)' }}
        className="p-6 text-[10px] font-black text-primary hover:text-white transition-all uppercase tracking-[0.2em] sm:tracking-[0.4em] border-t border-white/5 font-orbitron flex items-center justify-center gap-3 group/btn"
      >
        <span className="group-hover/btn:scale-110 transition-transform">ACCESS_COMPLETE_ARCHIVE</span>
        <div className="w-1 h-1 rounded-full bg-primary" />
      </motion.button>
    </div>
  );
};

export default ActivityFeed;
