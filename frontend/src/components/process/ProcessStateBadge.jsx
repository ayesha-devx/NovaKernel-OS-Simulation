import React from 'react';
import { motion } from 'framer-motion';

const ProcessStateBadge = ({ state }) => {
  const styles = {
    NEW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    READY: 'bg-secondary/10 text-secondary border-secondary/30 shadow-[0_0_15px_rgba(0,209,255,0.1)]',
    RUNNING: 'bg-success/15 text-success border-success/40 shadow-[0_0_20px_rgba(0,255,157,0.2)]',
    WAITING: 'bg-warning/10 text-warning border-warning/30 shadow-[0_0_15px_rgba(255,200,87,0.1)]',
    TERMINATED: 'bg-error/10 text-error border-error/30 shadow-[0_0_15px_rgba(255,77,109,0.1)]',
  };

  const getPulseColor = (state) => {
    switch(state) {
      case 'RUNNING': return 'bg-success';
      case 'READY': return 'bg-secondary';
      case 'WAITING': return 'bg-warning';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {['RUNNING', 'READY'].includes(state) && (
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.2, 0.05, 0.2] 
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`absolute inset-0 ${getPulseColor(state)} rounded-lg blur-md`}
        />
      )}
      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black border uppercase tracking-[0.15em] font-orbitron relative z-10 flex items-center gap-2 ${styles[state] || styles.NEW}`}>
        {(state === 'RUNNING' || state === 'READY') && (
          <motion.div 
            animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-1.5 h-1.5 rounded-full ${getPulseColor(state)} shadow-[0_0_8px_currentColor]`} 
          />
        )}
        {state}
      </span>
    </div>
  );
};

export default ProcessStateBadge;
