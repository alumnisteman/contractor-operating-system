import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, EmptyState, formatDateTime } from '../../components/ui';
import type { QCInspection, QCChecklist } from '../../types';

export function QCTab({ projectId }: { projectId: string }) {
  const [inspections, setInspections] = useState<QCInspection[]>([]);
  const [checklists, setChecklists] = useState<QCChecklist[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ checklist_id: '', result: 'pending', notes: '' });

  const load = useCallback(async () => {
    const { data: i } = await supabase.from('qc_inspections').select('*, qc_checklists(*)').eq('project_id', projectId).order('inspection_date', { ascending: false });
    setInspections(i || []);
    const { data: c } = await supabase.from('qc_checklists').select('*');
    setChecklists(c || []);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('qc_inspections').insert({ project_id: projectId, checklist_id: form.checklist_id, result: form.result, notes: form.notes });
    setShow(false); setForm({ checklist_id: '', result: 'pending', notes: '' }); load();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 16 }}>QC Inspection</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShow(true)}>+ Inspection</button>
      </div>
      {inspections.length === 0 ? <EmptyState message="Belum ada QC inspection" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Checklist</th><th>Tanggal</th><th>Hasil</th><th>Catatan</th></tr></thead>
            <tbody>
              {inspections.map(i => <tr key={i.id}><td>{(i as any).qc_checklists?.name || '-'}</td><td>{formatDateTime(i.inspection_date)}</td><td><Badge status={i.result} /></td><td>{i.notes || '-'}</td></tr>)}
            </tbody>
          </table>
        </div>
      }
      {show && (
        <Modal title="Tambah QC Inspection" onClose={() => setShow(false)}>
          <div className="form-group"><label>Checklist</label><select value={form.checklist_id} onChange={e => setForm({ ...form, checklist_id: e.target.value })}>{checklists.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="form-group"><label>Hasil</label><select value={form.result} onChange={e => setForm({ ...form, result: e.target.value })}><option value="pending">Pending</option><option value="passed">Passed</option><option value="failed">Failed</option><option value="conditional">Conditional</option></select></div>
          <div className="form-group"><label>Catatan</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.checklist_id}>Tambah</button>
        </Modal>
      )}
    </div>
  );
}
