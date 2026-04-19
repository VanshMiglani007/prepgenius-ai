import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Target, BarChart2, TrendingUp, Calendar, Clock, Flame, Zap } from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ActivityHeatmap from '../components/ActivityHeatmap';

const Analytics = () => {
  const { user } = useAuth();
  const { activeTheme } = useTheme();
  const primaryColor = `rgb(${activeTheme.primary})`;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    topicsCompleted: 0,
    totalTopics: 0,
    productivityScore: 0,
    dailyStudyHours: 0,
    overallProgress: 0,
    currentStreak: 0,
    weeklyData: [
      { name: 'Mon', hours: 0 },
      { name: 'Tue', hours: 0 },
      { name: 'Wed', hours: 0 },
      { name: 'Thu', hours: 0 },
      { name: 'Fri', hours: 0 },
      { name: 'Sat', hours: 0 },
      { name: 'Sun', hours: 0 },
    ],
    historicalData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashRes, dailyRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/daily')
        ]);

        if (dashRes.data.success) {
          setStats(prev => ({ ...prev, ...dashRes.data.data }));
        }
        if (dailyRes.data.success) {
          setStats(prev => ({ ...prev, historicalData: dailyRes.data.data.analytics }));
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  const statCards = [
    { 
      label: "Today's Focus", value: stats.dailyStudyHours, unit: 'hrs',
      sub: stats.dailyStudyHours > 0 ? 'Active today' : 'No sessions yet',
      icon: <Clock size={18} />, color: 'text-primary', iconBg: 'bg-primary/10',
      borderColor: 'border-primary/30'
    },
    { 
      label: "Productivity", value: stats.productivityScore, unit: '%', 
      icon: <Zap size={18} />, color: 'text-violet-400', iconBg: 'bg-violet-500/10',
      borderColor: 'border-violet-400/30',
      progress: stats.productivityScore, progressColor: 'bg-violet-400'
    },
    { 
      label: "Topics Mastered", value: stats.topicsCompleted, unit: `/ ${stats.totalTopics}`,
      sub: 'Total active topics',
      icon: <Target size={18} />, color: 'text-emerald-400', iconBg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-400/30'
    },
    { 
      label: "Overall Progress", value: stats.overallProgress, unit: '%',
      icon: <TrendingUp size={18} />, color: 'text-amber-400', iconBg: 'bg-amber-500/10',
      borderColor: 'border-amber-400/30',
      progress: stats.overallProgress, progressColor: 'bg-amber-400'
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#13131f] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
          <p className="text-[11px] text-white/40 mb-1">{label}</p>
          <p className="text-sm font-bold" style={{ color: primaryColor }}>
            {payload[0].value}h studied
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <main className="page-content !max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        >
          <div>
            <h1 className="page-title">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="text-primary" size={20} />
              </div>
              Performance Analytics
            </h1>
            <p className="page-description">Visualize productivity, track study hours, and monitor progress.</p>
          </div>
          {stats.currentStreak > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 bg-orange-500/8 px-4 py-2 rounded-xl border border-orange-500/15"
            >
              <Flame size={16} className="text-orange-400" />
              <span className="text-sm font-bold text-orange-400">{stats.currentStreak} day streak</span>
            </motion.div>
          )}
        </motion.div>
        
        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />)}
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <motion.div
                key={card.label}
                variants={fadeUp}
                className={`glass-card p-5 border-t-2 ${card.borderColor} group`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="label-text !mb-0">{card.label}</span>
                  <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-1 tabular-nums">
                  {card.value} <span className="text-sm text-white/25 font-medium">{card.unit}</span>
                </p>
                {card.sub && <p className="text-[11px] text-white/30">{card.sub}</p>}
                {card.progress !== undefined && (
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${card.progress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`${card.progressColor} h-1.5 rounded-full`}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <ActivityHeatmap data={stats.historicalData} />
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-card p-6"
          >
            <h3 className="section-title text-base mb-6">
              <BarChart2 className="text-primary" size={18} />
              Learning Velocity
              <span className="text-[10px] text-white/20 font-normal ml-2 uppercase tracking-wider">Past 7 days</span>
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="hours" name="Study Hours" fill={primaryColor} radius={[8, 8, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Insight Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-[50px]" />
            <div className="relative z-10">
              <Target size={40} className="text-primary/30 mb-4" />
              <h3 className="text-lg font-bold mb-2">Keep the momentum!</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                Your spaced repetition algorithm predicts optimal retention if you review topics within 48 hours.
              </p>
            </div>
            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] relative z-10">
              <p className="label-text text-emerald-400 !tracking-widest">Recommendation</p>
              <p className="text-sm font-medium text-white/70">
                Complete 1 Pomodoro session today to maintain your weekly streak goal.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
