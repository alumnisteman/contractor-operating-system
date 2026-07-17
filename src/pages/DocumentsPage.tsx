import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Badge, EmptyState, formatDate } from '../components/ui';

export function DocumentsPage() {
  const [tab, setTab] = useState<'documents' | 'drawings'>('documents');
  const [docs, setDocs] = useState<any[]>([]);
  const [drawings, setDrawings] = useState<any[]>([]);
  useEffect(() => { (async () => {
    const [d, dr] = await Promise.all([
      supabase.from('documents').select('*,projects(name)').order('created_at', { ascending: false }),
      supabase.from('drawings').select('*,projects(name)').order('created_at', { ascending: false }),
    ]);
    setDocs(d.data || []); setDrawings(dr.data || []);
  })(); }, []);
  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">Documents</h1></div>
      <div className="tabs">
        <button className={`tab ${tab === 'documents' ? 'tab-active' : ''}`} onClick={() => setTab('documents')}>Documents</button>
        <button className={`tab ${tab === 'drawings' ? 'tab-active' : ''}`} onClick={() => setTab('drawings')}>Drawings</button>
      </div>
      {tab === 'documents' && (<div className="card" style={{ padding: 0 }}>{docs.length === 0 ? <EmptyState message="Belum ada dokumen" /> : (
        <table className="table"><thead><tr><th>Judul</th><th>Tipe</th><th>Project</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>
          {docs.map((d) => <tr key={d.id}><td>{d.title}</td><td>{d.doc_type}</td><td>{d.projects?.name || '-'}</td><td><Badge status={d.status} /></td><td>{formatDate(d.doc_date)}</td></tr>)}
        </tbody></table>
      )}</div>)}
      {tab === 'drawings' && (<div className="card" style={{ padding: 0 }}>{drawings.length === 0 ? <EmptyState message="Belum ada drawing" /> : (
        <table className="table"><thead><tr><th>Judul</th><th>Tipe</th><th>Rev</th><th>Project</th><th>Status</th></tr></thead><tbody>
          {drawings.map((d) => <tr key={d.id}><td>{d.title}</td><td>{d.drawing_type}</td><td>{d.revision}</td><td>{d.projects?.name || '-'}</td><td><Badge status={d.status} /></td></tr>)}
        </tbody></table>
      )}</div>)}
    </div>
  );
}
