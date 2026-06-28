import React from 'react';
import { motion } from 'framer-motion';
import { 
    LuGauge, 
    LuActivity, 
    LuZap, 
    LuMonitor, 
    LuTimer,
    LuTriangleAlert,
    LuChevronRight
} from 'react-icons/lu';
import { useKernel } from '../../context/KernelContext';

const RuntimeProfilerPanel = () => {
    const { monitoringData = {}, fps = 60, renderPressure = 'LOW' } = useKernel();
    const { profiler = {} } = monitoringData;

    const rates = profiler?.rates || { socket_throughput: 0, telemetry_pressure: 0 };
    const latencies = profiler?.latencies || {};
    const score = profiler?.score ?? 100;

    const getScoreColor = (s) => {
        if (s >= 90) return 'text-emerald-400';
        if (s >= 70) return 'text-blue-400';
        if (s >= 50) return 'text-yellow-400';
        return 'text-red-500';
    };

    const getPressureColor = (p) => {
        switch (p) {
            case 'HIGH': return 'text-red-500';
            case 'MEDIUM': return 'text-yellow-400';
            default: return 'text-emerald-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">
                        <LuMonitor size={12} /> Rendering FPS
                    </div>
                    <div className="flex items-end gap-2">
                        <span className={`text-3xl font-black font-mono tracking-tighter ${getPressureColor(renderPressure)}`}>
                            {fps}
                        </span>
                        <span className="text-white/20 text-[10px] font-bold mb-1">FPS</span>
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">
                        <LuGauge size={12} /> Performance Score
                    </div>
                    <div className="flex items-end gap-2">
                        <span className={`text-3xl font-black font-mono tracking-tighter ${getScoreColor(score)}`}>
                            {Math.round(score)}
                        </span>
                        <span className="text-white/20 text-[10px] font-bold mb-1">UNIT</span>
                    </div>
                </div>
            </div>

            {/* Throughput Section */}
            <div className="space-y-3">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <LuZap className="text-amber-400" size={12} /> Data Pipeline Throughput
                </h3>
                <div className="grid grid-cols-1 gap-2">
                    <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                <LuActivity size={14} />
                            </div>
                            <div>
                                <div className="text-[10px] text-white/40 uppercase font-bold">Socket Throughput</div>
                                <div className="text-sm font-mono text-white/80">{rates.socket_throughput || 0} emits/s</div>
                            </div>
                        </div>
                        <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, ((rates.socket_throughput || 0) / 500) * 100)}%` }}
                            />
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                                <LuZap size={14} />
                            </div>
                            <div>
                                <div className="text-[10px] text-white/40 uppercase font-bold">Telemetry Pressure</div>
                                <div className="text-sm font-mono text-white/80">{rates.telemetry_pressure || 0} items/s</div>
                            </div>
                        </div>
                        <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, ((rates.telemetry_pressure || 0) / 5000) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Subsystem Latency */}
            <div className="space-y-3">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <LuTimer className="text-rose-400" size={12} /> Processing Latency
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {(!latencies || Object.entries(latencies).length === 0) ? (
                        <div className="col-span-2 py-4 text-center text-[10px] text-white/20 font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-xl">
                            Awaiting telemetry data...
                        </div>
                    ) : (
                        Object.entries(latencies).map(([name, lat]) => (
                            <div key={name} className="bg-white/5 p-2 rounded-lg border border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] font-black text-white/40 uppercase truncate">{name.replace('_', ' ')}</span>
                                    <span className={`text-[10px] font-mono font-bold ${lat > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {lat}ms
                                    </span>
                                </div>
                                <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        className={`h-full ${lat > 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (lat / 100) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Warnings / Render Pressure */}
            {renderPressure === 'HIGH' && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-pulse">
                    <LuTriangleAlert className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <div>
                        <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">High Render Pressure</div>
                        <p className="text-[10px] leading-tight text-white/50">UI update frequency is exceeding rendering capacity. Consider closing expensive monitoring panels.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(RuntimeProfilerPanel);
