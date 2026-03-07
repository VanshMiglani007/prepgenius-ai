import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, RotateCcw, Target, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

const FocusTimer = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  
  // Timer states
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
        if (res.data.success) {
          setTopics(res.data.data.topics || []);
        }
      } catch (err) {
        console.error("Failed to load topics:", err);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      handleTimerComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    
    // Stop the study session in background
    if (sessionId) {
      try {
        await api.put(`/sessions/${sessionId}/end`);
        setSessionId(null);
      } catch (err) {
        console.error("Failed to end session:", err);
      }
    }

    if (!isBreak) {
      // Finished working, start break
      setIsBreak(true);
      setTimeLeft(BREAK_TIME);
      // Automatically maybe? Lets just reset and let user start break
    } else {
      // Finished break, back to work
      setIsBreak(false);
      setTimeLeft(WORK_TIME);
    }
  };

  const toggleTimer = async () => {
    if (!selectedTopic && !isBreak) {
      setError("Please select a topic before starting a focus session.");
      return;
    }
    setError("");

    if (!isActive) {
      // Starting
      if (!isBreak && !sessionId) {
        // Log start of work session to DB
        try {
          const res = await api.post('/sessions/start', {
            topicId: selectedTopic,
            sessionType: 'focus'
          });
          if (res.data.success) {
            setSessionId(res.data.data.session._id);
          }
        } catch (err) {
          console.error("Failed to start session:", err);
          setError("Failed to register session with server.");
          return;
        }
      }
      setIsActive(true);
    } else {
      // Pausing
      setIsActive(false);
      clearInterval(timerRef.current);
    }
  };

  const resetTimer = async () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
    
    // Attempt deleting or ignoring the short session if reset
    if (sessionId) {
       try {
         // Optionally you could call api.delete(`/sessions/${sessionId}`) if you want to trash it
         // But ending it immediately is safer
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
    <div className="min-h-screen flex flex-col bg-dark-bg text-white">
      <Navbar />

      <main className="flex-1 p-10 max-w-7xl mx-auto w-full flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Target className="text-primary" size={32} />
            Pomodoro Focus
          </h1>
          <p className="text-white/60">Laser focus your attention to maximize your productivity score.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Topic Selector */}
        {!isBreak && (
          <div className="w-full max-w-md mb-10 z-10">
            <label className="block text-xs uppercase tracking-wider text-white/60 mb-2 font-semibold text-center">Focusing On</label>
            <select 
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setError('');
              }}
              disabled={isActive}
              className="w-full bg-dark-surface border border-white/20 rounded-xl px-4 py-4 text-white hover:cursor-pointer outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option className="bg-white text-black" value="">-- Select a Topic --</option>
              {topics.map(t => (
                <option className="bg-white text-black" key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        {isBreak && (
           <div className="w-full max-w-md mb-10 text-center">
              <h3 className="text-2xl font-bold text-green-400">Break Time</h3>
              <p className="text-white/60">Rest your eyes and recharge.</p>
           </div>
        )}

        {/* Timer Circle */}
        <div className="w-72 h-72 md:w-96 md:h-96 relative">
           {/* Glow Effect */}
           <div className={`absolute inset-0 rounded-full blur-[60px] opacity-20 transition-colors duration-1000 ${isBreak ? 'bg-green-500' : 'bg-primary'}`}></div>
           
           <CircularProgressbar
              value={getPercentage()}
              text={formatTime(timeLeft)}
              strokeWidth={4}
              styles={buildStyles({
                textColor: '#fff',
                pathColor: isBreak ? '#4ade80' : '#00d4ff',
                trailColor: 'rgba(255,255,255,0.05)',
                pathTransitionDuration: 0.5,
              })}
            />
        </div>

        {/* Controls */}
        <div className="flex gap-6 mt-12 z-10">
          <button 
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 ${
              isActive 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                : 'bg-primary text-dark-bg hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]'
            }`}
          >
            {isActive ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
          </button>
          
          <button 
            onClick={resetTimer}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-all shadow-lg hover:scale-105"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        {isBreak && (
          <button onClick={skipBreak} className="mt-8 text-white/40 hover:text-white transition-colors text-sm hover:underline">
            Skip Break
          </button>
        )}
      </main>
    </div>
  );
};

export default FocusTimer;
