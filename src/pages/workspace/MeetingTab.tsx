import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, EmptyState, formatDateTime } from '../../components/ui';
import type { Meeting } from '../../types';

export function MeetingTab({ projectId }: { projectId: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: '', agenda: '', participants: '', minutes: '' });

  const load = useCallback(async () => {
    const { data } = await supabase.from('meetings').select('*').eq('project_id', projectId).order('meeting_date', { ascending: false });
    setMeetings(data || []);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('meetings').insert({ project_id: projectId, title: form.title, agenda: form.agenda, participants: form.participants, minutes: form.minutes });
    setShow(false); setForm({ title: '', agenda: '', participants: '', minutes: '' }); load();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 16 }}>Meeting</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShow(true)}>+ Meeting</button>
      </div>
      {meetings.length === 0 ? <EmptyState message="Belum ada meeting" /> :
        <div className="card" style={{ padding: 0 }}>
          <table className="table"><thead><tr><th>Judul</th><th>Agenda</th><th>Participants</th><th>Tanggal</th><th>Status</th></tr></thead>
            <tbody>{meetings.map(m => <tr key={m.id}><td>{m.title}</td><td>{m.agenda || '-'}</td><td>{m.participants || '-'}</td><td>{formatDateTime(m.meeting_date)}</td><td>{m.status}</td></tr>)}</tbody>
          </table>
        </div>
      }
      {show && (
        <Modal title="Buat Meeting" onClose={() => setShow(false)}>
          <div className="form-group"><label>Judul</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-group"><label>Agenda</label><textarea value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })} /></div>
          <div className="form-group"><label>Participants</label><input value={form.participants} onChange={e => setForm({ ...form, participants: e.target.value })} /></div>
          <div className="form-group"><label>Minutes</label><textarea value={form.minutes} onChange={e => setForm({ ...form, minutes: e.target.value })} /></div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.title}>Buat</button>
        </Modal>
      )}
    </div>
  );
}
