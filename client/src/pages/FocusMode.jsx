import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Play, Pause, RotateCcw, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

const FocusMode = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Topic selection
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(FOCUS_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  // Notes
  const [notes, setNotes] = useState('');

  // Load topics
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

  // Timer logic
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

  // Circle progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ backgroundColor: 'rgb(var(--color-bg))' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-white/20 font-medium">
            {isBreak ? 'Break Time' : 'Focus Mode'}
          </span>
          <span className="text-xs text-white/30 ml-3">{sessions} sessions completed</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-md flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main content — centered vertically */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl w-full items-center">
          {/* Left: Topic info */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[10px] text-white/20 uppercase tracking-wider font-medium mb-2">Current Topic</p>
              <div className="relative">
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="w-full text-left bg-white/[0.03] border border-white/[0.07] rounded-lg px-4 py-3 flex items-center justify-between hover:border-white/[0.12] transition-colors"
                >
                  <span className="text-sm font-medium text-white/70">
                    {selectedTopic?.name || 'No topics available'}
                  </span>
                  <ChevronDown size={14} className="text-white/25" />
                </button>
                {showPicker && topics.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#111118] border border-white/[0.08] rounded-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                    {topics.map(t => (
                      <button
                        key={t._id}
                        onClick={() => { setSelectedTopic(t); setShowPicker(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          selectedTopic?._id === t._id ? 'bg-white/[0.06] text-white' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedTopic && (
              <button
                onClick={markComplete}
                className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                <CheckCircle2 size={14} /> Mark as completed
              </button>
            )}

            <div>
              <p className="text-[10px] text-white/20 uppercase tracking-wider font-medium mb-2">Progress</p>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/[0.15] rounded-full transition-all duration-500"
                  style={{ width: `${sessions > 0 ? Math.min(100, sessions * 25) : 0}%` }}
                />
              </div>
              <p className="text-[10px] text-white/15 mt-1">{sessions * 25}m studied today</p>
            </div>
          </div>

          {/* Center: Timer */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 280 280" className="w-full h-full -rotate-90">
                <circle cx="140" cy="140" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                <circle
                  cx="140" cy="140" r={radius} fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-mono font-light text-white/80 tracking-wider">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-white/20 uppercase tracking-widest mt-2">
                  {isBreak ? 'Break' : 'Focus'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={reset}
                className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-colors"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={toggle}
                className="w-14 h-14 rounded-full bg-white/[0.08] flex items-center justify-center text-white/70 hover:bg-white/[0.12] transition-colors"
              >
                {isRunning ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>
              <div className="w-10" /> {/* Spacer for symmetry */}
            </div>
          </div>

          {/* Right: Notes */}
          <div className="flex flex-col h-full max-h-72">
            <p className="text-[10px] text-white/20 uppercase tracking-wider font-medium mb-2">Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write quick notes while studying..."
              className="flex-1 w-full bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-sm text-white/60 placeholder-white/15 resize-none outline-none focus:border-white/[0.12] transition-colors leading-relaxed"
              rows={8}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
