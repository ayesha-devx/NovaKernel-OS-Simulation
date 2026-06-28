import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ title, value, subValue, icon, trend, color }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 1000);
      setPrevValue(value);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  const colorMap = {
    primary: 'text-primary bg-primary/5 border-primary/30 neon-border',
    secondary: 'text-cyan bg-cyan/5 border-cyan/30 neon-border-cyan',
    success: 'text-green bg-green/5 border-green/30 neon-border-green',
    warning: 'text-warning bg-warning/5 border-warning/30 neon-border-warning',
    error: 'text-error bg-error/5 border-error/30 neon-border-danger',
    magenta: 'text-magenta bg-magenta/5 border-magenta/30 neon-border-magenta',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className={`glass-premium rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 border border-white/10 relative overflow-hidden group transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)] ${colorMap[color] || colorMap.primary}`}
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 shimmer-sweep opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
      <div className="absolute inset-0 scanline-overlay opacity-20 pointer-events-none" />
      
      {/* Dynamic Color Bloom */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
        color === 'primary' ? 'bg-primary/20' : 
        color === 'secondary' ? 'bg-cyan/20' : 
        color === 'success' ? 'bg-green/20' : 
        color === 'warning' ? 'bg-warning/20' : 
        color === 'magenta' ? 'bg-magenta/20' : 'bg-primary/20'
      }`} />

      <div className="flex justify-between items-start mb-6 sm:mb-10 relative z-10">
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${colorMap[color] || colorMap.primary} !bg-transparent !border-white/10`}>
          <div className="text-2xl drop-shadow-[0_0_10px_currentColor]">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="flex flex-col items-end">
             <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest font-orbitron border ${
                trend.includes('%') || trend === 'ONLINE' || trend === 'NORMAL'
                  ? 'bg-green/10 text-green border-green/20' 
                  : 'bg-error/10 text-error border-error/20'
              }`}>
              {trend}
            </span>
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <h3 className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.4em] mb-3 group-hover:text-primary transition-colors font-orbitron truncate">
            {title.replace(' ', '_')}
        </h3>
        <div className="flex items-baseline gap-3">
          <AnimatePresence mode="wait">
            <motion.p 
              key={value}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`text-4xl font-black text-white tracking-tighter font-orbitron ${isUpdating ? 'neon-text' : 'drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]'}`}
            >
              {value}
            </motion.p>
          </AnimatePresence>
          {subValue && (
            <span className="text-[10px] text-slate-600 font-mono-cyber uppercase tracking-widest font-bold">
                {subValue}
            </span>
          )}
        </div>
      </div>

      {/* Realtime Sync Wave */}
      <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden opacity-30">
          <motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent"
          />
      </div>
    </motion.div>
  );
};

export default StatCard;
