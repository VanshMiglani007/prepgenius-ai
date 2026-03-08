import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const transitions = {
  crush: {
    initial: { opacity: 0, scale: 0.95, y: -20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.4, ease: "easeIn" } }
  },
  curtains: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.4, ease: "easeIn" } }
  },
  slice: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.4, ease: "easeIn" } }
  },
  drop: {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: "easeIn" } }
  },
  flip: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } }
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
