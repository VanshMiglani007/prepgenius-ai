import React from 'react';
import { Book, CheckSquare, Calendar, Target, Clock } from 'lucide-react';

/**
 * StudyOrbit — Orbiting nodes around a central icon.
 * Pure CSS keyframe animations, GPU-accelerated.
 * Clean styling — no neon glow, no shadows.
 */
const StudyOrbit = () => {
  const orbitNodes = [
    { icon: <Book size={16} />, radius: 110, duration: 20, delay: 0 },
    { icon: <CheckSquare size={16} />, radius: 145, duration: 26, delay: -4 },
    { icon: <Calendar size={16} />, radius: 180, duration: 32, delay: -8 },
    { icon: <Target size={16} />, radius: 125, duration: 22, delay: -2 },
    { icon: <Clock size={16} />, radius: 160, duration: 28, delay: -6 },
  ];

  return (
    <div className="relative w-[400px] h-[400px] flex items-center justify-center select-none opacity-60">
      <style>{`
        @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes counter-orbit { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .orbit-ring { animation: orbit var(--dur) linear infinite; animation-delay: var(--delay); }
        .orbit-icon { animation: counter-orbit var(--dur) linear infinite; animation-delay: var(--delay); }
      `}</style>

      {/* Central icon — clean, no glow */}
      <div className="relative z-20 flex items-center justify-center">
        <div className="w-14 h-14 bg-white/[0.04] border border-white/[0.1] rounded-xl flex items-center justify-center text-white/50">
          <Target size={26} strokeWidth={1.5} />
        </div>
      </div>

      {/* Orbit rings */}
      {[110, 145, 180].map((r, i) => (
        <div
          key={i}
          className="absolute border border-white/[0.04] rounded-full"
          style={{ width: r * 2, height: r * 2 }}
        />
      ))}

      {/* Orbiting nodes */}
      {orbitNodes.map((node, i) => (
        <div
          key={i}
          className="absolute orbit-ring"
          style={{
            width: node.radius * 2,
            height: node.radius * 2,
            '--dur': `${node.duration}s`,
            '--delay': `${node.delay}s`,
          }}
        >
          <div
            className="orbit-icon absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2
                       w-8 h-8 bg-white/[0.04] border border-white/[0.08] rounded-lg
                       flex items-center justify-center text-white/40"
            style={{ '--dur': `${node.duration}s`, '--delay': `${node.delay}s` }}
          >
            {node.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudyOrbit;
