import React, { useEffect, useRef } from 'react';

const HeroNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    const nodes = [];
    const nodeCount = 60;
    const connectionDistance = 150;
    const mouse = { x: -1000, y: -1000 };

    class Node {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.4)';
        ctx.fill();

        const distMouse = Math.sqrt((this.x - mouse.x) ** 2 + (this.y - mouse.y) ** 2);
        if (distMouse < 100) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00d4ff';
          ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node());
    }

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      nodes.forEach((node, i) => {
        node.update();
        node.draw();

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dist = Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2);
          
          if (dist < connectionDistance) {
            const distMouse = Math.min(
              Math.sqrt((node.x - mouse.x) ** 2 + (node.y - mouse.y) ** 2),
              Math.sqrt((other.x - mouse.x) ** 2 + (other.y - mouse.y) ** 2)
            );

            const opacity = (1 - dist / connectionDistance) * 0.2;
            const extraOpacity = distMouse < 150 ? (1 - distMouse / 150) * 0.5 : 0;
            
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${Math.max(opacity, extraOpacity)})`;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default HeroNetwork;
