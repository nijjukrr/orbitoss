import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Filter, Clock } from 'lucide-react';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton.jsx';
import { ErrorState } from '../components/shared/ErrorState.jsx';

export function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAlerts(filter);
      setAlerts(res || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const handleResolveAlert = async (id) => {
    setResolvingId(id);
    try {
      await api.resolveAlert(id);
      fetchAlerts();
    } catch (err) {
      alert(`Alert resolution failed: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) return <LoadingSkeleton height="160px" count={4} />;
  if (error) return <ErrorState message={error} onRetry={fetchAlerts} />;

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING' && a.status !== 'RESOLVED').length;
  const resolvedCount = alerts.filter(a => a.status === 'RESOLVED').length;

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1px' }}>
            <span>CENTRAL INCIDENT MANAGEMENT</span> · <span>STORED PROCEDURE RESOLUTION</span>
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            Mission Control Alert Board
          </h1>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
          {['ALL', 'OPEN', 'RESOLVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: filter === f ? 'linear-gradient(135deg, #0284c7, #06b6d4)' : 'transparent',
                color: filter === f ? '#fff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Summary Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '1.25rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertTriangle size={32} style={{ color: '#f43f5e' }} />
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#fb7185', display: 'block' }}>CRITICAL ALERTS</span>
            <b style={{ fontSize: '1.75rem', color: '#f8fafc' }}>{criticalCount}</b>
          </div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1.25rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertTriangle size={32} style={{ color: '#f59e0b' }} />
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#fbbf24', display: 'block' }}>WARNING ALERTS</span>
            <b style={{ fontSize: '1.75rem', color: '#f8fafc' }}>{warningCount}</b>
          </div>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.25rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle2 size={32} style={{ color: '#10b981' }} />
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#34d399', display: 'block' }}>RESOLVED ALERTS</span>
            <b style={{ fontSize: '1.75rem', color: '#f8fafc' }}>{resolvedCount}</b>
          </div>
        </div>
      </div>

      {/* Alerts List Table */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '16px',
        padding: '1.5rem',
        backdropFilter: 'blur(12px)'
      }}>
        {alerts.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {alerts.map((a) => (
              <div
                key={a.alert_id}
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: `1px solid ${a.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.25)'}`,
                  padding: '1.25rem',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <StatusBadge status={a.severity} />
                  <div>
                    <b style={{ fontSize: '1.05rem', color: '#f8fafc', display: 'block' }}>
                      {(a.alert_type || 'ALERT').replace('_', ' ')}
                    </b>
                    <p style={{ margin: '4px 0 6px', fontSize: '0.9rem', color: '#cbd5e1' }}>{a.message}</p>
                    <small style={{ color: '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>
                      Target: <b style={{ color: '#38bdf8' }}>{a.satellite_code || a.module_code || 'SYSTEM'}</b> · Created: {new Date(a.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <StatusBadge status={a.status} size="sm" />
                  {a.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => handleResolveAlert(a.alert_id)}
                      disabled={resolvingId === a.alert_id}
                      style={{
                        padding: '0.6rem 1.25rem',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      {resolvingId === a.alert_id ? 'Executing procedure...' : '✔ Resolve Alert'}
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#34d399', fontFamily: 'monospace' }}>RESOLVED IN DB</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontFamily: 'monospace' }}>
            No alerts matching filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
