import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuSearch, 
  LuArrowUpDown, 
  LuTrash2, 
  LuPlay, 
  LuPause, 
  LuClock, 
  LuCircleX, 
  LuCpu, 
  LuChevronLeft, 
  LuChevronRight,
  LuInfo,
  LuTerminal,
  LuGitFork,
  LuCornerDownRight,
  LuDatabase
} from 'react-icons/lu';
import { useProcess } from '../../context/KernelContext';
import ProcessStateBadge from './ProcessStateBadge';
import ProcessDetailModal from './ProcessDetailModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import { TableSkeleton } from '../ui/Skeleton';

const PCBTable = () => {
  const { processes, updateProcessState, deleteProcess, forkProcess, isLoading } = useProcess();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('pid');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Modal State
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const filteredProcesses = processes
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.pid.toString().includes(searchTerm))
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priority - a.priority;
      if (sortBy === 'state') return a.state.localeCompare(b.state);
      return a[sortBy] > b[sortBy] ? 1 : -1;
    });

  const totalPages = Math.ceil(filteredProcesses.length / rowsPerPage);
  const paginatedProcesses = filteredProcesses.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleDeleteClick = (e, process) => {
    e.stopPropagation();
    setProcessToDelete(process);
    setIsConfirmOpen(true);
  };

  const handleForkClick = (e, pid) => {
    e.stopPropagation();
    forkProcess(pid);
  };

  const handleRowClick = (process) => {
    setSelectedProcess(process);
    setIsDetailOpen(true);
  };

  return (
    <div className="glass-premium rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col h-full shadow-[0_0_50px_rgba(157,0,255,0.05)] relative group">
      <div className="absolute inset-0 scanline-overlay opacity-5 pointer-events-none" />
      
      {/* Table Header Controls */}
      <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex flex-col lg:flex-row gap-6 items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-border">
            <LuTerminal className="text-primary neon-text" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] font-orbitron">PCB_Allocation_Table</h3>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Realtime_Process_Descriptor_Monitor</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative group/search flex-1 lg:w-72">
            <LuSearch className="absolute left-4 top-3.5 text-slate-500 group-focus-within/search:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Query_Kernel_Space..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/40 focus:bg-primary/5 focus:ring-2 focus:ring-primary/10 transition-all font-mono-cyber tracking-wider"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="relative group/sort">
            <select 
              className="bg-white/[0.03] border border-white/10 rounded-2xl pl-5 pr-10 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest focus:outline-none focus:border-secondary/40 focus:bg-secondary/5 transition-all cursor-pointer hover:bg-white/[0.05] appearance-none font-orbitron"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="pid" className="bg-[#050816] text-slate-400">PID_INDEX</option>
              <option value="priority" className="bg-[#050816] text-slate-400">PRIORITY_RANK</option>
              <option value="state" className="bg-[#050816] text-slate-400">STATE_PHASE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-separate border-spacing-0 min-w-[900px]">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#0B1020]/90 backdrop-blur-xl">
              {[
                { label: 'PID', align: 'left' },
                { label: 'Identity_Descriptor', align: 'left' },
                { label: 'Kernel_State', align: 'center' },
                { label: 'Priority', align: 'center' },
                { label: 'Burst', align: 'center' },
                { label: 'Execution_Flux', align: 'center', width: 'w-40' },
                { label: 'Memory', align: 'center' },
                { label: 'Protocol_Actions', align: 'right' }
              ].map((head, i) => (
                <th key={i} className={`px-8 py-5 border-b border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-orbitron ${head.align === 'center' ? 'text-center' : head.align === 'right' ? 'text-right' : ''} ${head.width || ''}`}>
                  {head.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <AnimatePresence mode='popLayout'>
                {paginatedProcesses.map((process) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    whileHover={{ backgroundColor: 'rgba(157, 0, 255, 0.03)' }}
                    key={process.pid}
                    onClick={() => handleRowClick(process)}
                    className="group relative transition-all duration-300 cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${process.state === 'RUNNING' ? 'bg-success animate-pulse shadow-[0_0_8px_#00FF9D]' : 'bg-slate-700'}`} />
                        <span className="font-mono-cyber text-xs text-primary/80 font-bold group-hover:text-primary group-hover:scale-110 transition-all">#{process.pid}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          {process.parent_pid && <LuCornerDownRight size={12} className="text-primary/40 animate-pulse" />}
                          <span className="text-[13px] font-black text-white font-orbitron tracking-tight group-hover:translate-x-1 transition-transform duration-300">{process.name}</span>
                          {process.child_pids.length > 0 && (
                            <div className="px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20 flex items-center gap-1">
                                <LuGitFork size={8} className="text-secondary" />
                                <span className="text-secondary text-[8px] font-black uppercase tracking-tighter">FORKED: {process.child_pids.length}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono-cyber uppercase tracking-widest mt-1 opacity-60 group-hover:opacity-100 transition-opacity">CREATED: {process.creation_timestamp}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <ProcessStateBadge state={process.state} />
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full border text-[9px] font-black font-orbitron transition-all ${
                        process.priority > 7 ? 'text-error border-error/30 bg-error/5 shadow-[0_0_10px_rgba(255,77,109,0.1)]' : 
                        process.priority > 4 ? 'text-warning border-warning/30 bg-warning/5 shadow-[0_0_10px_rgba(255,200,87,0.1)]' : 
                        'text-success border-success/30 bg-success/5 shadow-[0_0_10px_rgba(0,255,157,0.1)]'
                      }`}>
                        LVL_{process.priority}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center font-mono-cyber text-xs text-slate-400">{process.burst_time}s</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex justify-between w-full text-[8px] font-black font-mono-cyber uppercase tracking-widest text-slate-500">
                            <span>REM: {process.burst_remaining}s</span>
                            <span>{Math.round((process.burst_remaining/process.burst_time)*100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                          <motion.div 
                            className={`h-full rounded-full ${process.state === 'RUNNING' ? 'bg-gradient-to-r from-success to-secondary shadow-[0_0_12px_rgba(0,255,157,0.6)]' : 'bg-primary/30'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(process.burst_remaining/process.burst_time) * 100}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1 group/mem">
                        <div className="flex items-center gap-1.5">
                            <LuDatabase size={10} className="text-secondary opacity-40 group-hover/mem:opacity-100 group-hover/mem:scale-110 transition-all" />
                            <span className="text-xs font-black text-white font-orbitron">{process.memory_required}MB</span>
                        </div>
                        {process.memory_blocks?.length > 0 && (
                          <div className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                            <span className="text-[8px] font-mono-cyber text-secondary opacity-60">
                                ADDR: 0x{process.memory_blocks[0].start_address.toString(16).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => handleForkClick(e, process.pid)}
                          className="p-2 bg-white/5 hover:bg-secondary/20 text-secondary border border-white/10 hover:border-secondary/30 rounded-xl transition-all hover:scale-110 active:scale-90 group/act"
                        >
                          <LuGitFork size={14} className="group-hover/act:rotate-12 transition-transform" />
                        </button>
                        
                        {process.state === 'READY' ? (
                          <button 
                            onClick={() => updateProcessState(process.pid, 'RUNNING')}
                            className="p-2 bg-white/5 hover:bg-success/20 text-success border border-white/10 hover:border-success/30 rounded-xl transition-all hover:scale-110 active:scale-90"
                          >
                            <LuPlay size={14} />
                          </button>
                        ) : process.state === 'RUNNING' ? (
                          <button 
                            onClick={() => updateProcessState(process.pid, 'WAITING')}
                            className="p-2 bg-white/5 hover:bg-warning/20 text-warning border border-white/10 hover:border-warning/30 rounded-xl transition-all hover:scale-110 active:scale-90"
                          >
                            <LuPause size={14} />
                          </button>
                        ) : process.state !== 'TERMINATED' && (
                          <button 
                            onClick={() => updateProcessState(process.pid, 'READY')}
                            className="p-2 bg-white/5 hover:bg-primary/20 text-primary border border-white/10 hover:border-primary/30 rounded-xl transition-all hover:scale-110 active:scale-90"
                          >
                            <LuClock size={14} />
                          </button>
                        )}

                        {process.state !== 'TERMINATED' && (
                          <button 
                            onClick={() => updateProcessState(process.pid, 'TERMINATED')}
                            className="p-2 bg-white/5 hover:bg-error/20 text-error border border-white/10 hover:border-error/30 rounded-xl transition-all hover:scale-110 active:scale-90"
                          >
                            <LuCircleX size={14} />
                          </button>
                        )}
                        
                        <div className="w-px h-6 bg-white/5 mx-1" />

                        <button 
                          onClick={(e) => handleDeleteClick(e, process)}
                          className="p-2 bg-white/5 hover:bg-error/20 text-slate-600 hover:text-error border border-white/10 hover:border-error/30 rounded-xl transition-all hover:scale-110 active:scale-90"
                        >
                          <LuTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
            {!isLoading && filteredProcesses.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-40 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 opacity-20 pointer-events-none" />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-8 max-w-sm mx-auto relative z-10"
                  >
                    <div className="relative">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.4, 1], 
                                opacity: [0.1, 0.3, 0.1],
                                rotate: [0, 90, 180, 270, 360]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-10 bg-primary rounded-full blur-[60px]"
                        />
                        <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center relative z-10 neon-border-secondary">
                            <LuCpu size={48} className="text-primary opacity-40 animate-pulse" />
                        </div>
                        <div className="absolute top-0 right-0 -mr-2 -mt-2 w-6 h-6 rounded-full bg-secondary shadow-[0_0_15px_#00D1FF] animate-bounce" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-xl font-black text-white font-orbitron uppercase tracking-[0.4em]">Kernel_Memory_Idle</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                            Zero_Active_PCB_States_Detected. 
                            <br/>Inject core process nodes to initiate hypervisor simulation.
                        </p>
                    </div>
                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  </motion.div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && filteredProcesses.length > 0 && (
        <div className="px-8 py-6 border-t border-white/5 bg-[#0B1020]/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-orbitron">
            Active_PCB_Index: {(currentPage - 1) * rowsPerPage + 1} — {Math.min(currentPage * rowsPerPage, filteredProcesses.length)} <span className="text-primary/50">/</span> {filteredProcesses.length} UNITS
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 disabled:opacity-10 transition-all text-slate-400 hover:text-primary active:scale-90"
            >
              <LuChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-[10px] font-black font-orbitron transition-all border ${
                    currentPage === i + 1 
                    ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(157,0,255,0.4)] scale-110' 
                    : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 disabled:opacity-10 transition-all text-slate-400 hover:text-primary active:scale-90"
            >
              <LuChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProcessDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        process={selectedProcess} 
      />
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => deleteProcess(processToDelete.pid)}
        title="Confirm PCB Purge"
        message={`Are you sure you want to permanently remove ${processToDelete?.name} (PID: ${processToDelete?.pid}) from the kernel memory? This action cannot be undone.`}
      />
    </div>
  );
};

export default PCBTable;
