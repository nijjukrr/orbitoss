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

  return (
    <div style={{ display: 'grid', gap: '3rem' }}>
      {/* Header with NASA Destiny Laboratory Background */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        backgroundImage: 'linear-gradient(180deg, rgba(3, 7, 18, 0.5) 0%, rgba(3, 7, 18, 0.95) 100%), url("/media/nasa/iss-lab.jpg")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        padding: '3.5rem 3rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '2px', marginBottom: '8px' }}>
              <Eye size={14} />
              <span>NASA DESTINY LABORATORY · MICROGRAVITY SCIENCE</span>
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-1px' }}>
              Space Station Research Control
            </h1>
          </div>
          <StatusBadge status="NOMINAL" label="RESEARCH ACTIVE" />
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <MetricCard icon={FlaskConical} label="Total Projects" value={experiments.length} sub="Active In Microgravity" glowColor="#38bdf8" />
        <MetricCard icon={Activity} label="Average Progress" value={`${(experiments.reduce((acc, x) => acc + Number(x.progress_pct || 0), 0) / (experiments.length || 1)).toFixed(1)}%`} sub="Completion Rate" glowColor="#34d399" />
        <MetricCard icon={User} label="Lead Researchers" value={new Set(experiments.map(x => x.lead_researcher)).size} sub="Flight Scientists" glowColor="#c084fc" />
      </div>

      {/* Experiments Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {experiments.map((exp) => {
          const pct = Math.min(100, Math.max(0, Number(exp.progress_pct || 0)));
          return (
            <div
              key={exp.experiment_id || exp.code}
              onClick={() => openDetailModal(exp)}
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8' }}>{exp.code} · {exp.module_name}</span>
                  <StatusBadge status={exp.status} size="sm" />
                </div>

                <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
                  {exp.title}
                </h3>

                <p style={{ margin: '0 0 1rem', fontSize: '12px', color: '#94a3b8' }}>
                  Lead Researcher: <b style={{ color: '#cbd5e1' }}>{exp.lead_researcher}</b>
                </p>
              </div>

              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'monospace', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>PROGRESS</span>
                    <b style={{ color: '#38bdf8' }}>{pct}%</b>
                  </div>
                  <div style={{ height: '8px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.8)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #34d399)', borderRadius: 'inherit' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                  <span>Started: {exp.started_on} · {exp.log_count ?? 0} Logs</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Inspect <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Experiment Detail Modal */}
      {selectedExperiment && (
        <Modal isOpen={!!selectedExperiment} onClose={() => setSelectedExperiment(null)} title={`${selectedExperiment.code} — Experiment Control & Data Logs`}>
          {loadingDetail ? (
            <LoadingSkeleton height="100px" count={2} />
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                    {selectedExperiment.title}
                  </h3>
                  <small style={{ color: '#94a3b8', fontSize: '11px' }}>Lead Researcher: {selectedExperiment.lead_researcher} · Module: {selectedExperiment.module_name}</small>
                </div>
                <StatusBadge status={selectedExperiment.status} />
              </div>

              {/* Experiment Logs */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> Research Observation Logs (PostgreSQL experiment_logs)
                </h4>

                {experimentDetail?.logs && experimentDetail.logs.length > 0 ? (
                  <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {experimentDetail.logs.map((l) => (
                      <div key={l.experiment_log_id} style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '8px', fontSize: '12px' }}>
                        <p style={{ margin: '0 0 4px', color: '#f8fafc' }}>{l.note}</p>
                        <span style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace' }}>
                          Logged at: {new Date(l.logged_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '1rem', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '8px', color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
                    No research observation logs recorded yet.
                  </div>
                )}
              </div>

              {/* Experiment Metric Results */}
              {experimentDetail?.results && experimentDetail.results.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>
                    Metric Measurement Results
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {experimentDetail.results.map((r) => (
                      <div key={r.result_id} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontFamily: 'monospace' }}>{r.metric_name}</span>
                        <b style={{ fontSize: '1.1rem', color: '#f8fafc' }}>{r.metric_value} {r.unit}</b>
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
