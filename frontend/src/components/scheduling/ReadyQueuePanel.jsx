import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLayers, FiZap, FiCpu } from 'react-icons/fi';
import { LuZap } from 'react-icons/lu';
import QueueCard from './QueueCard';
import QueueControls from './QueueControls';
import { useProcess } from '../../context/KernelContext';

const ReadyQueuePanel = ({ minimal = false }) => {
  const { 
    readyQueue, 
    queueStats, 
    queueMode, 
    updateQueueMode, 
    dequeueProcess, 
    clearQueue 
  } = useProcess();
  
  const [isDispatching, setIsDispatching] = useState(false);
  const [localQueue, setLocalQueue] = useState([]);

  useEffect(() => {
    setLocalQueue(readyQueue);
  }, [readyQueue]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalQueue(prev => prev.map(p => ({
        ...p,
        waiting_duration: (parseFloat(p.waiting_duration) + 1).toFixed(2)
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleModeChange = (newMode) => {
    updateQueueMode(newMode);
  };

  const handleDequeue = async () => {
    if (readyQueue.length === 0) return;
    setIsDispatching(true);
    await dequeueProcess();
    setTimeout(() => setIsDispatching(false), 500);
  };

  return (
    <div className={`flex flex-col gap-8 h-full ${minimal ? 'p-0' : 'p-2'}`}>
      {!minimal && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border">
                <FiLayers className="text-primary neon-text" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white font-orbitron tracking-tighter uppercase neon-gradient-text">QUEUE_PIPELINE</h1>
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[8px] mt-1">Ready_State_Orchestration_Bus</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="glass-premium px-6 py-2.5 rounded-2xl border-white/10 flex flex-col items-end">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 font-orbitron">Priority_Protocol</p>
               <p className="text-sm font-black text-primary font-orbitron neon-text">{queueMode}</p>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${minimal ? '' : 'lg:grid-cols-4'} gap-8 items-stretch h-full`}>
        {/* Main Pipeline Visualization */}
        <div className={`relative glass-premium ${minimal ? 'rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8' : 'rounded-3xl sm:rounded-[3rem] p-4 sm:p-10'} flex-grow min-h-[350px] shadow-[0_0_50px_rgba(157,0,255,0.05)] overflow-hidden group`}>
          <div className="absolute inset-0 scanline-overlay opacity-10 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-5">
              <div>
                <h2 className={`${minimal ? 'text-xs' : 'text-xl'} font-black text-white font-orbitron tracking-[0.3em] uppercase ${minimal ? 'text-slate-400' : ''}`}>
                    {minimal ? 'PIPELINE_STATUS' : 'READY_QUEUE_BUS'}
                </h2>
                {!minimal && (
                  <div className="flex items-center gap-3 mt-2">
                    <motion.span 
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-[8px] font-black text-secondary uppercase tracking-widest px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 font-orbitron"
                    >
                      {queueMode}_PROTOCOL_ACTIVE
                    </motion.span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1 font-orbitron">Payload_Load</p>
                <div className="flex items-center gap-2 justify-end">
                    <span className={`font-black font-orbitron text-white neon-text-cyan ${minimal ? 'text-2xl' : 'text-3xl'}`}>{readyQueue.length}</span>
                    <span className="text-[9px] text-slate-600 font-mono-cyber">PTR</span>
                </div>
            </div>
          </div>

          <div className="relative min-h-[220px] flex items-center">
            {/* Arrival Ingress Bus Line */}
            <div className="absolute left-2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/50 to-transparent flex flex-col justify-center rounded-full opacity-40 group-hover:opacity-80 transition-opacity">
               <motion.div 
                 animate={{ y: [-40, 40], opacity: [0, 1, 0] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-x-0 h-20 bg-primary blur-md"
               />
               <span className="absolute -left-12 -rotate-90 text-[7px] font-black text-primary/30 tracking-[1em] whitespace-nowrap uppercase select-none font-orbitron">INGRESS_BUS_01</span>
            </div>

            <div className="w-full overflow-x-auto pb-6 custom-scrollbar scroll-smooth">
              <div className="flex items-center gap-6 sm:gap-8 px-6 sm:px-16 min-w-max">
                <AnimatePresence mode="popLayout">
                  {localQueue.length > 0 ? (
                    localQueue.map((process, index) => (
                      <QueueCard 
                        key={process.pid} 
                        process={process} 
                        index={index} 
                        isFirst={index === 0}
                        small={minimal}
                      />
                    ))
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center py-20 gap-6 relative">
                      <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ 
                            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="w-20 h-20 rounded-full border border-dashed border-primary/20 flex items-center justify-center relative"
                      >
                         <LuZap size={40} className="text-primary/30 neon-text" />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] font-orbitron">Pipeline_Dormant</p>
                        <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mt-2">Ready_Queue_Synchronized_Empty</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Egress Dispatched Bus Line */}
            <div className="absolute right-2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-secondary/50 to-transparent flex flex-col justify-center rounded-full opacity-40 group-hover:opacity-80 transition-opacity">
               <motion.div 
                 animate={{ y: [40, -40], opacity: [0, 1, 0] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-x-0 h-20 bg-secondary blur-md"
               />
               <span className="absolute -right-12 rotate-90 text-[7px] font-black text-secondary/30 tracking-[1em] whitespace-nowrap uppercase select-none font-orbitron">DISPATCH_BUS_01</span>
            </div>
          </div>
        </div>

        {!minimal && (
          <div className="lg:col-span-1">
            <QueueControls 
              mode={queueMode}
              onModeChange={handleModeChange}
              onClear={clearQueue}
              onDequeue={handleDequeue}
              stats={queueStats}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadyQueuePanel;
