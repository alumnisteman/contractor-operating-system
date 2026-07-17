import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, EmptyState, formatCurrency } from '../../components/ui';
import type { Personnel } from '../../types';

const ROLES = ['pm', 'site_manager', 'engineer', 'qc', 'hse', 'lineman', 'operator', 'helper', 'surveyor', 'other'];

export function HRPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'engineer', phone: '', certification: '', license_no: '', daily_rate: '' });

  const load = useCallback(async () => {
    const { data } = await supabase.from('personnel').select('*').order('created_at', { ascending: false });
    setPersonnel(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('personnel').insert({
      name: form.name, role: form.role, phone: form.phone, certification: form.certification,
      license_no: form.license_no, daily_rate: parseFloat(form.daily_rate) || 0,
    });
    setShow(false); setForm({ name: '', role: 'engineer', phone: '', certification: '', license_no: '', daily_rate: '' }); load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">HR / SDM</h1><p className="page-subtitle">{personnel.length} personnel</p></div>
        <button className="btn btn-primary" onClick={() => setShow(true)}>+ Personnel</button>
      </div>
      {personnel.length === 0 ? <EmptyState message="Belum ada personnel" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Nama</th><th>Role</th><th>Phone</th><th>Sertifikasi</th><th>Lisensi</th><th>Rate/Hari</th><th>Status</th></tr></thead>
            <tbody>{personnel.map(p => <tr key={p.id}><td>{p.name}</td><td style={{ textTransform: 'capitalize' }}>{p.role}</td><td>{p.phone || '-'}</td><td>{p.certification || '-'}</td><td>{p.license_no || '-'}</td><td>{formatCurrency(p.daily_rate || 0)}</td><td><Badge status={p.status} /></td></tr>)}</tbody>
          </table>
        </div>
      }
      {show && (
        <Modal title="Tambah Personnel" onClose={() => setShow(false)}>
          <div className="form-row"><div className="form-group"><label>Nama</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div className="form-group"><label>Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div></div>
          <div className="form-row"><div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div><div className="form-group"><label>Sertifikasi</label><input value={form.certification} onChange={e => setForm({ ...form, certification: e.target.value })} /></div></div>
          <div className="form-row"><div className="form-group"><label>Lisensi No</label><input value={form.license_no} onChange={e => setForm({ ...form, license_no: e.target.value })} /></div><div className="form-group"><label>Rate/Hari</label><input type="number" value={form.daily_rate} onChange={e => setForm({ ...form, daily_rate: e.target.value })} /></div></div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.name}>Tambah</button>
        </Modal>
      )}
    </div>
  );
}
