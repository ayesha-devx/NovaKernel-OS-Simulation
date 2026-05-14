import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LuTerminal, 
    LuMonitor, 
    LuZap, 
    LuActivity, 
    LuShieldCheck,
    LuChevronDown,
    LuChevronUp,
    LuX,
    LuCpu,
    LuDatabase
} from 'react-icons/lu';
import { useKernel } from '../../context/KernelContext';

const DebugOverlay = () => {
    const { 
        monitoringData = {}, 
        fps = 60, 
        renderPressure = 'LOW', 
        showDebugOverlay = false, 
        setShowDebugOverlay,
        kernelState = {}
    } = useKernel();
    
    const [minimized, setMinimized] = useState(false);
    const { profiler = {}, leakDetector = {}, watchdog = {} } = monitoringData;
    
    if (!showDebugOverlay) return null;

    const stats = [
        { label: 'FPS', value: fps, color: renderPressure === 'HIGH' ? 'text-red-500' : 'text-emerald-400', icon: <LuMonitor size={10} /> },
        { label: 'NET', value: `${profiler?.rates?.socket_throughput || 0}e/s`, color: 'text-blue-400', icon: <LuZap size={10} /> },
        { label: 'STB', value: `${Math.round(leakDetector?.stability_score || 100)}%`, color: 'text-purple-400', icon: <LuShieldCheck size={10} /> },
        { label: 'WATCH', value: watchdog?.status || 'OK', color: 'text-amber-400', icon: <LuActivity size={10} /> },
        { label: 'PROC', value: kernelState?.processes?.length || 0, color: 'text-cyan-400', icon: <LuCpu size={10} /> },
        { label: 'MEM', value: `${Math.round((kernelState?.memory?.used_ram || 0) / 1024)}G`, color: 'text-rose-400', icon: <LuDatabase size={10} /> }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-6 right-6 z-[9999] font-mono pointer-events-auto"
        >
            <div className="glass bg-black/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-w-[180px]">
                {/* Header */}
                <div className="bg-white/5 px-4 py-2 flex items-center justify-between gap-4 border-b border-white/5 cursor-move">
                    <div className="flex items-center gap-2">
                        <LuTerminal className="text-primary-500" size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Kernel_Debug</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setMinimized(!minimized)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white"
                        >
                            {minimized ? <LuChevronUp size={12} /> : <LuChevronDown size={12} />}
                        </button>
                        <button 
                            onClick={() => setShowDebugOverlay(false)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-rose-500"
                        >
                            <LuX size={12} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {!minimized && (
                    <div className="p-3">
                        <div className="grid grid-cols-2 gap-2">
                            {stats.map((stat) => (
                                <div key={stat.label} className="bg-white/5 p-2 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-1.5 text-[8px] font-black text-white/30 uppercase mb-0.5">
                                        {stat.icon} {stat.label}
                                    </div>
                                    <div className={`text-xs font-black ${stat.color} tracking-tighter`}>
                                        {stat.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Performance Bar */}
                        <div className="mt-3 pt-3 border-t border-white/5">
                            <div className="flex justify-between items-center text-[8px] font-black text-white/20 uppercase mb-1.5">
                                <span>Render_Load</span>
                                <span className={renderPressure === 'HIGH' ? 'text-red-500' : 'text-emerald-500'}>{renderPressure}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    className={`h-full ${renderPressure === 'HIGH' ? 'bg-red-500' : renderPressure === 'MEDIUM' ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                    initial={{ width: '20%' }}
                                    animate={{ width: renderPressure === 'HIGH' ? '90%' : renderPressure === 'MEDIUM' ? '50%' : '20%' }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default React.memo(DebugOverlay);
