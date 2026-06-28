import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuNetwork, LuActivity, LuChevronRight, LuChevronDown } from 'react-icons/lu';
import { useProcess } from '../../context/KernelContext';
import ProcessStateBadge from '../process/ProcessStateBadge';

const TreeNode = ({ node, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col relative">
      <div className="flex items-center gap-4 relative group">
        {/* Connection Line */}
        {depth > 0 && (
          <div className="absolute -left-6 top-1/2 w-6 h-[2px] bg-gradient-to-r from-primary/30 to-primary/60 group-hover:from-secondary group-hover:to-primary transition-all duration-500 shadow-[0_0_8px_rgba(157,0,255,0.4)]"></div>
        )}
        
        {/* Node Card */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02, x: 5 }}
          className={`relative flex items-center gap-5 p-4 rounded-2xl border transition-all duration-500 mb-3 min-w-[280px] overflow-hidden group/card shadow-[0_0_20px_rgba(0,0,0,0.3)] ${
            depth === 0 
            ? 'bg-primary/10 border-primary/40 shadow-[0_0_30px_rgba(157,0,255,0.1)]' 
            : 'bg-white/[0.03] border-white/10 hover:border-secondary/40'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
              depth === 0 
              ? 'bg-primary/20 text-primary neon-border' 
              : 'bg-white/5 text-slate-500 group-hover/card:text-secondary group-hover/card:bg-secondary/10'
          }`}>
            <LuActivity size={18} className={depth === 0 ? "neon-text" : ""} />
          </div>
          
          <div className="flex-1 relative">
            <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-black text-white font-orbitron tracking-tight truncate max-w-[120px] uppercase">{node.name}</span>
                <span className="text-[10px] font-mono-cyber text-primary font-bold drop-shadow-[0_0_5px_rgba(157,0,255,0.5)]">PID_{node.pid}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
                <ProcessStateBadge state={node.state} />
                <div className="h-1 w-1 rounded-full bg-slate-700" />
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest font-mono-cyber">L-{depth}</span>
            </div>
          </div>

          {hasChildren && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-all text-slate-500 hover:text-white"
            >
              {isExpanded ? <LuChevronDown size={16} /> : <LuChevronRight size={16} />}
            </button>
          )}
          
          {/* Animated Edge Glow */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover/card:scale-y-100 transition-transform duration-500 rounded-full" />
        </motion.div>
      </div>

      {/* Children Container */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div 
            initial={{ opacity: 0, height: 0, x: -10 }}
            animate={{ opacity: 1, height: 'auto', x: 0 }}
            exit={{ opacity: 0, height: 0, x: -10 }}
            className="ml-8 border-l-2 border-white/5 pl-6 relative"
          >
            {node.children.map((child) => (
              <TreeNode key={child.pid} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProcessTreePanel = () => {
  const { treeData } = useProcess();

  return (
    <div className="glass-premium rounded-3xl sm:rounded-[2.5rem] border border-white/10 flex flex-col h-full overflow-hidden shadow-[0_0_50px_rgba(157,0,255,0.05)] relative group">
      <div className="absolute inset-0 scanline-overlay opacity-10 pointer-events-none" />
      
      <div className="px-4 sm:px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center neon-border-secondary">
            <LuNetwork className="text-secondary neon-text-cyan" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.4em] font-orbitron">Family_Tree_Flux</h3>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Realtime_Fork_Hierarchy_Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-1.5 glass-premium bg-secondary/10 rounded-full border border-secondary/30">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_12px_rgba(0,209,255,1)] indicator-pulse" />
            <span className="text-[9px] text-secondary font-black tracking-[0.2em] font-orbitron uppercase">Graph_Live</span>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-8 overflow-auto custom-scrollbar bg-grid-pattern relative z-10">
        {treeData.length > 0 ? (
          <div className="space-y-6">
            {treeData.map((root) => (
              <TreeNode key={root.pid} node={root} />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 relative">
            <div className="relative mb-8">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute inset-0 bg-secondary rounded-full blur-3xl"
                />
                <LuNetwork size={64} className="text-secondary/20 relative z-10 animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.4em] font-orbitron mb-2">Zero_Graph_States</h4>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest max-w-[200px] leading-loose">
                Kernel process memory is currently flat. Perform a fork() action to visualize hierarchy.
            </p>
          </div>
        )}
      </div>
      
      {/* Cinematic Background Element */}
      <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-1000">
        <LuNetwork size={240} className="text-primary rotate-12" />
      </div>
    </div>
  );
};

export default ProcessTreePanel;
