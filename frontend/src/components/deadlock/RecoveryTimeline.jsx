import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  FiClock, FiTrash2, FiPlay, FiPause, FiSkipForward,
  FiRotateCcw, FiChevronDown, FiChevronUp, FiActivity
} from 'react-icons/fi';
import RecoveryEventCard from './RecoveryEventCard';
import axios from 'axios';
import { API_BASE_URL as API_BASE, SOCKET_URL } from '../../config';

// ── Playback hook ───────────────────────────────────────────────────────────
const usePlayback = (events) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const timerRef = useRef(null);

  const stop = useCallback(() => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setIsReplaying(false);
  }, []);

  const startReplay = useCallback(() => {
    if (!events || events.length === 0) return;
    stop();
    // Reverse so we play oldest → newest
    setPlayIndex(0);
    setIsReplaying(true);
    setIsPlaying(true);
  }, [events, stop]);

  const pause = useCallback(() => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const stepForward = useCallback(() => {
    setPlayIndex(i => Math.min(i + 1, (events?.length ?? 1) - 1));
  }, [events]);

  useEffect(() => {
    if (!isReplaying || !isPlaying) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setPlayIndex(i => {
        if (i >= (events?.length ?? 0) - 1) { stop(); return i; }
        return i + 1;
      });
    }, 800);
    return () => clearInterval(timerRef.current);
  }, [isReplaying, isPlaying, events, stop]);

  return { isPlaying, playIndex, isReplaying, startReplay, pause, resume, stepForward, stop };
};

// ── Main Component ──────────────────────────────────────────────────────────
const RecoveryTimeline = ({ className = '' }) => {
  const [events, setEvents] = useState([]);
  const [replayEvents, setReplayEvents] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'replay'
  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  const pb = usePlayback(replayEvents);

  // ── Socket connection ────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { reconnectionAttempts: 5 });
    socketRef.current = socket;

    socket.on('recovery_timeline_update', (data) => {
      if (data?.events) {
        setEvents(data.events); // newest-first from backend
      }
    });

    return () => socket.close();
  }, []);

  // ── Initial fetch ────────────────────────────────────────────────────
  useEffect(() => {
    axios.get(`${API_BASE}/deadlock/timeline`).then(res => {
      if (res.data?.events) setEvents(res.data.events);
    }).catch(() => {});
  }, []);

  // ── Auto-scroll to top (newest event) ───────────────────────────────
  useEffect(() => {
    if (activeTab === 'live' && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events, activeTab]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleClear = async () => {
    await axios.post(`${API_BASE}/deadlock/timeline/clear`).catch(() => {});
    setEvents([]);
  };

  const handleLoadReplay = async () => {
    const res = await axios.get(`${API_BASE}/deadlock/animation/replay`).catch(() => null);
    if (res?.data?.phases) {
      // Convert animation phases → synthetic timeline events for replay
      const synth = res.data.phases.map((ph, i) => ({
        id: i,
        timestamp: ph.timestamp,
        type: ph.phase,
        message: `Animation phase: ${ph.phase.replace(/_/g, ' ')}`,
        severity: ph.phase === 'DETECTION' ? 'CRITICAL'
                : ph.phase === 'SYSTEM_STABILIZED' ? 'SUCCESS'
                : ph.phase === 'VICTIM_SELECTED' || ph.phase === 'PROCESS_TERMINATED' ? 'WARNING'
                : 'INFO',
        metadata: ph.metadata,
      })).reverse(); // oldest first for playback
      setReplayEvents(synth);
      setActiveTab('replay');
      pb.startReplay();
    }
  };

  // ── Displayed events ─────────────────────────────────────────────────
  const displayedEvents = activeTab === 'live'
    ? events
    : replayEvents.slice(0, pb.playIndex + 1);

  const hasEvents = events.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-premium border border-white/10 rounded-3xl sm:rounded-[2rem] overflow-hidden relative ${className}`}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline-overlay opacity-10 pointer-events-none" />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 md:px-8 md:py-5 border-b border-white/5 gap-4 relative z-10">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(157,0,255,0.15)] shrink-0">
            <FiClock size={18} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] font-orbitron">
              Recovery Timeline <span className="text-primary/40 ml-2">_SECURE_LOG</span>
            </h3>
            <p className="text-[9px] text-white/30 font-mono-cyber mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              {events.length} LOGS
            </p>
          </div>

          {/* Live pulse */}
          {hasEvents && (
            <div className="flex items-center gap-2 bg-success/10 px-3 py-1 rounded-full border border-success/20">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_#00FF9D]" />
              <span className="text-[9px] text-success font-black uppercase tracking-[0.2em]">Live</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
          {/* Tab switcher */}
          <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
            {['live', 'replay'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? 'bg-primary/20 text-primary'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Action buttons */}
            <button
              onClick={handleClear}
              title="Clear timeline"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 flex items-center justify-center transition-all"
            >
              <FiTrash2 size={11} />
            </button>
            <button
              onClick={() => setIsExpanded(e => !e)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/60 flex items-center justify-center transition-all"
            >
              {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* ── Replay controls ──────────────────────────────────── */}
            {activeTab === 'replay' && (
              <div className="flex flex-wrap items-center gap-2 p-4 sm:px-6 sm:py-3 border-b border-white/5 bg-white/2">
                <button
                  onClick={handleLoadReplay}
                  className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-1.5"
                >
                  <FiRotateCcw size={10} /> Load Last Recovery
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={pb.isPlaying ? pb.pause : pb.resume}
                    disabled={!pb.isReplaying}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all disabled:opacity-30"
                  >
                    {pb.isPlaying ? <FiPause size={11} /> : <FiPlay size={11} />}
                  </button>
                  <button
                    onClick={pb.stepForward}
                    disabled={!pb.isReplaying}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all disabled:opacity-30"
                  >
                    <FiSkipForward size={11} />
                  </button>
                  {pb.isReplaying && (
                    <span className="text-[8px] text-white/30 font-mono">
                      {pb.playIndex + 1} / {replayEvents.length}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── Event list ───────────────────────────────────────── */}
            <div
              ref={scrollRef}
              className="overflow-y-auto max-h-96 p-6 space-y-3 scrollbar-thin scrollbar-thumb-primary/20 relative z-10"
            >
              {displayedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-white/5 bg-white/2 rounded-[2rem] glass">
                  <div className="relative">
                    <FiActivity className="text-white/10 mb-4" size={40} />
                    <div className="absolute inset-0 text-primary/10 animate-pulse">
                       <FiActivity size={40} />
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] font-orbitron">
                    No active transmissions
                  </p>
                  <p className="text-[9px] text-white/20 mt-2 font-mono-cyber uppercase tracking-widest">
                    Awaiting system deadlock simulation... <span className="terminal-cursor" />
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {displayedEvents.map((event, i) => (
                    <RecoveryEventCard key={event.id} event={event} index={i} />
                  ))}
                  {activeTab === 'live' && (
                    <div className="flex items-center gap-2 text-[10px] text-primary/40 font-mono-cyber px-4 py-2">
                      <span className="animate-pulse">&gt;</span> LISTENING_FOR_EVENTS<span className="terminal-cursor h-3 w-1" />
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecoveryTimeline;
