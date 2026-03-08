import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const transitions = {
  crush: {
    initial: { opacity: 0, scale: 1.1, filter: "blur(10px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.2, rotate: 15, skew: "25deg", filter: "blur(20px) contrast(200%)", transition: { duration: 0.8, ease: "easeInOut" } }
  },
  curtains: {
    initial: { opacity: 0, scaleY: 0, originY: 0 },
    animate: { opacity: 1, scaleY: 1, transition: { duration: 0.7, ease: "circOut" } },
    exit: { opacity: 0, scaleY: 0, originY: 1, transition: { duration: 0.7, ease: "circIn" } }
  },
  slice: {
    initial: { opacity: 0, x: window.innerWidth || 1000, skewX: "-20deg" },
    animate: { opacity: 1, x: 0, skewX: "0deg", transition: { duration: 0.6, type: "spring", bounce: 0.2 } },
    exit: { opacity: 0, x: -(window.innerWidth || 1000), skewX: "20deg", transition: { duration: 0.5, ease: "easeIn" } }
  },
  drop: {
    initial: { opacity: 0, y: -500, rotate: -10 },
    animate: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.7, type: "spring", bounce: 0.4 } },
    exit: { opacity: 0, y: 500, rotate: 10, transition: { duration: 0.6, ease: "anticipate" } }
  },
  flip: {
    initial: { opacity: 0, rotateY: 90 },
    animate: { opacity: 1, rotateY: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, rotateY: -90, transition: { duration: 0.6, ease: "easeIn" } }
  }
};

const PageTransition = ({ children }) => {
  const location = useLocation();

  // Pick a transition type based on the destination path, or randomize if desired.
  // We'll intentionally map them to different routes for the "unexpected" feel requested.
  const variantType = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'crush';
    if (path === '/login') return 'flip';
    if (path === '/dashboard') return 'curtains';
    if (path === '/subjects' || path === '/topics') return 'slice';
    if (path === '/study-plan' || path === '/timer') return 'drop';
    return 'crush'; // default
  }, [location.pathname]);

  const activeVariant = transitions[variantType];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: activeVariant.initial,
        animate: activeVariant.animate,
        exit: activeVariant.exit
      }}
      className="w-full min-h-screen relative origin-center"
      style={{ perspective: 1200 }}
    >
      {children}
    </motion.div>
  );
};


export default PageTransition;
