import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Badge, EmptyState, Modal, StatCard, formatCurrency } from '../components/ui';
import type { Equipment } from '../types';

export function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('equipment').select('*').order('name');
    setEquipment(data || []);
  };
  useEffect(() => { load(); }, []);

  const inUse = equipment.filter((e) => e.status === 'in_use');
  const available = equipment.filter((e) => e.status === 'available');
  const breakdown = equipment.filter((e) => e.status === 'breakdown');

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Equipment</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Tambah Equipment</button>
      </div>
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total" value={equipment.length} />
        <StatCard label="Tersedia" value={available.length} color="var(--success-500)" />
        <StatCard label="Dipakai" value={inUse.length} color="var(--primary-500)" />
        <StatCard label="Rusak" value={breakdown.length} color="var(--error-500)" />
      </div>
      <div className="grid grid-auto">
        {equipment.map((e) => (
          <div key={e.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ fontSize: 16 }}>{e.name}</h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.type} - {e.model || ''}</div>
              </div>
              <Badge status={e.status} />
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              S/N: {e.serial_number || '-'} | Operator: {e.operator || '-'}<br />
              Rate: {formatCurrency(e.rental_rate || 0)}/hari
            </div>
          </div>
        ))}
      </div>
      {equipment.length === 0 && <EmptyState message="Belum ada equipment" />}
      {showForm && <EquipmentForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function EquipmentForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', type: 'excavator', model: '', serial_number: '', capacity: '', rental_rate: 0, operator: '' });
  const submit = async () => { await supabase.from('equipment').insert({ ...form, rental_rate: parseFloat(form.rental_rate as any) || 0 }); onSaved(); };
  return (
    <Modal title="Tambah Equipment" onClose={onClose}>
      <div className="form-row">
        <div className="form-group"><label>Nama</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label>Tipe</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="excavator">Excavator</option><option value="crane">Crane</option><option value="sky_lift">Sky Lift</option>
          <option value="truck">Truck</option><option value="generator">Generator</option><option value="welding">Welding</option>
          <option value="compressor">Compressor</option><option value="manlift">Manlift</option><option value="other">Other</option>
        </select></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Model</label><input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
        <div className="form-group"><label>Serial Number</label><input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Capacity</label><input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
        <div className="form-group"><label>Rate Harian</label><input type="number" value={form.rental_rate} onChange={(e) => setForm({ ...form, rental_rate: parseFloat(e.target.value) || 0 })} /></div>
      </div>
      <div className="form-group"><label>Operator</label><input value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} /></div>
      <button className="btn btn-primary" onClick={submit}>Simpan</button>
    </Modal>
  );
}
