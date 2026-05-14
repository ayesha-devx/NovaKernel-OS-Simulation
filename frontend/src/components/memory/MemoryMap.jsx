import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProcess } from '../../context/KernelContext';
import { LuCpu, LuTerminal, LuDatabase, LuActivity, LuInfo } from 'react-icons/lu';

const MemoryMap = () => {
  const { memoryMap = { blocks: [] }, schedulerState = {} } = useProcess();
  const [selectedBlock, setSelectedBlock] = useState(null);

  const totalSize = memoryMap.stats?.total_memory || 4096;
  const blocks = memoryMap.blocks || [];

  return (
    <div className="relative pt-6 pb-6">
      {/* Memory Grid Header Telemetry */}
      <div className="flex justify-between items-center text-[9px] font-black font-orbitron mb-8 uppercase tracking-[0.3em] px-2">
        <div className="flex items-center gap-6">
            <span className="text-primary/40">ADDR_0x0000</span>
            <div className="h-3 w-px bg-primary/20" />
            <div className="flex items-center gap-10 ml-4">
              <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_#9D00FF]"></div> ALLOCATED</span>
              <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-primary/10 border border-primary/40"></div> UNUSED_SYS</span>
            </div>
        </div>
        <span className="text-primary/40 tracking-widest">LIMIT_0x{(totalSize - 1).toString(16).toUpperCase()}</span>
      </div>

      {/* Holographic Memory Grid Container */}
      <div className="h-32 w-full glass-premium rounded-[1.5rem] border border-primary/30 flex overflow-hidden p-2 shadow-[0_0_50px_rgba(157,0,255,0.1)] relative group bg-primary/[0.02]">
        <div className="absolute inset-0 scanline-overlay opacity-20 pointer-events-none" />
        
        {/* Grid Background Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08]" 
             style={{ backgroundImage: 'linear-gradient(to right, rgba(157,0,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(157,0,255,0.2) 1px, transparent 1px)', backgroundSize: '20px 100%' }} />

        {blocks.map((block, idx) => {
          const widthPct = (block.size / totalSize) * 100;
          const isAllocated = block.status === "ALLOCATED";
          const isCurrentProcess = schedulerState.current_process?.pid === block.pid;
          
          return (
            <motion.div
              key={`${block.block_id || idx}-${block.start_address || 0}`}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              onClick={() => setSelectedBlock(block)}
              className={`h-full relative cursor-pointer group/block transition-all duration-500 overflow-hidden ${
                isAllocated 
                ? isCurrentProcess 
                  ? 'bg-gradient-to-b from-primary to-primary/20 border-x border-primary/50 z-10' 
                  : 'bg-gradient-to-b from-primary/40 to-primary/5 border-x border-primary/30 hover:from-primary/60'
                : 'bg-primary/5 hover:bg-primary/10 border-x border-primary/10'
              }`}
              style={{ width: `${widthPct}%` }}
            >
              {/* Internal Scanning Effect for allocated blocks */}
              {isAllocated && (
                 <motion.div 
                    animate={{ x: [-100, 200] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                 />
              )}

              {widthPct > 5 && isAllocated && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 relative z-10">
                  <span className={`text-[9px] font-black uppercase tracking-tighter w-full text-center truncate ${isCurrentProcess ? 'text-success neon-text' : 'text-primary/80'}`}>
                    {block.process_name}
                  </span>
                  <span className="text-[7px] font-mono-cyber opacity-40 mt-0.5">{block.size}MB</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Block Details Sub-Panel */}
      <AnimatePresence>
        {selectedBlock && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 20 }}
            className="mt-10 overflow-hidden"
          >
            <div className="glass-premium bg-primary/[0.03] border border-primary/20 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex flex-wrap items-center gap-10">
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-orbitron">ALLOC_STATUS</span>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest border font-orbitron ${
                    selectedBlock.status === "ALLOCATED" 
                      ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(157,0,255,0.2)]' 
                      : 'bg-slate-800 text-slate-500 border-white/5'
                  }`}>
                    {selectedBlock.status}
                  </div>
                </div>

                {selectedBlock.pid && (
                  <div className="flex items-center gap-5 border-l border-white/10 pl-10">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center neon-border">
                        <LuCpu className="text-primary neon-text" size={24} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron mb-1">EXEC_CONTEXT</p>
                        <p className="text-lg font-black text-white font-orbitron tracking-tight">{selectedBlock.process_name}</p>
                        <p className="text-[9px] text-primary font-mono-cyber uppercase font-black">PID_0x{selectedBlock.pid.toString(16).toUpperCase()}</p>
                     </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 border-l border-white/10 pl-10">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-orbitron">ADDRESS_SPACE_SEGMENT</p>
                  <div className="flex items-center gap-4 bg-black/40 px-5 py-2.5 rounded-2xl border border-white/5 font-mono-cyber font-black text-xs text-secondary">
                    <span>0x{(selectedBlock.start_address || 0).toString(16).toUpperCase().padStart(4, '0')}</span>
                    <span className="opacity-30">→</span>
                    <span>0x{(selectedBlock.end_address || 0).toString(16).toUpperCase().padStart(4, '0')}</span>
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedBlock(null)}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-[9px] font-black text-white font-orbitron tracking-widest transition-all uppercase"
              >
                CLOSE_PORTAL
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryMap;
