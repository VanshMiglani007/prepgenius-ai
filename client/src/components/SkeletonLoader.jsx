import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  type = 'text', 
  width = '100%', 
  height = '1rem', 
  className = "",
  count = 1
}) => {
  const skeletons = Array.from({ length: count });

  const getStyle = () => {
    switch (type) {
      case 'circle': return 'rounded-full';
      case 'card': return 'rounded-2xl h-48';
      case 'list-item': return 'rounded-xl h-16';
      case 'dashboard-stat': return 'rounded-2xl h-24';
      case 'chart': return 'rounded-2xl h-72';
      default: return 'rounded-md';
    }
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {skeletons.map((_, i) => (
        <div 
          key={i} 
          className={`relative overflow-hidden bg-white/[0.03] border border-white/[0.05] ${getStyle()}`}
          style={{ width, height: type === 'text' ? height : undefined }}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5, 
              ease: "linear" 
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent shadow-[0_0_20px_rgba(255,255,255,0.02)]"
          />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
