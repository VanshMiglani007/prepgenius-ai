import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, RotateCcw, Target, AlertCircle, SkipForward } from 'lucide-react';
import api from '../services/api';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

const FocusTimer = () => {
  const { user } = useAuth();
  const { activeTheme } = useTheme();
  const { showNotification } = useNotification();
  const primaryColor = `rgb(${activeTheme.primary})`;
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') || '';

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/topics');
        if (res.data.success) setTopics(res.data.data.topics || []);
      } catch (err) {
        console.error("Failed to load topics:", err);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      handleTimerComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    if (sessionId) {
      try {
        await api.put(`/sessions/${sessionId}/end`);
        setSessionId(null);
      } catch (err) {
        console.error("Failed to end session:", err);
      }
    }
    if (!isBreak) {
      showNotification('🎉 Focus session complete! Take a break.', 'success', 5000);
      setIsBreak(true);
      setTimeLeft(BREAK_TIME);
    } else {
      showNotification('⚡ Break over. Ready to focus again!', 'info', 4000);
      setIsBreak(false);
      setTimeLeft(WORK_TIME);
    }
  };

  const toggleTimer = async () => {
    if (!selectedTopic && !isBreak) {
      setError("Please select a topic before starting.");
      return;
    }
    setError("");

    if (!isActive) {
      if (!isBreak && !sessionId) {
        try {
          const res = await api.post('/sessions/start', { topicId: selectedTopic, sessionType: 'focus' });
          if (res.data.success) {
            setSessionId(res.data.data.session._id);
            const topicName = topics.find(t => t._id === selectedTopic)?.name || 'topic';
            showNotification(`🎯 Starting session: ${topicName}`, 'info', 3000);
          }
        } catch (err) {
          console.error("Failed to start session:", err);
          setError("Failed to register session.");
          return;
        }
      }
      setIsActive(true);
    } else {
      setIsActive(false);
      clearInterval(timerRef.current);
    }
  };

  const resetTimer = async () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
    if (sessionId) {
      try {
        await api.put(`/sessions/${sessionId}/end`);
        setSessionId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const skipBreak = () => {
    setIsBreak(false);
    setIsActive(false);
    clearInterval(timerRef.current);
    setTimeLeft(WORK_TIME);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPercentage = () => {
    const total = isBreak ? BREAK_TIME : WORK_TIME;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="page-container">
      <main className="page-content flex flex-col items-center">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="page-title justify-center text-2xl">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="text-primary" size={20} />
            </div>
            Pomodoro Focus
          </h1>
          <p className="page-description text-center">Laser focus to maximize productivity.</p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-3 bg-red-500/8 border border-red-500/15 rounded-xl flex items-center gap-2 text-sm text-red-300 max-w-md w-full">
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}

        {/* Topic Selector */}
        {!isBreak && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md mb-8">
            <label className="label-text text-center block">Focusing On</label>
            <select 
              value={selectedTopic}
              onChange={(e) => { setSelectedTopic(e.target.value); setError(''); }}
              disabled={isActive}
              className="input-field !py-3.5 disabled:opacity-40"
            >
              <option className="bg-[#13131f]" value="">— Select a Topic —</option>
              {topics.map(t => (
                <option className="bg-[#13131f]" key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Break Banner */}
        {isBreak && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mb-8 text-center">
            <h3 className="text-xl font-bold text-emerald-400">☕ Break Time</h3>
            <p className="text-white/40 text-sm">Rest your eyes and recharge.</p>
          </motion.div>
        )}

        {/* Timer Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-64 h-64 md:w-80 md:h-80 relative"
        >
          {/* Glow */}
          <div 
            className="absolute inset-[-20px] rounded-full blur-[60px] opacity-10 transition-colors duration-1000"
            style={{ backgroundColor: isBreak ? '#34d399' : primaryColor }}
          />
          <CircularProgressbar
            value={getPercentage()}
            text={formatTime(timeLeft)}
            strokeWidth={3}
            styles={buildStyles({
              textColor: '#fff',
              textSize: '16px',
              pathColor: isBreak ? '#4ade80' : primaryColor,
              trailColor: 'rgba(255,255,255,0.04)',
              pathTransitionDuration: 0.5,
            })}
          />
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-5 mt-10"
        >
          <button 
            onClick={toggleTimer}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isActive 
                ? 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25' 
                : 'btn-primary !rounded-2xl shadow-[0_0_30px_rgba(var(--color-primary),0.15)]'
            }`}
          >
            {isActive ? <Pause fill="currentColor" size={22} /> : <Play fill="currentColor" size={22} className="ml-0.5" />}
          </button>
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-white/35 hover:bg-white/[0.08] hover:text-white/60 transition-all"
          >
            <RotateCcw size={20} />
          </button>
        </motion.div>

        {/* Skip Break */}
        {isBreak && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={skipBreak} 
            className="btn-ghost mt-6 text-xs"
          >
            <SkipForward size={12} /> Skip Break
          </motion.button>
        )}
      </main>
    </div>
  );
};

export default FocusTimer;
