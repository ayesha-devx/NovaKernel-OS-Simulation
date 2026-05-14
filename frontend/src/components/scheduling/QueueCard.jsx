import React from 'react';
import { motion } from 'framer-motion';

const QueueCard = ({ process, index, isFirst, small = false }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, x: -50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ 
        opacity: 0, 
        scale: 0.5, 
        x: 150,
        filter: "blur(15px)",
        transition: { duration: 0.5, ease: "anticipate" }
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        layout: { duration: 0.6, type: "spring", stiffness: 200, damping: 25 }
      }}
      className={`relative ${small ? 'min-w-[180px] p-5' : 'min-w-[240px] p-8'} rounded-[2rem] border transition-all duration-700 ${
        isFirst 
          ? 'glass-premium border-primary/50 shadow-[0_0_50px_rgba(157,0,255,0.15)] ring-1 ring-primary/30' 
          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
      } backdrop-blur-2xl group cursor-default overflow-hidden`}
    >
      {/* Cinematic Background Elements */}
      {isFirst && (
        <>
            <div className="absolute inset-0 scanline-overlay opacity-30" />
            <motion.div 
              animate={{ 
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.05, 1] 
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none"
            />
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] -mr-12 -mt-12" />
        </>
      )}
      
      <div className={`flex justify-between items-start ${small ? 'mb-4' : 'mb-6'} relative z-10`}>
        <div className="flex flex-col">
            <span className="text-[8px] font-mono-cyber text-slate-500 uppercase tracking-widest font-black">PID_LINK</span>
            <span className={`text-[10px] font-mono-cyber font-black ${isFirst ? 'text-primary' : 'text-slate-400'}`}>0x{process.pid.toString(16).toUpperCase()}</span>
        </div>
        <span className={`text-[10px] w-8 h-8 flex items-center justify-center rounded-xl font-black font-orbitron transition-all duration-500 ${
          isFirst ? 'bg-primary text-white neon-border shadow-[0_0_15px_rgba(157,0,255,0.5)]' : 'bg-white/5 text-slate-600 border border-white/5'
        }`}>
          {index + 1}
        </span>
      </div>
      
      <h4 className={`${small ? 'text-sm' : 'text-base'} font-black text-white font-orbitron tracking-tight truncate ${small ? 'mb-2' : 'mb-3'} relative z-10 group-hover:text-primary transition-colors duration-300`}>
        {process.name}
      </h4>
      
      {!small && (
        <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 font-orbitron">Priority</span>
            <span className="text-xs font-mono-cyber text-primary font-black drop-shadow-[0_0_5px_rgba(157,0,255,0.3)]">LVL_{process.priority}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 font-orbitron">Burst_Time</span>
            <span className="text-xs font-mono-cyber text-secondary font-black drop-shadow-[0_0_5px_rgba(0,209,255,0.3)]">{process.burst_time}s</span>
          </div>
        </div>
      )}
      
      <div className={`${small ? 'mt-4 pt-4' : 'mt-8 pt-6'} border-t border-white/5 flex items-center justify-between relative z-10`}>
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isFirst ? 'bg-primary shadow-[0_0_10px_rgba(157,0,255,1)] indicator-pulse' : 'bg-slate-800'}`} />
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest font-orbitron">{small ? 'Wait' : 'Pipeline_Wait'}</span>
        </div>
        <span className={`${small ? 'text-[10px]' : 'text-xs'} font-mono-cyber font-black ${isFirst ? 'text-primary' : 'text-slate-500'}`}>{process.waiting_duration}s</span>
      </div>
      
      {/* Holographic Reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default QueueCard;
