import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Badge, EmptyState, Modal, formatCurrency, formatDate } from '../components/ui';
import type { Material, Warehouse, Inventory } from '../types';

export function MaterialPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('materials').select('*').order('name');
    setMaterials(data || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Material</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Tambah Material</button>
      </div>
      {materials.length === 0 ? <EmptyState message="Belum ada material" /> : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Kode</th><th>Nama</th><th>Kategori</th><th>Satuan</th><th>QR</th></tr></thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id}><td>{m.code || '-'}</td><td>{m.name}</td><td>{m.category || '-'}</td><td>{m.unit}</td><td>{m.qr_code ? '✓' : '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <MaterialForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function MaterialForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ code: '', name: '', category: '', unit: '', specification: '' });
  const submit = async () => { await supabase.from('materials').insert(form); onSaved(); };
  return (
    <Modal title="Tambah Material" onClose={onClose}>
      <div className="form-row">
        <div className="form-group"><label>Kode</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
        <div className="form-group"><label>Nama</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Kategori</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
        <div className="form-group"><label>Satuan</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
      </div>
      <div className="form-group"><label>Spesifikasi</label><textarea value={form.specification} onChange={(e) => setForm({ ...form, specification: e.target.value })} /></div>
      <button className="btn btn-primary" onClick={submit}>Simpan</button>
    </Modal>
  );
}

export function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const [w, inv] = await Promise.all([
      supabase.from('warehouses').select('*').order('name'),
      supabase.from('inventory').select('*,materials(name,unit),warehouses(name)').order('updated_at', { ascending: false }),
    ]);
    setWarehouses(w.data || []); setInventory(inv.data || []);
  };
  useEffect(() => { load(); }, []);

  const lowStock = inventory.filter((i) => i.quantity <= i.min_stock && i.min_stock > 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Warehouse</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Tambah Gudang</button>
      </div>
      {lowStock.length > 0 && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--warning-50)', borderColor: 'var(--warning-500)' }}>
          <h3 style={{ color: 'var(--warning-700)' }}>⚠ Stock Menipis</h3>
          {lowStock.map((i) => <div key={i.id} style={{ fontSize: 14 }}>{i.materials?.name} - sisa {i.quantity} {i.materials?.unit} (min: {i.min_stock})</div>)}
        </div>
      )}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-card"><span className="stat-label">Total Gudang</span><span className="stat-value">{warehouses.length}</span></div>
        <div className="card stat-card"><span className="stat-label">Total Item</span><span className="stat-value">{inventory.length}</span></div>
        <div className="card stat-card"><span className="stat-label">Stock Menipis</span><span className="stat-value" style={{ color: 'var(--warning-500)' }}>{lowStock.length}</span></div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <h3 style={{ padding: 20 }} >Inventaris</h3>
        {inventory.length === 0 ? <EmptyState message="Belum ada inventaris" /> : (
          <table className="table">
            <thead><tr><th>Material</th><th>Gudang</th><th>Qty</th><th>Min Stock</th><th>Harga</th></tr></thead>
            <tbody>
              {inventory.map((i) => (
                <tr key={i.id}>
                  <td>{i.materials?.name}</td><td>{i.warehouses?.name}</td>
                  <td style={{ color: i.quantity <= i.min_stock ? 'var(--error-600)' : undefined }}>{i.quantity} {i.materials?.unit}</td>
                  <td>{i.min_stock}</td><td>{formatCurrency(i.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showForm && <WarehouseForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function WarehouseForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', location: '', latitude: '', longitude: '' });
  const submit = async () => {
    await supabase.from('warehouses').insert({
      ...form, latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null,
    });
    onSaved();
  };
  return (
    <Modal title="Tambah Gudang" onClose={onClose}>
      <div className="form-group"><label>Nama</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div className="form-group"><label>Lokasi</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
      <div className="form-row">
        <div className="form-group"><label>Latitude</label><input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></div>
        <div className="form-group"><label>Longitude</label><input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></div>
      </div>
      <button className="btn btn-primary" onClick={submit}>Simpan</button>
    </Modal>
  );
}
