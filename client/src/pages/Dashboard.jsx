import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, CheckSquare, CalendarDays, Target, TrendingUp, Sparkles, Flame, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

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

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) setStats(res.data.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (stats.dailyStudyHours >= stats.dailyGoalHours && stats.dailyStudyHours > 0) {
      if (!window._notifiedGoalToday) {
        showNotification(`You've reached your daily goal of ${stats.dailyGoalHours} hours!`, 'success', 5000);
        window._notifiedGoalToday = true;
      }
    }
  }, [stats.dailyStudyHours, stats.dailyGoalHours, showNotification]);

  return (
    <div className="min-h-screen flex flex-col text-white">
      <main className="flex-1 px-6 md:px-10 max-w-6xl mx-auto w-full pt-6 pb-10">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="brand-border py-7 px-8 mb-8 flex justify-between items-center"
        >
          <div>
            <h2 className="text-2xl font-bold mb-1.5 text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Organize subjects, manage topics, and stay on top of your study schedule.
            </p>
          </div>
          <div className="text-right hidden sm:flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-orange-500/8 px-3 py-1.5 rounded-lg border border-orange-500/15">
              <Flame size={16} className="text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">{stats.currentStreak} day streak</span>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[10px] text-white/35 font-medium uppercase tracking-wider">Productivity</p>
              <div className="flex items-end gap-0.5">
                <span className="text-3xl font-bold text-white">{stats.productivityScore}</span>
                <span className="text-sm font-semibold text-white/40 mb-0.5">%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action cards — simple hover lift, no 3D tilt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard onClick={() => navigate('/subjects')} icon={<Book />} title="Subjects" desc="Manage your classes" />
          <ActionCard onClick={() => navigate('/topics')} icon={<CheckSquare />} title="Topics" desc={`${stats.topicsCompleted} / ${stats.totalTopics} completed`} />
          <ActionCard onClick={() => navigate('/study-plan')} icon={<CalendarDays />} title="Study Plan" desc="Generate your schedule" />
          <ActionCard onClick={() => navigate('/timer')} icon={<Target />} title="Focus Timer" desc="Start a Pomodoro session" />
          <ActionCard onClick={() => navigate('/analytics')} icon={<TrendingUp />} title="Analytics" desc="View your performance" />
          <ActionCard onClick={() => navigate('/assistant')} icon={<Sparkles />} title="AI Assistant" desc="Ask me anything" />
        </div>

        {/* Daily Study Goal */}
        <div className="mt-8 bg-white/[0.02] border border-white/[0.07] rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="text-white/50" size={20} />
                    Daily Study Goal
                  </h3>
                  <p className="text-xs text-white/35 mt-1">Stay consistent day after day.</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-white">{stats.dailyStudyHours}h</span>
                  <span className="text-white/30 font-medium text-sm"> / {stats.dailyGoalHours}h</span>
                </div>
              </div>

              {/* Progress bar — clean gradient, no glow */}
              <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.dailyStudyHours / stats.dailyGoalHours) * 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${(stats.dailyStudyHours / stats.dailyGoalHours) >= 1
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                      : 'bg-gradient-to-r from-white/30 to-white/50'
                    }`}
                />
              </div>

              <div className="flex justify-between mt-2 text-[10px] text-white/30 uppercase tracking-wider font-medium">
                <span>{Math.round((stats.dailyStudyHours / stats.dailyGoalHours) * 100)}% completed</span>
                {stats.dailyStudyHours >= stats.dailyGoalHours && (
                  <span className="text-green-400 font-semibold">Goal achieved</span>
                )}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 w-full md:w-auto min-w-[180px]">
              <p className="text-[10px] text-white/30 mb-2 uppercase tracking-wider font-semibold">Adjust Goal</p>
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
                <span className="text-sm font-mono font-bold w-8 text-center text-white/60">{stats.dailyGoalHours}h</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* Simple card — lift 2px on hover, soft shadow, no 3D tilt, no glow */
const ActionCard = ({ onClick, icon, title, desc }) => (
  <button
    onClick={onClick}
    className="action-card group text-left flex flex-col"
  >
    <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center mb-4 text-white/60 group-hover:text-white transition-colors duration-150">
      {React.cloneElement(icon, { size: 20, strokeWidth: 2 })}
    </div>
    <h3 className="text-[15px] font-semibold mb-1 text-white">{title}</h3>
    <p className="text-xs text-white/40">{desc}</p>
  </button>
);

export default Dashboard;
