import React from 'react';
import { Cpu, Shield, Activity, Zap, Layers } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge.jsx';

export function StationSchematic({ modules = [], onSelectModule }) {
  const findModule = (code) => modules.find(m => m.code === code) || {};

  const modLab = findModule('MOD-LAB');
  const modCmd = findModule('MOD-CMD');
  const modHab = findModule('MOD-HAB');
  const modCup = findModule('MOD-CUP');
  const modDoc = findModule('MOD-DOC');

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))',
      border: '1px solid rgba(56, 189, 248, 0.2)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(12px)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1.5px' }}>
            ASTRA HABITAT ONE · GRAPHICAL MODULE SCHEMATIC
          </p>
          <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Interactive Habitat Operations Grid
          </h3>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>
          CLICK MODULE TO INSPECT
        </span>
      </div>

      {/* Graphical Modules Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        alignItems: 'center',
        padding: '2rem 1rem',
        position: 'relative'
      }}>
        {/* Module Card Component */}
        {[
          { code: 'MOD-LAB', data: modLab, title: 'SCIENCE LAB', desc: 'Microgravity Research' },
          { code: 'MOD-CMD', data: modCmd, title: 'COMMAND HUB', desc: 'Central Avionics & Controls', isHub: true },
          { code: 'MOD-HAB', data: modHab, title: 'HABITAT MODULE', desc: 'Crew Quarters & Life Support' },
        ].map((m) => (
          <div
            key={m.code}
            onClick={() => onSelectModule && onSelectModule(m.data.code ? m.data : { code: m.code, name: m.title, module_type: m.desc, status: 'NOMINAL', temperature_c: 22.5, pressure_kpa: 101.3, oxygen_pct: 20.9, co2_pct: 0.04, power_kw: 4.8 })}
            style={{
              background: m.isHub
                ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(6, 182, 212, 0.15))'
                : 'rgba(15, 23, 42, 0.8)',
              border: `1px solid ${m.isHub ? 'rgba(56, 189, 248, 0.5)' : 'rgba(56, 189, 248, 0.2)'}`,
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: m.isHub ? '0 0 25px rgba(56, 189, 248, 0.25)' : 'none',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#38bdf8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = m.isHub ? 'rgba(56, 189, 248, 0.5)' : 'rgba(56, 189, 248, 0.2)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8' }}>{m.code}</span>
              <StatusBadge status={m.data.status || 'NOMINAL'} size="sm" />
            </div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              {m.title}
            </h4>
            <p style={{ margin: '0 0 1rem', fontSize: '11px', color: '#64748b' }}>
              {m.desc}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', background: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '6px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '9px', display: 'block' }}>TEMP</span>
                <b style={{ color: '#f8fafc' }}>{m.data.temperature_c ?? 22.5}°C</b>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '9px', display: 'block' }}>O₂ LEVEL</span>
                <b style={{ color: (m.data.oxygen_pct ?? 20.9) < 19 ? '#fb7185' : '#34d399' }}>{m.data.oxygen_pct ?? 20.9}%</b>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
