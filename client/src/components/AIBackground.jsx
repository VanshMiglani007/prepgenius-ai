import React, { useEffect, useRef } from 'react';

const AIBackground = () => {
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

    const mouse = { x: -1000, y: -1000 };
    const layers = [
      { count: 40, speed: 0.2, radius: 1, color: 'rgba(0, 212, 255, 0.08)', distance: 100 }, // Distant
      { count: 30, speed: 0.4, radius: 2, color: 'rgba(34, 211, 238, 0.15)', distance: 150 }, // Main
      { count: 15, speed: 0.8, radius: 3, color: 'rgba(56, 189, 248, 0.25)', distance: 200 }  // Interactive
    ];

    const nodes = [];
    const atoms = [];
    let pulses = [];

    // --- NODE CLASS: Represents neural network nodes ---
    class Node {
      constructor(layerIndex) {
        this.layer = layers[layerIndex];
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * this.layer.speed;
        this.vy = (Math.random() - 0.5) * this.layer.speed;
        this.baseRadius = this.layer.radius;
        this.pulseFactor = 0;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Mouse gravitation for interactive layer
        if (this.layer.speed > 0.5) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            this.x += dx * 0.01;
            this.y += dy * 0.01;
          }
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.baseRadius + this.pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = this.layer.color;
        ctx.fill();
        
        if (this.pulseFactor > 0) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#22d3ee';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
      }
    }

    // --- ATOM CLASS: Represents moving atomic structures ---
    class Atom {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Atoms drift very slowly
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.nucleusRadius = 3 + Math.random() * 2;
            
            // Generate 1 to 3 electrons
            this.electrons = [];
            const electronCount = Math.floor(Math.random() * 3) + 1;
            for(let i=0; i < electronCount; i++) {
                this.electrons.push({
                    angle: Math.random() * Math.PI * 2,
                    speed: 0.02 + Math.random() * 0.03, // orbital speed
                    radiusX: 20 + Math.random() * 20, // elliptical orbit horizontal radius
                    radiusY: 10 + Math.random() * 10, // elliptical orbit vertical radius
                    orbitTilt: Math.random() * Math.PI // tilt of the ellipse
                });
            }
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < -100) this.x = width + 100;
            if (this.x > width + 100) this.x = -100;
            if (this.y < -100) this.y = height + 100;
            if (this.y > height + 100) this.y = -100;

            // Update electron angles
            this.electrons.forEach(e => {
                e.angle += e.speed;
            });
        }

        draw() {
            // Draw Nucleus
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.nucleusRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 211, 238, 0.6)';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00d4ff';
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw Electrons and Orbits
            this.electrons.forEach(e => {
                // Draw faint orbital path
                ctx.beginPath();
                ctx.ellipse(this.x, this.y, e.radiusX, e.radiusY, e.orbitTilt, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Calculate electron position along the tilted ellipse
                // Parametric equation for tilted ellipse
                const cosA = Math.cos(e.orbitTilt);
                const sinA = Math.sin(e.orbitTilt);
                const cosT = Math.cos(e.angle);
                const sinT = Math.sin(e.angle);

                const ex = this.x + (e.radiusX * cosT * cosA - e.radiusY * sinT * sinA);
                const ey = this.y + (e.radiusX * cosT * sinA + e.radiusY * sinT * cosA);

                // Draw Electron
                ctx.beginPath();
                ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 5;
                ctx.shadowColor = '#fff';
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        }
    }

    // Initialize Nodes
    layers.forEach((layer, i) => {
      for (let j = 0; j < layer.count; j++) {
        nodes.push(new Node(i));
      }
    });

    // Initialize Atoms (super dense and permanent atomic structure)
    const numAtoms = 20;
    for(let i=0; i<numAtoms; i++) {
        atoms.push(new Atom());
    }

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const createPulse = () => {
       const startNode = nodes[Math.floor(Math.random() * nodes.length)];
       const nearbyNodes = nodes.filter(n => {
           const d = Math.sqrt((n.x - startNode.x)**2 + (n.y - startNode.y)**2);
           return d > 0 && d < 200;
       });
       
       if (nearbyNodes.length > 0) {
           const endNode = nearbyNodes[Math.floor(Math.random() * nearbyNodes.length)];
           pulses.push({
               start: startNode,
               end: endNode,
               progress: 0,
               speed: 0.02 + Math.random() * 0.03
           });
       }
       
       setTimeout(createPulse, 2000 + Math.random() * 5000);
    };

    window.addEventListener('mousemove', onMouseMove);
    createPulse();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      nodes.forEach((node, i) => {
        node.update();
        node.draw();

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          if (node.layer !== other.layer) continue;

          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < node.layer.distance) {
            const dxM = mouse.x - (node.x + other.x)/2;
            const dyM = mouse.y - (node.y + other.y)/2;
            const distM = Math.sqrt(dxM * dxM + dyM * dyM);
            
            const opacity = (1 - dist / node.layer.distance) * (node.layer.speed / 2);
            const extraGlow = distM < 150 ? (1 - distM / 150) * 0.4 : 0;

            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            // Curved lines
            const cx = (node.x + other.x) / 2 + (Math.sin(animationFrameId * 0.01 + i) * 10);
            const cy = (node.y + other.y) / 2 + (Math.cos(animationFrameId * 0.01 + j) * 10);
            ctx.quadraticCurveTo(cx, cy, other.x, other.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${Math.max(opacity, extraGlow)})`;
            ctx.lineWidth = 0.5 + extraGlow;
            ctx.stroke();
          }
        }
      });

      // Draw pulses
      pulses = pulses.filter(p => {
          p.progress += p.speed;
          if (p.progress >= 1) return false;
          
          const x = p.start.x + (p.end.x - p.start.x) * p.progress;
          const y = p.start.y + (p.end.y - p.start.y) * p.progress;
          
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00d4ff';
          ctx.fill();
          ctx.shadowBlur = 0;
          
          return true;
      });

      // Draw and update atoms
      atoms.forEach(atom => {
          atom.update();
          atom.draw();
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
    />
  );
};

export default AIBackground;
