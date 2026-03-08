import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import { X, CheckCircle, AlertCircle, Info, Flame } from 'lucide-react';

const Toaster = () => {
  const { notifications } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-400" size={20} />;
      case 'error': return <AlertCircle className="text-red-400" size={20} />;
      case 'streak': return <Flame className="text-orange-500 fill-orange-500" size={20} />;
      default: return <Info className="text-primary" size={20} />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success': return 'border-green-500/30 bg-green-500/10';
      case 'error': return 'border-red-500/30 bg-red-500/10';
      case 'streak': return 'border-orange-500/30 bg-orange-500/10';
      default: return 'border-primary/30 bg-primary/10';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 backdrop-blur-md shadow-lg ${getBgColor(n.type)}`}
          >
            <div className="flex-shrink-0">{getIcon(n.type)}</div>
            <p className="flex-1 text-sm font-medium text-white/90 leading-tight">{n.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;
