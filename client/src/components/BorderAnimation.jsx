import React from 'react';
import { motion } from 'framer-motion';

const BorderAnimation = ({ children, className = "" }) => {
  return (
    <div className={`relative group p-[2px] rounded-2xl overflow-hidden ${className}`}>
      {/* Animated Border SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="2"
          strokeDasharray="100 400"
          className="animate-[borderFlow_4s_linear_infinite]"
          rx="16"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="relative z-10 bg-dark-bg rounded-[14px] h-full">
        {children}
      </div>

      <style jsx>{`
        @keyframes borderFlow {
          from { stroke-dashoffset: 500; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default BorderAnimation;
