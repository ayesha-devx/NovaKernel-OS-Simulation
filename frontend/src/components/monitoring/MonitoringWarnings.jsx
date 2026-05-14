import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuTriangleAlert, LuCheck } from 'react-icons/lu';

const MonitoringWarnings = React.memo(({ warnings }) => {
  return (
    <div className="glass bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 h-full flex flex-col">
      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        <LuTriangleAlert className="text-amber-400" /> Active Warnings
      </h3>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        <AnimatePresence initial={false}>
          {warnings.length > 0 ? (
            warnings.map((warning, i) => (
              <motion.div
                key={`${warning}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                <p className="text-[11px] font-medium text-rose-200 uppercase leading-tight">
                  {warning}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-40">
              <LuCheck size={32} className="mb-2" />
              <p className="text-[9px] font-black uppercase tracking-widest text-center">System Integral — No Warnings</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default MonitoringWarnings;
