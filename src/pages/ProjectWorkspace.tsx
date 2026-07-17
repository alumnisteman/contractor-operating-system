import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Badge, ProgressBar, HealthRing, EmptyState, Modal, formatCurrency, formatDate, formatDateTime, timeAgo, daysUntil } from '../components/ui';
import type { Project, WBS, Task, ActivityItem, DailyProgress, Photo, QCInspection, Meeting } from '../types';
import { useAuth } from '../lib/AuthContext';

type Tab = 'overview' | 'wbs' | 'tasks' | 'timeline' | 'material' | 'qc' | 'hse' | 'gallery' | 'meetings' | 'equipment' | 'documents' | 'finance';

export function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (id) (async () => {
      const { data } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
      setProject(data as Project | null);
    })();
  }, [id]);

  if (!project) return <div className="page"><p>Memuat...</p></div>;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' }, { key: 'wbs', label: 'WBS' },
    { key: 'tasks', label: 'Tasks' }, { key: 'timeline', label: 'Timeline' },
    { key: 'material', label: 'Material' }, { key: 'qc', label: 'QC' },
    { key: 'hse', label: 'HSE' }, { key: 'gallery', label: 'Gallery' },
    { key: 'meetings', label: 'Meeting' }, { key: 'equipment', label: 'Equipment' },
    { key: 'documents', label: 'Documents' }, { key: 'finance', label: 'Finance' },
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-sm btn-outline" onClick={() => navigate('/projects')}>← Kembali</button>
        <div style={{ flex: 1 }}>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-subtitle">{project.project_type} - {project.up2d} {project.uid} {project.up3} {project.ulp}</p>
        </div>
        <HealthRing score={project.health_score} size={56} />
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`tab ${tab === t.key ? 'tab-active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab project={project} />}
      {tab === 'wbs' && <WBSTab projectId={project.id} />}
      {tab === 'tasks' && <TasksTab projectId={project.id} />}
      {tab === 'timeline' && <TimelineTab projectId={project.id} />}
      {tab === 'material' && <MaterialTab projectId={project.id} />}
      {tab === 'qc' && <QCTab projectId={project.id} />}
      {tab === 'hse' && <HSETab projectId={project.id} />}
      {tab === 'gallery' && <GalleryTab projectId={project.id} />}
      {tab === 'meetings' && <MeetingsTab projectId={project.id} />}
      {tab === 'equipment' && <EquipmentTab projectId={project.id} />}
      {tab === 'documents' && <DocumentsTab projectId={project.id} />}
      {tab === 'finance' && <FinanceTab projectId={project.id} />}
    </div>
  );
}

function OverviewTab({ project }: { project: Project }) {
  const [wbs, setWbs] = useState<WBS[]>([]);
  const [termin, setTermin] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const [w, t, c, tk] = await Promise.all([
        supabase.from('project_wbs').select('*').eq('project_id', project.id),
        supabase.from('project_termin').select('*').eq('project_id', project.id).order('termin_no'),
        supabase.from('project_cashflow').select('*').eq('project_id', project.id).order('month_date'),
        supabase.from('tasks').select('*').eq('project_id', project.id).limit(5),
      ]);
      setWbs(w.data || []); setTermin(t.data || []); setCashflow(c.data || []); setTasks(tk.data || []);
    })();
  }, [project.id]);

  const totalWeight = wbs.reduce((s, w) => s + (w.weight || 0), 0);
  const weightedProgress = wbs.length > 0 ? wbs.reduce((s, w) => s + (w.actual_progress * w.weight), 0) / (totalWeight || 1) : 0;
  const terminPaid = termin.filter((t) => t.status === 'paid').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Informasi Proyek</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
          <div><label>SPMK</label><div>{project.spmk_no || '-'}</div></div>
          <div><label>PM</label><div>{project.pm_name || '-'}</div></div>
          <div><label>Kontrak</label><div>{formatCurrency(project.contract_value || 0)}</div></div>
          <div><label>Mulai</label><div>{formatDate(project.start_date)}</div></div>
          <div><label>Selesai</label><div>{formatDate(project.end_date)}</div></div>
          <div><label>Sisa Hari</label><div>{daysUntil(project.end_date)} hari</div></div>
          <div><label>Risk</label><div><Badge status={project.risk_level} /></div></div>
          <div><label>Status</label><div><Badge status={project.status} /></div></div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span>Progress WBS (Weighted)</span><span>{weightedProgress.toFixed(1)}%</span>
          </div>
          <ProgressBar value={weightedProgress} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>AI Insights</h3>
        <div className="ai-insight">
          <div className="ai-insight-title">⚠ Analisis Otomatis</div>
          {project.progress < 50 && daysUntil(project.end_date) < 30 && daysUntil(project.end_date) > 0 && (
            <div className="ai-insight-item">⚠ Progress terlambat - sisa {daysUntil(project.end_date)} hari, progress baru {project.progress}%</div>
          )}
          {termin.filter((t) => t.status === 'pending').length > 0 && (
            <div className="ai-insight-item">⚠ Termin #{termin.filter((t) => t.status === 'pending')[0].termin_no} belum ditagih</div>
          )}
          {project.health_score < 70 && (
            <div className="ai-insight-item">⚠ Health score {project.health_score}/100 - di bawah ambang batas</div>
          )}
          {wbs.filter((w) => w.qc_status === 'failed').length > 0 && (
            <div className="ai-insight-item">⚠ {wbs.filter((w) => w.qc_status === 'failed').length} WBS gagal QC</div>
          )}
          {project.progress >= 50 && daysUntil(project.end_date) > 30 && (
            <div className="ai-insight-item">✓ Proyek berjalan sesuai jadwal</div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Termin Pembayaran</h3>
        {termin.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Belum ada termin</p> :
          <table className="table">
            <thead><tr><th>Termin</th><th>Nilai</th><th>%</th><th>Status</th></tr></thead>
            <tbody>
              {termin.map((t) => (
                <tr key={t.id}><td>#{t.termin_no}</td><td>{formatCurrency(t.amount)}</td><td>{t.percentage}%</td><td><Badge status={t.status} /></td></tr>
              ))}
            </tbody>
          </table>
        }
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>Total dibayar: {formatCurrency(terminPaid)}</div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Recent Tasks</h3>
        {tasks.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Belum ada task</p> :
          tasks.map((t) => (
            <div key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><Badge status={t.status} /> - {formatDate(t.due_date)}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function WBSTab({ projectId }: { projectId: string }) {
  const [wbs, setWbs] = useState<WBS[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WBS | null>(null);

  const load = async () => {
    const { data } = await supabase.from('project_wbs').select('*').eq('project_id', projectId).order('created_at');
    setWbs(data || []);
  };
  useEffect(() => { load(); }, [projectId]);

  const updateProgress = async (id: string, progress: number) => {
    await supabase.from('project_wbs').update({ actual_progress: progress }).eq('id', id);
    setWbs((prev) => prev.map((w) => w.id === id ? { ...w, actual_progress: progress } : w));
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h3>WBS - Work Breakdown Structure</h3>
        <button className="btn btn-sm btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Tambah WBS</button>
      </div>
      {wbs.length === 0 ? <EmptyState message="Belum ada WBS" /> : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Code</th><th>Nama</th><th>Vol</th><th>Unit</th><th>Weight</th><th>Target</th><th>Aktual</th><th>QC</th><th>Approval</th></tr></thead>
            <tbody>
              {wbs.map((w) => (
                <tr key={w.id}>
                  <td>{w.code || '-'}</td>
                  <td>{w.name}</td>
                  <td>{w.volume}</td>
                  <td>{w.unit || '-'}</td>
                  <td>{w.weight}%</td>
                  <td>{w.target_progress}%</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="range" min="0" max="100" value={w.actual_progress}
                        onChange={(e) => updateProgress(w.id, parseFloat(e.target.value))}
                        style={{ width: 80, padding: 0 }} />
                      <span style={{ fontSize: 12 }}>{w.actual_progress}%</span>
                    </div>
                  </td>
                  <td>{w.qc_status ? <Badge status={w.qc_status} /> : '-'}</td>
                  <td><Badge status={w.approval_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <WBSForm projectId={projectId} editing={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function WBSForm({ projectId, editing, onClose, onSaved }: { projectId: string; editing: WBS | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: editing?.name || '', code: editing?.code || '', description: editing?.description || '',
    volume: editing?.volume || 0, unit: editing?.unit || '', weight: editing?.weight || 0,
    target_progress: editing?.target_progress || 0, actual_progress: editing?.actual_progress || 0,
  });

  const submit = async () => {
    if (editing) {
      await supabase.from('project_wbs').update(form).eq('id', editing.id);
    } else {
      await supabase.from('project_wbs').insert({ ...form, project_id: projectId });
    }
    onSaved();
  };

  return (
    <Modal title={editing ? "Edit WBS" : "Tambah WBS"} onClose={onClose}>
      <div className="form-group"><label>Nama Pekerjaan</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div className="form-row">
        <div className="form-group"><label>Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
        <div className="form-group"><label>Unit</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Volume</label><input type="number" value={form.volume} onChange={(e) => setForm({ ...form, volume: parseFloat(e.target.value) || 0 })} /></div>
        <div className="form-group"><label>Weight (%)</label><input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Target Progress (%)</label><input type="number" value={form.target_progress} onChange={(e) => setForm({ ...form, target_progress: parseFloat(e.target.value) || 0 })} /></div>
        <div className="form-group"><label>Aktual Progress (%)</label><input type="number" value={form.actual_progress} onChange={(e) => setForm({ ...form, actual_progress: parseFloat(e.target.value) || 0 })} /></div>
      </div>
      <button className="btn btn-primary" onClick={submit}>Simpan</button>
    </Modal>
  );
}

function TasksTab({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    setTasks(data || []);
  };
  useEffect(() => { load(); }, [projectId]);

  const columns = ['todo', 'in_progress', 'review', 'done', 'blocked'];

  const moveTask = async (id: string, status: string) => {
    await supabase.from('tasks').update({ status }).eq('id', id);
    load();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h3>Tasks</h3>
        <button className="btn btn-sm btn-primary" onClick={() => setShowForm(true)}>+ Tambah Task</button>
      </div>
      <div className="kanban-board">
        {columns.map((col) => (
          <div key={col} className="kanban-col" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text'); moveTask(id, col); }}>
            <div className="kanban-col-header">
              <span style={{ textTransform: 'capitalize' }}>{col.replace(/_/g, ' ')}</span>
              <span className="badge badge-neutral">{tasks.filter((t) => t.status === col).length}</span>
            </div>
            {tasks.filter((t) => t.status === col).map((t) => (
              <div key={t.id} className="kanban-card" draggable onDragStart={(e) => e.dataTransfer.setData('text', t.id)} onClick={() => moveTask(t.id, col === 'done' ? 'todo' : col === 'todo' ? 'in_progress' : 'review')}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  <Badge status={t.priority} /> {t.due_date && ` - ${formatDate(t.due_date)}`}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {showForm && <TaskForm projectId={projectId} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function TaskForm({ projectId, onClose, onSaved }: { projectId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', status: 'todo' });
  const submit = async () => {
    await supabase.from('tasks').insert({ ...form, project_id: projectId, due_date: form.due_date || null });
    onSaved();
  };
  return (
    <Modal title="Tambah Task" onClose={onClose}>
      <div className="form-group"><label>Judul</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div className="form-group"><label>Deskripsi</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="form-row">
        <div className="form-group"><label>Prioritas</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
        <div className="form-group"><label>Due Date</label><input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
      </div>
      <button className="btn btn-primary" onClick={submit}>Simpan</button>
    </Modal>
  );
}

function TimelineTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  useEffect(() => {
    supabase.from('activity_feed').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(30).then(({ data }) => setItems(data || []));
  }, [projectId]);

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>Project Timeline</h3>
      {items.length === 0 ? <EmptyState message="Belum ada aktivitas" /> :
        items.map((a) => (
          <div key={a.id} className="timeline-item">
            <div className="timeline-dot" style={{ background: 'var(--primary-500)' }} />
            <div className="timeline-content">
              <div style={{ fontSize: 14 }}><strong>{a.user_name || 'System'}</strong> {a.action}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{a.description}</div>
              <div className="timeline-time">{formatDateTime(a.created_at)}</div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

function MaterialTab({ projectId }: { projectId: string }) {
  const [movements, setMovements] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('material_movements').select('*,materials(name,unit)').eq('project_id', projectId).order('movement_date', { ascending: false }).then(({ data }) => setMovements(data || []));
  }, [projectId]);

  const totalPurchased = movements.filter((m) => m.movement_type === 'purchase').reduce((s, m) => s + (m.quantity * m.unit_price), 0);
  const totalInstalled = movements.filter((m) => m.movement_type === 'installed').reduce((s, m) => s + m.quantity, 0);

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Monitoring Material</h3>
        <div style={{ fontSize: 14, marginBottom: 8 }}>Total Pembelian: {formatCurrency(totalPurchased)}</div>
        <div style={{ fontSize: 14, marginBottom: 8 }}>Total Terpasang: {totalInstalled} unit</div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Riwayat Pergerakan</h3>
        {movements.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Belum ada pergerakan</p> :
          movements.slice(0, 10).map((m) => (
            <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{m.materials?.name || 'Material'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <Badge status={m.movement_type} /> - {m.quantity} {m.materials?.unit} - {formatDate(m.movement_date)}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function QCTab({ projectId }: { projectId: string }) {
  const [inspections, setInspections] = useState<QCInspection[]>([]);
  useEffect(() => {
    supabase.from('qc_inspections').select('*').eq('project_id', projectId).order('inspection_date', { ascending: false }).then(({ data }) => setInspections(data || []));
  }, [projectId]);

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>QC Inspections</h3>
      {inspections.length === 0 ? <EmptyState message="Belum ada inspeksi QC" /> :
        <table className="table">
          <thead><tr><th>Tanggal</th><th>Hasil</th><th>Catatan</th></tr></thead>
          <tbody>
            {inspections.map((i) => (
              <tr key={i.id}><td>{formatDateTime(i.inspection_date)}</td><td><Badge status={i.result} /></td><td>{i.notes || '-'}</td></tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  );
}

function HSETab({ projectId }: { projectId: string }) {
  const [toolboxes, setToolboxes] = useState<any[]>([]);
  const [permits, setPermits] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [t, p, i] = await Promise.all([
        supabase.from('hse_toolbox').select('*').eq('project_id', projectId).order('meeting_date', { ascending: false }),
        supabase.from('hse_permits').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('hse_incidents').select('*').eq('project_id', projectId).order('incident_date', { ascending: false }),
      ]);
      setToolboxes(t.data || []); setPermits(p.data || []); setIncidents(i.data || []);
    })();
  }, [projectId]);

  return (
    <div className="grid grid-3">
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Toolbox Meeting</h3>
        {toolboxes.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Belum ada</p> :
          toolboxes.map((t) => (
            <div key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{t.topic}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(t.meeting_date)} - {t.attendees_count} peserta</div>
            </div>
          ))
        }
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Work Permits</h3>
        {permits.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Belum ada</p> :
          permits.map((p) => (
            <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{p.permit_type.replace(/_/g, ' ')}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><Badge status={p.status} /> - {formatDate(p.issued_date)}</div>
            </div>
          ))
        }
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Incidents</h3>
        {incidents.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Tidak ada incident</p> :
          incidents.map((i) => (
            <div key={i.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{i.description}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><Badge status={i.status} /> - {formatDate(i.incident_date)}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function GalleryTab({ projectId }: { projectId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  useEffect(() => {
    supabase.from('photos').select('*').eq('project_id', projectId).order('taken_at', { ascending: false }).then(({ data }) => setPhotos(data || []));
  }, [projectId]);

  const groups: Record<string, Photo[]> = {};
  photos.forEach((p) => {
    const d = new Date(p.taken_at).toDateString();
    (groups[d] = groups[d] || []).push(p);
  });

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const labelFor = (d: string) => d === today ? 'Hari Ini' : d === yesterday ? 'Kemarin' : new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div>
      {Object.entries(groups).map(([date, items]) => (
        <div key={date} style={{ marginBottom: 24 }}>
          <h4 style={{ marginBottom: 12 }}>{labelFor(date)}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {items.map((p) => (
              <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 160, background: 'var(--n-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📷</div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.caption || 'Foto'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDateTime(p.taken_at)}</div>
                  {p.latitude && p.longitude && <div style={{ fontSize: 11, color: 'var(--primary-600)' }}>📍 {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {photos.length === 0 && <EmptyState message="Belum ada foto" />}
    </div>
  );
}

function MeetingsTab({ projectId }: { projectId: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  useEffect(() => {
    supabase.from('meetings').select('*').eq('project_id', projectId).order('meeting_date', { ascending: false }).then(({ data }) => setMeetings(data || []));
  }, [projectId]);

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>Meetings</h3>
      {meetings.length === 0 ? <EmptyState message="Belum ada meeting" /> :
        meetings.map((m) => (
          <div key={m.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{m.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDateTime(m.meeting_date)} - {m.duration_min} min</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{m.agenda}</div>
            <Badge status={m.status} />
          </div>
        ))
      }
    </div>
  );
}

function EquipmentTab({ projectId }: { projectId: string }) {
  const [equipment, setEquipment] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('equipment').select('*').eq('project_id', projectId).then(({ data }) => setEquipment(data || []));
  }, [projectId]);

  return (
    <div className="card" style={{ padding: 0 }}>
      <table className="table">
        <thead><tr><th>Nama</th><th>Tipe</th><th>Model</th><th>Status</th><th>Operator</th></tr></thead>
        <tbody>
          {equipment.map((e) => (
            <tr key={e.id}><td>{e.name}</td><td>{e.type}</td><td>{e.model || '-'}</td><td><Badge status={e.status} /></td><td>{e.operator || '-'}</td></tr>
          ))}
        </tbody>
      </table>
      {equipment.length === 0 && <EmptyState message="Belum ada equipment" />}
    </div>
  );
}

function DocumentsTab({ projectId }: { projectId: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [drawings, setDrawings] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const [d, dr] = await Promise.all([
        supabase.from('documents').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('drawings').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      ]);
      setDocs(d.data || []); setDrawings(dr.data || []);
    })();
  }, [projectId]);

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Documents</h3>
        {docs.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Belum ada dokumen</p> :
          docs.map((d) => (
            <div key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{d.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.doc_type} - <Badge status={d.status} /></div>
            </div>
          ))
        }
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Drawings</h3>
        {drawings.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Belum ada drawing</p> :
          drawings.map((d) => (
            <div key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{d.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.drawing_type} - Rev {d.revision} - <Badge status={d.status} /></div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function FinanceTab({ projectId }: { projectId: string }) {
  const [termin, setTermin] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const [t, i, c] = await Promise.all([
        supabase.from('project_termin').select('*').eq('project_id', projectId).order('termin_no'),
        supabase.from('invoices').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('project_cashflow').select('*').eq('project_id', projectId).order('month_date'),
      ]);
      setTermin(t.data || []); setInvoices(i.data || []); setCashflow(c.data || []);
    })();
  }, [projectId]);

  const totalPaid = termin.filter((t) => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const totalPending = termin.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Termin</h3>
        {termin.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Belum ada termin</p> :
          <table className="table">
            <thead><tr><th>#</th><th>Nilai</th><th>Status</th></tr></thead>
            <tbody>{termin.map((t) => <tr key={t.id}><td>#{t.termin_no}</td><td>{formatCurrency(t.amount)}</td><td><Badge status={t.status} /></td></tr>)}</tbody>
          </table>
        }
        <div style={{ marginTop: 12, fontSize: 13 }}>Dibayar: {formatCurrency(totalPaid)} | Pending: {formatCurrency(totalPending)}</div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Invoices</h3>
        {invoices.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Belum ada invoice</p> :
          invoices.map((i) => (
            <div key={i.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{i.invoice_number}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatCurrency(i.total_amount)} - <Badge status={i.status} /></div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
