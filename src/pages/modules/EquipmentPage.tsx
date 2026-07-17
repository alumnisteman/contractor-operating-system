import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, EmptyState, formatCurrency } from '../../components/ui';
import type { Equipment } from '../../types';

const TYPES = ['excavator', 'crane', 'sky_lift', 'truck', 'generator', 'welding', 'compressor', 'manlift', 'other'];

export function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'excavator', model: '', serial_number: '', capacity: '', rental_rate: '', operator: '' });

  const load = useCallback(async () => {
    const { data } = await supabase.from('equipment').select('*').order('created_at', { ascending: false });
    setEquipment(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('equipment').insert({
      name: form.name, type: form.type, model: form.model, serial_number: form.serial_number,
      capacity: form.capacity, rental_rate: parseFloat(form.rental_rate) || 0, operator: form.operator,
    });
    setShow(false); setForm({ name: '', type: 'excavator', model: '', serial_number: '', capacity: '', rental_rate: '', operator: '' }); load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Equipment</h1><p className="page-subtitle">{equipment.length} unit</p></div>
        <button className="btn btn-primary" onClick={() => setShow(true)}>+ Equipment</button>
      </div>
      {equipment.length === 0 ? <EmptyState message="Belum ada equipment" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Nama</th><th>Tipe</th><th>Model</th><th>Serial</th><th>Kapasitas</th><th>Rate</th><th>Operator</th><th>Status</th></tr></thead>
            <tbody>{equipment.map(e => <tr key={e.id}><td>{e.name}</td><td>{e.type}</td><td>{e.model || '-'}</td><td>{e.serial_number || '-'}</td><td>{e.capacity || '-'}</td><td>{formatCurrency(e.rental_rate || 0)}</td><td>{e.operator || '-'}</td><td><Badge status={e.status} /></td></tr>)}</tbody>
          </table>
        </div>
      }
      {show && (
        <Modal title="Tambah Equipment" onClose={() => setShow(false)}>
          <div className="form-row"><div className="form-group"><label>Nama</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div className="form-group"><label>Tipe</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div></div>
          <div className="form-row"><div className="form-group"><label>Model</label><input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div><div className="form-group"><label>Serial Number</label><input value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} /></div></div>
          <div className="form-row"><div className="form-group"><label>Kapasitas</label><input value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div><div className="form-group"><label>Rate/Hari</label><input type="number" value={form.rental_rate} onChange={e => setForm({ ...form, rental_rate: e.target.value })} /></div></div>
          <div className="form-group"><label>Operator</label><input value={form.operator} onChange={e => setForm({ ...form, operator: e.target.value })} /></div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.name}>Tambah</button>
        </Modal>
      )}
    </div>
  );
}
