import React from 'react';
import { Sun, Moon, Info } from 'lucide-react';

export function Navbar({ activeTab = 'Dashboard', theme = 'dark', onToggleTheme, onOpenAbout }) {
  const getDisplayTitle = () => {
    if (activeTab.startsWith('Satellite:')) {
      return `SATELLITE ${activeTab.split(':')[1]}`;
    }
    return activeTab.toUpperCase();
  };

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.25s ease'
    }}>
      {/* Left / Active Page Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text-muted)', letterSpacing: '1.5px', fontWeight: 700 }}>
          ORBITOPS
        </span>
        <span style={{ color: 'var(--border)' }}>/</span>
        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {getDisplayTitle()}
        </h2>
      </div>

      {/* Right Controls: About Modal & Theme Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* About Project Button */}
        <button
          onClick={onOpenAbout}
          aria-label="Open About Project Modal"
          title="About ORBITOPS DBMS Project"
          style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            padding: '7px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'DM Mono, monospace',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <Info size={14} />
          <span>ABOUT PROJECT</span>
        </button>

        {/* Light/Dark Theme Switcher */}
        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            padding: '7px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'DM Mono, monospace',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
        </button>
      </div>
    </header>
  );
}
