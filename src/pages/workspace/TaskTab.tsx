import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, EmptyState, formatDate } from '../../components/ui';
import type { Task } from '../../types';

const COLUMNS = ['todo', 'in_progress', 'review', 'done', 'blocked'];
const COL_LABELS: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done', blocked: 'Blocked' };

export function TaskTab({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', assigned_to_name: '' });

  const load = useCallback(async () => {
    const { data } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    setTasks(data || []);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    await supabase.from('tasks').insert({ project_id: projectId, title: form.title, description: form.description, priority: form.priority, due_date: form.due_date || null, assigned_to_name: form.assigned_to_name });
    setShow(false); setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to_name: '' }); load();
  };

  const move = async (id: string, status: string) => {
    await supabase.from('tasks').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 16 }}>Task Board</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShow(true)}>+ Task</button>
      </div>
      {tasks.length === 0 && !show ? <EmptyState message="Belum ada task" /> :
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
          {COLUMNS.map(col => (
            <div key={col} className="kanban-col" style={{ minWidth: 240, flex: 1 }}>
              <div className="kanban-col-header">{COL_LABELS[col]} <span style={{ color: 'var(--text-muted)' }}>{tasks.filter(t => t.status === col).length}</span></div>
              {tasks.filter(t => t.status === col).map(t => (
                <div key={t.id} className="kanban-card" draggable
                  onDragEnd={(e) => { e.preventDefault(); }}
                  onClick={() => { const next = COLUMNS[(COLUMNS.indexOf(t.status) + 1) % COLUMNS.length]; move(t.id, next); }}>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
                  {t.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{t.description}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge status={t.priority} />
                    {t.due_date && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(t.due_date)}</span>}
                  </div>
                  {t.assigned_to_name && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>👤 {t.assigned_to_name}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      }
      {show && (
        <Modal title="Buat Task" onClose={() => setShow(false)}>
          <div className="form-group"><label>Judul</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-group"><label>Deskripsi</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label>Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div className="form-group"><label>Due Date</label><input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Assignee</label><input value={form.assigned_to_name} onChange={e => setForm({ ...form, assigned_to_name: e.target.value })} /></div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create} disabled={!form.title}>Buat</button>
        </Modal>
      )}
    </div>
  );
}
