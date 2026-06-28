import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoN from '../../assets/logo-n.png';
import { 
  LuBell, 
  LuUser, 
  LuWifi, 
  LuWifiOff, 
  LuClock, 
  LuChevronDown,
  LuTerminal,
  LuActivity,
  LuLayoutDashboard,
  LuLayers,
  LuDatabase,
  LuFolderTree,
  LuHardDrive,
  LuShieldAlert,
  LuBot,
  LuSettings,
  LuRotateCcw,
  LuTrash2,
  LuShieldCheck,
  LuCircuitBoard,
  LuSlidersHorizontal,
  LuTrendingUp,
  LuLock,
  LuBrain,
  LuTimer,
  LuMenu,
  LuX
} from 'react-icons/lu';
import { toast } from 'react-toastify';
import { useKernel } from '../../context/KernelContext';

const Navbar = ({ onToggleSidebar, isMobileSidebarOpen }) => {
  const navigate = useNavigate();
  const { logs, isConnected, kernelState, clearLogs } = useKernel();
  const [time, setTime] = useState(new Date());
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCommands, setFilteredCommands] = useState([]);
  const inputRef = useRef(null);

  // Command definitions
  const commands = [
    { id: 'nav-overview', label: 'Go to Nova Overview', category: 'Navigation', icon: <LuShieldCheck size={14}/>, action: () => navigate('/kernel-overview') },
    { id: 'nav-scheduler', label: 'Open CPU Scheduler', category: 'Navigation', icon: <LuTimer size={14}/>, action: () => navigate('/scheduler') },
    { id: 'nav-memory', label: 'Monitor Memory Management', category: 'Navigation', icon: <LuDatabase size={14}/>, action: () => navigate('/memory') },
    { id: 'nav-fs', label: 'Explore File System', category: 'Navigation', icon: <LuFolderTree size={14}/>, action: () => navigate('/file-system') },
    { id: 'nav-hardware', label: 'Open Hardware HAL', category: 'Navigation', icon: <LuCircuitBoard size={14}/>, action: () => navigate('/hardware') },
    { id: 'nav-disk', label: 'Disk Scheduling Dashboard', category: 'Navigation', icon: <LuHardDrive size={14}/>, action: () => navigate('/disk-scheduling') },
    { id: 'nav-ai', label: 'Talk to AI Assistant', category: 'Navigation', icon: <LuBrain size={14}/>, action: () => navigate('/ai-assistant') },
    { id: 'nav-deadlock', label: 'Deadlock Detection', category: 'Navigation', icon: <LuLock size={14}/>, action: () => navigate('/deadlock') },
    { id: 'nav-analytics', label: 'Open Analytics Dashboard', category: 'Navigation', icon: <LuTrendingUp size={14}/>, action: () => navigate('/analytics') },
    { id: 'nav-developer', label: 'Open Developer Console', category: 'Navigation', icon: <LuSlidersHorizontal size={14}/>, action: () => navigate('/developer-console') },
    { id: 'action-clear-logs', label: 'Clear System Logs', category: 'System Action', icon: <LuTrash2 size={14}/>, action: async () => { 
      try {
        await clearLogs();
        toast.success('Kernel log buffer purged successfully.'); 
      } catch (e) {
        toast.error('Failed to purge kernel logs.');
      }
    } },
    { id: 'action-restart', label: 'Soft Reboot Kernel', category: 'System Action', icon: <LuRotateCcw size={14}/>, action: () => { window.location.href = '/boot'; } },
    { id: 'nav-settings', label: 'System Settings', category: 'Navigation', icon: <LuSettings size={14}/>, action: () => navigate('/settings') },
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setSearchQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCommands([]);
      return;
    }
    const filtered = commands.filter(cmd => 
      cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCommands(filtered);
  }, [searchQuery]);

  const executeCommand = (cmd) => {
    cmd.action();
    setSearchQuery('');
    setIsSearchFocused(false);
    inputRef.current?.blur();
  };

  const criticalCount = logs.filter(l => l.severity === 'ERROR' || l.severity === 'WARNING').length;
  const hasNewAlerts = criticalCount > lastSeenCount;

  const handleNotificationClick = () => {
    setLastSeenCount(criticalCount);
    toast.info(`System Analysis: ${criticalCount} critical events identified.`, { 
      icon: criticalCount > 0 ? '⚠️' : '✅',
      theme: 'dark'
    });
  };

  const cpuLoad = Math.round(kernelState?.metrics?.cpu_utilization || 0);
  const ramLoad = Math.round(kernelState?.metrics?.ram_pressure || 0);

  return (
    <nav className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 transition-all duration-500">
      {/* Background with cinematic effects */}
      <div className="absolute inset-x-4 top-2 bottom-2 glass-nav rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 scanline-overlay opacity-10" />
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-primary/5 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-secondary/5 to-transparent" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-between gap-6">
        {/* Left Section: Branding & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Hamburger Menu Toggle for Mobile */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onToggleSidebar}
            className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all mr-1.5 flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileSidebarOpen ? <LuX size={16} /> : <LuMenu size={16} />}
          </motion.button>

          <motion.div 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-full overflow-hidden" 
            onClick={() => navigate('/kernel-overview')}
          >
            <img src={logoN} alt="NovaOS Logo" className="w-full h-full object-cover scale-100 mix-blend-screen" />
          </motion.div>
          
          <div className="flex flex-col -ml-[6px]">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black tracking-tighter uppercase font-orbitron neon-gradient-text">
                NovaOS
              </h1>
              <div className="px-2 py-0.5 rounded-md text-[8px] font-black bg-primary/20 text-primary border border-primary/40 tracking-[0.2em] shadow-[0_0_10px_rgba(157,0,255,0.2)]">
                SYS_V1.0
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_#00FF9D]" />
              <span className="text-[9px] font-black font-mono-cyber text-white/30 tracking-[0.3em] uppercase">
                KERNEL OPERATIONS PANEL
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Advanced Search Terminal */}
        <div className="hidden lg:flex items-center flex-1 max-w-2xl relative px-4">
          <div className="relative w-full group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-xl blur-md transition duration-500 opacity-100`} />
            <div className={`relative flex items-center bg-black/80 border-2 transition-all duration-300 rounded-xl border-primary/60 shadow-[0_0_25px_rgba(157,0,255,0.2)]`}>
              <div className={`pl-4 flex items-center gap-2 transition-colors duration-300 text-primary`}>
                <LuTerminal size={14} />
                <span className="text-[10px] font-bold font-mono-cyber opacity-40">KRNL_CMD:</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="EXECUTE_PROTOCOL..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredCommands.length > 0) {
                    executeCommand(filteredCommands[0]);
                  }
                }}
                className="w-full bg-transparent py-2.5 px-3 text-[10px] font-black font-mono-cyber text-white placeholder:text-white/10 focus:outline-none uppercase tracking-widest"
              />
              <div className="pr-4 flex items-center gap-3">
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-white/20 hover:text-white transition-colors">
                    <LuTrash2 size={12} />
                  </button>
                )}
                <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-black text-white/20 font-mono-cyber">
                  ^K
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Results Dropdown */}
          <AnimatePresence>
            {isSearchFocused && searchQuery.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="absolute top-full left-4 right-4 mt-4 glass-premium rounded-2xl p-2 z-50 overflow-hidden shadow-2xl border border-white/10"
              >
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                <div className="relative">
                  <div className="p-3 mb-2 border-b border-white/5 flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Protocol Search Results</span>
                    <span className="text-[9px] font-mono text-primary">{filteredCommands.length} MATCHES</span>
                  </div>
                  {filteredCommands.length > 0 ? (
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {filteredCommands.map((cmd) => (
                        <button
                          key={cmd.id}
                          onClick={() => executeCommand(cmd)}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 rounded-xl group transition-all text-left mb-1 border border-transparent hover:border-white/5"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-white/30 group-hover:text-primary transition-colors group-hover:border-primary/30 group-hover:shadow-[0_0_10px_rgba(157,0,255,0.1)]">
                              {cmd.icon}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white/80 group-hover:text-white uppercase tracking-wider">{cmd.label}</p>
                              <p className="text-[8px] text-white/20 font-mono uppercase mt-0.5">{cmd.category}</p>
                            </div>
                          </div>
                          <LuChevronDown className="-rotate-90 text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" size={14} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <LuShieldAlert className="mx-auto text-white/10 mb-3" size={24} />
                      <p className="text-[9px] text-white/20 font-mono uppercase tracking-[0.3em]">No protocols found in active buffer</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section: Telemetry & Profile */}
        <div className="flex items-center gap-4">
          {/* Advanced Telemetry HUD */}
          <div className="hidden xl:flex items-center gap-8 px-6 py-2.5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {/* CPU Gauge */}
            <div className="flex flex-col gap-1.5 min-w-[70px]">
              <div className="flex justify-between items-end">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">CPU_LOAD</span>
                <span className={`text-[10px] font-black font-mono-cyber ${cpuLoad > 80 ? 'text-error' : 'text-primary'}`}>{cpuLoad}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      opacity: (cpuLoad / 10) > i ? 1 : 0.3,
                      backgroundColor: cpuLoad > 80 ? '#FF4D6D' : '#9D00FF',
                      boxShadow: (cpuLoad / 10) > i ? (cpuLoad > 80 ? '0 0 8px #FF4D6D' : '0 0 8px #9D00FF') : 'none'
                    }}
                    className="flex-1 h-full rounded-sm"
                  />
                ))}
              </div>
            </div>

            {/* RAM Gauge */}
            <div className="flex flex-col gap-1.5 min-w-[70px]">
              <div className="flex justify-between items-end">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">MEM_UTIL</span>
                <span className={`text-[10px] font-black font-mono-cyber ${ramLoad > 80 ? 'text-error' : 'text-secondary'}`}>{ramLoad}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      opacity: (ramLoad / 10) > i ? 1 : 0.3,
                      backgroundColor: ramLoad > 80 ? '#FF4D6D' : '#00D1FF',
                      boxShadow: (ramLoad / 10) > i ? (ramLoad > 80 ? '0 0 8px #FF4D6D' : '0 0 8px #00D1FF') : 'none'
                    }}
                    className="flex-1 h-full rounded-sm"
                  />
                ))}
              </div>
            </div>

            {/* Kernel Pulse */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-1">PULSE</span>
                <div className="flex items-end gap-0.5 h-4">
                  {[...Array(8)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: isConnected ? [4, 12, 6, 14, 4][(i + Math.floor(time.getSeconds()/2)) % 5] : 2 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                      className={`w-1 rounded-full ${isConnected ? 'bg-primary shadow-[0_0_8px_rgba(157,0,255,0.6)]' : 'bg-error/40'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Time & Connectivity */}
          <div className="hidden md:flex flex-col items-end px-5 py-1.5 border-x border-white/5">
            <span className="text-[14px] font-mono-cyber font-black text-white tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-error'}`} />
              <span className="text-[8px] font-black font-mono-cyber text-white/20 uppercase tracking-tighter">
                NODE_{isConnected ? 'LINK_UP' : 'LINK_DOWN'}
              </span>
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNotificationClick}
              className="p-3 rounded-xl transition-all relative group border border-transparent hover:border-white/5"
            >
              <LuBell size={18} className={`text-white/40 group-hover:text-primary transition-colors ${hasNewAlerts ? 'animate-bounce text-primary' : ''}`} />
              {criticalCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-black shadow-[0_0_10px_#FF4D6D]"></span>
              )}
            </motion.button>

            <div className="relative ml-2">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="group relative flex items-center justify-center w-11 h-11 rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-primary via-magenta to-secondary transition-opacity duration-300 ${isProfileOpen ? 'opacity-100' : 'opacity-20 group-hover:opacity-40'}`} />
                <LuUser className="relative z-10 text-white" size={20} />
                {isConnected && (
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-success rounded-full border-2 border-black shadow-[0_0_8px_#00FF9D] z-20" />
                )}
              </button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="absolute top-full right-0 mt-4 w-64 glass-premium rounded-3xl p-3 z-50 overflow-hidden shadow-2xl border border-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <div className="relative">
                      <div className="p-4 mb-3 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Root Operator</p>
                        <p className="text-[14px] font-bold text-white mb-2">Administrator_01</p>
                        <div className="flex items-center gap-2 px-2 py-1 bg-black/40 rounded-lg border border-white/5">
                          <LuShieldAlert size={10} className="text-success" />
                          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Trust Level: OMNI</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <button 
                          onClick={() => { setIsProfileOpen(false); navigate('/developer-console'); }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-[11px] font-black text-white/60 hover:text-white uppercase tracking-wider transition-all border border-transparent hover:border-white/5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <LuActivity size={14} />
                          </div>
                          Kernel Diagnostics
                        </button>
                        <button 
                          onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-[11px] font-black text-white/60 hover:text-white uppercase tracking-wider transition-all border border-transparent hover:border-white/5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                            <LuSettings size={14} />
                          </div>
                          System Config
                        </button>
                        <div className="h-[1px] bg-white/5 my-2 mx-1 opacity-50"></div>
                        <button 
                          onClick={() => { setIsProfileOpen(false); window.location.href = '/boot'; }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-error/10 rounded-xl text-[11px] font-black text-error/80 hover:text-error uppercase tracking-wider transition-all border border-transparent hover:border-error/20"
                        >
                          <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center text-error">
                            <LuRotateCcw size={14} />
                          </div>
                          Terminate Link
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


