import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useKernel } from '../context/KernelContext';
import { 
  LuBrain, 
  LuSend, 
  LuCpu, 
  LuDatabase, 
  LuActivity, 
  LuZap, 
  LuBookOpen, 
  LuShieldAlert,
  LuSparkles,
  LuMessageSquare,
  LuChevronRight,
  LuTerminal
} from 'react-icons/lu';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const AIKernelAssistant = () => {
  const { askAI, aiIntelligence, aiMessages, addMessage, isConnected } = useKernel();
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || isTyping) return;

    const userQuery = query.trim();
    setQuery('');
    addMessage('user', userQuery);
    setIsTyping(true);

    try {
      await askAI(userQuery);
      // context automatically updates aiMessages now
    } catch (err) {
      // error handled in context
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    { label: "Explain RR", query: "Explain Round Robin scheduling" },
    { label: "Analyze Memory", query: "Analyze current memory fragmentation" },
    { label: "Why CPU high?", query: "Why is CPU usage high?" },
    { label: "Explain Deadlock", query: "Explain current deadlock state" },
    { label: "Summarize System", query: "Summarize system health" },
  ];

  return (
    <DashboardLayout title="AI KERNEL ASSISTANT">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Cinematic Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-magenta/5 to-transparent rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative glass-premium rounded-[2.5rem] p-10 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(157,0,255,0.05)]">
             <div className="absolute inset-0 scanline-overlay opacity-20" />
             <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 blur-[120px] -mr-40 -mt-40" />
             
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
               <div className="space-y-4">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border shadow-[0_0_20px_rgba(157,0,255,0.2)]">
                        <LuBrain className="text-primary neon-text" size={32} />
                    </div>
                    <div>
                      <h1 className="text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">AI KERNEL ASSISTANT</h1>
                      <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_#00FF9D] indicator-pulse" />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">Neural Interface & Heuristic Analysis Link v2.0</p>
                      </div>
                    </div>
                 </div>
                 <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-19">
                   Direct neural link to the NovaOS intelligence core. Leveraging advanced LLM heuristics to provide real-time system diagnostics and optimization recommendations.
                 </p>
               </div>
               
               <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                 <div className="flex items-center gap-3 px-6 py-2.5 bg-black/40 rounded-xl border border-white/5 font-orbitron">
                    <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_12px_#00FF9D]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                       NEURAL_LINK: <span className="text-success">SYNCHRONIZED</span>
                    </span>
                 </div>
               </div>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
        
        {/* Chat Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 glass bg-slate-950/50 rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden relative shadow-2xl">
            {/* Header */}
            <div className="h-14 bg-white/5 border-b border-white/5 flex items-center px-8 justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="relative">
                    <LuBrain className="text-primary animate-pulse" size={20} />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                  <span className="text-xs font-black text-white/60 uppercase tracking-[0.2em]">Neural_Kernel_Copilot_v1.2</span>
               </div>
               <div className="flex items-center gap-4">
                  {aiMessages.some(m => m.content.includes("Local Mode")) && (
                    <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                       <LuShieldAlert size={12} className="text-amber-400 animate-pulse" />
                       <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Quota Limited</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{isConnected ? 'Uplink Stable' : 'Uplink Lost'}</span>
                  </div>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex flex-col gap-6">
              <AnimatePresence initial={false}>
                {aiMessages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-5 rounded-3xl ${
                      msg.role === 'user' 
                        ? 'bg-primary/20 border border-primary/20 text-white rounded-tr-none shadow-lg' 
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                    }`}>
                      <div className="flex items-center gap-2 mb-2 opacity-40">
                        {msg.role === 'user' ? <LuMessageSquare size={12} /> : <LuSparkles size={12} />}
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {msg.role === 'user' ? 'Kernel_Operator' : 'AI_Assistant'}
                        </span>
                      </div>
                      <div className="text-[13px] leading-relaxed font-medium markdown-content prose prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white/5 border-t border-white/5 shrink-0">
               <form onSubmit={handleSend} className="relative">
                  <input 
                    ref={inputRef}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-24 text-[13px] text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10 font-medium"
                    placeholder="Ask NovaOS anything... (e.g. 'Explain current deadlock risk')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isTyping}
                  />
                  <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
                    <button 
                      type="submit"
                      disabled={isTyping || !query.trim()}
                      className="h-full px-5 bg-primary text-white rounded-xl hover:bg-primary/80 transition-all disabled:opacity-30 flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                      <LuSend size={16} />
                      <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Dispatch</span>
                    </button>
                  </div>
               </form>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-3">
             {quickPrompts.map((p, i) => (
               <button 
                 key={i}
                 onClick={() => { setQuery(p.query); inputRef.current?.focus(); }}
                 className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
               >
                 {p.label}
               </button>
             ))}
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           
           {/* AI Narrator */}
           <div className="glass bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                   <LuActivity size={18} />
                 </div>
                 <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">System Health Narrator</h3>
              </div>
              <div className="relative">
                 <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-transparent opacity-20" />
                 <p className="text-[13px] leading-relaxed text-indigo-100 font-medium italic">
                   "{aiIntelligence.summary || "Synthesizing kernel vectors..."}"
                 </p>
                 <div className="mt-4 flex items-center gap-2">
                   <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: `${aiIntelligence.state?.health_score || 0}%` }}
                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                      />
                   </div>
                   <span className="text-[10px] font-black text-indigo-400">{aiIntelligence.state?.health_score || 0}%</span>
                 </div>
              </div>
           </div>

           {/* Optimization Engine */}
           <div className="flex-1 glass bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                   <LuZap size={18} />
                 </div>
                 <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">Live Recommendations</h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                 {aiIntelligence.recommendations && aiIntelligence.recommendations.length > 0 ? (
                   aiIntelligence.recommendations.map((rec, idx) => (
                     <motion.div 
                       key={idx}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       className="p-5 bg-white/5 border border-white/10 rounded-2xl group hover:border-amber-500/30 transition-all cursor-default"
                     >
                        <div className="flex items-center justify-between mb-2">
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                             rec.severity === 'CRITICAL' ? 'text-red-400 border-red-400/20 bg-red-400/5' :
                             rec.severity === 'WARNING' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                             rec.severity === 'SUCCESS' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                             'text-blue-400 border-blue-400/20 bg-blue-400/5'
                           }`}>
                             {rec.type}
                           </span>
                           <span className="text-[10px] font-bold text-white/20">NOW</span>
                        </div>
                        <h4 className="text-[11px] font-black text-white mb-1 uppercase tracking-tight">{rec.title}</h4>
                        <p className="text-[11px] text-white/50 leading-relaxed mb-3">
                          {rec.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                           <span>Action: {rec.action}</span>
                           <LuChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                     </motion.div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                      <LuZap size={32} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Optimizations Found</p>
                   </div>
                 )}
              </div>
           </div>

           {/* Viva Mode Alert */}
           <div className="glass bg-indigo-950/30 border border-indigo-500/20 rounded-[2.5rem] p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 shrink-0">
                 <LuBookOpen size={24} />
              </div>
              <div>
                 <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Viva Assistant Active</h4>
                 <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest leading-relaxed">
                   Currently analyzing kernel state for educational demonstrations.
                 </p>
              </div>
           </div>

        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default AIKernelAssistant;
