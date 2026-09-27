import React from 'react';
import {
  LayoutDashboard,
  Orbit,
  Building2,
  Users,
  FlaskConical,
  Radio,
  Terminal,
  AlertTriangle,
  Globe2,
  UserCheck
} from 'lucide-react';

const menuItems = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'Satellites', label: 'Satellites', icon: Orbit },
  { id: 'Station', label: 'Space Station', icon: Building2 },
  { id: 'Crew', label: 'Crew & Tasks', icon: Users },
  { id: 'Experiments', label: 'Experiments', icon: FlaskConical },
  { id: 'Ground Stations', label: 'Ground Stations', icon: Radio },
  { id: 'Command Center', label: 'Command Center', icon: Terminal },
  { id: 'Alerts', label: 'Alert Center', icon: AlertTriangle },
];

export function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside style={{
      width: '260px',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)',
      padding: '1.75rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      flexShrink: 0,
      transition: 'all 0.25s ease'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem 2rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: 'var(--button-primary-bg)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--button-primary-text)',
          fontWeight: 900
        }}>
          <Globe2 size={22} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, letterSpacing: '1px', color: 'var(--text-primary)' }}>
            ORBIT<span style={{ color: 'var(--text-muted)' }}>OPS</span>
          </h2>
          <small style={{ color: 'var(--text-muted)', fontSize: '9px', fontFamily: 'monospace', letterSpacing: '2px', display: 'block' }}>
            MISSION CONTROL DBMS
          </small>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'grid', gap: '0.35rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (activeTab.startsWith('Satellite:') && item.id === 'Satellites');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: isActive ? 'var(--surface-muted)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 800 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                borderLeft: isActive ? '3px solid var(--text-primary)' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Operator Profile */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border)',
        paddingTop: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'var(--surface-muted)',
          border: '1px solid var(--border-strong)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--text-primary)'
        }}>
          <UserCheck size={18} />
        </div>
        <div>
          <b style={{ display: 'block', fontSize: '12px', color: 'var(--text-primary)' }}>Maya Raman</b>
          <small style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'monospace' }}>Mission Controller</small>
        </div>
      </div>
    </aside>
  );
}
