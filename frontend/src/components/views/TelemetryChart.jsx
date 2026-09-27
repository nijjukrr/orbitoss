import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TelemetryChart({ data = [], dataKey = 'battery_pct', name = 'Battery %', stroke = '#38bdf8', fill = '#0284c7' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem', fontFamily: 'monospace' }}>
        No telemetry time-series history recorded.
      </div>
    );
  }

  const gradientId = `chartGrad_${dataKey}`;

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.4} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
          <XAxis
            dataKey="recorded_at"
            stroke="#64748b"
            tick={{ fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          />
          <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
          <Tooltip
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f8fafc'
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={stroke}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
