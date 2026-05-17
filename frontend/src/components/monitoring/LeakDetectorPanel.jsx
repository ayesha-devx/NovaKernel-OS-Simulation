import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LuActivity, 
    LuTriangleAlert, 
    LuShieldCheck, 
    LuCpu, 
    LuDatabase, 
    LuZap, 
    LuClock,
    LuRefreshCw,
    LuChevronRight,
    LuCircleCheck,
    LuCircleX
} from 'react-icons/lu';
import { useKernel } from '../../context/KernelContext';

const LeakDetectorPanel = () => {
    const { monitoringData = {}, requestWatchdogSync } = useKernel();
    const { leakDetector = {}, watchdog = {} } = monitoringData;

    const stabilityScore = leakDetector?.stability_score ?? 100;
    const watchdogScore = watchdog?.score ?? 100;
    const warnings = leakDetector?.warnings || [];
    const resourceScores = leakDetector?.resource_scores || {};
    const pressureLevels = leakDetector?.pressure_levels || {};
    const heartbeats = watchdog?.heartbeats || {};
    const stalled = watchdog?.stalled || [];

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-400';
        if (score >= 75) return 'text-blue-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-500';
    };

    const getSeverityColor = (sev) => {
        switch (sev) {
            case 'CRITICAL': return 'text-red-500 border-red-500/30 bg-red-500/10';
            case 'HIGH': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
            case 'MEDIUM': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
            default: return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
        }
    };

    const renderPressureIndicator = (label, score, level, icon) => (
        <div className="bg-slate-900/50 border border-white/5 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded bg-white/5 ${getScoreColor(score)}`}>
                    {icon}
                </div>
                <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider font-bold">{label}</div>
                    <div className="text-sm font-mono text-white/80">{(score || 0).toFixed(1)}% Health</div>
                </div>
            </div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                level === 'LOW' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                level === 'MEDIUM' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' :
                'text-red-500 border-red-500/20 bg-red-500/5'
            }`}>
                {level || 'STABLE'}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header / Global Scores */}
            <div className="grid grid-cols-1 gap-4">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/80 border border-white/10 rounded-xl p-5 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LuShieldCheck size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-emerald-400 mb-1">
                            <LuShieldCheck size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Runtime Stability</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className={`text-4xl font-black font-mono tracking-tighter ${getScoreColor(stabilityScore)}`}>
                                {Math.round(stabilityScore || 0)}
                            </span>
                            <span className="text-white/30 text-[10px] mb-1.5 font-bold uppercase">Points</span>
                        </div>
                        <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stabilityScore}%` }}
                                className={`h-full ${stabilityScore > 75 ? 'bg-emerald-500' : stabilityScore > 50 ? 'bg-yellow-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/80 border border-white/10 rounded-xl p-5 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LuActivity size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-400 mb-1">
                                <LuActivity size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Watchdog Health</span>
                            </div>
                            <button 
                                onClick={requestWatchdogSync}
                                className="p-1 hover:bg-white/5 rounded transition-colors text-white/40 hover:text-white"
                            >
                                <LuRefreshCw size={14} />
                            </button>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className={`text-4xl font-black font-mono tracking-tighter ${getScoreColor(watchdogScore)}`}>
                                {Math.round(watchdogScore || 0)}
                            </span>
                            <span className="text-white/30 text-[10px] mb-1.5 font-bold uppercase">{watchdog?.status || 'STABLE'}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-[10px] font-mono text-white/40">
                            <div className="flex items-center gap-1">
                                <LuClock size={12} />
                                UPTIME: {Math.floor(watchdog?.uptime || 0)}s
                            </div>
                            <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500`} />
                                ACTIVE
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Resource Pressure Grid */}
            <div className="grid grid-cols-1 gap-3">
                {renderPressureIndicator('Memory', resourceScores.memory || 100, pressureLevels.memory, <LuDatabase size={16} />)}
                {renderPressureIndicator('Scheduler', resourceScores.queue || 100, pressureLevels.queue, <LuCpu size={16} />)}
                {renderPressureIndicator('Network', resourceScores.telemetry || 100, pressureLevels.telemetry, <LuZap size={16} />)}
            </div>

            {/* Subsystem Heartbeats */}
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                        <LuClock size={14} />
                        Engine Pulse Synchronization
                    </h3>
                    <span className="text-[10px] font-mono text-white/30 tracking-tighter">MAX_DRIFT: 10s</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(heartbeats).map(([name, drift]) => {
                        const isStalled = Array.isArray(stalled) && stalled.some(s => s.name === name);
                        return (
                            <div 
                                key={name}
                                className={`p-2 rounded-lg border transition-all duration-300 flex flex-col gap-1 ${
                                    isStalled 
                                    ? 'bg-red-500/10 border-red-500/30' 
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center justify-between overflow-hidden">
                                    <span className="text-[8px] font-black uppercase text-white/60 truncate mr-1">{name.replace('_', ' ')}</span>
                                    {isStalled ? <LuCircleX className="text-red-500" size={10} /> : <LuCircleCheck className="text-emerald-500" size={10} />}
                                </div>
                                <div className="flex items-center justify-between font-mono">
                                    <span className={`text-[9px] font-bold ${isStalled ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {isStalled ? 'STALLED' : 'ALIVE'}
                                    </span>
                                    <span className="text-[8px] text-white/30">{drift}s</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Leak Warnings Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2 px-1">
                    <LuTriangleAlert size={14} className="text-yellow-400" />
                    Resource Leak & Stability Diagnostics
                </h3>
                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {(!warnings || warnings.length === 0) ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-8 flex flex-col items-center justify-center text-white/20 border border-dashed border-white/5 rounded-xl"
                            >
                                <LuShieldCheck size={32} className="mb-2 opacity-50 text-emerald-500/50" />
                                <p className="text-xs font-bold uppercase tracking-widest">No active leaks detected</p>
                            </motion.div>
                        ) : (
                            warnings.map((warning) => (
                                <motion.div
                                    key={warning.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`border rounded-xl p-4 relative overflow-hidden transition-all hover:translate-x-1 ${getSeverityColor(warning.severity)}`}
                                >
                                    <div className="flex items-start justify-between relative z-10">
                                        <div className="flex gap-3">
                                            <div className="mt-1">
                                                <LuTriangleAlert size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/10">{warning.subsystem}</span>
                                                    <span className="text-[10px] font-bold opacity-60">ID: {warning.id}</span>
                                                </div>
                                                <h4 className="text-sm font-bold mb-1">{warning.message}</h4>
                                                <p className="text-xs opacity-70 flex items-center gap-1 italic">
                                                    <LuChevronRight size={12} />
                                                    {warning.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <div className="text-[10px] font-black uppercase tracking-tighter mb-2">{warning.severity}</div>
                                            <div className="flex items-center gap-1 text-[10px] font-mono opacity-50 bg-black/20 px-2 py-1 rounded">
                                                <LuClock size={10} />
                                                {new Date(warning.timestamp * 1000).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    {warning.trend === 'INCREASING' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-30 animate-pulse" />
                                    )}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Passive Rules Disclaimer */}
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                <LuShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                <p className="text-[10px] leading-relaxed text-emerald-400/60 font-medium">
                    <strong className="text-emerald-400 uppercase tracking-tighter mr-1">Observability Policy:</strong> 
                    This engine is strictly passive. It monitors trends and heartbeats to provide diagnostics without 
                    interfering with kernel scheduling, process execution, or resource synchronization.
                </p>
            </div>
        </div>
    );
};

export default LeakDetectorPanel;
