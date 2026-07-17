import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Modal, Badge, ProgressBar, HealthScore, EmptyState, formatCurrency, formatDate, calcHealthScore } from '../components/ui';
import type { Project, ProjectTemplate } from '../types';

export function ProjectsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', project_type: 'distribusi', up2d: '', uid: '', up3: '', ulp: '', spmk_no: '', pm_name: '', contract_value: '', start_date: '', end_date: '', latitude: '', longitude: '', location_name: '', template_id: '' });

  const load = useCallback(async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
    const { data: t } = await supabase.from('project_templates').select('*');
    setTemplates(t || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    const { data } = await supabase.from('projects').insert({
      name: form.name, description: form.description, project_type: form.project_type,
      up2d: form.up2d, uid: form.uid, up3: form.up3, ulp: form.ulp,
      spmk_no: form.spmk_no, pm_name: form.pm_name,
      contract_value: parseFloat(form.contract_value) || 0,
      start_date: form.start_date || null, end_date: form.end_date || null,
      latitude: parseFloat(form.latitude) || null, longitude: parseFloat(form.longitude) || null,
      location_name: form.location_name, status: 'planning',
      created_by: profile?.id,
    }).select().single();
    if (data && form.template_id) {
      const { data: twbs } = await supabase.from('project_template_wbs').select('*').eq('template_id', form.template_id);
      if (twbs) {
        await supabase.from('project_wbs').insert(twbs.map((w: any) => ({
          project_id: data.id, code: w.code, name: w.name, description: w.description,
          volume: w.volume, unit: w.unit, weight: w.weight,
        })));
      }
    }
    setShowCreate(false);
    setForm({ name: '', description: '', project_type: 'distribusi', up2d: '', uid: '', up3: '', ulp: '', spmk_no: '', pm_name: '', contract_value: '', start_date: '', end_date: '', latitude: '', longitude: '', location_name: '', template_id: '' });
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Projects</h1><p className="page-subtitle">{projects.length} proyek terdaftar</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Buat Project</button>
      </div>

      {projects.length === 0 ? <EmptyState message="Belum ada project. Klik 'Buat Project' untuk memulai." /> :
        <div className="grid grid-3">
          {projects.map(p => {
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
                {p.end_date && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Deadline: {formatDate(p.end_date)}</div>
                )}
              </div>
            );
          })}
        </div>
      }

      {showCreate && (
        <Modal title="Buat Project Baru" onClose={() => setShowCreate(false)}>
          <div className="form-group"><label>Nama Project</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Deskripsi</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label>Jenis Project</label>
              <select value={form.project_type} onChange={e => setForm({ ...form, project_type: e.target.value })}>
                <option value="distribusi">Distribusi</option><option value="transmisi">Transmisi</option>
                <option value="gardu_induk">Gardu Induk</option><option value="pembangkit">Pembangkit</option>
                <option value="jasa">Jasa</option><option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div className="form-group"><label>Template</label>
              <select value={form.template_id} onChange={e => setForm({ ...form, template_id: e.target.value })}>
                <option value="">Tanpa template</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>UP2D</label><input value={form.up2d} onChange={e => setForm({ ...form, up2d: e.target.value })} /></div>
            <div className="form-group"><label>UID</label><input value={form.uid} onChange={e => setForm({ ...form, uid: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>UP3</label><input value={form.up3} onChange={e => setForm({ ...form, up3: e.target.value })} /></div>
            <div className="form-group"><label>ULP</label><input value={form.ulp} onChange={e => setForm({ ...form, ulp: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>SPMK No</label><input value={form.spmk_no} onChange={e => setForm({ ...form, spmk_no: e.target.value })} /></div>
            <div className="form-group"><label>PM</label><input value={form.pm_name} onChange={e => setForm({ ...form, pm_name: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Nilai Kontrak</label><input type="number" value={form.contract_value} onChange={e => setForm({ ...form, contract_value: e.target.value })} /></div>
            <div className="form-group"><label>Lokasi</label><input value={form.location_name} onChange={e => setForm({ ...form, location_name: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Tanggal Mulai</label><input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
            <div className="form-group"><label>Tanggal Selesai</label><input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Latitude</label><input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} /></div>
            <div className="form-group"><label>Longitude</label><input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.name}>Buat Project</button>
        </Modal>
      )}
    </div>
  );
}
