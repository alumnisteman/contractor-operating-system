import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Badge, EmptyState, Modal, StatCard, formatCurrency } from '../components/ui';
import type { Supplier } from '../types';

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('suppliers').select('*').order('name');
    setSuppliers(data || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Supplier Directory</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Tambah Supplier</button>
      </div>
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <StatCard label="Total Supplier" value={suppliers.length} />
        <StatCard label="Avg Rating" value={suppliers.length > 0 ? (suppliers.reduce((s, x) => s + (x.rating || 0), 0) / suppliers.length).toFixed(1) : '0'} />
        <StatCard label="Avg Lead Time" value={suppliers.length > 0 ? `${Math.round(suppliers.reduce((s, x) => s + (x.lead_time_days || 0), 0) / suppliers.length)} hari` : '-'} />
      </div>
      <div className="grid grid-auto">
        {suppliers.map((s) => (
          <div key={s.id} className="card">
            <h3 style={{ fontSize: 16 }}>{s.name}</h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.category || '-'}</div>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              Rating: {'⭐'.repeat(Math.round(s.rating || 0))} ({s.rating || 0})<br />
              Lead Time: {s.lead_time_days || 0} hari<br />
              {s.contact_person && `PIC: ${s.contact_person}`} {s.phone && ` - ${s.phone}`}
            </div>
          </div>
        ))}
      </div>
      {suppliers.length === 0 && <EmptyState message="Belum ada supplier" />}
      {showForm && <SupplierForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function SupplierForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', category: '', contact_person: '', phone: '', email: '', address: '', rating: 0, lead_time_days: 0 });
  const submit = async () => { await supabase.from('suppliers').insert({ ...form, rating: parseFloat(form.rating as any) || 0 }); onSaved(); };
  return (
    <Modal title="Tambah Supplier" onClose={onClose}>
      <div className="form-row">
        <div className="form-group"><label>Nama</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label>Kategori</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Kontak</label><input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></div>
        <div className="form-group"><label>Telepon</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="form-group"><label>Rating (0-5)</label><input type="number" step="0.1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} /></div>
      </div>
      <div className="form-group"><label>Lead Time (hari)</label><input type="number" value={form.lead_time_days} onChange={(e) => setForm({ ...form, lead_time_days: parseInt(e.target.value) || 0 })} /></div>
      <div className="form-group"><label>Alamat</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      <button className="btn btn-primary" onClick={submit}>Simpan</button>
    </Modal>
  );
}
