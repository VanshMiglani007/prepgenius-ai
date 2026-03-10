import React from 'react';

/**
 * AIBackground — Lightweight CSS-only ambient background.
 * Replaces the heavy canvas-based 85-node + 20-atom system
 * with simple CSS gradient blobs that use GPU-accelerated transforms.
 * Zero JavaScript, zero RAF loops, zero performance cost.
 */
const AIBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Primary ambient glow — top left */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.04]"
        style={{
          top: '-15%',
          left: '5%',
          background: 'radial-gradient(circle, rgb(var(--color-primary)), transparent 70%)',
          animation: 'bg-drift 25s ease-in-out infinite alternate',
        }}
      />
      {/* Secondary ambient glow — bottom right */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.03]"
        style={{
          bottom: '-10%',
          right: '0%',
          background: 'radial-gradient(circle, rgb(var(--color-primary)), transparent 70%)',
          animation: 'bg-drift 30s ease-in-out infinite alternate-reverse',
        }}
      />
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />

      <style>{`
        @keyframes bg-drift {
          from { transform: translate3d(0, 0, 0) scale(1); }
          to { transform: translate3d(30px, 20px, 0) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default AIBackground;
