import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * AdvancedCursor — Minimal, zero-lag custom cursor.
 * 
 * Just a small dot + subtle ring. No canvas, no RAF loop, no trail.
 * Position set directly in mousemove for instant response.
 */
const AdvancedCursor = () => {
  const { theme, themes } = useTheme();
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const activeTheme = themes.find(t => t.id === theme) || themes[0];
  const rgb = activeTheme.primary;

  // Update cursor color whenever theme changes
  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    dot.style.backgroundColor = `rgb(${rgb})`;
    ring.style.borderColor = `rgb(${rgb})`;
  }, [rgb]);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let hovering = false;
    let clicking = false;

    const move = (e) => {
      const tx = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
      dot.style.transform = tx;
      ring.style.transform = tx;
    };

    const updateRing = () => {
      if (clicking) {
        ring.style.width = '16px';
        ring.style.height = '16px';
        ring.style.margin = '-8px 0 0 -8px';
        ring.style.opacity = '1';
      } else if (hovering) {
        ring.style.width = '32px';
        ring.style.height = '32px';
        ring.style.margin = '-16px 0 0 -16px';
        ring.style.opacity = '0.7';
      } else {
        ring.style.width = '22px';
        ring.style.height = '22px';
        ring.style.margin = '-11px 0 0 -11px';
        ring.style.opacity = '0.5';
      }
    };

    const isInteractive = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (el.closest?.('button') || el.closest?.('a') || el.closest?.('.interactive') || el.closest?.('[role="button"]')) return true;
      return false;
    };

    const over = (e) => {
      hovering = isInteractive(e.target);
      updateRing();
    };

    const down = () => { clicking = true; updateRing(); };
    const up = () => { clicking = false; updateRing(); };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    window.addEventListener('mousedown', down, { passive: true });
    window.addEventListener('mouseup', up, { passive: true });

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  return (
    <>
      {/* Center dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 5, height: 5,
          margin: '-2.5px 0 0 -2.5px',
          backgroundColor: `rgb(${rgb})`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999999,
          willChange: 'transform',
          transform: 'translate3d(-50px,-50px,0)',
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 22, height: 22,
          margin: '-11px 0 0 -11px',
          border: `1.5px solid rgb(${rgb})`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999999,
          willChange: 'transform',
          opacity: 0.5,
          transition: 'width .12s, height .12s, margin .12s, opacity .12s',
          transform: 'translate3d(-50px,-50px,0)',
        }}
      />
    </>
  );
};

export default AdvancedCursor;
