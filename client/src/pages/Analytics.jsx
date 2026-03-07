import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Target, BarChart2, TrendingUp, Calendar, Clock } from 'lucide-react';
import api from '../services/api';

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    topicsCompleted: 0,
    totalTopics: 0,
    productivityScore: 0,
    dailyStudyHours: 0,
    overallProgress: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setStats(res.data.data);
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
            Today's Focus & Analytics
          </h1>
          <p className="text-white/60">Track your productivity score, study hours, and performance trends.</p>
        </div>
        
        <div className="bg-dark-surface border border-primary/20 rounded-3xl p-10 text-center relative overflow-hidden">
           {/* Decorative background glow */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

           <Target size={64} className="mx-auto text-primary/40 mb-6 relative z-10" />
           <h2 className="text-3xl font-bold mb-4 text-white relative z-10">Advanced Analytics Engine</h2>
           <p className="text-white/60 max-w-xl mx-auto mb-10 relative z-10">
             We are currently crunching your study data history. Detailed statistical charts, Spaced Repetition efficiency graphs, and Focus tracking will appear here soon.
           </p>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 relative z-10">
             <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center hover:border-primary/50 transition-colors">
               <Clock size={32} strokeWidth={1.5} className="text-primary mb-3" />
               <h4 className="text-xs uppercase tracking-wider text-white/40 mb-1">Today's Focus</h4>
               <p className="text-3xl font-bold text-white">{stats.dailyStudyHours} <span className="text-lg text-white/50">hrs</span></p>
             </div>
             
             <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center hover:border-primary/50 transition-colors">
               <BarChart2 size={32} strokeWidth={1.5} className="text-primary mb-3" />
               <h4 className="text-xs uppercase tracking-wider text-white/40 mb-1">Productivity Score</h4>
               <p className="text-3xl font-bold text-white">{stats.productivityScore}%</p>
             </div>
             
             <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center hover:border-primary/50 transition-colors">
               <Calendar size={32} strokeWidth={1.5} className="text-primary mb-3" />
               <h4 className="text-xs uppercase tracking-wider text-white/40 mb-1">Topics Completed</h4>
               <p className="text-3xl font-bold text-white">{stats.topicsCompleted} <span className="text-lg text-white/50">/ {stats.totalTopics}</span></p>
             </div>

             <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center hover:border-primary/50 transition-colors">
               <TrendingUp size={32} strokeWidth={1.5} className="text-primary mb-3" />
               <h4 className="text-xs uppercase tracking-wider text-white/40 mb-1">Overall Progress</h4>
               <p className="text-3xl font-bold text-white">{stats.overallProgress}%</p>
             </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
