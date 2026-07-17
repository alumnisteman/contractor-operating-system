import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, ProgressBar, Badge, EmptyState, formatDate } from '../../components/ui';
import type { ProjectWBS } from '../../types';

export function WBSTab({ projectId }: { projectId: string }) {
  const [wbs, setWbs] = useState<ProjectWBS[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '', volume: '1', unit: '', weight: '0', start_date: '', end_date: '' });

  const load = useCallback(async () => {
    const { data } = await supabase.from('project_wbs').select('*').eq('project_id', projectId).order('created_at');
    setWbs(data || []);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('project_wbs').insert({
      project_id: projectId, code: form.code, name: form.name, description: form.description,
      volume: parseFloat(form.volume) || 0, unit: form.unit, weight: parseFloat(form.weight) || 0,
      start_date: form.start_date || null, end_date: form.end_date || null,
    });
    setShow(false); setForm({ code: '', name: '', description: '', volume: '1', unit: '', weight: '0', start_date: '', end_date: '' }); load();
  };

  const updateProgress = async (id: string, progress: number) => {
    await supabase.from('project_wbs').update({ actual_progress: progress, updated_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  const approve = async (id: string) => {
    await supabase.from('project_wbs').update({ approval_status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 16 }}>WBS — Work Breakdown Structure</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShow(true)}>+ WBS Item</button>
      </div>
      {wbs.length === 0 ? <EmptyState message="Belum ada WBS" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Code</th><th>Nama</th><th>Vol</th><th>Sat</th><th>Bobot</th><th>Target</th><th>Aktual</th><th>Progress</th><th>QC</th><th>Approval</th><th>Aksi</th></tr></thead>
            <tbody>
              {wbs.map(w => (
                <tr key={w.id}>
                  <td>{w.code || '-'}</td>
                  <td>{w.name}</td>
                  <td>{w.volume}</td>
                  <td>{w.unit || '-'}</td>
                  <td>{w.weight}%</td>
                  <td>{w.target_progress}%</td>
                  <td>{w.actual_progress}%</td>
                  <td style={{ minWidth: 120 }}><ProgressBar value={w.actual_progress} /></td>
                  <td>{w.qc_status ? <Badge status={w.qc_status === 'n/a' ? 'neutral' : w.qc_status} /> : '-'}</td>
                  <td><Badge status={w.approval_status} /></td>
                  <td>
                    <input type="range" min={0} max={100} value={w.actual_progress} style={{ width: 80, padding: 0 }}
                      onChange={e => updateProgress(w.id, parseInt(e.target.value))} />
                    {w.approval_status === 'pending' && w.actual_progress > 0 && <button className="btn btn-sm btn-outline" style={{ marginLeft: 4 }} onClick={() => approve(w.id)}>Approve</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      {show && (
        <Modal title="Tambah WBS" onClose={() => setShow(false)}>
          <div className="form-row">
            <div className="form-group"><label>Code</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
            <div className="form-group"><label>Nama</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Deskripsi</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label>Volume</label><input type="number" value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })} /></div>
            <div className="form-group"><label>Satuan</label><input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Bobot (%)</label><input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></div>
            <div className="form-group"><label>Target (%)</label><input type="number" defaultValue={0} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Mulai</label><input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
            <div className="form-group"><label>Selesai</label><input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.name}>Tambah</button>
        </Modal>
      )}
    </div>
  );
}
