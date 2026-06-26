import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKernel } from '../context/KernelContext';
import BootProgressBar from '../components/boot/BootProgressBar';
import BootLogStream from '../components/boot/BootLogStream';
import BootStatusGrid from '../components/boot/BootStatusGrid';
import BootPhaseIndicator from '../components/boot/BootPhaseIndicator';
import BootLogoAnimation from '../components/boot/BootLogoAnimation';

const KernelBoot = ({ forceExit = false }) => {
  const { kernelState } = useKernel();
  const navigate = useNavigate();
  const [showRedirect, setShowRedirect] = useState(forceExit);
  const [isMounted, setIsMounted] = useState(false);
  
  const boot = kernelState.boot || { state: 'OFFLINE', progress: 0, logs: [], ready: false };

  useEffect(() => {
    setIsMounted(true);
    if (forceExit) setShowRedirect(true);
  }, [forceExit]);

  useEffect(() => {
    // If kernel becomes ready, wait a longer moment for cinematic effect then redirect
    if (boot.ready && boot.state === 'ACTIVE') {
      const timer = setTimeout(() => {
        setShowRedirect(true);
        sessionStorage.setItem('nova_system_booted', 'true');
        // We don't actually need to navigate here anymore because BootGuard handles unmounting,
        // but we keep it for redundancy if someone hits /boot directly
        const navTimer = setTimeout(() => {
            if (window.location.pathname === '/boot') {
                navigate('/dashboard');
            }
        }, 800);
        return () => clearTimeout(navTimer);
      }, 1200); // 1.2 second success pause
      return () => clearTimeout(timer);
    }

    // Safety Fallback: If it's been active but not ready for some reason, redirect anyway
    if (boot.state === 'ACTIVE' && !boot.ready) {
        const timer = setTimeout(() => {
            setShowRedirect(true);
            sessionStorage.setItem('nova_system_booted', 'true');
            setTimeout(() => navigate('/dashboard'), 800);
        }, 1200);
        return () => clearTimeout(timer);
    }
  }, [boot.ready, boot.state, navigate]);

  return (
    <div className={`
      fixed inset-0 z-[10000] bg-background flex flex-col items-center justify-start overflow-y-auto py-6 px-4 font-space
      scrollbar-hide transition-all duration-1000 ease-in-out selection:bg-primary/30
      ${!isMounted ? 'opacity-0 scale-95' : showRedirect ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}
    `}>
      {/* Cinematic Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[80px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-magenta/10 blur-[80px] rounded-full animate-pulse-slow [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-cyan/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
        <div className="absolute inset-0 scanline-overlay-animated opacity-15" />
      </div>
      
      <div className="w-full max-w-4xl flex flex-col items-center gap-1.5 relative z-10 transition-all duration-1000">
        
        {/* Header / Logo */}
        <BootLogoAnimation />

        {/* Central Info Section */}
        <div className="w-full flex flex-col items-center gap-3 mt-1">
          <BootPhaseIndicator state={boot.state} />
          
          <BootProgressBar 
            progress={boot.progress || 0} 
            status={(boot.state || 'OFFLINE').replace(/_/g, ' ')} 
          />
        </div>
          
        {/* Horizontal Technical Layout */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-stretch mt-1">
          {/* Left Column: Subsystem Matrix */}
          <div className="flex-[1.1] flex flex-col gap-2">
            <div className="px-3 py-0.5 glass-premium inline-flex items-center gap-2 rounded-full border-cyan/20 self-start">
              <span className="w-1 h-1 bg-cyan shadow-[0_0_4px_#00D1FF] rounded-full animate-ping" />
              <span className="text-[8px] font-bold text-cyan uppercase tracking-[0.2em]">Subsystem Matrix</span>
            </div>
            <BootStatusGrid state={boot.state} />
          </div>

          {/* Right Column: Telemetry Logs */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="px-3 py-0.5 glass-premium flex justify-between items-center rounded-full border-primary/20">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-primary shadow-[0_0_4px_#9D00FF] rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">Kernel Telemetry</span>
              </div>
              <span className="text-[6px] font-bold text-primary/40 uppercase tracking-[0.1em] animate-pulse">L1_Active</span>
            </div>
            <div className="flex-1 min-h-[140px]">
              <BootLogStream logs={boot.logs} />
            </div>
          </div>
        </div>

        {/* Bottom Status Strip */}
        <div className="mt-3 w-full max-w-2xl py-1.5 px-4 glass-premium rounded-full border-white/5 flex justify-between items-center text-[7px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <div className="flex gap-6">
            <div className="flex items-center gap-1">
              <span>KERNEL:</span>
              <span className="text-cyan/40">{kernelState.system.version}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>BUILD:</span>
              <span className="text-magenta/40">2026.05.14</span>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1">
               <div className="w-1 h-1 rounded-full bg-green shadow-[0_0_4px_#00FF9D] animate-pulse" />
               <span className="text-green/30">SECURE_LINK</span>
            </div>
            <div className="h-2 w-[1px] bg-white/10" />
            <div className="flex items-center gap-1">
               <span className="text-primary/40">SECURE_KERNEL_V4</span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default KernelBoot;
