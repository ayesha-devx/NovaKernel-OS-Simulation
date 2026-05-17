import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LuShieldCheck,
  LuLayoutDashboard, 
  LuActivity, 
  LuCpu, 
  LuDatabase, 
  LuFolderTree, 
  LuLock, 
  LuHardDrive, 
  LuTerminal, 
  LuSettings,
  LuMonitor,
  LuEye,
  LuBrain,
  LuCamera
} from 'react-icons/lu';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: <LuShieldCheck />, label: 'Nova Overview', path: '/kernel-overview' },
    { icon: <LuLayoutDashboard />, label: 'Dashboard', path: '/dashboard' },
    { icon: <LuActivity />, label: 'Process Manager', path: '/process-manager' },
    { icon: <LuCpu />, label: 'Scheduler', path: '/scheduler' },
    { icon: <LuDatabase />, label: 'Memory Manager', path: '/memory' },
    { icon: <LuFolderTree />, label: 'File System', path: '/file-system' },
    { icon: <LuCpu />, label: 'Hardware HAL', path: '/hardware' },
    { icon: <LuLock />, label: 'Deadlock Detection', path: '/deadlock' },
    { icon: <LuHardDrive />, label: 'Disk Scheduling', path: '/disk-scheduling' },
    { icon: <LuTerminal />, label: 'Shell Terminal', path: '/shell-terminal' },
    { icon: <LuActivity />, label: 'Analytics Dashboard', path: '/analytics' },
    { icon: <LuEye />, label: 'Kernel Observatory', path: '/visualization' },
    { icon: <LuBrain />, label: 'AI Kernel Assistant', path: '/ai-assistant' },
    { icon: <LuCamera />, label: 'Snapshot Center', path: '/snapshots' },
    { icon: <LuMonitor />, label: 'Showcase Center', path: '/showcase' },
    { icon: <LuTerminal />, label: 'Developer Console', path: '/developer-console' },
    { icon: <LuSettings />, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 glass-sidebar h-[calc(100vh-64px)] overflow-y-auto hidden lg:flex flex-col py-8 px-5 scrollbar-hide z-20">
      <div className="space-y-2">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className="relative group block"
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent rounded-xl border-l-2 border-primary neon-border"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-secondary rounded-full shadow-[0_0_15px_rgba(0,209,255,1)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <motion.div
                whileHover={{ x: 8 }}
                className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                <span className={`text-xl transition-all duration-300 ${isActive ? 'text-primary drop-shadow-[0_0_10px_rgba(157,0,255,0.6)]' : 'group-hover:text-secondary group-hover:drop-shadow-[0_0_12px_rgba(0,209,255,0.4)]'}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-orbitron ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                
                {!isActive && (
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.03] rounded-xl transition-colors border border-transparent group-hover:border-white/5" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-10">
        <div className="relative p-6 rounded-[2rem] glass-premium border border-white/5 overflow-hidden group">
          <div className="absolute inset-0 scanline-overlay opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] font-orbitron mb-1">System_Core</p>
                <p className="text-[8px] font-mono-cyber text-slate-600">CORE: V1.0.0-STABLE-KERNEL</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center neon-border">
                <LuActivity className="text-primary text-sm indicator-pulse" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 font-orbitron">
                  <span>Logic_Flux</span>
                  <span className="text-secondary neon-text-cyan">42%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "42%" }}
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_10px_rgba(157,0,255,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
