import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Play, Pause, RotateCcw, CheckCircle2, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

const FocusMode = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const [timeLeft, setTimeLeft] = useState(FOCUS_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);

  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/topics');
        if (res.data.success) {
          const incomplete = res.data.data.filter(t => t.status !== 'completed');
          setTopics(incomplete);
          if (incomplete.length > 0 && !selectedTopic) setSelectedTopic(incomplete[0]);
        }
      } catch (e) {
        console.error('Failed to load topics:', e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current);
      if (!isBreak) {
        setSessions(s => s + 1);
        setIsBreak(true);
        setTimeLeft(BREAK_MINUTES * 60);
        setIsRunning(true);
      } else {
        setIsBreak(false);
        setTimeLeft(FOCUS_MINUTES * 60);
        setIsRunning(false);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, isBreak]);

  const toggle = () => setIsRunning(r => !r);
  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(FOCUS_MINUTES * 60);
    clearInterval(intervalRef.current);
  };

  const markComplete = async () => {
    if (!selectedTopic) return;
    try {
      await api.patch(`/topics/${selectedTopic._id}`, { status: 'completed' });
      setTopics(prev => prev.filter(t => t._id !== selectedTopic._id));
      setSelectedTopic(topics.find(t => t._id !== selectedTopic._id) || null);
    } catch (e) {
      console.error('Failed to mark complete:', e);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalTime = isBreak ? BREAK_MINUTES * 60 : FOCUS_MINUTES * 60;
  const progress = 1 - (timeLeft / totalTime);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ backgroundColor: 'rgb(var(--color-bg))' }}>
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            opacity: isRunning ? [0.03, 0.06, 0.03] : 0.02,
            scale: isRunning ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] ${
            isBreak ? 'bg-emerald-500' : 'bg-primary'
          }`}
        />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 relative z-10">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] uppercase tracking-wider font-semibold ${isBreak ? 'text-emerald-400' : 'text-white/25'}`}>
            {isBreak ? '☕ Break Time' : 'Focus Mode'}
          </span>
          <span className="text-[10px] text-white/15">•</span>
          <span className="text-[10px] text-white/20">{sessions} sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white/40 hover:bg-white/[0.04] transition-colors"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white/40 hover:bg-white/[0.04] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl w-full items-center">
          
          {/* Left: Topic + Progress */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="label-text">Current Topic</p>
              <div className="relative">
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="w-full text-left glass-card p-3 flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-white/60 truncate">
                    {selectedTopic?.name || 'No topics available'}
                  </span>
                  <ChevronDown size={14} className={`text-white/20 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
                </button>
                {showPicker && topics.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-[#13131f] border border-white/[0.08] rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto shadow-xl"
                  >
                    {topics.map(t => (
                      <button
                        key={t._id}
                        onClick={() => { setSelectedTopic(t); setShowPicker(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          selectedTopic?._id === t._id ? 'bg-white/[0.06] text-white' : 'text-white/35 hover:text-white/60 hover:bg-white/[0.03]'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {selectedTopic && (
              <button onClick={markComplete} className="btn-ghost text-xs justify-start">
                <CheckCircle2 size={14} /> Mark as completed
              </button>
            )}

            <div>
              <p className="label-text">Session Progress</p>
              <div className="flex items-center gap-2 mb-1.5">
                {[1,2,3,4].map(i => (
                  <div 
                    key={i} 
                    className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                      i <= sessions ? 'bg-primary' : 'bg-white/[0.06]'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-white/15">{sessions * 25}m studied this session</p>
            </div>
          </div>

          {/* Center: Timer */}
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 280 280" className="w-full h-full -rotate-90">
                <circle cx="140" cy="140" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                <circle
                  cx="140" cy="140" r={radius} fill="none"
                  stroke={isBreak ? 'rgba(52,211,153,0.3)' : 'rgba(var(--color-primary), 0.25)'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-mono font-extralight text-white/80 tracking-[0.1em] tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className={`text-[10px] uppercase tracking-[0.3em] mt-2 ${isBreak ? 'text-emerald-400/50' : 'text-white/15'}`}>
                  {isBreak ? 'Break' : 'Focus'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={reset} className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/[0.08] transition-all">
                <RotateCcw size={16} />
              </button>
              <button 
                onClick={toggle} 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  isRunning 
                    ? 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1]' 
                    : 'bg-primary/15 text-primary hover:bg-primary/25 shadow-[0_0_30px_rgba(var(--color-primary),0.1)]'
                }`}
              >
                {isRunning ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>
              <div className="w-11" />
            </div>
          </div>

          {/* Right: Notes */}
          <div className="flex flex-col h-full max-h-80">
            <p className="label-text">Session Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write quick notes while studying..."
              className="flex-1 w-full input-field !rounded-xl resize-none leading-relaxed !py-3"
              rows={8}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
