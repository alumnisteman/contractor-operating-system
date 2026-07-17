import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { EmptyState, formatDate } from '../../components/ui';

export function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [drawings, setDrawings] = useState<any[]>([]);

  const load = useCallback(async () => {
    const { data: d } = await supabase.from('documents').select('*, projects(*)').order('created_at', { ascending: false });
    setDocs(d || []);
    const { data: dr } = await supabase.from('drawings').select('*, projects(*)').order('created_at', { ascending: false });
    setDrawings(dr || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page">
      <div className="page-header"><div><h1 className="page-title">Documents</h1><p className="page-subtitle">Dokumen & drawing semua project</p></div></div>
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Dokumen</h3>
          {docs.length === 0 ? <EmptyState message="Belum ada dokumen" /> :
            <table className="table"><thead><tr><th>Title</th><th>Project</th><th>Type</th><th>Date</th></tr></thead>
              <tbody>{docs.map(d => <tr key={d.id}><td>{d.title}</td><td>{d.projects?.name || '-'}</td><td>{d.doc_type}</td><td>{formatDate(d.doc_date)}</td></tr>)}</tbody>
            </table>
          }
        </div>
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Drawing</h3>
          {drawings.length === 0 ? <EmptyState message="Belum ada drawing" /> :
            <table className="table"><thead><tr><th>Title</th><th>Project</th><th>Type</th><th>Rev</th></tr></thead>
              <tbody>{drawings.map(d => <tr key={d.id}><td>{d.title}</td><td>{d.projects?.name || '-'}</td><td>{d.drawing_type}</td><td>{d.revision}</td></tr>)}</tbody>
            </table>
          }
        </div>
      </div>
    </div>
  );
}
