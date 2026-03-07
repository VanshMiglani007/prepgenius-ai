import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Book, CheckSquare, CalendarDays, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    topicsCompleted: 0,
    totalTopics: 0,
    productivityScore: 0,
    dailyStudyHours: 0,
    overallProgress: 0,
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
      <Navbar />
      
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
          <div className="text-right hidden sm:block">
             <p className="text-sm text-primary font-semibold mb-1 uppercase tracking-wider">Productivity Score</p>
             <h1 className="text-5xl font-bold font-sans text-white">{stats.productivityScore}%</h1>
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
            <h3 className="text-[18px] font-semibold mb-[8px] text-white">Today's Focus</h3>
            <p className="text-[13px] text-white/70">{stats.dailyStudyHours} hrs completed</p>
          </div>
        </div>
      </main>

      <footer className="mt-auto text-center py-4 text-sm text-white/80">
        <p>PrepGenius AI — Intelligent Exam Preparation</p>
      </footer>
    </div>
  );
};

export default Dashboard;
