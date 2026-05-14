import React from 'react';
import { motion } from 'framer-motion';

const QueueMonitor = React.memo(({ metrics }) => {
  const queues = [
    { label: 'Ready Queue', value: metrics.queue_sizes?.length > 0 ? metrics.queue_sizes[metrics.queue_sizes.length - 1]?.value || 0 : 0, max: 100, color: 'emerald', rgb: '16, 185, 129' },
    { label: 'Active Tasks', value: metrics.active_processes?.length > 0 ? metrics.active_processes[metrics.active_processes.length - 1]?.value || 0 : 0, max: 50, color: 'cyan', rgb: '34, 211, 238' },
    { label: 'Socket Load', value: metrics.socket_emits?.length > 0 ? metrics.socket_emits[metrics.socket_emits.length - 1]?.value || 0 : 0, max: 10, color: 'purple', rgb: '168, 85, 247' }
  ];

  return (
    <div className="space-y-6">
      {queues.map((q) => (
        <div key={q.label}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{q.label}</span>
            <span className="text-[10px] font-mono text-white/60">{Math.round(q.value)} / {q.max}</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              className={`h-full bg-${q.color}-500`}
              style={{ boxShadow: `0 0 10px rgba(${q.rgb}, 0.5)` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (q.value / q.max) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
});

export default QueueMonitor;
