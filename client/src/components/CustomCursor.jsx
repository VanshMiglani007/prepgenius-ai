import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });
  
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a');
        
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <motion.div
      style={{
        translateX: springX,
        translateY: springY,
        left: -12,
        top: -12,
      }}
      animate={{
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? '#22d3ee' : '#22d3eeCC',
        boxShadow: isHovering 
            ? '0 0 25px rgba(34, 211, 238, 0.8), 0 0 10px rgba(0, 212, 255, 0.4)' 
            : '0 0 15px rgba(34, 211, 238, 0.4)',
      }}
      className="fixed w-6 h-6 rounded-full pointer-events-none z-[9999] border border-white/20 bg-gradient-to-br from-[#22d3ee] to-[#0891b2] blur-[1px]"
    />
  );
};

export default CustomCursor;
