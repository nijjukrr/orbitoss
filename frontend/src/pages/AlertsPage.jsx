import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Filter, Clock, ChevronDown, ChevronUp, Database, Zap, Activity } from 'lucide-react';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton.jsx';
import { ErrorState } from '../components/shared/ErrorState.jsx';

export function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [expandedAlertId, setExpandedAlertId] = useState(null);
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

  const toggleExpand = (id) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };

  if (loading) return <LoadingSkeleton height="160px" count={4} />;
  if (error) return <ErrorState title="ALERT SERVICE UNAVAILABLE" message={error} onRetry={fetchAlerts} />;

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING' && a.status !== 'RESOLVED').length;
  const resolvedCount = alerts.filter(a => a.status === 'RESOLVED').length;

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            <span>CENTRAL INCIDENT MANAGEMENT</span> · <span>POSTGRESQL TRIGGER PIPELINE</span>
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Mission Control Alert & Event Flow Board
          </h1>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-muted)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          {['ALL', 'OPEN', 'RESOLVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: filter === f ? 'var(--button-primary-bg)' : 'transparent',
                color: filter === f ? 'var(--button-primary-text)' : 'var(--text-secondary)',
                fontWeight: filter === f ? 800 : 500,
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
        <div style={{ background: 'var(--surface)', border: '2px solid var(--text-primary)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--card-shadow)' }}>
          <AlertTriangle size={30} style={{ color: 'var(--text-primary)' }} />
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-primary)', display: 'block' }}>⚠ CRITICAL ALERTS</span>
            <b style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>{criticalCount}</b>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--card-shadow)' }}>
          <AlertTriangle size={30} style={{ color: 'var(--text-secondary)' }} />
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)', display: 'block' }}>! WARNING ALERTS</span>
            <b style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>{warningCount}</b>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--card-shadow)' }}>
          <CheckCircle2 size={30} style={{ color: 'var(--text-muted)' }} />
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block' }}>✓ RESOLVED ALERTS</span>
            <b style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>{resolvedCount}</b>
          </div>
        </div>
      </div>

      {/* Alerts List Table with DBMS Event Flow Timeline */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: 'var(--card-shadow)'
      }}>
        {alerts.length > 0 ? (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {alerts.map((a) => {
              const isExpanded = expandedAlertId === a.alert_id;
              const exactCreatedTime = a.created_at ? new Date(a.created_at).toLocaleTimeString() : 'Recorded';
              const exactResolvedTime = a.resolved_at ? new Date(a.resolved_at).toLocaleTimeString() : null;
              const isResolved = a.status === 'RESOLVED';
              const isCritical = a.severity === 'CRITICAL';

              return (
                <div
                  key={a.alert_id}
                  style={{
                    background: 'var(--surface-muted)',
                    border: isCritical ? '2px solid var(--text-primary)' : isResolved ? '1px solid var(--border)' : '1px solid var(--border-strong)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleExpand(a.alert_id)}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <StatusBadge status={a.severity} />
                      <div>
                        <b style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block' }}>
                          {(a.alert_type || 'ALERT').replace('_', ' ')}
                        </b>
                        <p style={{ margin: '4px 0 6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{a.message}</p>
                        <small style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace' }}>
                          Target: <b style={{ color: 'var(--text-primary)' }}>{a.satellite_code || a.module_code || 'SYSTEM'}</b> · Created: {exactCreatedTime}
                        </small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <StatusBadge status={a.status} size="sm" />
                      {!isResolved ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveAlert(a.alert_id);
                          }}
                          disabled={resolvingId === a.alert_id}
                          style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: '6px',
                            background: 'var(--button-primary-bg)',
                            border: '1px solid var(--button-primary-bg)',
                            color: 'var(--button-primary-text)',
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          {resolvingId === a.alert_id ? 'Executing procedure...' : '✔ Resolve Alert'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>RESOLVED IN DB</span>
                      )}

                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable DBMS Event Flow Timeline */}
                  {isExpanded && (
                    <div style={{
                      background: 'var(--surface)',
                      borderTop: '1px solid var(--border)',
                      padding: '1.5rem',
                      display: 'grid',
                      gap: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-primary)', letterSpacing: '1px' }}>
                          DBMS EVENT & TRIGGER EXECUTION PIPELINE
                        </span>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                          Alert ID: {a.alert_id}
                        </span>
                      </div>

                      {/* Step-by-Step Vertical DBMS Flow */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', margin: '0.5rem 0' }}>
                        {[
                          { step: '1. TELEMETRY INSERTED', desc: 'Anomalous reading written to satellite_telemetry', note: 'Derived from alert creation transaction', icon: Database },
                          { step: '2. POSTGRES TRIGGER FIRED', desc: 'BEFORE/AFTER INSERT trigger evaluated conditions', note: 'Same transaction timestamp', icon: Zap },
                          { step: '3. ALERT RECORD CREATED', desc: `Alert row inserted with severity ${a.severity}`, note: exactCreatedTime, icon: AlertTriangle },
                          { step: '4. STATUS UPDATED', desc: 'Satellite status set to WARNING / DEGRADED', note: 'Same transaction timestamp', icon: Activity },
                          { step: '5. ALERT RESOLVED', desc: isResolved ? 'Stored procedure resolve_alert() executed' : 'Awaiting operator resolution', note: isResolved ? (exactResolvedTime || 'Resolved in DB') : 'Pending Resolution', icon: CheckCircle2 }
                        ].map((flow) => {
                          const IconComp = flow.icon;
                          return (
                            <div
                              key={flow.step}
                              style={{
                                background: 'var(--surface-muted)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '1rem 0.75rem',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <IconComp size={18} style={{ color: 'var(--text-primary)' }} />
                              <b style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{flow.step}</b>
                              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                {flow.note}
                              </span>
                              <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{flow.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
            No alerts matching filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
