import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Target, BarChart2, TrendingUp, Calendar, Clock } from 'lucide-react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const { user } = useAuth();
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
    ]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          // Merge real backend data with the default structure
          setStats(prev => ({
            ...prev,
            ...res.data.data
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
      <Navbar />
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full relative">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="text-primary" size={32} />
            Performance Analytics
          </h1>
          <p className="text-white/60">Visualize your productivity, track study hours, and monitor completed topics.</p>
        </div>
        
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 relative z-10">
          <div className="bg-dark-surface border-t-4 border-primary p-6 rounded-2xl hover:-translate-y-1 transition-transform shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xs uppercase tracking-wider text-white/50 font-semibold">Today's Focus</h4>
              <Clock size={20} className="text-primary" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.dailyStudyHours} <span className="text-lg text-white/30 font-medium">hrs</span></p>
            <p className="text-xs text-green-400">+1.2 hrs from yesterday</p>
          </div>
          
          <div className="bg-dark-surface border-t-4 border-indigo-400 p-6 rounded-2xl hover:-translate-y-1 transition-transform shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xs uppercase tracking-wider text-white/50 font-semibold">Productivity Level</h4>
              <BarChart2 size={20} className="text-indigo-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.productivityScore}%</p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
              <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${stats.productivityScore}%` }}></div>
            </div>
          </div>
          
          <div className="bg-dark-surface border-t-4 border-emerald-400 p-6 rounded-2xl hover:-translate-y-1 transition-transform shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xs uppercase tracking-wider text-white/50 font-semibold">Topics Mastered</h4>
              <Calendar size={20} className="text-emerald-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.topicsCompleted} <span className="text-lg text-white/30 font-medium">/ {stats.totalTopics}</span></p>
            <p className="text-xs text-white/40">Total active curriculum</p>
          </div>

          <div className="bg-dark-surface border-t-4 border-fuchsia-400 p-6 rounded-2xl hover:-translate-y-1 transition-transform shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xs uppercase tracking-wider text-white/50 font-semibold">Overall Course Progress</h4>
              <TrendingUp size={20} className="text-fuchsia-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.overallProgress}%</p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
              <div className="bg-fuchsia-400 h-1.5 rounded-full" style={{ width: `${stats.overallProgress}%` }}></div>
            </div>
          </div>
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
                      cursor={{ fill: 'rgba(0,212,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#1a1a2e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#00d4ff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="hours" name="Study Hours" fill="#00d4ff" radius={[6, 6, 0, 0]} maxBarSize={50} />
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
