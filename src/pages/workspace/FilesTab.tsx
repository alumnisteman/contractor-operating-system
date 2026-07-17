import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, EmptyState, formatDate } from '../../components/ui';
import type { Drawing, ProjectDocument } from '../../types';

export function FilesTab({ projectId }: { projectId: string }) {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [docs, setDocs] = useState<ProjectDocument[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: '', drawing_type: 'ifc', drawing_no: '', doc_type: 'kontrak', mode: 'drawing' as 'drawing' | 'document' });

  const load = useCallback(async () => {
    const { data: d } = await supabase.from('drawings').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    setDrawings(d || []);
    const { data: doc } = await supabase.from('documents').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    setDocs(doc || []);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (form.mode === 'drawing') {
      await supabase.from('drawings').insert({ project_id: projectId, title: form.title, drawing_type: form.drawing_type, drawing_no: form.drawing_no, revision: 'A', status: 'draft' });
    } else {
      await supabase.from('documents').insert({ project_id: projectId, title: form.title, doc_type: form.doc_type, status: 'draft' });
    }
    setShow(false); setForm({ title: '', drawing_type: 'ifc', drawing_no: '', doc_type: 'kontrak', mode: 'drawing' }); load();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 16 }}>Files — Drawing & Document</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShow(true)}>+ Upload</button>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h4 style={{ fontSize: 14, marginBottom: 12 }}>Drawing</h4>
          {drawings.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Belum ada drawing</p> :
            <table className="table"><thead><tr><th>No</th><th>Title</th><th>Type</th><th>Rev</th><th>Status</th></tr></thead>
              <tbody>{drawings.map(d => <tr key={d.id}><td>{d.drawing_no || '-'}</td><td>{d.title}</td><td>{d.drawing_type}</td><td>{d.revision}</td><td><Badge status={d.status} /></td></tr>)}</tbody>
            </table>
          }
        </div>
        <div className="card">
          <h4 style={{ fontSize: 14, marginBottom: 12 }}>Document</h4>
          {docs.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Belum ada dokumen</p> :
            <table className="table"><thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{docs.map(d => <tr key={d.id}><td>{d.title}</td><td>{d.doc_type}</td><td><Badge status={d.status} /></td><td>{formatDate(d.doc_date)}</td></tr>)}</tbody>
            </table>
          }
        </div>
      </div>
      {show && (
        <Modal title="Upload File" onClose={() => setShow(false)}>
          <div className="form-group"><label>Tipe</label><select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value as any })}><option value="drawing">Drawing</option><option value="document">Document</option></select></div>
          <div className="form-group"><label>Judul</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          {form.mode === 'drawing' ? (
            <div className="form-row">
              <div className="form-group"><label>Jenis Drawing</label><select value={form.drawing_type} onChange={e => setForm({ ...form, drawing_type: e.target.value })}><option value="ifc">IFC</option><option value="shop_drawing">Shop Drawing</option><option value="as_built">As Built</option><option value="sld">SLD</option><option value="layout">Layout</option></select></div>
              <div className="form-group"><label>Drawing No</label><input value={form.drawing_no} onChange={e => setForm({ ...form, drawing_no: e.target.value })} /></div>
            </div>
          ) : (
            <div className="form-group"><label>Jenis Dokumen</label><select value={form.doc_type} onChange={e => setForm({ ...form, doc_type: e.target.value })}><option value="kontrak">Kontrak</option><option value="spmk">SPMK</option><option value="addendum">Addendum</option><option value="bast">BAST</option><option value="ncr">NCR</option><option value="rfi">RFI</option><option value="itp">ITP</option></select></div>
          )}
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.title}>Upload</button>
        </Modal>
      )}
    </div>
  );
}
