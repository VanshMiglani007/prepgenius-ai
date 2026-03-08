import React, { useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, Play, AlertCircle, Sparkles, LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CalendarView from '../components/CalendarView';

const StudyPlan = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ hoursPerDay: 4, startDate: new Date().toISOString().split('T')[0] });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const generatePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/study-plan/generate', formData);
      if (res.data.success) {
        setPlan(res.data.data);
      } else {
        setError(res.data.message || 'Failed to generate plan.');
      }
    } catch (err) {
      console.error(err);
      setError('Error communicating with the planner engine. Ensure you have uncompleted Subjects and Topics active first.');
    } finally {
      setLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-white font-sans">
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full pt-24">
        
        {/* Header Setup */}
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="w-full md:w-1/3 space-y-8 sticky top-10">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <CalendarDays className="text-primary" size={32} />
                Study Planner
              </h1>
              <p className="text-white/60 text-sm">Our AI analyzes your exam urgency and topic difficulty to create the optimal study schedule.</p>
            </div>

            <div className="bg-dark-surface border border-primary/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,212,255,0.05)]">
               <form onSubmit={generatePlan} className="space-y-6">
                 <div>
                   <label className="block text-xs uppercase tracking-wider text-white/60 mb-2 font-semibold">Hours Per Day available</label>
                   <div className="flex items-center gap-3">
                     <Clock className="text-primary/70" size={20} />
                     <input 
                       type="number" 
                       min="1" max="16" step="0.5"
                       value={formData.hoursPerDay}
                       onChange={(e) => setFormData({...formData, hoursPerDay: Number(e.target.value)})}
                       className="w-full bg-dark-bg border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors text-lg"
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs uppercase tracking-wider text-white/60 mb-2 font-semibold">Start Date</label>
                   <input 
                     type="date" 
                     value={formData.startDate}
                     onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                     className="w-full bg-dark-bg border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors [color-scheme:dark] text-lg"
                   />
                 </div>

                 <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full relative overflow-hidden group inline-flex items-center justify-center gap-2 bg-primary text-dark-bg font-bold rounded-xl py-3 text-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                 >
                   <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                   {loading ? 'Analyzing...' : 'Generate New Plan'}
                   <Sparkles size={18} />
                 </button>
               </form>
               {error && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 text-sm text-red-200">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                 </motion.div>
               )}
            </div>
            
            {/* Quick Stats Panel */}
            {plan && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                   <p className="text-xs text-primary uppercase tracking-wider mb-1">Total Days</p>
                   <h3 className="text-3xl font-bold">{plan.totalDays}</h3>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                   <p className="text-xs text-primary uppercase tracking-wider mb-1">Total Hours</p>
                   <h3 className="text-3xl font-bold">{plan.totalHours}</h3>
                </div>
              </motion.div>
            )}
          </div>

          {/* View Container */}
          <div className="w-full md:w-2/3">
             {plan && !loading && (
                <div className="flex justify-end mb-6">
                   <div className="bg-dark-surface p-1 rounded-xl border border-white/10 flex gap-1">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-primary text-dark-bg' : 'text-white/40 hover:text-white'}`}
                      >
                         <LayoutList size={16} /> List
                      </button>
                      <button 
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-primary text-dark-bg' : 'text-white/40 hover:text-white'}`}
                      >
                         <CalendarIcon size={16} /> Calendar
                      </button>
                   </div>
                </div>
             )}

             {!plan && !loading && (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-white/10 rounded-2xl">
                  <CalendarDays size={64} className="mb-4 opacity-50" />
                  <h2 className="text-2xl font-semibold">No active study plan</h2>
                  <p className="max-w-xs mt-2 text-sm">Configure your parameters on the left to generate an optimized schedule.</p>
                </div>
             )}

             {loading && (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-6"></div>
                  <p className="text-primary animate-pulse font-medium tracking-wide">Crunching topic difficulty algorithms...</p>
                </div>
             )}

             {!loading && plan && plan.schedule && (
               <>
                 {viewMode === 'list' ? (
                   <motion.div 
                     initial="hidden" animate="show"
                     variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                     className="space-y-8"
                   >
                     {plan.schedule.map((day, dIdx) => {
                       const dateObj = new Date(day.date);
                       const isToday = day.date === new Date().toISOString().split('T')[0];

                       return (
                         <motion.div key={dIdx} variants={itemVariants} className="relative pl-8 md:pl-0">
                            {/* Timeline Connector */}
                            <div className="absolute left-[11px] top-10 bottom-[-40px] w-0.5 bg-white/10 hidden md:block z-0"></div>
                            
                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                              {/* Date Block */}
                              <div className="md:w-32 flex-shrink-0 pt-2 hidden md:block">
                                <div className={`text-right pr-6 border-r-2 ${isToday ? 'border-primary' : 'border-white/20'}`}>
                                   <p className="text-sm uppercase tracking-widest text-white/50">{dateObj.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                                   <h3 className={`text-2xl font-bold ${isToday ? 'text-primary' : ''}`}>
                                     {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                   </h3>
                                   {isToday && <span className="text-[10px] bg-primary text-dark-bg px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block">Today</span>}
                                </div>
                              </div>

                              {/* Mobile Date Header */}
                              <div className="md:hidden flex items-center justify-between border-b border-white/10 pb-2 mb-4">
                                 <h3 className="text-xl font-bold text-primary">
                                   {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                 </h3>
                                 <span className="text-sm text-white/50">{day.totalHours} hrs</span>
                              </div>

                              {/* Tasks Container */}
                              <div className="flex-1 space-y-3">
                                 {day.items.map((task, tIdx) => (
                                   <div key={tIdx} className="bg-dark-surface border border-white/5 hover:border-primary/40 transition-colors rounded-xl p-5 flex justify-between items-center group">
                                      <div>
                                         <p className="text-xs text-primary mb-1 uppercase tracking-wider font-semibold">{task.subjectName || 'Unassigned Subject'}</p>
                                         <h4 className="text-lg font-bold">{task.topicName}</h4>
                                         <div className="flex items-center gap-3 mt-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded-sm bg-white/5 font-medium
                                              ${task.difficulty === 'High' ? 'text-red-400' : task.difficulty === 'Medium' ? 'text-yellow-400' : 'text-green-400'}
                                            `}>
                                              {task.difficulty}
                                            </span>
                                            <span className="text-white/40 flex items-center gap-1">
                                              <Play size={10} className="opacity-60" /> {task.duration} hrs
                                            </span>
                                         </div>
                                      </div>
                                      
                                      {/* Future feature: Launch Pomodoro directly from study plan */}
                                      <button 
                                        onClick={() => navigate(`/timer?topic=${task.topicId}`)}
                                        className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:bg-primary hover:text-dark-bg transition-all group-hover:scale-110"
                                      >
                                        <Play size={16} className="ml-1" />
                                      </button>
                                   </div>
                                 ))}
                              </div>
                            </div>
                         </motion.div>
                       );
                     })}
                   </motion.div>
                 ) : (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <CalendarView schedule={plan.schedule} />
                   </motion.div>
                 )}
               </>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudyPlan;
