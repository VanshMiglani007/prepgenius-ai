import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CalendarView = ({ schedule }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Format schedule into a map for quick lookup: { "YYYY-MM-DD": [items] }
  const scheduleMap = schedule.reduce((acc, day) => {
    acc[day.date] = day.items;
    return acc;
  }, {});

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayStr = new Date().toISOString().split('T')[0];

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = startDayOfMonth(year, month);

  // Padding for previous month
  for (let i = 0; i < startDay; i++) {
    days.push({ day: null });
  }

  // Days of current month
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      day: i,
      date: dateStr,
      items: scheduleMap[dateStr] || []
    });
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <div className="bg-dark-surface border border-white/10 rounded-3xl p-6 lg:p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-bold">{currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
          <p className="text-sm text-white/50">Plan your study sessions for the month.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-full border border-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-full border border-white/10 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-4 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] uppercase tracking-widest text-white/40 font-bold py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-4">
        {days.map((d, idx) => {
          const isToday = d.date === todayStr;
          const hasItems = d.items?.length > 0;
          
          return (
            <div 
              key={idx} 
              onClick={() => d.day && setSelectedDay(d)}
              className={`
                min-h-[70px] md:min-h-[100px] border rounded-2xl p-2 transition-all cursor-pointer relative group
                ${!d.day ? 'border-transparent' : 'border-white/5 hover:border-primary/50 hover:bg-white/5'}
                ${isToday ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_rgba(0,212,255,0.05)]' : ''}
              `}
            >
              {d.day && (
                <>
                  <span className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-white/60'}`}>{d.day}</span>
                  {hasItems && (
                     <div className="mt-2 space-y-1 hidden md:block">
                        {d.items.slice(0, 2).map((item, i) => (
                           <div key={i} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded truncate font-medium">
                              {item.topicName}
                           </div>
                        ))}
                        {d.items.length > 2 && (
                           <div className="text-[8px] text-white/30 pl-1">+{d.items.length - 2} more</div>
                        )}
                     </div>
                  )}
                  {hasItems && (
                     <div className="absolute bottom-2 right-2 md:hidden">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                     </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Modal/Detail View */}
      <AnimatePresence>
        {selectedDay && selectedDay.items.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="mt-8 p-6 bg-dark-bg/50 border border-primary/30 rounded-2xl backdrop-blur-sm"
          >
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                   Schedule for {new Date(selectedDay.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </h3>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="text-xs uppercase tracking-tighter text-white/40 hover:text-white"
                >
                  Close
                </button>
             </div>
             <div className="space-y-3">
                {selectedDay.items.map((task, idx) => (
                   <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                      <div>
                        <p className="text-[10px] uppercase text-primary font-bold mb-1">{task.subjectName}</p>
                        <h4 className="font-semibold">{task.topicName}</h4>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="text-right">
                            <p className="text-xs text-white/40 flex items-center gap-1 justify-end"><Clock size={12}/> {task.duration}h</p>
                         </div>
                         <button 
                            onClick={() => navigate(`/timer?topic=${task.topicId}`)}
                            className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-dark-bg transition-all"
                         >
                            <Play size={14} fill="currentColor" />
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;
