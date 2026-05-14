import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProcessManager from './pages/ProcessManager';
import Scheduler from './pages/Scheduler';
import Memory from './pages/Memory';
import FileSystem from './pages/FileSystem';
import KernelOverview from './pages/KernelOverview';
import Dashboard from './pages/Dashboard';
import HardwareDashboard from './pages/HardwareDashboard';
import DeadlockDetection from './pages/DeadlockDetection';
import DiskScheduling from './pages/DiskScheduling';
import ShellTerminal from './pages/ShellTerminal';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ShowcaseCenter from './pages/ShowcaseCenter';
import VisualizationCenter from './pages/VisualizationCenter';
import AIKernelAssistant from './pages/AIKernelAssistant';
import KernelBoot from './pages/KernelBoot';
import SnapshotCenter from './pages/SnapshotCenter';
import DeveloperConsole from './pages/DeveloperConsole';
import Settings from './pages/Settings';
import DebugOverlay from './components/monitoring/DebugOverlay';
import Sidebar from './components/layout/Sidebar';
import { KernelProvider, useKernel } from './context/KernelContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("OS_PANIC:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-8 font-mono">
          <div className="max-w-2xl w-full glass border-error-500/30 p-8 rounded-[2rem] text-center">
            <h1 className="text-error-500 text-4xl font-black mb-4 uppercase tracking-tighter">Kernel Panic</h1>
            <p className="text-white/60 text-sm mb-8 uppercase tracking-widest">A critical frontend exception has occurred</p>
            <div className="bg-black/40 p-6 rounded-xl border border-white/5 text-left mb-8 overflow-auto max-h-64">
              <p className="text-error-400 font-bold mb-2">Exception: {this.state.error?.message}</p>
              <p className="text-white/20 text-[10px] whitespace-pre-wrap">{this.state.error?.stack}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary/80 transition-all"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ReconnectBanner = () => {
  const { isConnected } = useKernel();
  if (isConnected) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-error-500 text-white text-[10px] font-black py-1 text-center uppercase tracking-[0.3em] animate-pulse">
      Kernel Connection Lost • Attempting Reconnection...
    </div>
  );
};

const BootGuard = ({ children }) => {
  const { kernelState } = useKernel();
  
  // Initialize from sessionStorage to skip animation on refresh
  const [minTimePassed, setMinTimePassed] = useState(() => {
    return sessionStorage.getItem('nova_system_booted') === 'true';
  });
  const [showApp, setShowApp] = useState(() => {
    return sessionStorage.getItem('nova_system_booted') === 'true';
  });
  
  const boot = kernelState.boot || { ready: false, state: 'OFFLINE', progress: 0 };
  const isBooting = !boot.ready || boot.state !== 'ACTIVE';

  useEffect(() => {
    // Only run the timer if we haven't passed the time yet
    if (!minTimePassed) {
      const timer = setTimeout(() => setMinTimePassed(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [minTimePassed]);

  useEffect(() => {
    if (!isBooting && minTimePassed && !showApp) {
      // Small additional delay to sync with KernelBoot's internal fade
      const timer = setTimeout(() => {
        setShowApp(true);
        sessionStorage.setItem('nova_system_booted', 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isBooting, minTimePassed, showApp]);

  if (!showApp) {
    return <KernelBoot />;
  }

  return (
    <div className="w-full h-full animate-fade-in">
      {children}
    </div>
  );
};

function App() {
  return (
    <KernelProvider>
      <ErrorBoundary>
        <ReconnectBanner />
        <Router>
          <BootGuard>
            <Routes>
              <Route path="/snapshots" element={<SnapshotCenter />} />
              <Route path="/boot" element={<KernelBoot />} />
              <Route path="/" element={<Navigate to="/kernel-overview" />} />
              <Route path="/kernel-overview" element={<KernelOverview />} />
              <Route path="/kernel overview" element={<Navigate to="/kernel-overview" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/process-manager" element={<ProcessManager />} />
              <Route path="/process manager" element={<Navigate to="/process-manager" />} />
              <Route path="/scheduler" element={<Scheduler />} />
              <Route path="/memory" element={<Memory />} />
              <Route path="/file-system" element={<FileSystem />} />
              <Route path="/hardware" element={<HardwareDashboard />} />
              <Route path="/deadlock" element={<DeadlockDetection />} />
              <Route path="/disk-scheduling" element={<DiskScheduling />} />
              <Route path="/shell-terminal" element={<ShellTerminal />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/showcase" element={<ShowcaseCenter />} />
              <Route path="/visualization" element={<VisualizationCenter />} />
              <Route path="/ai-assistant" element={<AIKernelAssistant />} />
              <Route path="/developer-console" element={<DeveloperConsole />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/kernel-overview" />} />
            </Routes>
            <DebugOverlay />
          </BootGuard>
        </Router>
        <ToastContainer 
          position="bottom-right"
          theme="dark"
          toastStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </ErrorBoundary>
    </KernelProvider>
  );
}

export default App;
