import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ 
        duration: 0.25, 
        ease: [0.23, 1, 0.32, 1] // Polished cubic-bezier
      }}
      className="w-full min-h-screen relative"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
