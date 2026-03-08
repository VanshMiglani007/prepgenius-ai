import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const AdvancedCursor = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });
  const points = useRef([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Tighter springs for a faster, less laggy cursor
  const springConfig = { stiffness: 800, damping: 35 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const onMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'INPUT' || 
        target.closest('.interactive') ||
        target.closest('button') ||
        target.closest('a');
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);

    document.body.style.cursor = 'none';

    let lastMousePos = { x: -100, y: -100 };

    const animate = () => {
      // Create new trail point only if mouse moved significantly to save canvas operations
      const dist = Math.hypot(mouse.current.x - lastMousePos.x, mouse.current.y - lastMousePos.y);
      if (dist > 2) {
        points.current.push({ ...mouse.current, age: 0 });
        lastMousePos = { ...mouse.current };
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (points.current.length > 0) {
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#22d3ee';
        
        for (let i = 0; i < points.current.length; i++) {
          const p = points.current[i];
          p.age += 1;
          
          if (p.age > 15) { // shorter trail lifespan
            points.current.splice(i, 1);
            i--;
            continue;
          }

          const opacity = 1 - p.age / 15;
          ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.5})`;
          
          if (i === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(animationFrameId);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
      />
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          left: -15,
          top: -15,
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
        }}
        className="fixed w-[30px] h-[30px] pointer-events-none z-[9999] rounded-full mix-blend-screen"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[8px]" />
        <div className="absolute inset-[10px] bg-primary rounded-full shadow-[0_0_15px_#00d4ff]" />
      </motion.div>
    </>
  );
};

export default AdvancedCursor;
