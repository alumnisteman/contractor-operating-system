import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { StatCard, Badge, ProgressBar, HealthScore, formatCurrency, formatDate, timeAgo, calcHealthScore } from '../components/ui';
import type { Project, ActivityFeedItem, Approval, Task } from '../types';

export function MissionControl() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [cashflowPct, setCashflowPct] = useState(0);
  const [safetyIssues, setSafetyIssues] = useState(0);
  const [materialDelays, setMaterialDelays] = useState(0);

  const load = useCallback(async () => {
    const { data: p } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(p || []);
    const running = (p || []).filter(x => x.status === 'active').length;
    const delayed = (p || []).filter(x => x.status === 'active' && x.progress < 50).length;

    const { data: a } = await supabase.from('activity_feed').select('*').order('created_at', { ascending: false }).limit(30);
    setActivities(a || []);

    const { data: ap } = await supabase.from('approvals').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(10);
    setApprovals(ap || []);

    const { data: t } = await supabase.from('tasks').select('*').neq('status', 'done').order('due_date', { ascending: true }).limit(10);
    setTasks(t || []);

    const { data: inv } = await supabase.from('invoices').select('total').eq('status', 'paid');
    const total = (inv || []).reduce((s, i: any) => s + (i.total || 0), 0);
    setInvoiceTotal(total);

    const { count } = await supabase.from('hse_incidents').select('*', { count: 'exact', head: true }).eq('status', 'open');
    setSafetyIssues(count || 0);

    setMaterialDelays(0);
    setCashflowPct(12);
    void running; void delayed;
  }, []);

  useEffect(() => { load(); }, [load]);

  const running = projects.filter(p => p.status === 'active').length;
  const delayed = projects.filter(p => p.status === 'active' && p.progress < 50).length;
  const todayTasks = tasks.filter(t => t.due_date === new Date().toISOString().slice(0, 10));

  return (
    <div className="page">
      {/* Daily Focus */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))', color: '#fff', border: 'none' }}>
        <h2 style={{ color: '#fff', fontSize: 18 }}>Halo, {profile?.full_name?.split(' ')[0] || ''} 👋</h2>
        <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 14, marginTop: 4 }}>Hari ini ada {approvals.length} approval, {todayTasks.length} task, {tasks.length} total pekerjaan</p>
      </div>

      {/* Mission Control Stats */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Project Running" value={running} color="var(--success-500)" />
        <StatCard label="Project Delay" value={delayed} color="var(--warning-500)" />
        <StatCard label="Safety Issue" value={safetyIssues} color={safetyIssues > 0 ? 'var(--error-500)' : 'var(--success-500)'} />
        <StatCard label="Cashflow" value={`+${cashflowPct}%`} color="var(--success-500)" />
        <StatCard label="Invoice Paid" value={formatCurrency(invoiceTotal)} />
        <StatCard label="Material Delay" value={materialDelays} color="var(--warning-500)" />
        <StatCard label="Pending Approval" value={approvals.length} color={approvals.length > 0 ? 'var(--warning-500)' : 'var(--success-500)'} />
        <StatCard label="Open Tasks" value={tasks.length} />
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12, fontSize: 16 }}>Quick Action</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: '+ Project', to: '/projects' },
            { label: '+ Purchase', to: '/warehouse' },
            { label: '+ Invoice', to: '/finance' },
            { label: '+ Employee', to: '/hr' },
            { label: '+ Progress', to: '/projects' },
            { label: '+ Equipment', to: '/equipment' },
          ].map(a => (
            <button key={a.label} className="btn btn-secondary" onClick={() => navigate(a.to)}>{a.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Activity Feed */}
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>Activity Feed</h3>
          {activities.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Belum ada aktivitas</p> :
            activities.slice(0, 15).map(a => (
              <div key={a.id} className="activity-item">
                <div className="activity-dot" style={{ background: a.activity_type === 'safety' ? 'var(--error-500)' : a.activity_type === 'approval' ? 'var(--warning-500)' : 'var(--primary-400)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{a.message}</div>
                  <div className="activity-time">{timeAgo(a.created_at)}</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Approval Queue */}
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>Approval Queue</h3>
          {approvals.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tidak ada approval pending</p> :
            approvals.map(ap => (
              <div key={ap.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{ap.approval_type}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(ap.created_at)}</div>
                </div>
                <Badge status={ap.status} />
              </div>
            ))
          }
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12, fontSize: 16 }}>Upcoming Deadline</h3>
        {tasks.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tidak ada deadline</p> :
          <table className="table">
            <thead><tr><th>Task</th><th>Assignee</th><th>Priority</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>
              {tasks.slice(0, 8).map(t => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{t.assigned_to_name || '-'}</td>
                  <td><Badge status={t.priority} /></td>
                  <td>{formatDate(t.due_date)}</td>
                  <td><Badge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {/* Project Smart Cards */}
      <h3 style={{ marginBottom: 12, fontSize: 16 }}>Project</h3>
      {projects.length === 0 ? <div className="card"><p style={{ color: 'var(--text-muted)' }}>Belum ada project. Buat project pertama Anda.</p></div> :
        <div className="grid grid-3">
          {projects.slice(0, 6).map(p => {
            const score = calcHealthScore(p);
            return (
              <div key={p.id} className="card" style={{ cursor: 'pointer', transition: 'box-shadow 180ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
                onClick={() => navigate(`/projects/${p.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 15 }}>{p.name}</h4>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.project_type || '-'} • {p.location_name || '-'}</span>
                  </div>
                  <HealthScore score={score} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progress</span><span>{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>Kontrak: {formatCurrency(p.contract_value || 0)}</span>
                  <Badge status={p.status} />
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}
