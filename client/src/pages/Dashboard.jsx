import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Book, CheckSquare, CalendarDays, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
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
      
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-primary/10 brand-border rounded-2xl py-8 px-10 mb-10 flex justify-between items-center"
        >
          <div>
            <h2 className="text-3xl font-bold mb-3 text-white">Welcome back, {user?.name?.split(' ')[0]}!</h2>
            <p className="text-white/85 text-base leading-relaxed">
              Your intelligent exam preparation planner. Organize subjects, manage topics, and optimize your study schedule.
            </p>
          </div>
          <div className="text-right hidden sm:block">
             <p className="text-sm text-primary font-semibold mb-1 uppercase tracking-wider">Productivity Score</p>
             <h1 className="text-5xl font-bold font-sans">{stats.productivityScore}%</h1>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVars}
          initial="hidden"
          animate="show"
        >
          {/* Action Card 1 */}
          <motion.div variants={itemVars} className="action-card flex flex-col items-center">
            <Book size={40} className="text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">Subjects</h3>
            <p className="text-sm text-white/70">Manage your classes</p>
          </motion.div>

          {/* Action Card 2 */}
          <motion.div variants={itemVars} className="action-card flex flex-col items-center">
            <CheckSquare size={40} className="text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">Topics</h3>
            <p className="text-sm text-white/70">{stats.topicsCompleted} / {stats.totalTopics} Completed</p>
          </motion.div>

          {/* Action Card 3 */}
          <motion.div variants={itemVars} className="action-card flex flex-col items-center">
            <CalendarDays size={40} className="text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">Study Plan</h3>
            <p className="text-sm text-white/70">Generate your schedule</p>
          </motion.div>

          {/* New Progress Insight */}
          <motion.div variants={itemVars} className="action-card flex flex-col items-center">
            <TrendingUp size={40} className="text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">Today's Focus</h3>
            <p className="text-sm text-white/70">{stats.dailyStudyHours} hrs completed</p>
          </motion.div>
        </motion.div>
      </main>

      <footer className="mt-auto text-center py-4 text-sm text-white/80">
        <p>PrepGenius AI — Intelligent Exam Preparation</p>
      </footer>
    </div>
  );
};

export default Dashboard;
