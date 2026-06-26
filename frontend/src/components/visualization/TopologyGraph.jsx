import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShare2, FiMaximize, FiMinimize, FiTarget, FiInfo } from 'react-icons/fi';

const TopologyGraph = ({ kernelState }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const processes = useMemo(() => {
    return Array.isArray(kernelState?.processes)
      ? kernelState.processes
      : Object.values(kernelState?.processes || {});
  }, [kernelState?.processes]);

  // 1. Build the Tree Structure
  const treeData = useMemo(() => {
    const nodes = {};
    const roots = [];

    processes.forEach(p => {
      nodes[p.pid] = { ...p, children: [] };
    });

    processes.forEach(p => {
      if (p.parent_pid && nodes[p.parent_pid]) {
        nodes[p.parent_pid].children.push(nodes[p.pid]);
      } else {
        roots.push(nodes[p.pid]);
      }
    });

    return roots;
  }, [processes]);

  // 2. Simple Tree Layout Calculator
  const layout = useMemo(() => {
    const coords = [];
    const connections = [];
    let levelWidths = {};

    const traverse = (node, depth, xOffset) => {
      levelWidths[depth] = (levelWidths[depth] || 0) + 1;
      const x = (levelWidths[depth] - 1 + xOffset) * 120 - (treeData.length * 60);
      const y = depth * 100;
      
      coords.push({ pid: node.pid, name: node.name, state: node.state, color: node.status_color, x, y });
      
      node.children.forEach((child, idx) => {
        connections.push({ from: { x, y }, to: { x: (levelWidths[depth+1] || 0) * 120 - (treeData.length * 60), y: (depth + 1) * 100 } });
        traverse(child, depth + 1, xOffset);
      });
    };

    treeData.forEach((root, idx) => traverse(root, 0, idx * 2));
    return { coords, connections };
  }, [treeData]);

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl relative">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
            <FiShare2 size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Process Topology</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">Hierarchy &amp; Lineage Map</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 transition-all"><FiMinimize size={14}/></button>
            <button onClick={() => setZoom(1)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 transition-all"><FiTarget size={14}/></button>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 transition-all"><FiMaximize size={14}/></button>
          </div>
        </div>
      </div>

      {/* ── Graph Canvas ────────────────────────────────────────────────── */}
      <div className="flex-grow relative cursor-grab active:cursor-grabbing overflow-hidden">
        <svg 
          viewBox="0 0 800 600" 
          className="w-full h-full"
          style={{ transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`, transition: 'transform 0.1s ease-out' }}
        >
          {/* Grid Background */}
          <defs>
            <pattern id="topology-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="2000" height="2000" fill="url(#topology-grid)" x="-500" y="-500" />

          {/* Connections (Lines) */}
          <g>
            {layout.connections.map((conn, i) => (
              <motion.path
                key={i}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                d={`M ${conn.from.x + 400} ${conn.from.y + 100} L ${conn.to.x + 400} ${conn.to.y + 100}`}
                className="stroke-white/10 stroke-[2] fill-none"
                strokeDasharray="4,4"
              />
            ))}
          </g>

          {/* Nodes (Processes) */}
          <g>
            {layout.coords.map((node) => (
              <motion.g
                key={node.pid}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                layout
                className="cursor-pointer group"
              >
                {/* Connection point dot */}
                <circle cx={node.x + 400} cy={node.y + 100} r={40} className="fill-black/60 stroke-white/10 stroke-[2] group-hover:stroke-primary transition-colors" />
                <circle 
                  cx={node.x + 400} cy={node.y + 100} r={32} 
                  className={`transition-all duration-500 ${node.state === 'RUNNING' ? 'fill-emerald-500/20 stroke-emerald-500' : 'fill-white/5 stroke-white/20'}`}
                  strokeWidth={2}
                />
                
                <text x={node.x + 400} y={node.y + 98} textAnchor="middle" className="fill-white text-[10px] font-black pointer-events-none uppercase">
                   P{node.pid}
                </text>
                <text x={node.x + 400} y={node.y + 110} textAnchor="middle" className="fill-white/30 text-[7px] font-bold pointer-events-none uppercase tracking-widest">
                   {node.name.slice(0, 10)}
                </text>

                {/* State Glow */}
                {node.state === 'RUNNING' && (
                  <circle 
                    cx={node.x + 400} cy={node.y + 100} r={35} 
                    className="fill-none stroke-emerald-500/40 stroke-[4] animate-pulse" 
                  />
                )}
              </motion.g>
            ))}
          </g>
        </svg>

        {/* Info Legend */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 scale-90 sm:scale-100 origin-bottom-right z-10">
           <div className="glass border border-white/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] shrink-0" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Active Thread</span>
           </div>
           <div className="glass border border-white/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Idle Process</span>
           </div>
        </div>
      </div>

      {/* ── Interaction Hint ───────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-2 text-white/20 scale-90 sm:scale-100 origin-bottom-left z-10 pointer-events-none">
         <FiInfo size={14} className="shrink-0"/>
         <span className="text-[8px] font-black uppercase tracking-[0.2em]">Pinch to Zoom • Drag to Pan Topology</span>
      </div>
    </div>
  );
};

export default TopologyGraph;
