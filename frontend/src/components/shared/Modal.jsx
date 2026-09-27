import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = '650px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.1)',
          padding: '1.75rem',
          color: '#f8fafc',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', paddingBottom: '0.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.3px', color: '#f8fafc' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
