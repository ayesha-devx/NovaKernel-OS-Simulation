import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useProcess } from '../context/KernelContext';
import { 
  LuDatabase, 
  LuHardDrive, 
  LuActivity, 
  LuSettings, 
  LuTerminal, 
  LuFileText,
  LuX,
  LuSave,
  LuLayoutGrid,
  LuList
} from 'react-icons/lu';
import StatCard from '../components/dashboard/StatCard';
import StorageMap from '../components/filesystem/StorageMap';
import FileExplorer from '../components/filesystem/FileExplorer';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';

const FileSystemPage = () => {
  const { filesystemState, isLoading } = useProcess();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('explorer');

  const { stats = {}, directory = [], blocks = [], logs = [] } = filesystemState || {};

  const handleFileSelect = async (file) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/filesystem/read/${file.filename}`);
      if (res.data.success) {
        setSelectedFile(res.data.metadata);
        setFileContent(res.data.content);
        setIsEditing(false);
      }
    } catch (err) {
      toast.error("Could not read file from disk");
    }
  };

  const saveFile = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/filesystem/write`, {
        filename: selectedFile.filename,
        content: fileContent
      });
      if (res.data.success) {
        toast.success("File synchronized with disk");
        setSelectedFile(res.data.inode);
        setIsEditing(false);
      }
    } catch (err) {
      toast.error("Write operation failed");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="FILE SYSTEM">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="FILE SYSTEM">
      <div className="relative z-10 space-y-10 pb-12">
        {/* Cinematic Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan/20 via-primary/5 to-transparent rounded-3xl sm:rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative glass-premium rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-10 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,209,255,0.05)]">
             <div className="absolute inset-0 scanline-overlay opacity-20" />
             <div className="absolute top-0 right-0 w-80 h-80 bg-cyan/5 blur-[120px] -mr-40 -mt-40" />
             
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 relative z-10">
                <div className="space-y-4 w-full lg:w-auto">
                  <div className="flex items-center gap-4 sm:gap-5">
                     <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan/20 border border-cyan/30 flex items-center justify-center neon-border-cyan shrink-0">
                         <LuHardDrive className="text-cyan neon-text-cyan" size={24} />
                     </div>
                     <div>
                       <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-orbitron tracking-tighter neon-gradient-text uppercase leading-none mb-1">FILE SYSTEM</h1>
                       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                           <div className="flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_#00FF9D] indicator-pulse" />
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron">Virtual_NVME_Storage_Active</span>
                           </div>
                       </div>
                     </div>
                  </div>
                  <p className="text-text/40 text-xs font-bold uppercase tracking-widest max-w-2xl leading-loose ml-0 sm:ml-19">
                    Kernel-space file allocation and I/O management. Interfacing with virtual disk sectors, inode indexing protocols, and synchronous data persistence layers.
                  </p>
                </div>
                
                <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 px-4 py-3 sm:px-8 sm:py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl w-full lg:w-auto">
                   <div className="flex flex-col items-start sm:items-end gap-1 flex-1 sm:flex-none">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron">Storage_Link</span>
                       <div className="flex items-center gap-2">
                           <div className="w-1.5 h-4 bg-cyan rounded-full animate-pulse shadow-[0_0_8px_rgba(0,209,255,1)]" />
                           <span className="text-xs font-mono font-black text-white uppercase">NVME_LINK</span>
                       </div>
                   </div>
                   <div className="w-px h-10 bg-white/10" />
                   <div className="flex flex-col items-start sm:items-end gap-1 flex-1 sm:flex-none">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron">Sync_Flux</span>
                       <span className="text-sm font-black text-secondary neon-text uppercase">1.2 GB/S</span>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
        {/* Storage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="TOTAL DISK" value={`${stats.total_disk_mb} MB`} icon={<LuHardDrive className="text-primary" />} color="primary" trend="NVME_v2" />
          <StatCard title="USED SPACE" value={`${stats.used_disk_mb} MB`} icon={<LuActivity className="text-cyan" />} trend={`${stats.utilization}%`} color="secondary" />
          <StatCard title="FREE BLOCKS" value={`${stats.free_blocks}`} icon={<LuLayoutGrid className="text-green" />} color="success" trend="READY" />
          <StatCard title="INODE USAGE" value={`${stats.inode_usage}/256`} icon={<LuList className="text-magenta" />} color="magenta" trend="ACTIVE" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Storage Map Visualization */}
            <div className="glass-premium border border-white/5 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 relative overflow-hidden group">
              <div className="absolute inset-0 scanline-overlay opacity-10 pointer-events-none" />
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <h3 className="text-[10px] font-black text-white/80 mb-6 sm:mb-8 flex items-center gap-3 uppercase tracking-[0.3em] font-orbitron relative z-10">
                <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/20">
                  <LuDatabase className="text-cyan" />
                </div>
                Storage Block Allocation Map
              </h3>
              <div className="relative z-10">
                <StorageMap blocks={blocks} stats={stats} />
              </div>
            </div>

            {/* Inode Table */}
            <div className="glass-premium border border-white/5 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 relative overflow-hidden group">
               <div className="absolute inset-0 scanline-overlay opacity-10 pointer-events-none" />
               <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

               <h3 className="text-[10px] font-black text-white/80 mb-6 sm:mb-8 flex items-center gap-3 uppercase tracking-[0.3em] font-orbitron relative z-10">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <LuList className="text-primary" />
                </div>
                Global Inode Index
              </h3>
              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left border-separate border-spacing-y-3 min-w-[700px]">
                   <thead>
                      <tr className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] font-orbitron">
                         <th className="px-3 py-2 sm:px-6">ID</th>
                         <th className="px-3 py-2 sm:px-6">Filename</th>
                         <th className="px-3 py-2 sm:px-6">Size</th>
                         <th className="px-3 py-2 sm:px-6">Blocks</th>
                         <th className="px-3 py-2 sm:px-6">Created</th>
                         <th className="px-3 py-2 sm:px-6 text-right">Perms</th>
                      </tr>
                   </thead>
                   <tbody>
                      {directory.map((inode) => (
                        <tr key={inode.inode_id} className="bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:neon-border-cyan transition-all duration-300 group rounded-xl">
                           <td className="px-3 py-3 sm:px-6 sm:py-4 text-xs font-mono text-cyan font-bold">#{inode.inode_id.toString().padStart(3, '0')}</td>
                           <td className="px-3 py-3 sm:px-6 sm:py-4 text-xs font-black text-white group-hover:text-cyan transition-colors uppercase tracking-wider">{inode.filename}</td>
                           <td className="px-3 py-3 sm:px-6 sm:py-4 text-xs text-slate-400 font-space">{inode.size} MB</td>
                           <td className="px-3 py-3 sm:px-6 sm:py-4 text-xs font-mono text-slate-500">[{inode.block_count}]</td>
                           <td className="px-3 py-3 sm:px-6 sm:py-4 text-[10px] text-slate-500 font-mono">{new Date(inode.created_at).toLocaleTimeString()}</td>
                           <td className="px-3 py-3 sm:px-6 sm:py-4 text-[10px] font-mono text-green/80 text-right">
                              <span className="px-2 py-1 bg-green/5 border border-green/20 rounded-md">{inode.permissions}</span>
                           </td>
                        </tr>
                      ))}
                      {directory.length === 0 && (
                        <tr><td colSpan="6" className="text-center py-12 text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] font-orbitron italic">No inodes allocated to hardware</td></tr>
                      )}
                   </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">
            {/* File Explorer */}
            <div className="glass-premium border border-white/5 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 relative overflow-hidden group">
               <div className="absolute inset-0 scanline-overlay opacity-10 pointer-events-none" />
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <div className="relative z-10">
                  <FileExplorer directory={directory} onFileSelect={handleFileSelect} />
               </div>
            </div>

            {/* FS Logs */}
            <div className="glass-premium border border-white/5 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 relative overflow-hidden">
               <div className="absolute inset-0 scanline-overlay opacity-20 pointer-events-none" />
               <h3 className="text-[10px] font-black text-white/80 mb-6 flex items-center gap-3 uppercase tracking-[0.3em] font-orbitron relative z-10">
                 <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/20">
                    <LuTerminal className="text-cyan animate-pulse" />
                 </div>
                 Storage Logs
               </h3>
               <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                  {logs.slice().reverse().map((log, idx) => (
                    <div key={log.id} className="p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono leading-relaxed group hover:border-cyan/30 transition-colors">
                       <span className="text-cyan font-bold">[{log.timestamp}]</span> 
                       <span className="text-white/90 ml-2">{log.message}</span>
                       {idx === 0 && <span className="terminal-cursor ml-2" />}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="py-8 text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] font-orbitron">
                       Waiting for I/O operations...
                       <span className="terminal-cursor ml-2" />
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      <AnimatePresence>
        {selectedFile && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFile(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface/95 backdrop-blur-3xl border border-white/10 rounded-3xl sm:rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 neon-border-cyan"
            >
              <div className="absolute inset-0 scanline-overlay opacity-10 pointer-events-none" />
              <div className="p-4 sm:p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-cyan/10 to-transparent relative z-10">
                 <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] bg-cyan/10 flex items-center justify-center text-cyan border border-cyan/20 shadow-[0_0_20px_rgba(0,209,255,0.2)] shrink-0">
                       <LuFileText size={24} />
                    </div>
                    <div>
                       <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tighter font-orbitron">{selectedFile.filename}</h2>
                       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 mt-1">
                          <span className="text-[10px] text-cyan/60 font-mono font-bold">INODE: #{selectedFile.inode_id}</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full hidden sm:block" />
                          <span className="text-[10px] text-slate-500 font-mono">{selectedFile.size} MB :: {selectedFile.blocks.length} BLOCKS</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedFile(null)} className="p-2 sm:p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10">
                    <LuX size={20} />
                 </button>
              </div>

              <div className="p-4 sm:p-8 md:p-10 relative z-10">
                 <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-orbitron flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" />
                       Data_Stream_Preview
                    </span>
                    <div className="flex gap-3 w-full sm:w-auto">
                       {isEditing ? (
                          <button onClick={saveFile} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green text-slate-950 text-[10px] font-black rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,157,0.4)] w-full sm:w-auto">
                             <LuSave size={14} /> COMMIT_TO_DISK
                          </button>
                       ) : (
                          <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 text-white text-[10px] font-black rounded-xl hover:bg-white/10 transition-all border border-white/10 hover:border-cyan/50 w-full sm:w-auto">
                             OVERRIDE_FILE
                          </button>
                       )}
                    </div>
                 </div>
                 <div className="relative group/textarea">
                    <textarea 
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      readOnly={!isEditing}
                      className="w-full h-80 bg-black/40 border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-sm font-mono text-cyan/80 focus:ring-1 focus:ring-cyan/50 outline-none resize-none transition-all custom-scrollbar "
                      placeholder="Waiting for data stream input..."
                    />
                    <div className="absolute top-4 right-4 text-[9px] text-slate-700 font-mono font-bold uppercase tracking-widest opacity-0 group-hover/textarea:opacity-100 transition-opacity">
                       0x{(fileContent.length).toString(16).toUpperCase().padStart(4, '0')}_BYTES
                    </div>
                 </div>
              </div>

              <div className="p-4 sm:p-8 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center text-[10px] text-slate-500 font-mono">
                 <span>CREATED: {new Date(selectedFile.created_at).toLocaleString()}</span>
                 <span>MODIFIED: {new Date(selectedFile.modified_at).toLocaleString()}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default FileSystemPage;
