import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, EmptyState, StatCard, formatCurrency, formatDate } from '../../components/ui';
import type { Invoice } from '../../types';

export function FinancePage() {
  const [tab, setTab] = useState<'invoices' | 'termin' | 'cashflow'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [termin, setTermin] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ invoice_no: '', amount: '', project_id: '', due_date: '' });
  const [projects, setProjects] = useState<any[]>([]);

  const load = useCallback(async () => {
    const { data: inv } = await supabase.from('invoices').select('*, projects(*)').order('created_at', { ascending: false });
    setInvoices(inv || []);
    const { data: t } = await supabase.from('project_termin').select('*, projects(*)').order('termin_no');
    setTermin(t || []);
    const { data: p } = await supabase.from('projects').select('id, name');
    setProjects(p || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('invoices').insert({
      invoice_no: form.invoice_no, project_id: form.project_id || null,
      amount: parseFloat(form.amount) || 0, total: parseFloat(form.amount) || 0,
      due_date: form.due_date || null, status: 'draft',
    });
    setShow(false); setForm({ invoice_no: '', amount: '', project_id: '', due_date: '' }); load();
  };

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalOutstanding = invoices.filter(i => i.status === 'submitted' || i.status === 'approved').reduce((s, i) => s + i.total, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Finance</h1><p className="page-subtitle">Invoice, termin & cashflow</p></div>
        {tab === 'invoices' && <button className="btn btn-primary" onClick={() => setShow(true)}>+ Invoice</button>}
      </div>
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <StatCard label="Total Paid" value={formatCurrency(totalPaid)} color="var(--success-500)" />
        <StatCard label="Outstanding" value={formatCurrency(totalOutstanding)} color="var(--warning-500)" />
        <StatCard label="Total Invoices" value={invoices.length} />
      </div>
      <div className="tab-bar">
        <div className={`tab ${tab === 'invoices' ? 'active' : ''}`} onClick={() => setTab('invoices')}>Invoice</div>
        <div className={`tab ${tab === 'termin' ? 'active' : ''}`} onClick={() => setTab('termin')}>Termin</div>
        <div className={`tab ${tab === 'cashflow' ? 'active' : ''}`} onClick={() => setTab('cashflow')}>Cashflow</div>
      </div>
      {tab === 'invoices' && (invoices.length === 0 ? <EmptyState message="Belum ada invoice" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>No Invoice</th><th>Project</th><th>Nilai</th><th>Jatuh Tempo</th><th>Status</th></tr></thead>
            <tbody>{invoices.map(i => <tr key={i.id}><td>{i.invoice_no}</td><td>{(i as any).projects?.name || '-'}</td><td>{formatCurrency(i.total)}</td><td>{formatDate(i.due_date)}</td><td><Badge status={i.status} /></td></tr>)}</tbody>
          </table>
        </div>
      )}
      {tab === 'termin' && (termin.length === 0 ? <EmptyState message="Belum ada termin" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Project</th><th>Termin</th><th>Nilai</th><th>Persen</th><th>Status</th></tr></thead>
            <tbody>{termin.map(t => <tr key={t.id}><td>{t.projects?.name || '-'}</td><td>{t.termin_no}</td><td>{formatCurrency(t.amount)}</td><td>{t.percentage}%</td><td><Badge status={t.status} /></td></tr>)}</tbody>
          </table>
        </div>
      )}
      {tab === 'cashflow' && <EmptyState message="Cashflow chart akan tampil di sini" />}
      {show && (
        <Modal title="Buat Invoice" onClose={() => setShow(false)}>
          <div className="form-group"><label>No Invoice</label><input value={form.invoice_no} onChange={e => setForm({ ...form, invoice_no: e.target.value })} /></div>
          <div className="form-group"><label>Project</label><select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}><option value="">Pilih project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="form-row"><div className="form-group"><label>Nilai</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div><div className="form-group"><label>Jatuh Tempo</label><input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div></div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.invoice_no}>Buat</button>
        </Modal>
      )}
    </div>
  );
}
