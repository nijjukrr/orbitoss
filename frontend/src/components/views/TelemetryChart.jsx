import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TelemetryChart({ data = [], dataKey = 'battery_pct', name = 'Battery %' }) {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'monospace' }}>
        No telemetry time-series history recorded.
      </div>
    );
  }

  const isLight = theme === 'light';
  const lineColor = isLight ? '#000000' : '#ffffff';
  const gridColor = isLight ? '#dadada' : '#242424';
  const tooltipBg = isLight ? '#ffffff' : '#111111';
  const tooltipBorder = isLight ? '#dadada' : '#3a3a3a';
  const tooltipText = isLight ? '#000000' : '#ffffff';

  const gradientId = `chartGrad_${dataKey}_${theme}`;

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={isLight ? 0.2 : 0.35} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="recorded_at"
            stroke="var(--text-muted)"
            tick={{ fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          />
          <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
          <Tooltip
            contentStyle={{
              background: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '6px',
              fontSize: '12px',
              color: tooltipText,
              boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={lineColor}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
