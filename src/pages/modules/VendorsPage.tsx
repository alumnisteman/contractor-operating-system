import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Badge, EmptyState } from '../../components/ui';

export function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [tab, setTab] = useState<'vendors' | 'suppliers'>('vendors');

  const load = useCallback(async () => {
    const { data: v } = await supabase.from('vendor_profiles').select('*').order('created_at', { ascending: false });
    setVendors(v || []);
    const { data: s } = await supabase.from('suppliers').select('*').order('name');
    setSuppliers(s || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page">
      <div className="page-header"><div><h1 className="page-title">Vendors & Suppliers</h1><p className="page-subtitle">Direktori vendor & supplier</p></div></div>
      <div className="tab-bar">
        <div className={`tab ${tab === 'vendors' ? 'active' : ''}`} onClick={() => setTab('vendors')}>Vendor (DPT)</div>
        <div className={`tab ${tab === 'suppliers' ? 'active' : ''}`} onClick={() => setTab('suppliers')}>Supplier Directory</div>
      </div>
      {tab === 'vendors' && (vendors.length === 0 ? <EmptyState message="Belum ada vendor terdaftar" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Perusahaan</th><th>NPWP</th><th>Kontak</th><th>Klasifikasi</th><th>DPT Status</th></tr></thead>
            <tbody>{vendors.map(v => <tr key={v.id}><td>{v.company_name}</td><td>{v.npwp || '-'}</td><td>{v.contact_person || '-'} ({v.contact_phone || '-'})</td><td>{v.classification || '-'}</td><td><Badge status={v.dpt_status} /></td></tr>)}</tbody>
          </table>
        </div>
      )}
      {tab === 'suppliers' && (suppliers.length === 0 ? <EmptyState message="Belum ada supplier" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Nama</th><th>Kategori</th><th>Kontak</th><th>Rating</th><th>Lead Time</th></tr></thead>
            <tbody>{suppliers.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.category || '-'}</td><td>{s.contact_person || '-'} ({s.phone || '-'})</td><td>{s.rating || '-'}/5</td><td>{s.lead_time_days || '-'} hari</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
