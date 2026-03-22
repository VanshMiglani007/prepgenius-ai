import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, CheckSquare, CalendarDays, Target, TrendingUp, Sparkles, Flame, Clock, ArrowRight } from 'lucide-react';
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

  const progressPct = stats.dailyGoalHours > 0
    ? Math.min(100, (stats.dailyStudyHours / stats.dailyGoalHours) * 100)
    : 0;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const cardVariant = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <main className="flex-1 px-6 md:px-10 max-w-6xl mx-auto w-full pt-6 pb-10">

        {/* ── Welcome banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="brand-border py-6 px-8 mb-6 flex justify-between items-center"
        >
          <div>
            <h2 className="text-2xl font-bold mb-1 text-white">
              Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'User'}</span>
            </h2>
            <p className="text-white/45 text-sm">
              Organize subjects, manage topics, and stay on top of your study schedule.
            </p>
          </div>
          <div className="text-right hidden sm:flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-orange-500/8 px-3 py-1.5 rounded-lg border border-orange-500/15 transition-all hover:border-orange-500/30">
              <Flame size={15} className="text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">{animatedStreak} day streak</span>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Productivity</p>
              <div className="flex items-end gap-0.5">
                <span className="text-3xl font-bold text-white tabular-nums">{animatedScore}</span>
                <span className="text-sm font-semibold text-white/40 mb-0.5">%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stat pills row ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
          >
            {[
              { label: 'Topics Done', value: stats.topicsCompleted, suffix: `/ ${stats.totalTopics}`, color: 'text-emerald-400' },
              { label: 'Study Hours Today', value: stats.dailyStudyHours, suffix: 'h', color: 'text-blue-400' },
              { label: 'Overall Progress', value: stats.overallProgress, suffix: '%', color: 'text-violet-400' },
              { label: 'Daily Goal', value: stats.dailyGoalHours, suffix: 'h target', color: 'text-amber-400' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.25 }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-white/10 transition-colors duration-200"
              >
                <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-1">{item.label}</p>
                <p className={`text-lg font-bold ${item.color} tabular-nums`}>
                  {item.value}<span className="text-xs font-normal text-white/30 ml-1">{item.suffix}</span>
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Action cards ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[
            { path: '/subjects', icon: <Book />, title: 'Subjects', desc: 'Manage your classes' },
            { path: '/topics', icon: <CheckSquare />, title: 'Topics', desc: `${stats.topicsCompleted} / ${stats.totalTopics} completed` },
            { path: '/study-plan', icon: <CalendarDays />, title: 'Study Plan', desc: 'Generate your schedule' },
            { path: '/timer', icon: <Target />, title: 'Focus Timer', desc: 'Start a Pomodoro session' },
            { path: '/analytics', icon: <TrendingUp />, title: 'Analytics', desc: 'View your performance' },
            { path: '/assistant', icon: <Sparkles />, title: 'AI Assistant', desc: 'Ask me anything' },
          ].map(card => (
            <motion.div key={card.path} variants={cardVariant}>
              <ActionCard onClick={() => navigate(card.path)} icon={card.icon} title={card.title} desc={card.desc} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Daily Study Goal ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="mt-6 bg-white/[0.02] border border-white/[0.06] rounded-xl p-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Clock className="text-white/40" size={18} />
                    Daily Study Goal
                  </h3>
                  <p className="text-xs text-white/30 mt-0.5">Stay consistent day after day.</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-white tabular-nums">{stats.dailyStudyHours}h</span>
                  <span className="text-white/30 font-medium text-sm"> / {stats.dailyGoalHours}h</span>
                </div>
              </div>

              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                  className={`h-full rounded-full ${progressPct >= 100
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : 'bg-gradient-to-r from-primary/60 to-primary'
                  }`}
                />
              </div>

              <div className="flex justify-between mt-2 text-[10px] text-white/30 uppercase tracking-wider font-medium">
                <span>{Math.round(progressPct)}% completed</span>
                {progressPct >= 100 && (
                  <span className="text-green-400 font-semibold">🎯 Goal achieved!</span>
                )}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 w-full md:w-auto min-w-[180px]">
              <p className="text-[10px] text-white/25 mb-2 uppercase tracking-wider font-semibold">Adjust Goal</p>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="1" max="12"
                  value={stats.dailyGoalHours}
                  onChange={async (e) => {
                    const val = parseInt(e.target.value);
                    setStats(prev => ({ ...prev, dailyGoalHours: val }));
                    try {
                      await api.post('/auth/update-profile', { dailyGoalHours: val });
                    } catch (err) {
                      console.error("Failed to update goal:", err);
                    }
                  }}
                  className="flex-1 h-1 bg-white/10 rounded-lg appearance-none accent-white/60"
                />
                <span className="text-sm font-mono font-bold w-8 text-center text-white/50">{stats.dailyGoalHours}h</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

/* Action card with clean hover lift */
const ActionCard = ({ onClick, icon, title, desc }) => (
  <button
    onClick={onClick}
    className="action-card group text-left flex flex-col w-full"
  >
    <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center mb-4 text-white/50 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-200">
      {React.cloneElement(icon, { size: 20, strokeWidth: 1.75 })}
    </div>
    <h3 className="text-[15px] font-semibold mb-1 text-white">{title}</h3>
    <p className="text-xs text-white/35 flex-1">{desc}</p>
    <div className="mt-3 flex items-center gap-1 text-[11px] text-white/20 group-hover:text-primary/60 transition-colors duration-200">
      <span>Open</span>
      <ArrowRight size={11} />
    </div>
  </button>
);

export default Dashboard;
