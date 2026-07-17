import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, EmptyState, formatCurrency, formatDate } from '../../components/ui';
import type { PurchaseRequest, Supplier } from '../../types';

const PR_COLUMNS = ['draft', 'requested', 'approved', 'ordered', 'delivered', 'completed'];

export function PurchaseTab({ projectId }: { projectId: string }) {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ pr_number: '', notes: '', supplier_id: '', expected_date: '' });

  const load = useCallback(async () => {
    const { data } = await supabase.from('purchase_requests').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    setPrs(data || []);
    const { data: s } = await supabase.from('suppliers').select('*');
    setSuppliers(s || []);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('purchase_requests').insert({
      pr_number: form.pr_number, project_id: projectId, notes: form.notes,
      supplier_id: form.supplier_id || null, expected_date: form.expected_date || null, status: 'draft',
    });
    setShow(false); setForm({ pr_number: '', notes: '', supplier_id: '', expected_date: '' }); load();
  };

  const move = async (id: string, status: string) => {
    await supabase.from('purchase_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 16 }}>Purchase Request — Kanban</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShow(true)}>+ Purchase</button>
      </div>
      {prs.length === 0 && !show ? <EmptyState message="Belum ada purchase request" /> :
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
          {PR_COLUMNS.map(col => (
            <div key={col} className="kanban-col" style={{ minWidth: 220, flex: 1 }}>
              <div className="kanban-col-header">{col} <span style={{ color: 'var(--text-muted)' }}>{prs.filter(p => p.status === col).length}</span></div>
              {prs.filter(p => p.status === col).map(p => (
                <div key={p.id} className="kanban-card" onClick={() => { const next = PR_COLUMNS[(PR_COLUMNS.indexOf(p.status) + 1) % PR_COLUMNS.length]; move(p.id, next); }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{p.pr_number}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{formatCurrency(p.total_amount)}</div>
                  {p.expected_date && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(p.expected_date)}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      }
      {show && (
        <Modal title="Buat Purchase Request" onClose={() => setShow(false)}>
          <div className="form-group"><label>PR Number</label><input value={form.pr_number} onChange={e => setForm({ ...form, pr_number: e.target.value })} /></div>
          <div className="form-group"><label>Supplier</label><select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}><option value="">Pilih supplier</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="form-group"><label>Expected Date</label><input type="date" value={form.expected_date} onChange={e => setForm({ ...form, expected_date: e.target.value })} /></div>
          <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.pr_number}>Buat</button>
        </Modal>
      )}
    </div>
  );
}
