import React from 'react';
import { useKernel } from '../../context/KernelContext';
import { 
  LuRotateCcw, 
  LuHardDrive, 
  LuCpu, 
  LuTrash2, 
  LuClock,
  LuShieldAlert
} from 'react-icons/lu';

const SnapshotCard = ({ snapshot }) => {
  const { socket } = useKernel();

  const handleRestore = () => {
    if (window.confirm(`Are you sure you want to restore snapshot "${snapshot.id}"? Current live state will be overwritten.`)) {
      socket.emit('RESTORE_SNAPSHOT', { id: snapshot.id });
    }
  };

  const handleDelete = () => {
    if (window.confirm("Permanently delete this restore point?")) {
      socket.emit('DELETE_SNAPSHOT', { id: snapshot.id });
    }
  };

  const formatDate = (ts) => {
    return new Date(ts * 1000).toLocaleString();
  };

  return (
    <div className="group relative bg-slate-950 border border-white/5 p-5 rounded-2xl hover:border-primary-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)]">
      {/* Label & Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${snapshot.id.startsWith('CHK') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary-500/20 text-primary-400'}`}>
                {snapshot.id.startsWith('CHK') ? 'CHECKPOINT' : 'SNAPSHOT'}
             </span>
             <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase">ID: {snapshot.id}</span>
          </div>
          <h3 className="text-white font-bold text-lg leading-tight group-hover:text-primary-400 transition-colors">
            {snapshot.label || "Unnamed State Capture"}
          </h3>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleDelete}
            className="p-2 bg-slate-900 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
           >
             <LuTrash2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Metadata Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5 flex items-center gap-3">
          <LuClock className="w-4 h-4 text-slate-500" />
          <div className="text-[9px] leading-tight">
            <p className="font-black text-slate-600 uppercase tracking-widest">Captured</p>
            <p className="text-slate-300 font-bold">{formatDate(snapshot.timestamp)}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5 flex items-center gap-3">
          <LuHardDrive className="w-4 h-4 text-slate-500" />
          <div className="text-[9px] leading-tight">
            <p className="font-black text-slate-600 uppercase tracking-widest">Size</p>
            <p className="text-slate-300 font-bold">{snapshot.size_kb} KB</p>
          </div>
        </div>
      </div>

      {/* Restore Button */}
      <button 
        onClick={handleRestore}
        className="w-full py-3 bg-slate-900 hover:bg-primary-600 text-slate-400 hover:text-white border border-white/5 hover:border-primary-500 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-[0.2em] transition-all"
      >
        <LuRotateCcw className="w-4 h-4 group-hover:animate-spin" />
        REHYDRATE SYSTEM
      </button>

      {/* Hover Glow Accent */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    </div>
  );
};

export default React.memo(SnapshotCard);
