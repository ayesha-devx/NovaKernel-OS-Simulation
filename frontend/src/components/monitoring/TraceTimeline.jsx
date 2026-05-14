import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuActivity, 
  LuFilter, 
  LuClock, 
  LuInfo, 
  LuTriangleAlert, 
  LuCircleCheck, 
  LuCircleX, 
  LuZap, 
  LuPause, 
  LuPlay,
  LuChevronRight,
  LuDatabase,
  LuCpu,
  LuHardDrive,
  LuBox,
  LuShield,
  LuMessageSquare,
  LuSettings
} from 'react-icons/lu';
import { useKernel } from '../../context/KernelContext';

const SUBSYSTEM_ICONS = {
  PROCESS: <LuCpu size={14} />,
  MEMORY: <LuDatabase size={14} />,
  DISK: <LuHardDrive size={14} />,
  DEADLOCK: <LuShield size={14} className="text-rose-400" />,
  SNAPSHOT: <LuBox size={14} />,
  AI: <LuMessageSquare size={14} />,
  HARDWARE: <LuSettings size={14} />,
  SYSTEM: <LuActivity size={14} />,
  DEFAULT: <LuZap size={14} />
};

const SEVERITY_COLORS = {
  INFO: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  SUCCESS: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  WARNING: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  ERROR: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  CRITICAL: 'text-rose-500 border-rose-600/50 bg-rose-600/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
};

const TraceTimeline = () => {
  const { monitoringData, socket, clearTraceHistory } = useKernel();
  const { trace = { events: [], warnings: [], health: {} } } = monitoringData;
  
  const [isPaused, setIsPaused] = useState(false);
  const [filterSubsystem, setFilterSubsystem] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Local buffer to handle "Pause" functionality
  const [displayEvents, setDisplayEvents] = useState([]);
  
  useEffect(() => {
    if (!isPaused) {
      setDisplayEvents(trace.events);
    }
  }, [trace.events, isPaused]);

  const filteredEvents = useMemo(() => {
    return displayEvents.filter(event => {
      const matchSub = filterSubsystem === 'ALL' || event.subsystem === filterSubsystem;
      const matchSev = filterSeverity === 'ALL' || event.severity === filterSeverity;
      return matchSub && matchSev;
    });
  }, [displayEvents, filterSubsystem, filterSeverity]);

  const subsystems = useMemo(() => {
    const subs = new Set(trace.events.map(e => e.subsystem));
    return ['ALL', ...Array.from(subs)];
  }, [trace.events]);

  const formatTime = (ts) => {
    const date = new Date(ts * 1000);
    return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + date.getMilliseconds().toString().padStart(3, '0');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden">
      
      {/* Header Controls */}
      <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/20 text-primary rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <LuActivity size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              Event Trace <span className="text-primary">Timeline</span>
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${trace.health?.status === 'STABLE' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                Live Feed • {trace.health?.event_rate || 0} EPS • {trace.health?.status || 'STABLE'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Subsystem Filter */}
          <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            <div className="px-2 text-slate-500"><LuFilter size={14} /></div>
            <select 
              value={filterSubsystem}
              onChange={(e) => setFilterSubsystem(e.target.value)}
              className="bg-transparent text-[10px] font-bold text-slate-300 uppercase outline-none pr-2 cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
            >
              {subsystems.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            <select 
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-[10px] font-bold text-slate-300 uppercase outline-none px-2 cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
            >
              <option value="ALL" className="bg-slate-900 text-white">ALL SEVERITIES</option>
              <option value="INFO" className="bg-slate-900 text-white">INFO</option>
              <option value="SUCCESS" className="bg-slate-900 text-white">SUCCESS</option>
              <option value="WARNING" className="bg-slate-900 text-white">WARNING</option>
              <option value="ERROR" className="bg-slate-900 text-white">ERROR</option>
              <option value="CRITICAL" className="bg-slate-900 text-white">CRITICAL</option>
            </select>
          </div>

          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-xl border transition-all duration-300 ${isPaused ? 'bg-amber-400 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-slate-800/40 border-white/10 text-slate-400 hover:bg-white hover:text-black hover:border-white'}`}
          >
            {isPaused ? <LuPlay size={16} /> : <LuPause size={16} />}
          </button>
          
          <button 
            onClick={() => clearTraceHistory()}
            className="p-2 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-black hover:border-rose-500 transition-all duration-300 shadow-none hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]"
            title="Clear Trace"
          >
            <LuCircleX size={16} />
          </button>
        </div>
      </div>

      {/* Warnings Bar (if any) */}
      <AnimatePresence>
        {trace.warnings?.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2 overflow-hidden"
          >
            {trace.warnings.slice(0, 1).map((w, idx) => (
              <div key={idx} className="flex items-center gap-3 text-rose-400 animate-pulse">
                <LuTriangleAlert size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{w.message}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Timeline Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-3 custom-scrollbar">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
            <LuActivity size={48} className="animate-pulse" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Awaiting Kernel Events...</p>
          </div>
        ) : (
          filteredEvents.map((event, idx) => (
            <motion.div
              layout
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              key={event.id}
              onClick={() => setSelectedEvent(event === selectedEvent ? null : event)}
              className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden
                ${selectedEvent === event ? 'bg-white/[0.05] border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'}
              `}
            >
              {/* Severity Side Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${SEVERITY_COLORS[event.severity].split(' ')[1]}`} />

              {/* Subsystem Icon */}
              <div className={`mt-1 p-2 rounded-lg border flex-shrink-0 ${SEVERITY_COLORS[event.severity]}`}>
                {SUBSYSTEM_ICONS[event.subsystem] || SUBSYSTEM_ICONS.DEFAULT}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest truncate">{event.title}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-tighter ${SEVERITY_COLORS[event.severity]}`}>
                      {event.subsystem}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 font-bold">{formatTime(event.timestamp)}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  {event.description}
                </p>

                {/* Metadata Drill-down */}
                <AnimatePresence>
                  {selectedEvent === event && Object.keys(event.metadata || {}).length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[9px] overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(event.metadata).map(([key, val]) => (
                          <div key={key} className="flex flex-col gap-0.5">
                            <span className="text-slate-600 uppercase font-black tracking-tighter">{key}</span>
                            <span className="text-primary truncate">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Detail Indicator */}
              <div className={`mt-1 text-slate-700 group-hover:text-slate-500 transition-colors ${selectedEvent === event ? 'rotate-90 text-primary' : ''}`}>
                <LuChevronRight size={16} />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_#3b82f6]" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Buffer: {trace.events.length}/500</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Listeners: 1</span>
          </div>
        </div>
        <span className="text-[9px] font-mono text-slate-600">ID: {monitoringData.trace?.pulse_id || '---'}</span>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default TraceTimeline;
