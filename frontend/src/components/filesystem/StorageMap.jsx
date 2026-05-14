import React from 'react';
import { motion } from 'framer-motion';

const StorageMap = ({ blocks = [], stats = {} }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1 font-orbitron">Physical Block Map</h4>
          <p className="text-[10px] text-slate-500 font-mono">0x2000 ADDRESSABLE SECTORS :: 64MB PAGE SIZE</p>
        </div>
        <div className="flex gap-6 text-[9px] font-black uppercase tracking-widest font-orbitron">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-cyan shadow-[0_0_8px_rgba(0,209,255,0.6)]"></div> 
            <span className="text-cyan">Allocated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-slate-800/50 border border-white/10"></div> 
            <span className="text-slate-500">Available</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 md:grid-cols-16 lg:grid-cols-32 gap-2 bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner relative group/map">
        <div className="absolute inset-0 scanline-overlay opacity-5 pointer-events-none" />
        {blocks.map((owner, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.002 }}
            whileHover={{ 
              scale: 1.3, 
              zIndex: 10,
              transition: { duration: 0.1 }
            }}
            className={`aspect-square rounded-[3px] border transition-all duration-300 cursor-crosshair ${
              owner 
              ? 'bg-cyan border-cyan/50 shadow-[0_0_12px_rgba(0,209,255,0.4)]' 
              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
            title={owner ? `Block ${idx}: Inode #${owner}` : `Block ${idx}: Free`}
          />
        ))}
      </div>
      
      <div className="flex justify-between text-[9px] text-slate-600 font-mono font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-cyan rounded-full animate-pulse" />
          <span>BOOT_SECTOR: 0x0000</span>
        </div>
        <span>END_ADDR: 0x{(blocks.length - 1).toString(16).toUpperCase().padStart(4, '0')}</span>
      </div>
    </div>
  );
};

export default StorageMap;
