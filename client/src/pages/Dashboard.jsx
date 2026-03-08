import React, { useState, useEffect } from 'react';
import { Book, CheckSquare, CalendarDays, TrendingUp, Target, Flame, Edit, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

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
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  // Show achievement notification once
  useEffect(() => {
    if (stats.dailyStudyHours >= stats.dailyGoalHours && stats.dailyStudyHours > 0) {
       // Check if we haven't already notified in this session
       if (!window._notifiedGoalToday) {
          showNotification(`Congratulations! You've reached your daily goal of ${stats.dailyGoalHours} hours! ✨`, 'success', 5000);
          window._notifiedGoalToday = true;
       }
    }
  }, [stats.dailyStudyHours, stats.dailyGoalHours, showNotification]);
  
  // Animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-white">
      <main className="flex-1 px-8 md:px-10 max-w-7xl mx-auto w-full pt-4">
        <div 
          className="brand-border py-8 px-10 mb-10 text-left flex justify-between items-center"
        >
          <div>
            <h2 className="text-[28px] font-bold mb-3 text-white">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h2>
            <p className="text-white/85 text-[16px] leading-[1.6]">
              Your intelligent exam preparation planner. Organize subjects, manage topics, and optimize your study schedule.
            </p>
          </div>
          <div className="text-right hidden sm:flex flex-col items-end gap-2">
             <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">
                <Flame size={20} className="text-orange-500 fill-orange-500" />
                <span className="text-lg font-bold text-orange-500">{stats.currentStreak} Day Streak</span>
             </div>
             <div className="flex flex-col items-end">
                <p className="text-xs text-primary font-semibold mb-1 uppercase tracking-wider">Productivity Score</p>
                <h1 className="text-4xl font-bold font-sans text-white">{stats.productivityScore}%</h1>
             </div>
          </div>
        </div>

        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Action Card 1 */}
          <div onClick={() => navigate('/subjects')} className="action-card flex flex-col items-center">
            <Book size={36} strokeWidth={2.5} className="text-primary mb-[15px]" />
            <h3 className="text-[18px] font-semibold mb-[8px] text-white">Subjects</h3>
            <p className="text-[13px] text-white/70">Manage your classes</p>
          </div>

          {/* Action Card 2 */}
          <div onClick={() => navigate('/topics')} className="action-card flex flex-col items-center">
            <CheckSquare size={36} strokeWidth={2.5} className="text-primary mb-[15px]" />
            <h3 className="text-[18px] font-semibold mb-[8px] text-white">Topics</h3>
            <p className="text-[13px] text-white/70">{stats.topicsCompleted} / {stats.totalTopics} Completed</p>
          </div>

          {/* Action Card 3 */}
          <div onClick={() => navigate('/study-plan')} className="action-card flex flex-col items-center">
            <CalendarDays size={36} strokeWidth={2.5} className="text-primary mb-[15px]" />
            <h3 className="text-[18px] font-semibold mb-[8px] text-white">Study Plan</h3>
            <p className="text-[13px] text-white/70">Generate your schedule</p>
          </div>

          {/* Action Card 4 */}
          <div onClick={() => navigate('/timer')} className="action-card flex flex-col items-center">
            <Target size={36} strokeWidth={2.5} className="text-primary mb-[15px]" />
            <h3 className="text-[18px] font-semibold mb-[8px] text-white">Focus Timer</h3>
            <p className="text-[13px] text-white/70">Start a Pomodoro session</p>
          </div>

          {/* New Progress Insight */}
          <div onClick={() => navigate('/analytics')} className="action-card flex flex-col items-center sm:col-span-2 lg:col-span-1">
            <TrendingUp size={36} strokeWidth={2.5} className="text-primary mb-[15px]" />
            <h3 className="text-[18px] font-semibold mb-[8px] text-white">Analytics</h3>
            <p className="text-[13px] text-white/70">View your performance</p>
          </div>

          {/* AI Assistant Card */}
          <div onClick={() => navigate('/assistant')} className="action-card flex flex-col items-center bg-primary/10 border-primary shadow-[0_0_20px_rgba(0,212,255,0.15)]">
            <Sparkles size={36} strokeWidth={2.5} className="text-primary mb-[15px]" />
            <h3 className="text-[18px] font-semibold mb-[8px] text-white">AI Assistant</h3>
            <p className="text-[13px] text-white/70">Ask me anything</p>
          </div>
        </div>

        {/* Daily Study Goal Section */}
        <div className="mt-10 bg-dark-surface border border-white/10 rounded-2xl p-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1 w-full">
                 <div className="flex justify-between items-end mb-3">
                    <div>
                       <h3 className="text-xl font-bold flex items-center gap-2">
                          <Clock className="text-primary" size={24} />
                          Daily Study Goal
                       </h3>
                       <p className="text-sm text-white/50 mt-1">Consistency is key to mastering your subjects.</p>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-bold text-white">{stats.dailyStudyHours}h</span>
                       <span className="text-white/40 font-medium"> / {stats.dailyGoalHours}h</span>
                    </div>
                 </div>
                 
                 {/* Progress Bar Container */}
                 <div className="h-4 bg-dark-bg rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.min(100, (stats.dailyStudyHours / stats.dailyGoalHours) * 100)}%` }}
                       transition={{ duration: 1, ease: "easeOut" }}
                       className={`h-full relative ${
                          (stats.dailyStudyHours / stats.dailyGoalHours) >= 1 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                          : 'bg-gradient-to-r from-primary to-indigo-500'
                       }`}
                    >
                       {/* Subtle glow effect */}
                       <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </motion.div>
                 </div>
                 
                 <div className="flex justify-between mt-3 text-xs text-white/40 uppercase tracking-widest font-semibold">
                    <span>{Math.round((stats.dailyStudyHours / stats.dailyGoalHours) * 100)}% Completed</span>
                    {stats.dailyStudyHours >= stats.dailyGoalHours && (
                        <span className="text-green-400 font-bold">Goal Achieved! ✨</span>
                    )}
                 </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 w-full md:w-auto min-w-[200px]">
                 <p className="text-xs text-white/40 mb-3 uppercase tracking-tighter font-bold">Adjust Goal</p>
                 <div className="flex items-center gap-4">
                    <input 
                       type="range" 
                       min="1" 
                       max="12" 
                       value={stats.dailyGoalHours}
                       onChange={async (e) => {
                          const val = parseInt(e.target.value);
                          setStats(prev => ({ ...prev, dailyGoalHours: val }));
                          try {
                             await api.post('/auth/update-profile', { dailyGoalHours: val });
                             showNotification(`Daily goal updated to ${val} hours.`, 'info');
                          } catch (err) {
                             console.error("Failed to update goal:", err);
                             showNotification("Failed to update goal. Please try again.", "error");
                          }
                       }}
                       className="flex-1 accent-primary h-1.5 bg-dark-bg rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-lg font-mono font-bold w-10 text-center">{stats.dailyGoalHours}h</span>
                 </div>
              </div>
           </div>
        </div>
      </main>

    </div>
  );
};

export default Dashboard;
