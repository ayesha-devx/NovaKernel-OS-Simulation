import React from 'react';
import { LuDatabase, LuRadio, LuActivity, LuZap, LuClock } from 'react-icons/lu';
import MetricsCard from './MetricsCard';

const PerformanceGrid = React.memo(({ metrics }) => {
  const getLatest = (arr) => (arr && arr.length > 0) ? arr[arr.length - 1]?.value || 0 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricsCard 
        title="Memory Usage" 
        value={getLatest(metrics.memory_usage)} 
        unit="MB" 
        icon={<LuDatabase size={18} />} 
        color="purple" 
      />
      <MetricsCard 
        title="Socket Emit Rate" 
        value={getLatest(metrics.socket_emits)} 
        unit="E/s" 
        icon={<LuRadio size={18} />} 
        color="cyan" 
      />
      <MetricsCard 
        title="Active Processes" 
        value={getLatest(metrics.active_processes)} 
        unit="PID" 
        icon={<LuActivity size={18} />} 
        color="emerald" 
      />
      <MetricsCard 
        title="Queue Depth" 
        value={getLatest(metrics.queue_sizes)} 
        unit="REQ" 
        icon={<LuZap size={18} />} 
        color="amber" 
      />
    </div>
  );
});

export default PerformanceGrid;
