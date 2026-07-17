import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Badge, EmptyState, Modal, StatCard, formatDate } from '../components/ui';
import type { Personnel } from '../types';

export function HRPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('personnel').select('*').order('name');
    setPersonnel(data || []);
  };
  useEffect(() => { load(); }, []);

  const active = personnel.filter((p) => p.status === 'assigned');
  const onLeave = personnel.filter((p) => p.status === 'on_leave');

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">HR - Sumber Daya Manusia</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Tambah Personil</button>
      </div>
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total Personil" value={personnel.length} />
        <StatCard label="Aktif" value={active.length} color="var(--success-500)" />
        <StatCard label="Cuti" value={onLeave.length} color="var(--warning-500)" />
        <StatCard label="Sertifikasi" value={personnel.filter((p) => p.certification).length} />
      </div>
      <div className="card" style={{ padding: 0 }}>
        {personnel.length === 0 ? <EmptyState message="Belum ada personil" /> : (
          <table className="table">
            <thead><tr><th>Nama</th><th>Peran</th><th>Sertifikasi</th><th>License</th><th>Status</th></tr></thead>
            <tbody>
              {personnel.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td><td>{p.role}</td><td>{p.certification || '-'}</td>
                  <td>{p.license_no ? `${p.license_no} (${formatDate(p.license_expiry)})` : '-'}</td>
                  <td><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showForm && <PersonnelForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function PersonnelForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', role: 'lineman', phone: '', certification: '', license_no: '', daily_rate: 0 });
  const submit = async () => { await supabase.from('personnel').insert({ ...form, daily_rate: parseFloat(form.daily_rate as any) || 0 }); onSaved(); };
  return (
    <Modal title="Tambah Personil" onClose={onClose}>
      <div className="form-row">
        <div className="form-group"><label>Nama</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label>Peran</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="pm">PM</option><option value="site_manager">Site Manager</option><option value="engineer">Engineer</option>
          <option value="qc">QC</option><option value="hse">HSE</option><option value="lineman">Lineman</option>
          <option value="operator">Operator</option><option value="helper">Helper</option><option value="surveyor">Surveyor</option>
        </select></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Telepon</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="form-group"><label>Sertifikasi</label><input value={form.certification} onChange={(e) => setForm({ ...form, certification: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>No License</label><input value={form.license_no} onChange={(e) => setForm({ ...form, license_no: e.target.value })} /></div>
        <div className="form-group"><label>Rate Harian</label><input type="number" value={form.daily_rate} onChange={(e) => setForm({ ...form, daily_rate: parseFloat(e.target.value) || 0 })} /></div>
      </div>
      <button className="btn btn-primary" onClick={submit}>Simpan</button>
    </Modal>
  );
}
