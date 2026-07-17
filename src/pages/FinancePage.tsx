import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Badge, EmptyState, Modal, StatCard, formatCurrency, formatDate } from '../components/ui';
import type { Invoice, Purchase } from '../types';

export function FinancePage() {
  const [tab, setTab] = useState<'invoices' | 'purchases' | 'termin'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showInvForm, setShowInvForm] = useState(false);
  const [showPrForm, setShowPrForm] = useState(false);

  const load = async () => {
    const [i, p] = await Promise.all([
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('purchases').select('*').order('created_at', { ascending: false }),
    ]);
    setInvoices(i.data || []); setPurchases(p.data || []);
  };
  useEffect(() => { load(); }, []);

  const totalOutstanding = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.total_amount, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total_amount, 0);
  const totalPurchase = purchases.reduce((s, p) => s + p.total_amount, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Finance</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setShowInvForm(true)}>+ Invoice</button>
          <button className="btn btn-secondary" onClick={() => setShowPrForm(true)}>+ Purchase Request</button>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <StatCard label="Invoice Outstanding" value={formatCurrency(totalOutstanding)} color="var(--warning-500)" />
        <StatCard label="Invoice Paid" value={formatCurrency(totalPaid)} color="var(--success-500)" />
        <StatCard label="Total Purchase" value={formatCurrency(totalPurchase)} />
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'invoices' ? 'tab-active' : ''}`} onClick={() => setTab('invoices')}>Invoices</button>
        <button className={`tab ${tab === 'purchases' ? 'tab-active' : ''}`} onClick={() => setTab('purchases')}>Purchase (Kanban)</button>
      </div>

      {tab === 'invoices' && (
        <div className="card" style={{ padding: 0 }}>
          {invoices.length === 0 ? <EmptyState message="Belum ada invoice" /> : (
            <table className="table">
              <thead><tr><th>No Invoice</th><th>Tipe</th><th>Jumlah</th><th>Status</th><th>Jatuh Tempo</th></tr></thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id}><td>{i.invoice_number}</td><td>{i.type || '-'}</td><td>{formatCurrency(i.total_amount)}</td><td><Badge status={i.status} /></td><td>{formatDate(i.due_date)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'purchases' && <PurchaseKanban purchases={purchases} onReload={load} />}

      {showInvForm && <InvoiceForm onClose={() => setShowInvForm(false)} onSaved={() => { setShowInvForm(false); load(); }} />}
      {showPrForm && <PurchaseForm onClose={() => setShowPrForm(false)} onSaved={() => { setShowPrForm(false); load(); }} />}
    </div>
  );
}

function PurchaseKanban({ purchases, onReload }: { purchases: Purchase[]; onReload: () => void }) {
  const columns = ['draft', 'requested', 'approved', 'ordered', 'delivered', 'completed'];
  const move = async (id: string, status: string) => {
    await supabase.from('purchases').update({ status }).eq('id', id);
    onReload();
  };
  return (
    <div className="kanban-board">
      {columns.map((col) => (
        <div key={col} className="kanban-col" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text'); move(id, col); }}>
          <div className="kanban-col-header">
            <span style={{ textTransform: 'capitalize' }}>{col}</span>
            <span className="badge badge-neutral">{purchases.filter((p) => p.status === col).length}</span>
          </div>
          {purchases.filter((p) => p.status === col).map((p) => (
            <div key={p.id} className="kanban-card" draggable onDragStart={(e) => e.dataTransfer.setData('text', p.id)}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.pr_number}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{formatCurrency(p.total_amount)}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function InvoiceForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ invoice_number: '', type: 'sales', amount: 0, tax_amount: 0, issue_date: '', due_date: '' });
  const submit = async () => {
    const total = (parseFloat(form.amount as any) || 0) + (parseFloat(form.tax_amount as any) || 0);
    await supabase.from('invoices').insert({
      ...form, total_amount: total, issue_date: form.issue_date || null, due_date: form.due_date || null,
    });
    onSaved();
  };
  return (
    <Modal title="Tambah Invoice" onClose={onClose}>
      <div className="form-group"><label>No Invoice</label><input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} /></div>
      <div className="form-group"><label>Tipe</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="sales">Sales</option><option value="purchase">Purchase</option></select></div>
      <div className="form-row">
        <div className="form-group"><label>Jumlah</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} /></div>
        <div className="form-group"><label>Pajak</label><input type="number" value={form.tax_amount} onChange={(e) => setForm({ ...form, tax_amount: parseFloat(e.target.value) || 0 })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Tanggal Issue</label><input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
        <div className="form-group"><label>Jatuh Tempo</label><input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
      </div>
      <button className="btn btn-primary" onClick={submit}>Simpan</button>
    </Modal>
  );
}

function PurchaseForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ pr_number: '', title: '', description: '', total_amount: 0 });
  const submit = async () => {
    await supabase.from('purchases').insert({ ...form, status: 'draft' });
    onSaved();
  };
  return (
    <Modal title="Tambah Purchase Request" onClose={onClose}>
      <div className="form-group"><label>No PR</label><input value={form.pr_number} onChange={(e) => setForm({ ...form, pr_number: e.target.value })} /></div>
      <div className="form-group"><label>Judul</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div className="form-group"><label>Deskripsi</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="form-group"><label>Total</label><input type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })} /></div>
      <button className="btn btn-primary" onClick={submit}>Simpan</button>
    </Modal>
  );
}
