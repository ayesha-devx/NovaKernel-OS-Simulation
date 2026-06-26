import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children, title }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background text-text selection:bg-primary/30 selection:text-white overflow-hidden" data-page-title={title}>
      {/* Cinematic Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Intense Animated Blur Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.6, 0.8, 0.6],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/30 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.3, 1, 1.3],
            opacity: [0.4, 0.6, 0.4],
            x: [0, -80, 0],
            y: [0, -100, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] -right-[15%] w-[70%] h-[70%] bg-secondary/20 rounded-full blur-[180px]"
        />
        <motion.div 
          animate={{ 
            opacity: [0.4, 0.6, 0.4],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] bg-primary/25 rounded-full blur-[120px]"
        />

        {/* Global Atmospheric Bloom */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(157,0,255,0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,209,255,0.12)_0%,transparent_60%)]" />

        {/* Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-25" />
        
        {/* Scanline Overlay */}
        <div className="scanline-overlay-animated opacity-40" />
        
        {/* High-Contrast Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,4,12,0.95)_100%)]" />
      </div>

      {/* Main Content Interface */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)} isMobileSidebarOpen={isMobileSidebarOpen} />
        
        {/* Mobile Sidebar Overlay Backdrop */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <AnimatePresence mode="wait">
              <motion.div 
                key={title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto min-h-full"
              >
                {title && <h1 className="sr-only">{title}</h1>}
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
