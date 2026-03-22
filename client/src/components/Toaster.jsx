import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import { X, CheckCircle, AlertCircle, Info, Flame } from 'lucide-react';

const getIcon = (type) => {
  switch (type) {
    case 'success': return <CheckCircle className="text-green-400 flex-shrink-0" size={18} />;
    case 'error': return <AlertCircle className="text-red-400 flex-shrink-0" size={18} />;
    case 'streak': return <Flame className="text-orange-500 fill-orange-500 flex-shrink-0" size={18} />;
    default: return <Info className="text-primary flex-shrink-0" size={18} />;
  }
};

const getBorderColor = (type) => {
  switch (type) {
    case 'success': return 'border-green-500/30';
    case 'error': return 'border-red-500/30';
    case 'streak': return 'border-orange-500/30';
    default: return 'border-primary/30';
  }
};

const getProgressColor = (type) => {
  switch (type) {
    case 'success': return 'bg-green-500';
    case 'error': return 'bg-red-500';
    case 'streak': return 'bg-orange-500';
    default: return 'bg-primary';
  }
};

const Toast = ({ notification, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const duration = notification.duration || 3000;

  useEffect(() => {
    const interval = 30;
    const step = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress(prev => Math.max(0, prev - step));
    }, interval);
    return () => clearInterval(timer);
  }, [duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative flex items-start gap-3 px-4 pt-3.5 pb-4 rounded-xl border backdrop-blur-md shadow-xl overflow-hidden bg-[#13131f] ${getBorderColor(notification.type)}`}
      style={{ minWidth: '280px', maxWidth: '360px' }}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <div
          className={`h-full rounded-full transition-none ${getProgressColor(notification.type)}`}
          style={{ width: `${progress}%`, transition: 'width 30ms linear', opacity: 0.6 }}
        />
      </div>

      {getIcon(notification.type)}

      <p className="flex-1 text-sm font-medium text-white/88 leading-snug pt-0.5">
        {notification.message}
      </p>

      <button
        onClick={() => onDismiss(notification.id)}
        className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors mt-0.5"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

const Toaster = () => {
  const { notifications, dismissNotification } = useNotification();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <Toast key={n.id} notification={n} onDismiss={dismissNotification} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;
