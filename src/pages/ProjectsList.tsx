import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Badge, ProgressBar, HealthRing, EmptyState, Modal, formatCurrency, formatDate, daysUntil } from '../components/ui';
import type { Project } from '../types';
import { useAuth } from '../lib/AuthContext';

export function ProjectsList() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const canEdit = profile?.role && !['vendor', 'surveyor'].includes(profile.role);

  const load = async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} proyek terdaftar</p>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Tambah Project</button>}
      </div>

      {projects.length === 0 ? <EmptyState message="Belum ada proyek" /> : (
        <div className="grid grid-auto">
          {projects.map((p) => (
            <div key={p.id} className="card card-hover" onClick={() => navigate(`/projects/${p.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16 }}>{p.name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.project_type || '-'} - {p.up2d || ''} {p.up3 || ''}</div>
                </div>
                <HealthRing score={p.health_score} size={48} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>Progress</span><span>{p.progress}%</span>
                </div>
                <ProgressBar value={p.progress} color={p.health_score < 70 ? 'var(--error-500)' : 'var(--primary-500)'} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Badge status={p.status} />
                <div style={{ fontSize: 12, color: daysUntil(p.end_date) < 14 ? 'var(--error-600)' : 'var(--text-muted)' }}>
                  {p.end_date ? `${daysUntil(p.end_date)} hari lagi` : ''}
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                {formatCurrency(p.contract_value || 0)} - PM: {p.pm_name || '-'}
              </div>
              {p.health_score < 70 && (
                <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--error-50)', borderRadius: 8, fontSize: 12, color: 'var(--error-700)' }}>
                  ⚠ Health score rendah - perlu perhatian
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && <ProjectForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function ProjectForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: '', description: '', up2d: '', uid: '', up3: '', ulp: '',
    spmk_no: '', pm_name: '', project_type: 'distribusi',
    contract_value: 0, start_date: '', end_date: '', location_name: '',
    latitude: '', longitude: '',
  });

  const submit = async () => {
    await supabase.from('projects').insert({
      ...form,
      spmk_date: form.start_date || null,
      contract_value: parseFloat(form.contract_value as any) || 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    });
    await supabase.from('activity_feed').insert({
      action: 'membuat project', entity_type: 'project',
      description: `Project "${form.name}" dibuat`,
      user_name: 'User',
    });
    onSaved();
  };

  return (
    <Modal title="Tambah Project" onClose={onClose} wide>
      <div className="form-row">
        <div className="form-group"><label>Nama Project</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label>Jenis Project</label>
          <select value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })}>
            <option value="distribusi">Distribusi</option><option value="transmisi">Transmisi</option>
            <option value="gardu_induk">Gardu Induk</option><option value="pembangkit">Pembangkit</option>
            <option value="jasa">Jasa</option><option value="lainnya">Lainnya</option>
          </select>
        </div>
      </div>
      <div className="form-group"><label>Deskripsi</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="form-row">
        <div className="form-group"><label>UP2D</label><input value={form.up2d} onChange={(e) => setForm({ ...form, up2d: e.target.value })} /></div>
        <div className="form-group"><label>UID</label><input value={form.uid} onChange={(e) => setForm({ ...form, uid: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>UP3</label><input value={form.up3} onChange={(e) => setForm({ ...form, up3: e.target.value })} /></div>
        <div className="form-group"><label>ULP</label><input value={form.ulp} onChange={(e) => setForm({ ...form, ulp: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>SPMK No</label><input value={form.spmk_no} onChange={(e) => setForm({ ...form, spmk_no: e.target.value })} /></div>
        <div className="form-group"><label>PM</label><input value={form.pm_name} onChange={(e) => setForm({ ...form, pm_name: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Nilai Kontrak</label><input type="number" value={form.contract_value} onChange={(e) => setForm({ ...form, contract_value: parseFloat(e.target.value) || 0 })} /></div>
        <div className="form-group"><label>Lokasi</label><input value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Tanggal Mulai</label><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
        <div className="form-group"><label>Tanggal Selesai</label><input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Latitude</label><input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-6.2088" /></div>
        <div className="form-group"><label>Longitude</label><input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="106.8456" /></div>
      </div>
      <button className="btn btn-primary" onClick={submit}>Simpan</button>
    </Modal>
  );
}
