import React from 'react';
import { LuClock, LuCircleCheck, LuCircleAlert } from 'react-icons/lu';

const SnapshotTimeline = ({ history }) => {
  return (
    <div className="space-y-4">
      {history.slice(0, 5).map((entry, idx) => (
        <div key={entry.id} className="flex gap-4 relative">
          {/* Vertical Line */}
          {idx !== history.slice(0, 5).length - 1 && (
            <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-slate-800" />
          )}

          <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${idx === 0 ? 'bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}>
            <LuClock className="w-3 h-3 text-white" />
          </div>

          <div className="flex-1 pb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {new Date(entry.timestamp * 1000).toLocaleTimeString()}
              </span>
              <span className="text-[9px] font-bold text-slate-600 bg-slate-900 px-2 py-0.5 rounded-full border border-white/5 uppercase italic">
                {entry.id.split('_')[0]}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-300 tracking-tight leading-none mb-1">{entry.label}</p>
            <p className="text-[10px] font-medium text-slate-500">System State Verified • {entry.size_kb} KB</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(SnapshotTimeline);



