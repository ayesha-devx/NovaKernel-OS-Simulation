import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiShield, FiAlertTriangle } from 'react-icons/fi';

const DeadlockGraphVisualizer = ({ kernelState }) => {
  const resources = kernelState?.resources?.resources || {};
  const deadlock = kernelState?.deadlock || { is_deadlocked: false, detected_pids: [], resource_cycles: [] };
  const processes = Array.isArray(kernelState?.processes) ? kernelState.processes : Object.values(kernelState?.processes || {});
  const existingProcessPids = new Set(processes.map(p => p.pid));
  const isDeadlocked = deadlock.is_deadlocked;

  const nodes = [];
  const edges = [];

  const resourceList = Object.values(resources || {});

  // 1. Position Resource nodes in a larger outer circle
  resourceList.forEach((res, idx) => {
    const total = resourceList.length || 1;
    const angle = (idx / total) * 2 * Math.PI;
    nodes.push({
      id: res.id, name: res.name, type: 'resource',
      x: 350 + Math.cos(angle) * 200,
      y: 280 + Math.sin(angle) * 200,
    });
  });

  // 2. Position Process nodes in a smaller inner circle
  const pids = new Set();
  resourceList.forEach(res => {
    if (res.allocated_to && existingProcessPids.has(res.allocated_to)) pids.add(res.allocated_to);
    (res.waiting_pids || []).forEach(p => { if (existingProcessPids.has(Number(p))) pids.add(Number(p)); });
  });

  const pidList = Array.from(pids);
  pidList.forEach((pid, idx) => {
    const total = pidList.length || 1;
    const angle = (idx / total) * 2 * Math.PI + Math.PI / 4;
    nodes.push({
      id: `P${pid}`, name: `PID ${pid}`, type: 'process',
      x: 350 + Math.cos(angle) * 100,
      y: 280 + Math.sin(angle) * 100,
      pid,
    });
  });

  // 3. Build edges
  resourceList.forEach(res => {
    if (res.allocated_to && existingProcessPids.has(res.allocated_to)) {
      edges.push({ from: res.id, to: `P${res.allocated_to}`, type: 'allocation' });
    }
    Array.from(new Set(res.waiting_pids || [])).forEach(pid => {
      if (existingProcessPids.has(Number(pid))) {
        edges.push({ from: `P${pid}`, to: res.id, type: 'request' });
      }
    });
  });

  const getEdgeStyle = (edge) => {
    const isCycle = deadlock.resource_cycles?.some(cycle =>
      cycle.includes(edge.from) && cycle.includes(edge.to)
    );
    if (isCycle) return 'stroke-red-500 stroke-[4] animate-pulse drop-shadow-[0_0_8px_#ef4444]';
    return edge.type === 'allocation' ? 'stroke-emerald-500/40' : 'stroke-amber-500/40';
  };

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl relative">
      <div className="p-4 sm:px-6 sm:py-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDeadlocked ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-primary/20 text-primary'}`}>
            <FiShield size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Resource Graph</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
              Status: <span className={isDeadlocked ? 'text-red-500' : 'text-emerald-500'}>{isDeadlocked ? 'CIRCULAR WAIT' : 'NOMINAL'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-grow relative flex items-center justify-center p-4">
        <svg viewBox="0 0 700 560" className="w-full h-full">
           <defs>
             <marker id="v-arrow-emerald" markerWidth="10" markerHeight="10" refX="25" refY="5" orient="auto">
               <path d="M0,0 L0,10 L10,5 Z" fill="#10b981" />
             </marker>
             <marker id="v-arrow-amber" markerWidth="10" markerHeight="10" refX="25" refY="5" orient="auto">
               <path d="M0,0 L0,10 L10,5 Z" fill="#f59e0b" />
             </marker>
             <marker id="v-arrow-red" markerWidth="10" markerHeight="10" refX="25" refY="5" orient="auto">
               <path d="M0,0 L0,10 L10,5 Z" fill="#ef4444" />
             </marker>
           </defs>

           {edges.map((edge, i) => {
             const fromNode = nodes.find(n => n.id === edge.from);
             const toNode   = nodes.find(n => n.id === edge.to);
             if (!fromNode || !toNode) return null;
             const isCycle = deadlock.resource_cycles?.some(cycle =>
               cycle.includes(edge.from) && cycle.includes(edge.to)
             );
             return (
               <motion.line
                 key={`${edge.from}-${edge.to}-${i}`}
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
                 className={getEdgeStyle(edge)}
                 markerEnd={`url(#v-arrow-${isCycle ? 'red' : (edge.type === 'allocation' ? 'emerald' : 'amber')})`}
                 strokeDasharray={edge.type === 'request' ? '5,5' : '0'}
               />
             );
           })}

           {nodes.map((node) => (
             <motion.g key={node.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="cursor-pointer">
               <circle
                 cx={node.x} cy={node.y} r={18}
                 className={`transition-all duration-500 ${
                   node.type === 'process' 
                     ? (isDeadlocked && deadlock.detected_pids.includes(node.pid) ? 'fill-red-500/20 stroke-red-500' : 'fill-emerald-500/10 stroke-emerald-500/40')
                     : 'fill-amber-500/10 stroke-amber-500/40'
                 }`}
                 strokeWidth={2}
               />
               <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle"
                 className="fill-white text-[8px] font-black pointer-events-none">
                 {node.id}
               </text>
             </motion.g>
           ))}
        </svg>

        {isDeadlocked && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
              <FiAlertTriangle className="text-red-500 text-4xl mx-auto mb-2 animate-bounce" />
              <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">Deadlock Active</p>
           </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-2 scale-90 sm:scale-100 origin-bottom z-10 pointer-events-none">
         <div className="flex gap-4">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Allocation</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Request</span>
            </div>
         </div>
         <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">WFG Visualization Engine</span>
      </div>
    </div>
  );
};

export default DeadlockGraphVisualizer;
