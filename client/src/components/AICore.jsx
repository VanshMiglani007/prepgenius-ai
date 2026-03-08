import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Layers, CheckSquare, Calendar, BarChart3, Sparkles } from 'lucide-react';

const AICore = ({ isActivating = false }) => {
  const [mouseNear, setMouseNear] = useState(false);

  const orbitNodes = [
    { name: 'Subjects', icon: <Layers size={18} />, radius: 120, speed: 15, delay: 0 },
    { name: 'Topics', icon: <CheckSquare size={18} />, radius: 160, speed: 20, delay: 2 },
    { name: 'Sessions', icon: <Calendar size={18} />, radius: 200, speed: 25, delay: 4 },
    { name: 'Analytics', icon: <BarChart3 size={18} />, radius: 140, speed: 18, delay: 1 },
  ];

  return (
    <div 
      className="relative w-[500px] h-[500px] flex items-center justify-center"
      onMouseEnter={() => setMouseNear(true)}
      onMouseLeave={() => setMouseNear(false)}
    >
      {/* Central AI Core */}
      <motion.div
        animate={{
          scale: (mouseNear || isActivating) ? 1.2 : 1,
          boxShadow: (mouseNear || isActivating) 
            ? '0 0 50px rgba(0, 212, 255, 0.6), 0 0 100px rgba(0, 212, 255, 0.2)' 
            : '0 0 30px rgba(0, 212, 255, 0.3)',
        }}
        className="z-20 w-32 h-32 bg-dark-bg border-4 border-primary rounded-full flex items-center justify-center text-primary relative"
      >
        <Brain size={60} className={isActivating ? 'animate-pulse' : ''} />
        {/* Glow inner */}
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20"></div>
      </motion.div>

      {/* Orbiting Nodes */}
      {orbitNodes.map((node, i) => (
        <OrbitNode 
            key={i} 
            {...node} 
            isParentActive={mouseNear || isActivating} 
            isActivating={isActivating}
        />
      ))}

      {/* Connection Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <AnimatePresence>
          {(mouseNear || isActivating) && orbitNodes.map((node, i) => (
            <ConnectionLine key={i} index={i} radius={node.radius} speed={node.speed} delay={node.delay} />
          ))}
        </AnimatePresence>
      </svg>
    </div>
  );
};

const OrbitNode = ({ icon, radius, speed, delay, isParentActive, isActivating }) => {
  return (
    <motion.div
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: isActivating ? speed / 3 : speed,
        repeat: Infinity,
        ease: "linear",
        delay: -delay,
      }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <motion.div
        style={{ translateX: radius }}
        animate={{
          scale: isParentActive ? 1.2 : 1,
          borderColor: isParentActive ? '#00d4ff' : 'rgba(0, 212, 255, 0.2)',
          backgroundColor: isParentActive ? 'rgba(0, 212, 255, 0.2)' : 'rgba(26, 26, 46, 0.8)',
        }}
        className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-primary backdrop-blur-md pointer-events-auto interactive"
      >
        {icon}
      </motion.div>
    </motion.div>
  );
};

const ConnectionLine = ({ index, radius, speed, delay }) => {
  return (
    <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="rgba(0, 212, 255, 0.1)"
            strokeWidth="1"
            strokeDasharray="5,5"
        />
        <PulseDot radius={radius} speed={speed} delay={delay} />
    </motion.g>
  );
};

const PulseDot = ({ radius, speed, delay }) => {
    return (
        <motion.circle
            r="3"
            fill="#00d4ff"
            initial={{ opacity: 0 }}
            animate={{ 
                opacity: [0, 1, 0],
                rotate: 360 
            }}
            transition={{
                rotate: { duration: speed, repeat: Infinity, ease: "linear", delay: -delay },
                opacity: { duration: 1, repeat: Infinity }
            }}
            style={{
                originX: "50%",
                originY: "50%",
                translateX: radius
            }}
            cx="50%"
            cy="50%"
        />
    )
}

export default AICore;
