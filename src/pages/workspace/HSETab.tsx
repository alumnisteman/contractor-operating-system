import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, EmptyState, formatDateTime } from '../../components/ui';
import type { HSEToolbox, HSEPermit, HSEIncident } from '../../types';

export function HSETab({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState<'toolbox' | 'permit' | 'incident'>('toolbox');
  const [toolboxes, setToolboxes] = useState<HSEToolbox[]>([]);
  const [permits, setPermits] = useState<HSEPermit[]>([]);
  const [incidents, setIncidents] = useState<HSEIncident[]>([]);
  const [show, setShow] = useState(false);

  const load = useCallback(async () => {
    const { data: t } = await supabase.from('hse_toolbox').select('*').eq('project_id', projectId).order('meeting_date', { ascending: false });
    setToolboxes(t || []);
    const { data: p } = await supabase.from('hse_permits').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    setPermits(p || []);
    const { data: i } = await supabase.from('hse_incidents').select('*').eq('project_id', projectId).order('incident_date', { ascending: false });
    setIncidents(i || []);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div className="tab-bar" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <div className={`tab ${tab === 'toolbox' ? 'active' : ''}`} onClick={() => setTab('toolbox')}>Toolbox</div>
          <div className={`tab ${tab === 'permit' ? 'active' : ''}`} onClick={() => setTab('permit')}>Permit</div>
          <div className={`tab ${tab === 'incident' ? 'active' : ''}`} onClick={() => setTab('incident')}>Incident</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShow(true)}>+ Tambah</button>
      </div>
      {tab === 'toolbox' && (toolboxes.length === 0 ? <EmptyState message="Belum ada toolbox meeting" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Topik</th><th>Presenter</th><th>Tanggal</th><th>Peserta</th></tr></thead>
            <tbody>{toolboxes.map(t => <tr key={t.id}><td>{t.topic}</td><td>{t.presenter || '-'}</td><td>{formatDateTime(t.meeting_date)}</td><td>{t.attendees_count}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {tab === 'permit' && (permits.length === 0 ? <EmptyState message="Belum ada work permit" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Tipe</th><th>No Permit</th><th>Lokasi</th><th>Status</th></tr></thead>
            <tbody>{permits.map(p => <tr key={p.id}><td>{p.permit_type}</td><td>{p.permit_no || '-'}</td><td>{p.location || '-'}</td><td><Badge status={p.status} /></td></tr>)}</tbody>
          </table>
        </div>
      )}
      {tab === 'incident' && (incidents.length === 0 ? <EmptyState message="Tidak ada incident — aman" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Tipe</th><th>Deskripsi</th><th>Tanggal</th><th>Status</th></tr></thead>
            <tbody>{incidents.map(i => <tr key={i.id}><td>{i.type || '-'}</td><td>{i.description}</td><td>{formatDateTime(i.incident_date)}</td><td><Badge status={i.status} /></td></tr>)}</tbody>
          </table>
        </div>
      )}
      {show && <HSEModal projectId={projectId} type={tab} onClose={() => setShow(false)} onSaved={load} />}
    </div>
  );
}

function HSEModal({ projectId, type, onClose, onSaved }: { projectId: string; type: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Record<string, string>>({});
  const save = async () => {
    if (type === 'toolbox') await supabase.from('hse_toolbox').insert({ project_id: projectId, topic: form.topic || '', presenter: form.presenter, attendees_count: parseInt(form.attendees) || 0, notes: form.notes });
    else if (type === 'permit') await supabase.from('hse_permits').insert({ project_id: projectId, permit_type: form.permit_type || 'hot_work', permit_no: form.permit_no, location: form.location, description: form.description });
    else await supabase.from('hse_incidents').insert({ project_id: projectId, type: form.type || 'minor', description: form.description || '', location: form.location });
    onClose(); onSaved();
  };
  return (
    <Modal title={`Tambah ${type}`} onClose={onClose}>
      {type === 'toolbox' && <>
        <div className="form-group"><label>Topik</label><input value={form.topic || ''} onChange={e => setForm({ ...form, topic: e.target.value })} /></div>
        <div className="form-row"><div className="form-group"><label>Presenter</label><input value={form.presenter || ''} onChange={e => setForm({ ...form, presenter: e.target.value })} /></div><div className="form-group"><label>Peserta</label><input type="number" value={form.attendees || ''} onChange={e => setForm({ ...form, attendees: e.target.value })} /></div></div>
      </>}
      {type === 'permit' && <>
        <div className="form-group"><label>Tipe Permit</label><select value={form.permit_type || 'hot_work'} onChange={e => setForm({ ...form, permit_type: e.target.value })}><option value="hot_work">Hot Work</option><option value="confined_space">Confined Space</option><option value="height">Height</option><option value="excavation">Excavation</option><option value="electrical">Electrical</option><option value="lifting">Lifting</option></select></div>
        <div className="form-group"><label>No Permit</label><input value={form.permit_no || ''} onChange={e => setForm({ ...form, permit_no: e.target.value })} /></div>
        <div className="form-group"><label>Lokasi</label><input value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
      </>}
      {type === 'incident' && <>
        <div className="form-group"><label>Tipe</label><select value={form.type || 'minor'} onChange={e => setForm({ ...form, type: e.target.value })}><option value="minor">Minor</option><option value="major">Major</option><option value="fatal">Fatal</option><option value="property">Property</option><option value="environmental">Environmental</option></select></div>
        <div className="form-group"><label>Deskripsi</label><textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-group"><label>Lokasi</label><input value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
      </>}
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={save}>Simpan</button>
    </Modal>
  );
}
