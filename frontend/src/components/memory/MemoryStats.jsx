import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuDatabase, 
  LuActivity, 
  LuZap, 
  LuShieldAlert, 
  LuHeart,
  LuLayers
} from 'react-icons/lu';
import { useProcess } from '../../context/KernelContext';

export const MemoryMetrics = () => {
  const { memoryStats = {} } = useProcess();

  const metrics = [
    { 
      label: 'TOTAL_RAM_CAPACITY', 
      value: `${memoryStats.total_memory || 4096}MB`, 
      sub: 'Physical_Storage',
      icon: <LuDatabase />, 
      color: '#9D00FF', 
      glow: 'rgba(157, 0, 255, 0.4)' 
    },
    { 
      label: 'CURRENT_ALLOCATION', 
      value: `${memoryStats.used_memory || 0}MB`, 
      sub: `${memoryStats.utilization || 0}%_Utilization`,
      icon: <LuActivity />, 
      color: '#00D1FF', 
      glow: 'rgba(0, 209, 255, 0.4)' 
    },
    { 
      label: 'FRAGMENTATION_LOSS', 
      value: `${memoryStats.fragmentation_percentage || 0}%`, 
      sub: `${memoryStats.external_fragmentation || 0}MB_Wasted`,
      icon: <LuShieldAlert />, 
      color: '#FFC857', 
      glow: 'rgba(255, 200, 87, 0.4)' 
    },
    { 
      label: 'FREE_BLOCK_PEAK', 
      value: `${memoryStats.largest_free_block || 0}MB`, 
      sub: 'Continuous_Space',
      icon: <LuZap />, 
      color: '#00FF9D', 
      glow: 'rgba(0, 255, 157, 0.4)' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {metrics.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative glass-premium p-8 rounded-[2.5rem] border border-white/10 overflow-hidden group shadow-[0_0_40px_rgba(0,0,0,0.3)]"
        >
          <div className="absolute inset-0 scanline-overlay opacity-5 group-hover:opacity-10 transition-opacity" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500" 
                  style={{ backgroundColor: `${m.color}15`, borderColor: `${m.color}30`, color: m.color, boxShadow: `0 0 15px ${m.color}20` }}>
                {React.cloneElement(m.icon, { size: 24, className: 'neon-text' })}
             </div>
             <div className="text-right">
                <span className="text-[10px] font-black font-orbitron tracking-widest text-slate-500 opacity-60 uppercase">{m.label}</span>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1 font-mono-cyber">{m.sub}</p>
             </div>
          </div>

          <div className="relative z-10">
             <h4 className="text-3xl font-black text-white font-orbitron tracking-tighter mb-1">{m.value}</h4>
             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full opacity-50"
                  style={{ background: `linear-gradient(to right, transparent, ${m.color})` }}
                />
             </div>
          </div>

          <div className="absolute -bottom-4 -right-4 w-24 h-24 blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40" 
               style={{ backgroundColor: m.color }} />
        </motion.div>
      ))}
    </div>
  );
};

export const MemoryHealthMonitor = () => {
  const { memoryStats = {} } = useProcess();
  const efficiency = 100 - (memoryStats.fragmentation_percentage || 0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-premium p-10 rounded-[3rem] border border-white/10 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] shadow-[0_0_50px_rgba(157,0,255,0.05)]"
    >
      <div className="absolute inset-0 scanline-overlay opacity-10 pointer-events-none" />
      
      <div className="relative mb-12">
        {/* Rotating Diagnostic Scan Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-56 h-56 rounded-full border-2 border-dashed border-primary/20"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-dotted border-secondary/30"
        />
        
        {/* Heartbeat Pulse Glow */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-10 bg-primary/20 rounded-full blur-[40px]"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <LuHeart className="text-primary neon-text mb-2 animate-pulse" size={32} />
            <span className="text-5xl font-black text-white font-orbitron tracking-tighter neon-text">{Math.round(efficiency)}%</span>
        </div>
      </div>

      <div className="text-center relative z-10">
        <h3 className="text-xs font-black text-white font-orbitron tracking-[0.4em] uppercase mb-2">ALLOCATION_HEALTH_INDEX</h3>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono-cyber">Diagnostic_Realtime_Engine_V4.1</p>
        
        <div className="flex items-center gap-4 mt-8 justify-center">
           <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 border border-success/30">
              <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_#00FF9D] animate-pulse" />
              <span className="text-[8px] font-black text-success uppercase tracking-widest font-orbitron">Optimized</span>
           </div>
           <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-orbitron">SYS_0x7FF</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export const FragmentationMatrix = () => {
  const { memoryStats = {} } = useProcess();

  return (
    <div className="glass-premium p-10 rounded-[3rem] border border-white/10 relative overflow-hidden h-full shadow-[0_0_40px_rgba(255,200,87,0.05)]">
       <div className="absolute inset-0 scanline-overlay opacity-5 pointer-events-none" />
       
       <div className="flex items-center gap-5 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-warning/20 border border-warning/30 flex items-center justify-center neon-border-warning">
              <LuLayers className="text-warning neon-text-warning" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white font-orbitron tracking-[0.2em] uppercase">FRAG_MATRIX</h3>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 font-orbitron">Structural_Integrity_Scan</p>
          </div>
       </div>

       <div className="space-y-10">
          {[
            { label: 'External_Fragmentation', value: memoryStats.external_fragmentation || 0, unit: 'MB', pct: memoryStats.fragmentation_percentage || 0, color: '#FFC857' },
            { label: 'Internal_Fragmentation', value: 0, unit: 'MB', pct: 0, color: '#FF4D6D' },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron">{item.label}</span>
                  <p className="text-2xl font-black text-white font-orbitron mt-1">{item.value}{item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 font-mono-cyber">LOSS_RATIO</p>
                  <span className="text-sm font-black font-mono-cyber" style={{ color: item.color }}>{item.pct}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  className="h-full rounded-full shadow-[0_0_15px_rgba(255,200,87,0.2)]"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
       </div>

       <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5">
             <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                    <LuActivity className="text-primary" size={14} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-orbitron">Utilization_Load</span>
             </div>
             <span className="text-lg font-black text-white font-mono-cyber">{memoryStats.utilization || 0}%</span>
          </div>
       </div>
    </div>
  );
};
