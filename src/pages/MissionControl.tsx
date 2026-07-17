import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { StatCard, Badge, ProgressBar, HealthRing, formatCurrency, formatDate, timeAgo, daysUntil } from '../components/ui';
import type { Project, ActivityItem, Approval, Meeting } from '../types';
import { ProjectMap } from '../components/ProjectMap';

export function MissionControl() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [p, act, appr, mtg, inv, inc] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('activity_feed').select('*').order('created_at', { ascending: false }).limit(15),
        supabase.from('approvals').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
        supabase.from('meetings').select('*').gte('meeting_date', new Date().toISOString()).order('meeting_date').limit(5),
        supabase.from('invoices').select('*').neq('status', 'paid').order('created_at', { ascending: false }).limit(5),
        supabase.from('hse_incidents').select('*').eq('status', 'open').limit(5),
      ]);
      setProjects(p.data || []);
      setActivities(act.data || []);
      setApprovals(appr.data || []);
      setMeetings(mtg.data || []);
      setInvoices(inv.data || []);
      setIncidents(inc.data || []);
    })();
  }, []);

  const running = projects.filter((p) => p.status === 'active');
  const delayed = projects.filter((p) => p.status === 'active' && p.progress < 50 && daysUntil(p.end_date) < 30 && daysUntil(p.end_date) > 0);
  const totalInvoice = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);

  const resolveApproval = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('approvals').update({
      status, approved_by_name: profile?.full_name,
      approved_by: profile?.id, resolved_at: new Date().toISOString(),
    }).eq('id', id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="page">
      {/* Daily Focus */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))', border: 'none', color: '#fff' }}>
        <h2 style={{ color: '#fff', fontSize: 20 }}>Halo, {profile?.full_name}</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>Hari ini ada {approvals.length} approval, {meetings.length} meeting, dan beberapa tugas menunggu.</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {approvals.length > 0 && <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>✔ {approvals.length} Approval</div>}
          {meetings.length > 0 && <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>📅 {meetings.length} Meeting</div>}
          {running.length > 0 && <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>📂 {running.length} Proyek Aktif</div>}
          {incidents.length > 0 && <div style={{ background: 'rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>🔴 {incidents.length} Safety Issue</div>}
        </div>
      </div>

      {/* Mission Control Stats */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Project Running" value={running.length} color="var(--success-500)" icon="📂" />
        <StatCard label="Project Delay" value={delayed.length} color={delayed.length > 0 ? 'var(--warning-500)' : 'var(--success-500)'} icon="🟠" />
        <StatCard label="Safety Issue" value={incidents.length} color={incidents.length > 0 ? 'var(--error-500)' : 'var(--success-500)'} icon="🔴" />
        <StatCard label="Invoice Outstanding" value={formatCurrency(totalInvoice)} icon="💰" />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Activity Feed */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Activity Feed</h3>
          {activities.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Belum ada aktivitas</p> :
            activities.map((a) => (
              <div key={a.id} className="timeline-item">
                <div className="timeline-dot" style={{ background: 'var(--primary-500)' }} />
                <div className="timeline-content">
                  <div style={{ fontSize: 14 }}><strong>{a.user_name || 'System'}</strong> {a.action}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{a.description}</div>
                  <div className="timeline-time">{timeAgo(a.created_at)}</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Approval Queue */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Approval Queue</h3>
          {approvals.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Tidak ada approval menunggu</p> :
            approvals.map((a) => (
              <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{a.entity_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.entity_type} - {a.requested_by_name}</div>
                  </div>
                  <Badge status={a.priority} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-sm btn-primary" onClick={() => resolveApproval(a.id, 'approved')}>Setujui</button>
                  <button className="btn btn-sm btn-outline" onClick={() => resolveApproval(a.id, 'rejected')}>Tolak</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Project Map */}
      <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 0' }}><h3>Project Map</h3></div>
        <div style={{ padding: 16 }}>
          <ProjectMap projects={projects} />
        </div>
      </div>

      <div className="grid grid-3">
        {/* Upcoming Deadlines */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Upcoming Deadlines</h3>
          {projects.filter((p) => p.end_date && daysUntil(p.end_date) > 0 && daysUntil(p.end_date) < 60).slice(0, 5).map((p) => (
            <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.id}`)}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: daysUntil(p.end_date) < 14 ? 'var(--error-600)' : 'var(--text-muted)' }}>
                {daysUntil(p.end_date)} hari lagi - {formatDate(p.end_date)}
              </div>
            </div>
          ))}
          {projects.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Tidak ada deadline</p>}
        </div>

        {/* Smart Project Cards */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Project Health</h3>
          {running.slice(0, 5).map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.id}`)}>
              <HealthRing score={p.health_score} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Progress {p.progress}%</div>
              </div>
            </div>
          ))}
          {running.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Belum ada proyek aktif</p>}
        </div>

        {/* Meetings */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Upcoming Meetings</h3>
          {meetings.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Tidak ada meeting</p> :
            meetings.map((m) => (
              <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{m.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(m.meeting_date)} - {m.duration_min} min</div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Quick Action FAB */}
      <button className="fab" onClick={() => navigate('/projects')} title="Quick Add">+</button>
    </div>
  );
}
