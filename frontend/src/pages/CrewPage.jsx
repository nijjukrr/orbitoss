import React, { useState, useEffect } from 'react';
import { Users, UserCheck, CheckSquare, Plus, Clock, Shield, Activity, Calendar } from 'lucide-react';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton.jsx';
import { ErrorState } from '../components/shared/ErrorState.jsx';
import { Modal } from '../components/shared/Modal.jsx';

export function CrewPage() {
  const [crew, setCrew] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  const fetchCrewData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [crewRes, tasksRes] = await Promise.all([
        api.getCrew(),
        api.getCrewTasks().catch(() => [])
      ]);
      setCrew(crewRes || []);
      setTasks(tasksRes || []);
      if (crewRes && crewRes.length > 0) setSelectedCrewId(crewRes[0].crew_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrewData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle || !selectedCrewId) return;
    setCreatingTask(true);
    try {
      await api.createCrewTask({ crewId: selectedCrewId, title: newTitle, priority: 'WARNING' });
      setNewTitle('');
      setIsTaskModalOpen(false);
      fetchCrewData();
    } catch (err) {
      alert(`Task creation failed: ${err.message}`);
    } finally {
      setCreatingTask(false);
    }
  };

  if (loading) return <LoadingSkeleton height="160px" count={4} />;
  if (error) return <ErrorState message={error} onRetry={fetchCrewData} />;

  // Shift Mapping per Role/Member
  const getShiftInfo = (role, index) => {
    const shifts = [
      { name: 'ALPHA SHIFT', hours: '00:00 - 08:00 UTC', active: true, color: '#38bdf8' },
      { name: 'BETA SHIFT', hours: '08:00 - 16:00 UTC', active: false, color: '#34d399' },
      { name: 'GAMMA SHIFT', hours: '16:00 - 24:00 UTC', active: false, color: '#c084fc' }
    ];
    return shifts[index % 3];
  };

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1px' }}>
            <span>HORIZON MISSION OR-26</span> · <span>CREW SHIFT & WORKLOAD MANAGEMENT</span>
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            Astronaut Roster & Operations Schedule
          </h1>
        </div>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.65rem 1.25rem',
            background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
          }}
        >
          <Plus size={16} /> Assign Crew Task
        </button>
      </div>

      {/* SECTION 1: CURRENT CREW SHIFT TIMELINE VISUALIZATION */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.7))',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        padding: '1.75rem',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1.5px' }}>
              24-HOUR ORBITAL SCHEDULE
            </p>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>
              Current Crew Shift Timeline
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.6)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <Clock size={14} style={{ color: '#38bdf8' }} />
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#f8fafc', fontWeight: 700 }}>
              CURRENT ISS UTC TIME: {new Date().toUTCString().slice(17, 25)}
            </span>
          </div>
        </div>

        {/* 24-Hour Visual Shift Bands */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', position: 'relative' }}>
          {[
            { title: 'ALPHA SHIFT (00:00 - 08:00)', leader: 'Commander', active: true, desc: 'Systems Operations & Earth Science' },
            { title: 'BETA SHIFT (08:00 - 16:00)', leader: 'Flight Engineer', active: false, desc: 'EVAs & Microgravity Experiments' },
            { title: 'GAMMA SHIFT (16:00 - 24:00)', leader: 'Science Officer', active: false, desc: 'Maintenance & Life Support Check' }
          ].map((shift, idx) => (
            <div
              key={shift.title}
              style={{
                background: shift.active ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.4)',
                border: `1px solid ${shift.active ? '#38bdf8' : 'rgba(56, 189, 248, 0.15)'}`,
                borderRadius: '12px',
                padding: '1.25rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <b style={{ fontSize: '12px', fontFamily: 'monospace', color: shift.active ? '#38bdf8' : '#94a3b8' }}>
                  {shift.title}
                </b>
                {shift.active && (
                  <span style={{ background: '#0284c7', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', fontFamily: 'monospace' }}>
                    ● ACTIVE SHIFT
                  </span>
                )}
              </div>

              <p style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700 }}>{shift.leader}</p>
              <small style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>{shift.desc}</small>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: ASTRONAUT ROSTER & WORKLOAD VISUALIZATION */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1.5px' }}>
            ASTRONAUT ROSTER & AVAILABILITY
          </p>
          <h3 style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
            On-Duty Crew Workload Breakdown
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {crew.map((c, idx) => {
            const initials = (c.full_name || 'Crew Member')
              .split(' ')
              .map((n) => n[0])
              .join('');
            const shiftInfo = getShiftInfo(c.role, idx);
            const totalTasks = (c.open_tasks || 0) + (c.completed_tasks || 0);
            const completionPct = totalTasks > 0 ? Math.round(((c.completed_tasks || 0) / totalTasks) * 100) : 100;
            const activeTask = tasks.find(t => t.crew_id === c.crew_id && t.status !== 'COMPLETED');

            return (
              <div
                key={c.crew_id}
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      fontFamily: 'monospace',
                      boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)'
                    }}>
                      {initials}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8' }}>{c.role || 'Astronaut'}</span>
                        <StatusBadge status={c.status || 'ACTIVE'} size="sm" />
                      </div>

                      <h3 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                        {c.full_name}
                      </h3>

                      <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                        Country: <b>{c.nationality}</b> · Shift: <b style={{ color: shiftInfo.color }}>{shiftInfo.name}</b>
                      </small>
                    </div>
                  </div>

                  {/* Current Active Task */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '10px 14px', borderRadius: '10px', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8', display: 'block' }}>CURRENT TASK</span>
                    <b style={{ fontSize: '12px', color: '#f8fafc', display: 'block', marginTop: '2px' }}>
                      {activeTask ? activeTask.title : 'Routine Habitat Monitoring'}
                    </b>
                  </div>

                  {/* Workload Completion Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'monospace', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>WORKLOAD PROGRESS</span>
                      <b style={{ color: '#38bdf8' }}>{completionPct}%</b>
                    </div>
                    <div style={{ height: '8px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.8)', overflow: 'hidden' }}>
                      <div style={{ width: `${completionPct}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #34d399)', borderRadius: 'inherit' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(15, 23, 42, 0.8)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                  <div>
                    <b style={{ fontSize: '1.25rem', color: '#38bdf8', display: 'block' }}>{c.open_tasks ?? 0}</b>
                    <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>OPEN TASKS</span>
                  </div>
                  <div>
                    <b style={{ fontSize: '1.25rem', color: '#34d399', display: 'block' }}>{c.completed_tasks ?? 0}</b>
                    <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>COMPLETED</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: ASSIGNED TASK LOG TABLE */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '16px',
        padding: '1.5rem',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1px' }}>
              POSTGRESQL crew_tasks TABLE
            </p>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Assigned Operational Work Items
            </h3>
          </div>
          <CheckSquare size={20} style={{ color: '#38bdf8' }} />
        </div>

        {tasks.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {tasks.map((t) => (
              <div key={t.task_id} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b style={{ fontSize: '0.95rem', color: '#f8fafc', display: 'block' }}>{t.title}</b>
                  <small style={{ color: '#94a3b8', fontSize: '11px' }}>Assignee: {t.assignee || 'Unassigned'} · Module: {t.module_name || 'Station Wide'}</small>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <StatusBadge status={t.priority} size="sm" />
                  <StatusBadge status={t.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
            No pending crew tasks recorded.
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Assign New Crew Task">
        <form onSubmit={handleCreateTask} style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', marginBottom: '6px' }}>ASSIGN TO ASTRONAUT</label>
            <select
              value={selectedCrewId}
              onChange={(e) => setSelectedCrewId(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#f8fafc' }}
            >
              {crew.map((c) => (
                <option key={c.crew_id} value={c.crew_id}>{c.full_name} ({c.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', marginBottom: '6px' }}>TASK TITLE / INSTRUCTIONS</label>
            <input
              type="text"
              placeholder="e.g. Inspect HAB module thermal seal"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#f8fafc' }}
            />
          </div>

          <button
            type="submit"
            disabled={creatingTask}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {creatingTask ? 'Inserting Task...' : 'Create Task'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
