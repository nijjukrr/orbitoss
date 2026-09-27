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
      background: 'rgba(9, 21, 38, 0.95)',
      borderRight: '1px solid rgba(56, 189, 248, 0.15)',
      padding: '1.75rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem 2rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
        }}>
          <Globe2 size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '1px', color: '#f8fafc' }}>
            ORBIT<span style={{ color: '#38bdf8' }}>OPS</span>
          </h2>
          <small style={{ color: '#64748b', fontSize: '9px', fontFamily: 'monospace', letterSpacing: '2px', display: 'block' }}>
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
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.2), rgba(6, 182, 212, 0.05))' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'inset 3px 0 0 #38bdf8' : 'none'
              }}
            >
              <Icon size={18} style={{ color: isActive ? '#38bdf8' : '#64748b' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Operator Profile */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(56, 189, 248, 0.15)',
        paddingTop: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'grid',
          placeItems: 'center',
          color: '#38bdf8'
        }}>
          <UserCheck size={18} />
        </div>
        <div>
          <b style={{ display: 'block', fontSize: '12px', color: '#f8fafc' }}>Maya Raman</b>
          <small style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace' }}>Mission Controller</small>
        </div>
      </div>
    </aside>
  );
}
