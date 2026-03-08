import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const ActivityHeatmap = ({ data = [] }) => {
  // Map data to a date string for lookup: { "YYYY-MM-DD": hours }
  const dataMap = useMemo(() => {
    return data.reduce((acc, curr) => {
      const dateStr = new Date(curr.date).toISOString().split('T')[0];
      acc[dateStr] = curr.dailyStudyHours;
      return acc;
    }, {});
  }, [data]);

  // Generate the last 12 weeks of days
  const weeks = useMemo(() => {
    const tempWeeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Go back to the Sunday of 12 weeks ago
    const start = new Date(today);
    start.setDate(today.getDate() - (12 * 7) + (7 - today.getDay()));
    
    let current = new Date(start);
    for (let w = 0; w < 12; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split('T')[0];
        const hours = dataMap[dateStr] || 0;
        week.push({
          date: dateStr,
          hours,
          isActive: current <= today
        });
        current.setDate(current.getDate() + 1);
      }
      tempWeeks.push(week);
    }
    return tempWeeks;
  }, [dataMap]);

  const getColor = (hours) => {
    if (hours === 0) return 'bg-white/5';
    if (hours < 1) return 'bg-primary/20';
    if (hours < 3) return 'bg-primary/40';
    if (hours < 5) return 'bg-primary/70';
    return 'bg-primary shadow-[0_0_10px_rgba(0,212,255,0.4)]';
  };

  return (
    <div className="bg-dark-surface border border-white/5 p-8 rounded-3xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
           Study Activity Heatmap
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-bold">
           <span>Less</span>
           <div className="w-3 h-3 rounded-sm bg-white/5"></div>
           <div className="w-3 h-3 rounded-sm bg-primary/20"></div>
           <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
           <div className="w-3 h-3 rounded-sm bg-primary/70"></div>
           <div className="w-3 h-3 rounded-sm bg-primary shadow-[0_0_5px_rgba(0,212,255,0.3)]"></div>
           <span>More</span>
        </div>
      </div>

      <div className="flex gap-2 justify-between">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-2">
            {week.map((day, dIdx) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (wIdx * 7 + dIdx) * 0.005 }}
                className={`w-4 h-4 md:w-5 md:h-5 rounded-sm transition-all relative group ${getColor(day.hours)} ${!day.isActive ? 'opacity-20' : ''}`}
                title={`${day.date}: ${day.hours} hrs`}
              >
                 {/* Tooltip on hover */}
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-bg border border-white/10 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {day.hours}h
                 </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-[10px] text-white/30 uppercase tracking-widest font-bold px-1">
         <span>90 Days Ago</span>
         <span>Recent</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
