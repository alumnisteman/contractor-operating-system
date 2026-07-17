import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, EmptyState, formatCurrency } from '../../components/ui';
import type { Warehouse, Inventory, MaterialMovement } from '../../types';

export function WarehousePage() {
  const [tab, setTab] = useState<'inventory' | 'movements' | 'warehouses'>('inventory');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', location: '' });

  const load = useCallback(async () => {
    const { data: w } = await supabase.from('warehouses').select('*').order('name');
    setWarehouses(w || []);
    const { data: inv } = await supabase.from('inventory').select('*, materials(*), warehouses(*)').order('updated_at', { ascending: false });
    setInventory(inv || []);
    const { data: mv } = await supabase.from('material_movements').select('*, materials(*)').order('movement_date', { ascending: false }).limit(50);
    setMovements(mv || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('warehouses').insert({ name: form.name, location: form.location });
    setShow(false); setForm({ name: '', location: '' }); load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Warehouse</h1><p className="page-subtitle">Gudang & inventaris</p></div>
        {tab === 'warehouses' && <button className="btn btn-primary" onClick={() => setShow(true)}>+ Gudang</button>}
      </div>
      <div className="tab-bar">
        <div className={`tab ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}>Inventory</div>
        <div className={`tab ${tab === 'movements' ? 'active' : ''}`} onClick={() => setTab('movements')}>Movements</div>
        <div className={`tab ${tab === 'warehouses' ? 'active' : ''}`} onClick={() => setTab('warehouses')}>Gudang</div>
      </div>
      {tab === 'inventory' && (inventory.length === 0 ? <EmptyState message="Belum ada inventory" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Material</th><th>Gudang</th><th>Qty</th><th>Min Stock</th><th>Harga</th></tr></thead>
            <tbody>{inventory.map(i => <tr key={i.id}><td>{i.materials?.name || '-'}</td><td>{i.warehouses?.name || '-'}</td><td>{i.quantity}</td><td>{i.min_stock}</td><td>{formatCurrency(i.unit_price)}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {tab === 'movements' && (movements.length === 0 ? <EmptyState message="Belum ada pergerakan" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Material</th><th>Tipe</th><th>Qty</th><th>Ref</th><th>Tanggal</th></tr></thead>
            <tbody>{movements.map(m => <tr key={m.id}><td>{m.materials?.name || '-'}</td><td>{m.movement_type}</td><td>{m.quantity}</td><td>{m.reference_no || '-'}</td><td>{new Date(m.movement_date).toLocaleDateString('id-ID')}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {tab === 'warehouses' && (warehouses.length === 0 ? <EmptyState message="Belum ada gudang" /> :
        <div className="grid grid-3">{warehouses.map(w => <div key={w.id} className="card"><h4 style={{ fontSize: 15 }}>{w.name}</h4><p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{w.location || '-'}</p></div>)}</div>
      )}
      {show && (
        <Modal title="Tambah Gudang" onClose={() => setShow(false)}>
          <div className="form-group"><label>Nama</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Lokasi</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.name}>Tambah</button>
        </Modal>
      )}
    </div>
  );
}
