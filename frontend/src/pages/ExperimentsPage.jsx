import React, { useState, useEffect } from 'react';
import { FlaskConical, Activity, Calendar, User, Building2, CheckCircle2, ChevronRight, FileText, Eye } from 'lucide-react';
import { api } from '../api/client.js';
import { MetricCard } from '../components/shared/MetricCard.jsx';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton.jsx';
import { ErrorState } from '../components/shared/ErrorState.jsx';
import { Modal } from '../components/shared/Modal.jsx';

export function ExperimentsPage() {
  const [experiments, setExperiments] = useState([]);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [experimentDetail, setExperimentDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  const fetchExperiments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getExperiments();
      setExperiments(res || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const openDetailModal = async (exp) => {
    setSelectedExperiment(exp);
    setLoadingDetail(true);
    try {
      const res = await api.getExperiment(exp.experiment_id || exp.code);
      setExperimentDetail(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) return <LoadingSkeleton height="160px" count={4} />;
  if (error) return <ErrorState message={error} onRetry={fetchExperiments} />;

  const activeCount = experiments.filter(e => e.status === 'IN_PROGRESS' || e.status === 'ACTIVE' || e.status === 'NOMINAL').length || 1;
  const avgProgress = (experiments.reduce((acc, x) => acc + Number(x.progress_pct || 0), 0) / (experiments.length || 1)).toFixed(0);

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '2.5rem',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2rem'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'var(--surface-muted)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, marginBottom: '12px' }}>
            <Eye size={13} />
            <span>NASA DESTINY LABORATORY · MICROGRAVITY RESEARCH</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Space Station Research
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
            Pioneering biological, physical, and pharmaceutical scientific payload investigations aboard Astra Habitat One.
          </p>
        </div>

        {/* Highlight Stats Pill */}
        <div style={{
          background: 'var(--surface-muted)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.25rem 1.75rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block' }}>ACTIVE INVESTIGATION</span>
            <b style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 900 }}>{activeCount} ACTIVE</b>
          </div>
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block' }}>AVG PROGRESS</span>
            <b style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 900 }}>{avgProgress}% AVG</b>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <MetricCard icon={FlaskConical} label="Total Projects" value={experiments.length} sub="Microgravity Investigations" />
        <MetricCard icon={Activity} label="Average Progress" value={`${avgProgress}%`} sub="Across All Modules" />
        <MetricCard icon={User} label="Lead Researchers" value={new Set(experiments.map(x => x.lead_researcher)).size} sub="Flight Payload Officers" />
      </div>

      {/* Experiments Grid */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>
            POSTGRESQL experiments & experiment_logs TABLES
          </p>
          <h3 style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Active Experiment Payload Roster
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {experiments.map((exp) => {
            const pct = Math.min(100, Math.max(0, Number(exp.progress_pct || 0)));
            return (
              <div
                key={exp.experiment_id || exp.code}
                onClick={() => openDetailModal(exp)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--card-shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 700 }}>{exp.code} · {exp.module_name || 'SCI-01'}</span>
                    <StatusBadge status={exp.status} size="sm" />
                  </div>

                  <h3 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {exp.title}
                  </h3>

                  <div style={{ background: 'var(--surface-muted)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '1rem' }}>
                    <p style={{ margin: '0 0 4px', color: 'var(--text-muted)' }}>Lead Researcher: <b style={{ color: 'var(--text-primary)' }}>{exp.lead_researcher}</b></p>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Start Date: <b style={{ color: 'var(--text-secondary)' }}>{exp.started_on ? new Date(exp.started_on).toLocaleDateString() : 'Active'}</b></p>
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'monospace', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>PROGRESS</span>
                      <b style={{ color: 'var(--text-primary)' }}>{pct}%</b>
                    </div>
                    <div style={{ height: '8px', borderRadius: '10px', background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--text-primary)', borderRadius: 'inherit' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{exp.log_count ?? 2} Observation Logs Recorded</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      Inspect Payload →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Experiment Detail Modal */}
      {selectedExperiment && (
        <Modal isOpen={!!selectedExperiment} onClose={() => setSelectedExperiment(null)} title={`${selectedExperiment.code} — Payload Investigation & Measurements`}>
          {loadingDetail ? (
            <LoadingSkeleton height="100px" count={2} />
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedExperiment.title}
                  </h3>
                  <small style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                    Lead Researcher: <b>{selectedExperiment.lead_researcher}</b> · Module: <b>{selectedExperiment.module_name}</b> · Start Date: <b>{selectedExperiment.started_on ? new Date(selectedExperiment.started_on).toLocaleDateString() : 'Active'}</b>
                  </small>
                </div>
                <StatusBadge status={selectedExperiment.status} />
              </div>

              {/* Progress Summary */}
              <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>INVESTIGATION PROGRESS</span>
                  <b style={{ color: 'var(--text-primary)' }}>{selectedExperiment.progress_pct}%</b>
                </div>
                <div style={{ height: '8px', borderRadius: '10px', background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ width: `${selectedExperiment.progress_pct}%`, height: '100%', background: 'var(--text-primary)', borderRadius: 'inherit' }} />
                </div>
              </div>

              {/* Experiment Logs */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> Research Observation Logs (PostgreSQL experiment_logs)
                </h4>

                {experimentDetail?.logs && experimentDetail.logs.length > 0 ? (
                  <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {experimentDetail.logs.map((l) => (
                      <div key={l.experiment_log_id} style={{ background: 'var(--surface-muted)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '12px' }}>
                        <p style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontWeight: 500 }}>{l.note}</p>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'monospace' }}>
                          Logged at: {new Date(l.logged_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '1rem', background: 'var(--surface-muted)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>
                    No research observation logs recorded yet.
                  </div>
                )}
              </div>

              {/* Experiment Metric Results */}
              {experimentDetail?.results && experimentDetail.results.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Metric Measurement Results
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {experimentDetail.results.map((r) => (
                      <div key={r.result_id} style={{ background: 'var(--surface-muted)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontFamily: 'monospace' }}>{r.metric_name}</span>
                        <b style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{r.metric_value} {r.unit}</b>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
