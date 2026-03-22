import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Target, BarChart2, TrendingUp, Calendar, Clock } from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ActivityHeatmap from '../components/ActivityHeatmap';

const Analytics = () => {
  const { user } = useAuth();
  const { activeTheme } = useTheme();
  const primaryColor = `rgb(${activeTheme.primary})`;
  const [stats, setStats] = useState({
    topicsCompleted: 0,
    totalTopics: 0,
    productivityScore: 0,
    dailyStudyHours: 0,
    overallProgress: 0,
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
          setStats(prev => ({
            ...prev,
            ...dashRes.data.data
          }));
        }

        if (dailyRes.data.success) {
           setStats(prev => ({
             ...prev,
             historicalData: dailyRes.data.data.analytics
           }));
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-white">
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full relative pt-24">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="text-primary" size={32} />
            Performance Analytics
          </h1>
          <p className="text-white/60">Visualize your productivity, track study hours, and monitor completed topics.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 relative z-10">
        {[  
          { label: "Today's Focus", value: `${stats.dailyStudyHours}`, unit: 'hrs', sub: `${stats.dailyStudyHours > 0 ? 'Active today' : 'No sessions yet'}`, color: primaryColor, icon: <Clock size={20} className="text-primary" />, border: 'border-primary' },
          { label: "Productivity Level", value: `${stats.productivityScore}`, unit: '%', sub: null, color: '#818cf8', icon: <BarChart2 size={20} className="text-indigo-400" />, border: 'border-indigo-400', progress: stats.productivityScore, progressColor: 'bg-indigo-400' },
          { label: "Topics Mastered", value: `${stats.topicsCompleted}`, unit: `/ ${stats.totalTopics}`, sub: 'Total active curriculum', color: '#34d399', icon: <Calendar size={20} className="text-emerald-400" />, border: 'border-emerald-400' },
          { label: "Overall Progress", value: `${stats.overallProgress}`, unit: '%', sub: null, color: '#e879f9', icon: <TrendingUp size={20} className="text-fuchsia-400" />, border: 'border-fuchsia-400', progress: stats.overallProgress, progressColor: 'bg-fuchsia-400' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className={`bg-dark-surface border-t-4 ${card.border} p-6 rounded-2xl hover:-translate-y-1 transition-transform shadow-lg`}
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xs uppercase tracking-wider text-white/50 font-semibold">{card.label}</h4>
              {card.icon}
            </div>
            <p className="text-4xl font-bold text-white mb-1 tabular-nums">
              {card.value} <span className="text-lg text-white/30 font-medium">{card.unit}</span>
            </p>
            {card.sub && <p className="text-xs text-white/40">{card.sub}</p>}
            {card.progress !== undefined && (
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                <div className={`${card.progressColor} h-1.5 rounded-full transition-all duration-1000`} style={{ width: `${card.progress}%` }} />
              </div>
            )}
          </motion.div>
        ))}
        </div>

        {/* Heatmap Section */}
        <div className="mb-10">
           <ActivityHeatmap data={stats.historicalData} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 bg-dark-surface border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <BarChart2 className="text-primary" size={24} /> Learning Velocity (Past 7 Days)
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: `${primaryColor.replace(')', ', 0.05)').replace('rgb', 'rgba')}` }}
                      contentStyle={{ backgroundColor: '#1a1a2e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: primaryColor, fontWeight: 'bold' }}
                    />
                    <Bar dataKey="hours" name="Study Hours" fill={primaryColor} radius={[6, 6, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-dark-surface border border-white/5 p-8 rounded-3xl flex flex-col justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full"></div>
              <Target size={48} className="mx-auto text-primary/40 mb-4 relative z-10" />
              <h3 className="text-2xl font-bold mb-2 relative z-10">Keep the momentum!</h3>
              <p className="text-white/60 text-sm mb-6 relative z-10">Your spaced repetition algorithm predicts optimal memory retention if you review topics within 48 hours.</p>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 relative z-10">
                 <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">Recommendation</p>
                 <p className="text-sm font-medium">Complete 1 Pomodoro session today to reach your weekly streak goal.</p>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default Analytics;
