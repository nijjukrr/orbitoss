import React from 'react';

export function LoadingSkeleton({ height = '120px', count = 1 }) {
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            width: '100%',
            borderRadius: '12px',
            background: 'linear-gradient(90deg, rgba(15,23,42,0.6) 25%, rgba(30,41,59,0.7) 50%, rgba(15,23,42,0.6) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonPulse 1.8s infinite ease-in-out',
            border: '1px solid rgba(56, 189, 248, 0.1)'
          }}
        />
      ))}
      <style>{`
        @keyframes skeletonPulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
