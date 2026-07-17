import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, EmptyState, formatCurrency, formatDate } from '../../components/ui';
import type { Tender } from '../../types';

export function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ tender_number: '', title: '', description: '', project_type: 'distribusi', hps: '', up2d: '', uid: '', up3: '', ulp: '', spmk_no: '', pm_name: '', open_date: '', close_date: '' });

  const load = useCallback(async () => {
    const { data } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
    setTenders(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('tenders').insert({
      tender_number: form.tender_number, title: form.title, description: form.description,
      project_type: form.project_type, hps: parseFloat(form.hps) || 0,
      up2d: form.up2d, uid: form.uid, up3: form.up3, ulp: form.ulp,
      spmk_no: form.spmk_no, pm_name: form.pm_name,
      open_date: form.open_date || null, close_date: form.close_date || null, status: 'open',
    });
    setShow(false); setForm({ tender_number: '', title: '', description: '', project_type: 'distribusi', hps: '', up2d: '', uid: '', up3: '', ulp: '', spmk_no: '', pm_name: '', open_date: '', close_date: '' }); load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Tenders</h1><p className="page-subtitle">{tenders.length} tender</p></div>
        <button className="btn btn-primary" onClick={() => setShow(true)}>+ Tender</button>
      </div>
      {tenders.length === 0 ? <EmptyState message="Belum ada tender" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>No Tender</th><th>Judul</th><th>Jenis</th><th>HPS</th><th>Status</th><th>Buka</th><th>Tutup</th></tr></thead>
            <tbody>{tenders.map(t => <tr key={t.id}><td>{t.tender_number}</td><td>{t.title}</td><td>{t.project_type || '-'}</td><td>{formatCurrency(t.hps || 0)}</td><td><Badge status={t.status} /></td><td>{formatDate(t.open_date)}</td><td>{formatDate(t.close_date)}</td></tr>)}</tbody>
          </table>
        </div>
      }
      {show && (
        <Modal title="Buat Tender" onClose={() => setShow(false)}>
          <div className="form-row"><div className="form-group"><label>No Tender</label><input value={form.tender_number} onChange={e => setForm({ ...form, tender_number: e.target.value })} /></div><div className="form-group"><label>Judul</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div></div>
          <div className="form-group"><label>Deskripsi</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-row"><div className="form-group"><label>Jenis</label><select value={form.project_type} onChange={e => setForm({ ...form, project_type: e.target.value })}><option value="distribusi">Distribusi</option><option value="transmisi">Transmisi</option><option value="gardu_induk">Gardu Induk</option><option value="pembangkit">Pembangkit</option><option value="jasa">Jasa</option></select></div><div className="form-group"><label>HPS</label><input type="number" value={form.hps} onChange={e => setForm({ ...form, hps: e.target.value })} /></div></div>
          <div className="form-row"><div className="form-group"><label>UP2D</label><input value={form.up2d} onChange={e => setForm({ ...form, up2d: e.target.value })} /></div><div className="form-group"><label>UID</label><input value={form.uid} onChange={e => setForm({ ...form, uid: e.target.value })} /></div></div>
          <div className="form-row"><div className="form-group"><label>UP3</label><input value={form.up3} onChange={e => setForm({ ...form, up3: e.target.value })} /></div><div className="form-group"><label>ULP</label><input value={form.ulp} onChange={e => setForm({ ...form, ulp: e.target.value })} /></div></div>
          <div className="form-row"><div className="form-group"><label>SPMK</label><input value={form.spmk_no} onChange={e => setForm({ ...form, spmk_no: e.target.value })} /></div><div className="form-group"><label>PM</label><input value={form.pm_name} onChange={e => setForm({ ...form, pm_name: e.target.value })} /></div></div>
          <div className="form-row"><div className="form-group"><label>Buka</label><input type="date" value={form.open_date} onChange={e => setForm({ ...form, open_date: e.target.value })} /></div><div className="form-group"><label>Tutup</label><input type="date" value={form.close_date} onChange={e => setForm({ ...form, close_date: e.target.value })} /></div></div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.tender_number}>Buat</button>
        </Modal>
      )}
    </div>
  );
}
