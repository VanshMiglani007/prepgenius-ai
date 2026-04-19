import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const ActivityHeatmap = ({ data = [] }) => {
  const dataMap = useMemo(() => {
    return data.reduce((acc, curr) => {
      const dateStr = new Date(curr.date).toISOString().split('T')[0];
      acc[dateStr] = curr.dailyStudyHours;
      return acc;
    }, {});
  }, [data]);

  const weeks = useMemo(() => {
    const tempWeeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(today.getDate() - (12 * 7) + (7 - today.getDay()));
    
    let current = new Date(start);
    for (let w = 0; w < 12; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split('T')[0];
        const hours = dataMap[dateStr] || 0;
        week.push({ date: dateStr, hours, isActive: current <= today });
        current.setDate(current.getDate() + 1);
      }
      tempWeeks.push(week);
    }
    return tempWeeks;
  }, [dataMap]);

  const totalHours = useMemo(() => {
    return Object.values(dataMap).reduce((sum, h) => sum + h, 0);
  }, [dataMap]);

  const activeDays = useMemo(() => {
    return Object.values(dataMap).filter(h => h > 0).length;
  }, [dataMap]);

  const getColor = (hours) => {
    if (hours === 0) return 'bg-white/[0.04]';
    if (hours < 1) return 'bg-primary/20';
    if (hours < 3) return 'bg-primary/40';
    if (hours < 5) return 'bg-primary/65';
    return 'bg-primary';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h3 className="section-title text-base">
            <Activity size={18} className="text-primary" />
            Study Activity
          </h3>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-[11px] text-white/25">{Math.round(totalHours * 10) / 10}h total</span>
            <span className="text-[11px] text-white/25">{activeDays} active days</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/25 font-medium">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-white/[0.04]" />
          <div className="w-3 h-3 rounded-sm bg-primary/20" />
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <div className="w-3 h-3 rounded-sm bg-primary/65" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-[3px] justify-between overflow-x-auto pb-1">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-[3px]">
            {week.map((day, dIdx) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (wIdx * 7 + dIdx) * 0.003, duration: 0.2 }}
                className={`w-[14px] h-[14px] md:w-[18px] md:h-[18px] rounded-[3px] transition-all relative group ${getColor(day.hours)} ${!day.isActive ? 'opacity-15' : 'hover:ring-1 hover:ring-white/20'}`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#13131f] border border-white/[0.08] rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl">
                  <span className="text-white/50">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  <span className="text-primary font-semibold ml-1">{day.hours}h</span>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-3 text-[9px] text-white/20 uppercase tracking-widest font-semibold px-0.5">
        <span>90 days ago</span>
        <span>Recent</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
