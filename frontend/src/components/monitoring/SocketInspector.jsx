import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuActivity, LuSignal, LuZap, LuTriangleAlert, LuDatabase, LuUsers, LuClock } from 'react-icons/lu';
import { useKernel } from '../../context/KernelContext';
import clsx from 'clsx';

// Sub-components defined first to avoid ReferenceError
const MetricCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-slate-950 p-2 flex flex-col gap-1 hover:bg-slate-900 transition-colors">
    <div className="flex items-center justify-between">
      <span className="text-[9px] text-slate-500 uppercase tracking-tighter">{label}</span>
      <Icon className={clsx("w-3 h-3 opacity-50", color)} />
    </div>
    <div className={clsx("text-sm font-bold tracking-tight", color)}>{value}</div>
  </div>
);

const DiagnosticRow = ({ label, status }) => (
  <div className="flex items-center justify-between text-[9px]">
    <span className="text-slate-500">{label}</span>
    <span className={clsx(
      "font-bold",
      status === 'GOOD' || status === 'ACTIVE' ? "text-emerald-400" : "text-amber-400"
    )}>{status}</span>
  </div>
);

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const SocketInspector = () => {
  const { monitoringData } = useKernel();
  const socket = monitoringData?.socket || {};
  const { metrics = {}, health_score = 100, warnings = [], traffic = [] } = socket;

  const healthColor = useMemo(() => {
    if (health_score >= 90) return 'text-emerald-400';
    if (health_score >= 70) return 'text-yellow-400';
    if (health_score >= 40) return 'text-orange-500';
    return 'text-red-500';
  }, [health_score]);

  return (
    <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-md rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
      {/* Header / Health Score */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <LuSignal className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Live Socket Inspector</h3>
            <p className="text-[10px] text-slate-500">Passive Telemetry Stream v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={clsx("text-xl font-black", healthColor)}>
              {health_score}<span className="text-[10px] ml-0.5 opacity-50">%</span>
            </div>
            <div className="text-[9px] uppercase tracking-tighter text-slate-500">System Health</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className={clsx(
                "w-1.5 h-1.5 rounded-full animate-pulse", 
                health_score >= 70 ? "bg-emerald-500" : health_score >= 40 ? "bg-amber-500" : "bg-red-500"
              )} />
              <span className="text-[10px] text-slate-400 uppercase">
                {health_score >= 70 ? 'STABLE' : health_score >= 40 ? 'DEGRADED' : 'CRITICAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-px bg-slate-800 border-b border-slate-800">
        <MetricCard label="Emits/sec" value={metrics.emits_per_sec || 0} icon={LuZap} color="text-yellow-400" />
        <MetricCard label="Incoming/sec" value={metrics.incoming_per_sec || 0} icon={LuActivity} color="text-cyan-400" />
        <MetricCard 
          label="Latency" 
          value={`${metrics.latency_ms || 0}ms`} 
          icon={LuClock} 
          color={(metrics.latency_ms || 0) < 150 ? 'text-purple-400' : (metrics.latency_ms || 0) < 400 ? 'text-orange-400' : 'text-red-400'} 
        />
        <MetricCard label="Listeners" value={metrics.active_listeners || 0} icon={LuUsers} color="text-emerald-400" />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Traffic Logs */}
        <div className="flex-1 flex flex-col border-r border-slate-800 overflow-hidden">
          <div className="p-2 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest flex items-center gap-2">
              <LuDatabase className="w-3 h-3" /> Event Traffic History
            </span>
            <span className="text-[9px] text-slate-600">Max 50 entries</span>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-950 z-10">
                <tr className="text-[9px] text-slate-500 uppercase border-b border-slate-800">
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Event Name</th>
                  <th className="px-3 py-2 font-medium">Size</th>
                  <th className="px-3 py-2 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {Array.isArray(traffic) && [...traffic].sort((a, b) => (b.id || 0) - (a.id || 0)).map((entry) => (
                    <motion.tr 
                      key={entry.id || `${entry.timestamp}-${entry.event}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group border-b border-slate-900/50 hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="px-3 py-1.5">
                        <span className={clsx(
                          "px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold",
                          entry.type === 'OUTGOING' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                        )}>
                          {entry.type === 'OUTGOING' ? 'TX' : 'RX'}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-slate-300 truncate max-w-[200px]" title={entry.event}>
                        {entry.event.startsWith('kernel:') ? (
                          <div className="flex items-center gap-1">
                            <span className="text-indigo-500/50 font-bold">krnl:</span>
                            <span className="text-slate-200">{entry.event.split(':')[1]}</span>
                          </div>
                        ) : (
                          entry.event
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-slate-500 text-[9px]">
                        {formatSize(entry.size)}
                      </td>
                      <td className="px-3 py-1.5 text-slate-600 text-right text-[9px]">
                        {new Date(entry.timestamp * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {(!traffic || traffic.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-slate-600 italic">
                      Waiting for socket traffic...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warnings & Diagnostics Sidebar */}
        <div className="w-64 bg-slate-950/30 flex flex-col overflow-hidden">
          <div className="p-2 bg-slate-900/50 border-b border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest flex items-center gap-2">
              <LuTriangleAlert className="w-3 h-3 text-amber-500" /> Diagnostics
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Health Indicators */}
            <div className="space-y-2">
              <DiagnosticRow label="Payload Efficiency" status={(metrics.avg_payload_size || 0) < 20480 ? 'GOOD' : 'HEAVY'} />
              <DiagnosticRow label="Socket Congestion" status={(metrics.emits_per_sec || 0) < 30 ? 'NONE' : 'DETECTION'} />
              <DiagnosticRow label="Connection State" status="ACTIVE" />
            </div>

            <div className="h-px bg-slate-800 my-2" />

            {/* Warnings List */}
            <div className="space-y-2">
              <h4 className="text-[9px] uppercase text-slate-500 font-bold">Active Alerts</h4>
              <AnimatePresence>
                {warnings.map((warning, idx) => (
                  <motion.div
                    key={`${warning.type}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={clsx(
                      "p-2 rounded border text-[10px] flex flex-col gap-1",
                      warning.severity === 'CRITICAL' 
                        ? "bg-red-500/10 border-red-500/20 text-red-400" 
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{warning.type}</span>
                      <LuTriangleAlert className="w-3 h-3" />
                    </div>
                    <div className="text-[9px] opacity-80 leading-tight">
                      {warning.message}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {(!warnings || warnings.length === 0) && (
                <div className="py-4 text-center text-slate-700 text-[9px] italic border border-dashed border-slate-800 rounded">
                  No active warnings
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="p-3 bg-slate-900/50 border-t border-slate-800">
            <div className="flex justify-between text-[9px] text-slate-500 mb-1 uppercase tracking-tighter">
              <span>Total Data Transferred</span>
              <span className="text-indigo-400 font-bold">{formatSize(metrics.total_bytes_sent || 0)}</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-500" 
                animate={{ width: `${Math.min(100, (metrics.total_bytes_sent || 0) / (1024 * 1024 * 50) * 100)}%` }} // 50MB scale
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocketInspector;
