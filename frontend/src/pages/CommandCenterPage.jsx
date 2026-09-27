import React, { useState, useEffect } from 'react';
import { Terminal, Send, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Clock, Check } from 'lucide-react';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton.jsx';

export function CommandCenterPage() {
  const [satelliteCode, setSatelliteCode] = useState('SAT-03');
  const [commandType, setCommandType] = useState('SAFE_MODE');
  const [activeCommand, setActiveCommand] = useState(null);
  const [commandLogs, setCommandLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleTransmitCommand = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg('');
    try {
      const res = await api.createCommand({ satelliteCode, commandType });
      setSuccessMsg(`Command created successfully (ID: ${res.command_id.slice(0, 8)}). Initial state: CREATED.`);
      fetchCommandDetails(res.command_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommandDetails = async (cmdId) => {
    try {
      const res = await api.getCommand(cmdId);
      if (res?.command) {
        setActiveCommand(res.command);
        setCommandLogs(res.logs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvanceStatus = async (nextStatus) => {
    if (!activeCommand?.command_id) return;
    setAdvancing(true);
    setError(null);
    try {
      await api.advanceCommand(activeCommand.command_id, nextStatus, `Operator advanced status to ${nextStatus}`);
      await fetchCommandDetails(activeCommand.command_id);
    } catch (err) {
      setError(`Status advance failed: ${err.message}`);
    } finally {
      setAdvancing(false);
    }
  };

  const currentStatus = activeCommand?.status || 'CREATED';
  const statusOrder = ['CREATED', 'TRANSMITTED', 'RECEIVED', 'EXECUTED'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStageTimestamp = (statusName) => {
    if (!activeCommand) return null;
    const logMatch = commandLogs.find(l => l.status === statusName);
    if (logMatch) return new Date(logMatch.logged_at).toLocaleTimeString();
    if (statusName === 'CREATED' && activeCommand.created_at) {
      return new Date(activeCommand.created_at).toLocaleTimeString();
    }
    return null;
  };

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            <span>UPLINK OPERATIONS</span> · <span>DBMS TRANSACTION & STORED PROCEDURE PIPELINE</span>
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Spacecraft Command & Control Center
          </h1>
        </div>
        <StatusBadge status="NOMINAL" label="UPLINK READY" />
      </div>

      {/* Command Transmission Form */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.75rem',
        boxShadow: 'var(--card-shadow)'
      }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Send size={18} style={{ color: 'var(--text-primary)' }} /> Transmit Transactional Spacecraft Command
        </h3>

        <form onSubmit={handleTransmitCommand} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1.25rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: '6px' }}>TARGET SPACECRAFT</label>
            <select
              value={satelliteCode}
              onChange={(e) => setSatelliteCode(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600 }}
            >
              <option value="SAT-01">SAT-01 (ISS / Aurelia)</option>
              <option value="SAT-02">SAT-02 (AstraRelay-1)</option>
              <option value="SAT-03">SAT-03 (DeepSpace-3)</option>
              <option value="SAT-04">SAT-04 (EcoWatch-4)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: '6px' }}>COMMAND ACTION</label>
            <select
              value={commandType}
              onChange={(e) => setCommandType(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600 }}
            >
              {['SAFE_MODE', 'RESTART_PAYLOAD', 'ORIENTATION_CHANGE', 'REQUEST_TELEMETRY'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              background: 'var(--button-primary-bg)',
              border: '1px solid var(--button-primary-bg)',
              color: 'var(--button-primary-text)',
              fontWeight: 900,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: 'var(--card-shadow)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Transmitting...' : 'Transmit Command →'}
          </button>
        </form>

        {successMsg && (
          <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'monospace' }}>
            ✓ {successMsg}
          </div>
        )}
        {error && (
          <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace' }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* 4-Step Lifecycle Stepper with Timestamps & Advance Trigger Controls */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.75rem',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>
              POSTGRESQL STORED PROCEDURE advance_command()
            </p>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Command Lifecycle State Machine: <span style={{ color: 'var(--text-primary)' }}>{currentStatus}</span>
            </h3>
          </div>

          {activeCommand?.command_id && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {currentStatus === 'CREATED' && (
                <button
                  onClick={() => handleAdvanceStatus('TRANSMITTED')}
                  disabled={advancing}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  ➡ Advance to TRANSMITTED
                </button>
              )}
              {currentStatus === 'TRANSMITTED' && (
                <button
                  onClick={() => handleAdvanceStatus('RECEIVED')}
                  disabled={advancing}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  ➡ Advance to RECEIVED
                </button>
              )}
              {currentStatus === 'RECEIVED' && (
                <button
                  onClick={() => handleAdvanceStatus('EXECUTED')}
                  disabled={advancing}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', background: 'var(--button-primary-bg)', border: '1px solid var(--button-primary-bg)', color: 'var(--button-primary-text)', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', boxShadow: 'var(--card-shadow)' }}
                >
                  ✔ Execute Command (Stored Procedure)
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4-Step Visual Lifecycle Stepper */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', position: 'relative', margin: '2rem 0 1.5rem' }}>
          {statusOrder.map((st, idx) => {
            const isCompleted = currentIndex >= idx;
            const isActive = currentIndex === idx;
            const timestamp = getStageTimestamp(st);

            return (
              <div
                key={st}
                style={{
                  background: isActive ? 'var(--surface-muted)' : isCompleted ? 'var(--surface)' : 'var(--surface-muted)',
                  border: `1px solid ${isActive ? 'var(--text-primary)' : isCompleted ? 'var(--border-strong)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  padding: '1.25rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '8px'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: `2px solid ${isActive ? 'var(--text-primary)' : isCompleted ? 'var(--text-primary)' : 'var(--border)'}`,
                  background: isActive ? 'var(--button-primary-bg)' : isCompleted ? 'var(--surface-muted)' : 'var(--surface)',
                  color: isActive ? 'var(--button-primary-text)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  fontSize: '13px',
                  fontFamily: 'monospace'
                }}>
                  {isCompleted ? '✓' : idx + 1}
                </div>

                <b style={{ fontSize: '0.9rem', color: isActive ? 'var(--text-primary)' : isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {st}
                </b>

                <small style={{ fontSize: '10px', fontFamily: 'monospace', color: timestamp ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {timestamp ? `● ${timestamp}` : 'Pending'}
                </small>
              </div>
            );
          })}
        </div>

        {/* Audit Log Trail underneath */}
        {commandLogs.length > 0 && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              Database Audit Trail (POSTGRESQL command_logs table)
            </h4>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {commandLogs.map((log) => (
                <div key={log.logged_at} style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span>Stage: <b style={{ color: 'var(--text-primary)' }}>{log.status}</b> — {log.note || 'Status transitioned by PostgreSQL procedure'}</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>{new Date(log.logged_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
