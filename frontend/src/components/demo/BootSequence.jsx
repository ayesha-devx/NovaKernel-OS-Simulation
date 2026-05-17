import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuTerminal, LuCpu, LuShieldCheck, LuActivity } from 'react-icons/lu';

const BootSequence = ({ active, currentStep, progress, onComplete }) => {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (currentStep) {
      setLines(prev => [...prev.slice(-8), { 
        text: currentStep, 
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now() 
      }]);
    }
  }, [currentStep]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-10 font-mono"
        >
          {/* Animated Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="w-full max-w-3xl relative">
            {/* Header */}
            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                <LuTerminal size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text tracking-[0.2em] uppercase">NovaOS v1.1.0</h1>
                <p className="text-primary text-xs font-bold tracking-widest uppercase opacity-70">Showcase Orchestration Layer</p>
              </div>
            </div>

            {/* Terminal Feed */}
            <div className="glass rounded-xl border border-white/5 p-6 mb-8 h-64 overflow-hidden flex flex-col justify-end bg-black/40">
              <div className="space-y-2">
                {lines.map((line) => (
                  <motion.div
                    key={line.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex gap-4 text-xs"
                  >
                    <span className="text-text/30">[{line.timestamp}]</span>
                    <span className="text-primary font-bold">SYS_BOOT:</span>
                    <span className="text-text/80">{line.text}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-4 bg-primary animate-pulse" />
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Awaiting sub-system handshake...</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
                <span className="text-text/40">Boot Sequence Integrity</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4 mt-8">
                {[
                  { icon: <LuCpu />, label: 'Core', active: progress > 20 },
                  { icon: <LuShieldCheck />, label: 'Sec', active: progress > 50 },
                  { icon: <LuActivity />, label: 'IO', active: progress > 80 },
                  { icon: <LuTerminal />, label: 'HAL', active: progress > 95 },
                ].map((item, i) => (
                  <div key={i} className={`flex flex-col items-center gap-2 transition-all duration-500 ${item.active ? 'text-primary' : 'text-text/20'}`}>
                    <div className={`p-2 rounded-lg border transition-all duration-500 ${item.active ? 'border-primary/50 bg-primary/10 shadow-[0_0_10px_rgba(var(--primary),0.2)]' : 'border-white/5'}`}>
                      {item.icon}
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center opacity-20">
             <p className="text-[10px] text-text tracking-[0.5em] uppercase font-bold">NovaOS © 2024 Advanced Agentic Systems</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootSequence;
