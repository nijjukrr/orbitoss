import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TelemetryChart({ data = [], dataKey = 'battery_pct', name = 'Battery %', stroke = '#ffffff' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#777777', fontSize: '0.875rem', fontFamily: 'monospace' }}>
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
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
          <XAxis
            dataKey="recorded_at"
            stroke="#777777"
            tick={{ fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          />
          <YAxis stroke="#777777" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
          <Tooltip
            contentStyle={{
              background: '#111111',
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#ffffff'
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke="#ffffff"
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
