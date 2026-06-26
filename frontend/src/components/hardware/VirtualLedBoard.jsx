import React from 'react';
import { motion } from 'framer-motion';
import { useKernel } from '../../context/KernelContext';
import { LuActivity, LuZap, LuPower, LuHardDrive } from 'react-icons/lu';

const VirtualLedBoard = () => {
  const { hardwareState } = useKernel();
  
  if (!hardwareState) return null;

  const slots = [1, 2, 3];

  const LED = ({ active, color, label }) => {
    const colorClasses = {
      amber: active ? 'bg-amber-500 shadow-[0_0_20px_#f59e0b]' : 'bg-amber-500/10 border-amber-500/20',
      green: active ? 'bg-emerald-500 shadow-[0_0_20px_#10b981]' : 'bg-emerald-500/10 border-emerald-500/20',
      blue: active ? 'bg-blue-500 shadow-[0_0_20px_#3b82f6]' : 'bg-blue-500/10 border-blue-500/20',
      red: active ? 'bg-rose-500 shadow-[0_0_20px_#f43f5e]' : 'bg-rose-500/10 border-rose-500/20',
      cyan: active ? 'bg-cyan-400 shadow-[0_0_20px_#22d3ee]' : 'bg-cyan-400/10 border-cyan-400/20',
    };

    return (
      <div className="flex flex-col items-center gap-3">
        <motion.div 
          animate={active ? { 
            scale: [1, 1.2, 1], 
            filter: ["brightness(1)", "brightness(2.5)", "brightness(1)"]
          } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`w-6 h-6 rounded-full border-2 transition-all duration-150 ${colorClasses[color]}`} 
        />
        <span className={`text-[7px] font-black uppercase tracking-widest transition-colors duration-300 ${active ? 'text-white' : 'text-white/20'}`}>
            {label}
        </span>
      </div>
    );
  };

  return (
    <div className="relative p-6 sm:p-12 bg-[#12161f] rounded-[2rem] border-4 border-[#1a202c] shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
      {/* Board Texture / Screws */}
      <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-white/5 border border-white/10" />
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/5 border border-white/10" />
      <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-white/5 border border-white/10" />
      <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-white/5 border border-white/10" />

      <div className="flex gap-4 sm:gap-8 lg:gap-16">
        {slots.map(slot => (
          <div key={slot} className="space-y-6 sm:space-y-12">
            <div className="text-center">
               <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1 italic">Slot 0{slot}</p>
               <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            <div className="space-y-6 sm:space-y-10">
                <LED active={hardwareState.led_states[slot]?.READY} color="amber" label="Ready" />
                <LED active={hardwareState.led_states[slot]?.RUNNING} color="green" label="Run" />
                <LED active={hardwareState.led_states[slot]?.WAITING} color="blue" label="Wait" />
            </div>
          </div>
        ))}

        {/* Separator */}
        <div className="w-px bg-white/5 self-stretch" />

        {/* Special Function Indicators */}
        <div className="space-y-6 sm:space-y-12">
            <div className="text-center">
               <p className="text-[10px] font-black text-rose-500/40 uppercase tracking-widest mb-1 italic">System</p>
               <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            <div className="space-y-6 sm:space-y-10">
                <div className="flex flex-col items-center gap-3">
                    <LED active={hardwareState.special_leds?.DEADLOCK} color="red" label="Alarm" />
                    {hardwareState.special_leds?.DEADLOCK && (
                        <LuActivity className="text-rose-500 absolute -top-8 animate-bounce" size={24} />
                    )}
                </div>
                <LED active={hardwareState.special_leds?.TERMINATION} color="cyan" label="Term" />
                
                <div className="flex flex-col items-center gap-3 relative">
                    <LED active={hardwareState.special_leds?.DISK} color="cyan" label="Disk" />
                    {hardwareState.special_leds?.DISK && (
                        <LuHardDrive className="text-cyan-400 absolute -top-8 animate-pulse shadow-[0_0_15px_#22d3ee]" size={20} />
                    )}
                </div>
                
                <div className="flex flex-col items-center gap-3">
                    <motion.div 
                        animate={hardwareState.buzzer_active ? { x: [-2, 2, -2] } : {}}
                        transition={{ repeat: Infinity, duration: 0.1 }}
                        className={`p-2 rounded-xl border ${hardwareState.buzzer_active ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/10 text-white/10'}`}
                    >
                        <LuZap size={20} />
                    </motion.div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-white/20">Buzzer</span>
                </div>
            </div>
        </div>
      </div>

      {/* PCB Traces (Decorative) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <svg className="w-full h-full">
              <path d="M 0 100 H 200 V 300 H 400" fill="none" stroke="cyan" strokeWidth="1" />
              <path d="M 500 0 V 200 H 700" fill="none" stroke="cyan" strokeWidth="1" />
          </svg>
      </div>
    </div>
  );
};

export default VirtualLedBoard;
