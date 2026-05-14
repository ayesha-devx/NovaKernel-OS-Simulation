import React from 'react';
import StatCard from './StatCard';
import { LuLayoutDashboard, LuActivity, LuPlay, LuClock, LuCircleX } from 'react-icons/lu';
import { useProcess } from '../../context/KernelContext';

const ProcessStatistics = () => {
  const { stats } = useProcess();

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
      <StatCard 
        title="Orchestrated PCB" 
        value={stats.total} 
        icon={<LuLayoutDashboard size={18} />} 
        color="primary" 
        trend="TOTAL"
      />
      <StatCard 
        title="Ready State" 
        value={stats.ready} 
        icon={<LuClock size={18} />} 
        color="secondary" 
        trend="ACTIVE"
      />
      <StatCard 
        title="Logic Running" 
        value={stats.running} 
        icon={<LuPlay size={18} />} 
        color="success" 
        trend="COMPUTING"
      />
      <StatCard 
        title="Process Waiting" 
        value={stats.waiting} 
        icon={<LuActivity size={18} />} 
        color="warning" 
        trend="QUEUEING"
      />
      <StatCard 
        title="Terminated Void" 
        value={stats.terminated} 
        icon={<LuCircleX size={18} />} 
        color="error" 
        trend="PURGED"
      />
    </div>
  );
};

export default ProcessStatistics;
