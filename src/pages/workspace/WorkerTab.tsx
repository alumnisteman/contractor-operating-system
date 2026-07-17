import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, EmptyState, formatDate } from '../../components/ui';
import type { Personnel } from '../../types';

const ROLES = ['pm', 'site_manager', 'engineer', 'qc', 'hse', 'lineman', 'operator', 'helper', 'surveyor', 'other'];

export function WorkerTab({ projectId }: { projectId: string }) {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'engineer', phone: '', certification: '', daily_rate: '' });

  const load = useCallback(async () => {
    const { data } = await supabase.from('personnel').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    setPersonnel(data || []);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('personnel').insert({
      project_id: projectId, name: form.name, role: form.role, phone: form.phone,
      certification: form.certification, daily_rate: parseFloat(form.daily_rate) || 0,
    });
    setShow(false); setForm({ name: '', role: 'engineer', phone: '', certification: '', daily_rate: '' }); load();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 16 }}>Worker / SDM</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShow(true)}>+ Personnel</button>
      </div>
      {personnel.length === 0 ? <EmptyState message="Belum ada personnel" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Nama</th><th>Role</th><th>Phone</th><th>Sertifikasi</th><th>Rate/Hari</th><th>Status</th></tr></thead>
            <tbody>
              {personnel.map(p => (
                <tr key={p.id}><td>{p.name}</td><td style={{ textTransform: 'capitalize' }}>{p.role}</td><td>{p.phone || '-'}</td><td>{p.certification || '-'}</td><td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.daily_rate || 0)}</td><td><Badge status={p.status} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      {show && (
        <Modal title="Tambah Personnel" onClose={() => setShow(false)}>
          <div className="form-group"><label>Nama</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label>Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Sertifikasi</label><input value={form.certification} onChange={e => setForm({ ...form, certification: e.target.value })} /></div>
            <div className="form-group"><label>Rate/Hari</label><input type="number" value={form.daily_rate} onChange={e => setForm({ ...form, daily_rate: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.name}>Tambah</button>
        </Modal>
      )}
    </div>
  );
}
