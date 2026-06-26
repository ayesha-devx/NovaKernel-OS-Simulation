import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LuPlus, LuCpu, LuDatabase, LuActivity } from 'react-icons/lu';
import { useProcess } from '../../context/KernelContext';

const ProcessCreationForm = () => {
  const { createProcess } = useProcess();
  const [formData, setFormData] = useState({
    name: '',
    priority: 5,
    burst_time: 10,
    memory_required: 128
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createProcess(formData);
      setFormData({ name: '', priority: 5, burst_time: 10, memory_required: 128 });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-premium rounded-3xl sm:rounded-[2.5rem] border border-white/10 p-4 sm:p-8 relative overflow-hidden group shadow-[0_0_50px_rgba(157,0,255,0.05)]"
    >
      <div className="absolute inset-0 scanline-overlay opacity-10" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 blur-[80px] group-hover:bg-primary/20 transition-all duration-700" />
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border">
            <LuPlus className="text-primary neon-text" size={20} />
        </div>
        <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.4em] font-orbitron">Spawn_Core</h3>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Kernel_Process_Injection_Link</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1 font-orbitron">
              <span className="w-1 h-1 rounded-full bg-primary" /> Process_Identity
          </label>
          <div className="relative group/input">
            <input 
                type="text" 
                placeholder="PROT_LAYER_01X"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:border-primary/50 focus:bg-primary/5 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300 font-mono-cyber tracking-wider"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <div className="absolute inset-0 rounded-2xl border border-primary/0 group-focus-within/input:border-primary/30 pointer-events-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1 font-orbitron">
                <span className="w-1 h-1 rounded-full bg-secondary" /> Priority
            </label>
            <div className="relative group/input">
              <input 
                type="number" 
                min="1" max="10"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-secondary/50 focus:bg-secondary/5 focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all duration-300 font-mono-cyber"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              />
              <LuActivity className="absolute right-5 top-4 text-slate-600 group-focus-within/input:text-secondary group-focus-within/input:drop-shadow-[0_0_8px_rgba(0,209,255,0.6)] transition-all" size={18} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1 font-orbitron">
                <span className="w-1 h-1 rounded-full bg-magenta" /> Burst_T
            </label>
            <div className="relative group/input">
              <input 
                type="number" 
                min="1"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-magenta/50 focus:bg-magenta/5 focus:ring-2 focus:ring-magenta/20 focus:outline-none transition-all duration-300 font-mono-cyber"
                value={formData.burst_time}
                onChange={(e) => setFormData({...formData, burst_time: e.target.value})}
              />
              <LuCpu className="absolute right-5 top-4 text-slate-600 group-focus-within/input:text-magenta group-focus-within/input:drop-shadow-[0_0_8px_rgba(217,0,255,0.6)] transition-all" size={18} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1 font-orbitron">
              <span className="w-1 h-1 rounded-full bg-primary" /> Memory_Allocation
          </label>
          <div className="relative group/input">
            <input 
              type="number" 
              min="1"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-primary/50 focus:bg-primary/5 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300 font-mono-cyber"
              value={formData.memory_required}
              onChange={(e) => setFormData({...formData, memory_required: e.target.value})}
            />
            <LuDatabase className="absolute right-5 top-4 text-slate-600 group-focus-within/input:text-primary group-focus-within/input:drop-shadow-[0_0_8px_rgba(157,0,255,0.6)] transition-all" size={18} />
          </div>
        </div>

        <div className="pt-4">
            <motion.button 
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full group/btn h-14 overflow-hidden rounded-2xl disabled:opacity-50"
            >
                {/* Background Gradient & Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-magenta to-primary bg-[length:200%_100%] group-hover/btn:animate-gradient-x transition-all duration-500 shadow-[0_0_20px_rgba(157,0,255,0.4)] group-hover/btn:shadow-[0_0_30px_rgba(157,0,255,0.6)]" />
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 shimmer-sweep opacity-30 pointer-events-none" />
                
                {/* Cyan Edge Glow */}
                <div className="absolute inset-px rounded-[15px] border border-white/10 group-hover/btn:border-secondary/50 transition-all pointer-events-none" />
                
                <div className="relative flex items-center justify-center gap-3 text-white font-black text-xs uppercase tracking-[0.3em] font-orbitron">
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <LuPlus className="group-hover/btn:rotate-90 transition-transform duration-500" />
                            <span>Inject_Process</span>
                        </>
                    )}
                </div>
            </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProcessCreationForm;
