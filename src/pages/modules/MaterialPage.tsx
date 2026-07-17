import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, EmptyState } from '../../components/ui';
import type { Material } from '../../types';

export function MaterialPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', category: '', unit: '', specification: '' });

  const load = useCallback(async () => {
    const { data } = await supabase.from('materials').select('*').order('name');
    setMaterials(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('materials').insert({ code: form.code, name: form.name, category: form.category, unit: form.unit, specification: form.specification });
    setShow(false); setForm({ code: '', name: '', category: '', unit: '', specification: '' }); load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Material</h1><p className="page-subtitle">Katalog material</p></div>
        <button className="btn btn-primary" onClick={() => setShow(true)}>+ Material</button>
      </div>
      {materials.length === 0 ? <EmptyState message="Belum ada material" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Code</th><th>Nama</th><th>Kategori</th><th>Satuan</th><th>Spesifikasi</th></tr></thead>
            <tbody>{materials.map(m => <tr key={m.id}><td>{m.code || '-'}</td><td>{m.name}</td><td>{m.category || '-'}</td><td>{m.unit}</td><td>{m.specification || '-'}</td></tr>)}</tbody>
          </table>
        </div>
      }
      {show && (
        <Modal title="Tambah Material" onClose={() => setShow(false)}>
          <div className="form-row"><div className="form-group"><label>Code</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div><div className="form-group"><label>Nama</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div></div>
          <div className="form-row"><div className="form-group"><label>Kategori</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div><div className="form-group"><label>Satuan</label><input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div></div>
          <div className="form-group"><label>Spesifikasi</label><textarea value={form.specification} onChange={e => setForm({ ...form, specification: e.target.value })} /></div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.name}>Tambah</button>
        </Modal>
      )}
    </div>
  );
}
