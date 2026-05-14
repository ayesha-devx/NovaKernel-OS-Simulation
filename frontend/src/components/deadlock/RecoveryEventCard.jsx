import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiAlertTriangle, FiCheckCircle, FiInfo, FiZap,
  FiTarget, FiTrash2, FiRefreshCw, FiActivity,
  FiShield, FiPlay
} from 'react-icons/fi';

const SEVERITY_CONFIG = {
  CRITICAL: {
    border: 'neon-border-danger',
    bg: 'bg-danger/10',
    text: 'text-danger',
    dot: 'bg-danger',
    glow: 'shadow-[0_0_20px_rgba(255,77,109,0.2)]',
    icon: FiAlertTriangle,
  },
  WARNING: {
    border: 'neon-border-warning',
    bg: 'bg-warning/10',
    text: 'text-warning',
    dot: 'bg-warning',
    glow: 'shadow-[0_0_15px_rgba(255,200,87,0.15)]',
    icon: FiZap,
  },
  SUCCESS: {
    border: 'neon-border-green',
    bg: 'bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
    glow: 'shadow-[0_0_15px_rgba(0,255,157,0.15)]',
    icon: FiCheckCircle,
  },
  INFO: {
    border: 'border-white/10',
    bg: 'bg-white/5',
    text: 'text-white/40',
    dot: 'bg-white/20',
    glow: '',
    icon: FiInfo,
  },
};

const EVENT_TYPE_ICONS = {
  DEADLOCK_DETECTED:     FiAlertTriangle,
  CYCLE_ANALYSIS:        FiActivity,
  VICTIM_SELECTED:       FiTarget,
  RESOURCE_RELEASE:      FiZap,
  PROCESS_TERMINATED:    FiTrash2,
  RESOURCE_REALLOCATION: FiRefreshCw,
  SYSTEM_STABILIZED:     FiShield,
  SIMULATION:            FiPlay,
  AUTO_RECOVER:          FiZap,
  MANUAL_RESOLVE:        FiTarget,
  SYSTEM_RESET:          FiRefreshCw,
};

const RecoveryEventCard = ({ event, index = 0 }) => {
  const cfg = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.INFO;
  const IconComp = EVENT_TYPE_ICONS[event.type] || cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={`relative flex items-start gap-3 p-3 rounded-xl border ${cfg.border} ${cfg.bg} ${cfg.glow} group`}
    >
      {/* Severity dot */}
      <div className="relative flex-shrink-0 mt-1">
        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${event.severity === 'CRITICAL' ? 'animate-pulse' : ''} shadow-[0_0_8px_currentColor]`} />
      </div>

      {/* Icon */}
      <div className={`flex-shrink-0 mt-0.5 ${cfg.text} filter drop-shadow-[0_0_5px_currentColor]`}>
        <IconComp size={14} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] font-orbitron ${cfg.text}`}>
            {event.type?.replace(/_/g, ' ')}
          </span>
          <span className="text-[8px] text-white/20 font-mono-cyber flex-shrink-0 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            {event.timestamp}
          </span>
        </div>
        <p className="text-[10px] text-white/60 leading-relaxed font-mono-cyber uppercase tracking-wider">
          <span className="text-white/20 mr-2">CMD&gt;</span>
          {event.message}
        </p>
      </div>
    </motion.div>
  );
};

export default RecoveryEventCard;
