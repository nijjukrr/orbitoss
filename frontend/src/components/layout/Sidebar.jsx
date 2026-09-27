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
      background: '#000000',
      borderRight: '1px solid #242424',
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
          background: '#ffffff',
          display: 'grid',
          placeItems: 'center',
          color: '#000000',
          fontWeight: 900
        }}>
          <Globe2 size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '1px', color: '#ffffff' }}>
            ORBIT<span style={{ color: '#999999' }}>OPS</span>
          </h2>
          <small style={{ color: '#777777', fontSize: '9px', fontFamily: 'monospace', letterSpacing: '2px', display: 'block' }}>
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
                background: isActive ? '#1c1c1c' : 'transparent',
                color: isActive ? '#ffffff' : '#999999',
                fontSize: '0.875rem',
                fontWeight: isActive ? 800 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                borderLeft: isActive ? '3px solid #ffffff' : '3px solid transparent'
              }}
            >
              <Icon size={18} style={{ color: isActive ? '#ffffff' : '#777777' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Operator Profile */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid #242424',
        paddingTop: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#1c1c1c',
          border: '1px solid #3a3a3a',
          display: 'grid',
          placeItems: 'center',
          color: '#ffffff'
        }}>
          <UserCheck size={18} />
        </div>
        <div>
          <b style={{ display: 'block', fontSize: '12px', color: '#ffffff' }}>Maya Raman</b>
          <small style={{ color: '#777777', fontSize: '10px', fontFamily: 'monospace' }}>Mission Controller</small>
        </div>
      </div>
    </aside>
  );
}
