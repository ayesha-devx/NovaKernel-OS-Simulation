import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuFile, LuPlus, LuTrash2, LuEye, LuTerminal, LuDatabase } from 'react-icons/lu';
import axios from 'axios';
import { toast } from 'react-toastify';

const FileExplorer = ({ directory = [], onFileSelect }) => {
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createFile = async (e) => {
    e.preventDefault();
    if (!newFileName) return;
    
    try {
      const res = await axios.post('http://localhost:5000/api/filesystem/create', { 
        filename: newFileName,
        owner: 'Root'
      });
      if (res.data.success) {
        toast.success(`File ${newFileName} created!`);
        setNewFileName('');
        setIsCreating(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Filesystem write error");
    }
  };

  const deleteFile = async (filename) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/filesystem/delete/${filename}`);
      if (res.data.success) {
        toast.info(`File ${filename} deleted.`);
      }
    } catch (err) {
      toast.error("Kernel deletion failed");
    }
  };

  return (
    <div className="space-y-6 relative group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em] flex items-center gap-3 font-orbitron">
          <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/20 shadow-[0_0_10px_rgba(0,209,255,0.2)]">
            <LuDatabase className="text-cyan" />
          </div>
          Root Directory (/)
        </h3>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="p-2 bg-cyan/5 border border-cyan/20 text-cyan rounded-xl hover:bg-cyan/20 hover:neon-border-cyan transition-all group shadow-lg shadow-black/50"
        >
          <LuPlus className={`transition-transform duration-300 ${isCreating ? 'rotate-45' : ''}`} size={16} />
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={createFile}
            className="overflow-hidden"
          >
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex gap-3 neon-border-cyan backdrop-blur-md">
              <input 
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="system_kernel.sys"
                className="flex-1 bg-transparent border-none text-[10px] text-white placeholder-slate-600 focus:ring-0 font-mono font-bold uppercase tracking-wider"
              />
              <button type="submit" className="px-4 py-1.5 bg-cyan text-slate-950 text-[9px] font-black rounded-lg hover:bg-white transition-all shadow-[0_0_15px_rgba(0,209,255,0.4)]">
                ALLOCATE
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {directory.map((file) => (
          <motion.div 
            key={file.inode_id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 5 }}
            className="group flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-cyan/30 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => onFileSelect(file)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-11 h-11 rounded-xl bg-cyan/5 border border-cyan/10 flex items-center justify-center text-cyan group-hover:bg-cyan/10 group-hover:scale-110 transition-all shadow-inner">
                <LuFile size={20} />
              </div>
              <div>
                <p className="text-[11px] font-black text-white group-hover:text-cyan transition-colors uppercase tracking-widest font-orbitron">{file.filename}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-slate-500 font-mono">NODE: #{file.inode_id}</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full" />
                  <span className="text-[9px] text-cyan/70 font-mono font-bold">{file.size} MB</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 relative z-10">
               <button 
                onClick={(e) => { e.stopPropagation(); onFileSelect(file); }}
                className="p-2.5 bg-blue-500/5 hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 rounded-xl transition-all border border-transparent hover:border-blue-500/20"
               >
                 <LuEye size={15} />
               </button>
               <button 
                onClick={(e) => { e.stopPropagation(); deleteFile(file.filename); }}
                className="p-2.5 bg-error/5 hover:bg-error/20 text-slate-500 hover:text-error rounded-xl transition-all border border-transparent hover:border-error/20"
               >
                 <LuTrash2 size={15} />
               </button>
            </div>
          </motion.div>
        ))}

        {directory.length === 0 && !isCreating && (
          <div className="py-16 text-center group/empty">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-cyan/20 blur-[30px] rounded-full opacity-0 group-hover/empty:opacity-100 transition-opacity" />
              <LuTerminal className="mx-auto text-slate-800 relative z-10 animate-pulse" size={48} />
            </div>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] font-orbitron italic">FS_STATE: EMPTY_DISK_IMAGE</p>
            <p className="text-[9px] text-slate-700 font-mono mt-2 uppercase tracking-widest">Waiting for data allocation...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
