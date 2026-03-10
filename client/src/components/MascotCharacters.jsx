import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

const MascotCharacters = ({ isFocused = false, isSuccess = false, positionState = 'right' }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCurious, setIsCurious] = useState(false);
  const idleTimer = useRef(null);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsCurious(false);
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIsCurious(true), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(idleTimer.current);
    };
  }, []);

  // Perimeter path mapping (based on 800x500 card)
  // Align to lower-right and lower-left, avoiding the top text entirely.
  const variants = {
    right: { x: 480, y: 150, rotate: 0 },
    top: { x: 0, y: 300, rotate: 0 }, // 'top' is now actually 'bottom center'
    left: { x: -480, y: 150, rotate: 0 }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      <motion.div
        animate={positionState}
        variants={variants}
        transition={{ 
          duration: 1.5, 
          ease: "easeInOut",
          // When moving between right and left, we might want to force it through 'top'
          // We can handle the intermediate sequence in the parent Auth component.
        }}
        className="flex items-center justify-center gap-6"
      >
        <Blob id={1} mousePos={mousePos} gradient="from-dark-bg to-primary/80" delay={0} isFocused={isFocused} isSuccess={isSuccess} isCurious={isCurious} />
        <Blob id={2} mousePos={mousePos} gradient="from-dark-bg to-primary" delay={0.2} isFocused={isFocused} isSuccess={isSuccess} height="h-48" isCurious={isCurious} />
        <Blob id={3} mousePos={mousePos} gradient="from-dark-bg to-primary/60" delay={0.4} isFocused={isFocused} isSuccess={isSuccess} isCurious={isCurious} />
      </motion.div>
    </div>
  );
};

const Blob = ({ id, mousePos, gradient, delay, isFocused, isSuccess, height = "h-40", isCurious }) => {
  const blobRef = useRef(null);
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Spring animations for smooth leaning
  const rotateS = useSpring(0, { stiffness: 100, damping: 20 });
  const translateS = useSpring(0, { stiffness: 100, damping: 20 });

  useEffect(() => {
    if (!blobRef.current) return;
    const rect = blobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    
    // Calculate distance and direction for lean
    const diffX = mousePos.x - centerX;
    const limitX = 200; // sensitivity range
    const intensity = Math.min(Math.abs(diffX) / limitX, 1);
    
    // Focus reaction: look towards the center/left (where the form is)
    if (isFocused) {
        rotateS.set(-4);
        translateS.set(-6);
    } else if (isCurious) {
        // Lean forward if stagnant
        rotateS.set(-2);
        translateS.set(-4);
    } else {
        rotateS.set(intensity * (diffX > 0 ? 3 : -3));
        translateS.set(intensity * (diffX > 0 ? 5 : -5));
    }
  }, [mousePos, isFocused, isCurious]);

  // Random blinking logic
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
      setTimeout(blink, 3000 + Math.random() * 3000);
    };
    const timeout = setTimeout(blink, 2000 + delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <motion.div
      ref={blobRef}
      animate={{
        y: [0, -10, 0],
        scale: isSuccess ? [1, 1.2, 1] : 1,
      }}
      transition={{
        y: { duration: 4 + id, repeat: Infinity, ease: "easeInOut", delay },
        scale: { duration: 0.4, type: "spring" }
      }}
      style={{
        rotate: rotateS,
        x: translateS,
      }}
      className={`relative w-16 md:w-20 ${height} bg-gradient-to-t ${gradient} shadow-[0_0_20px_rgba(var(--color-primary),0.3)] border border-white/10 flex flex-col items-center pt-8 cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_35px_rgba(var(--color-primary),0.6)]`}
    >
      {/* Eyes Container */}
      <div className="flex gap-3">
        <Eye mousePos={mousePos} blobRef={blobRef} isBlinking={isBlinking} isFocused={isFocused} />
        <Eye mousePos={mousePos} blobRef={blobRef} isBlinking={isBlinking} isFocused={isFocused} />
      </div>
    </motion.div>
  );
};

const Eye = ({ mousePos, blobRef, isBlinking, isFocused }) => {
  const eyeRef = useRef(null);
  const pupilX = useSpring(0, { stiffness: 150, damping: 15 });
  const pupilY = useSpring(0, { stiffness: 150, damping: 15 });

  useEffect(() => {
    if (!eyeRef.current) return;
    const rect = eyeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (isFocused) {
        // Look towards the left (where the login form is)
        pupilX.set(-5);
        pupilY.set(0);
    } else {
        const diffX = mousePos.x - centerX;
        const diffY = mousePos.y - centerY;
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);
        const maxMove = 5;
        const angle = Math.atan2(diffY, diffX);
        
        const moveX = Math.cos(angle) * Math.min(maxMove, distance / 20);
        const moveY = Math.sin(angle) * Math.min(maxMove, distance / 20);
        
        pupilX.set(moveX);
        pupilY.set(moveY);
    }
  }, [mousePos, isFocused]);

  return (
    <div 
      ref={eyeRef}
      className="w-5 h-6 bg-white rounded-full flex items-center justify-center relative overflow-hidden transition-transform duration-200"
      style={{ transform: isBlinking ? 'scaleY(0.1)' : 'scaleY(1)' }}
    >
      <motion.div
        style={{ x: pupilX, y: pupilY }}
        className="w-2.5 h-3 bg-black rounded-full relative"
      >
        {/* Eye Highlight */}
        <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full opacity-60"></div>
      </motion.div>
    </div>
  );
};

export default MascotCharacters;
