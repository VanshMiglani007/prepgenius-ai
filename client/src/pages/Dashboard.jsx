import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Book, CheckSquare, CalendarDays, Target, TrendingUp, Sparkles, 
  Flame, Clock, ArrowRight, Zap, Brain, Play, BookOpen,
  BarChart3, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

/* ── Animated counter hook ── */
const useCountUp = (target, duration = 900, started = true) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = null;
    const initial = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(initial + (target - initial) * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return value;
};

/* ── Time-of-day greeting ── */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ── Motivational quotes ── */
const quotes = [
  "Small progress is still progress.",
  "Discipline is choosing between what you want now and what you want most.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Your future self will thank you for the work you put in today.",
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [stats, setStats] = useState({
    topicsCompleted: 0,
    totalTopics: 0,
    productivityScore: 0,
    dailyStudyHours: 0,
    overallProgress: 0,
    dailyGoalHours: 5,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setStats(res.data.data);
          setStatsLoaded(true);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setStatsLoaded(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (stats.dailyStudyHours >= stats.dailyGoalHours && stats.dailyStudyHours > 0) {
      if (!window._notifiedGoalToday) {
        showNotification(`🎯 You've reached your daily goal of ${stats.dailyGoalHours}h!`, 'success', 5000);
        window._notifiedGoalToday = true;
      }
    }
  }, [stats.dailyStudyHours, stats.dailyGoalHours, showNotification]);

  const animatedScore = useCountUp(stats.productivityScore, 1200, statsLoaded);
  const animatedStreak = useCountUp(stats.currentStreak, 800, statsLoaded);
  const animatedProgress = useCountUp(stats.overallProgress, 1000, statsLoaded);

  const progressPct = stats.dailyGoalHours > 0
    ? Math.min(100, (stats.dailyStudyHours / stats.dailyGoalHours) * 100)
    : 0;

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <div className="page-container">
      <main className="page-content">

        {/* ── Welcome Section ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {getGreeting()}, <span className="text-primary">{user?.name?.split(' ')[0] || 'User'}</span>
              </h1>
              <p className="text-sm text-white/30 italic max-w-md">"{quote}"</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Streak Badge */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 bg-orange-500/8 px-4 py-2 rounded-xl border border-orange-500/15 hover:border-orange-500/30 transition-colors"
              >
                <Flame size={16} className="text-orange-400" />
                <div>
                  <span className="text-sm font-bold text-orange-400 tabular-nums">{animatedStreak}</span>
                  <span className="text-[10px] text-orange-400/60 ml-1">day streak</span>
                </div>
              </motion.div>

              {/* Quick Focus Button */}
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25 }}
                onClick={() => navigate('/focus')}
                className="btn-primary px-4 py-2 text-sm"
              >
                <Play size={14} /> Focus Now
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
          >
            {[
              { label: 'Topics Done', value: stats.topicsCompleted, suffix: `/ ${stats.totalTopics}`, icon: <CheckSquare size={16} />, color: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
              { label: 'Study Today', value: stats.dailyStudyHours, suffix: 'h', icon: <Clock size={16} />, color: 'text-blue-400', iconBg: 'bg-blue-500/10' },
              { label: 'Productivity', value: animatedScore, suffix: '%', icon: <Zap size={16} />, color: 'text-violet-400', iconBg: 'bg-violet-500/10' },
              { label: 'Progress', value: animatedProgress, suffix: '%', icon: <TrendingUp size={16} />, color: 'text-amber-400', iconBg: 'bg-amber-500/10' },
            ].map((item, i) => (
              <motion.div key={item.label} variants={fadeUp} className="stat-card group">
                <div className="flex items-center justify-between mb-3">
                  <span className="label-text !mb-0">{item.label}</span>
                  <div className={`w-7 h-7 rounded-lg ${item.iconBg} flex items-center justify-center ${item.color} transition-transform group-hover:scale-110`}>
                    {item.icon}
                  </div>
                </div>
                <p className={`text-2xl font-bold ${item.color} tabular-nums leading-none`}>
                  {item.value}
                  <span className="text-xs font-normal text-white/25 ml-1">{item.suffix}</span>
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Quick Actions + Daily Goal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Daily Goal — takes 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-card p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="section-title text-base">
                  <Clock className="text-white/30" size={18} />
                  Daily Study Goal
                </h3>
                <p className="text-xs text-white/25 mt-0.5">Stay consistent for best results.</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white tabular-nums">{stats.dailyStudyHours}h</span>
                <span className="text-white/25 font-medium text-sm"> / {stats.dailyGoalHours}h</span>
              </div>
            </div>

            <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className={`h-full rounded-full ${progressPct >= 100
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-primary/70 to-primary'
                }`}
              />
            </div>

            <div className="flex justify-between text-[10px] text-white/25 uppercase tracking-wider font-medium">
              <span>{Math.round(progressPct)}% completed</span>
              {progressPct >= 100 && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckSquare size={10} /> Goal achieved!
                </span>
              )}
            </div>

            {/* Goal adjuster */}
            <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center gap-4">
              <span className="label-text !mb-0 whitespace-nowrap">Adjust Goal</span>
              <input
                type="range" min="1" max="12"
                value={stats.dailyGoalHours}
                onChange={async (e) => {
                  const val = parseInt(e.target.value);
                  setStats(prev => ({ ...prev, dailyGoalHours: val }));
                  try { await api.post('/auth/update-profile', { dailyGoalHours: val }); }
                  catch (err) { console.error("Failed to update goal:", err); }
                }}
                className="flex-1"
              />
              <span className="text-sm font-mono font-bold w-8 text-center text-white/40 tabular-nums">{stats.dailyGoalHours}h</span>
            </div>
          </motion.div>

          {/* AI Insight Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-colors" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Brain size={20} className="text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">AI Study Tip</h3>
              <p className="text-xs text-white/35 leading-relaxed">
                {stats.productivityScore < 50 
                  ? "Try shorter, focused study bursts. 25-minute sessions with 5-minute breaks can improve retention by up to 40%."
                  : stats.currentStreak > 3 
                    ? `Impressive ${stats.currentStreak}-day streak! Keep your momentum — consistency beats intensity.`
                    : "Start each session by reviewing yesterday's notes. Spaced repetition boosts long-term memory."
                }
              </p>
            </div>
            <button 
              onClick={() => navigate('/assistant')}
              className="mt-4 flex items-center gap-1.5 text-xs text-primary/60 hover:text-primary transition-colors font-medium relative z-10"
            >
              Ask AI for more <ChevronRight size={12} />
            </button>
          </motion.div>
        </div>

        {/* ── Navigation Cards ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {[
            { path: '/subjects', icon: <BookOpen />, title: 'Subjects', desc: 'Manage your classes & exams', color: 'text-blue-400' },
            { path: '/topics', icon: <CheckSquare />, title: 'Topics', desc: `${stats.topicsCompleted} / ${stats.totalTopics} completed`, color: 'text-emerald-400' },
            { path: '/study-plan', icon: <CalendarDays />, title: 'Study Plan', desc: 'AI-generated schedule', color: 'text-violet-400' },
            { path: '/timer', icon: <Target />, title: 'Focus Timer', desc: 'Pomodoro sessions', color: 'text-amber-400' },
            { path: '/analytics', icon: <BarChart3 />, title: 'Analytics', desc: 'Track performance', color: 'text-cyan-400' },
            { path: '/assistant', icon: <Sparkles />, title: 'AI Assistant', desc: 'Get study advice', color: 'text-fuchsia-400' },
          ].map(card => (
            <motion.div key={card.path} variants={fadeUp}>
              <button
                onClick={() => navigate(card.path)}
                className="action-card group text-left flex items-start gap-4 w-full"
              >
                <div className={`w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center ${card.color} group-hover:bg-primary/10 group-hover:text-primary transition-all duration-200 flex-shrink-0`}>
                  {React.cloneElement(card.icon, { size: 20, strokeWidth: 1.75 })}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold mb-0.5 text-white">{card.title}</h3>
                  <p className="text-xs text-white/30">{card.desc}</p>
                </div>
                <ArrowRight size={14} className="text-white/10 group-hover:text-primary/50 transition-colors mt-0.5 flex-shrink-0" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
