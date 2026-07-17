import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { EmptyState, formatDateTime } from '../../components/ui';
import type { ActivityFeedItem } from '../../types';

export function TimelineTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ActivityFeedItem[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase.from('activity_feed').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(50);
    setItems(data || []);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  if (items.length === 0) return <EmptyState message="Belum ada aktivitas tercatat" />;

  return (
    <div className="card">
      <h3 style={{ fontSize: 16, marginBottom: 16 }}>Universal Timeline</h3>
      <div style={{ position: 'relative', paddingLeft: 20 }}>
        <div style={{ position: 'absolute', left: 5, top: 0, bottom: 0, width: 2, background: 'var(--n-200)' }} />
        {items.map(a => (
          <div key={a.id} style={{ position: 'relative', paddingBottom: 20 }}>
            <div style={{ position: 'absolute', left: -19, top: 4, width: 12, height: 12, borderRadius: '50%',
              background: a.activity_type === 'safety' ? 'var(--error-500)' : a.activity_type === 'approval' ? 'var(--warning-500)' : a.activity_type === 'progress' ? 'var(--success-500)' : 'var(--primary-400)' }} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>{a.message}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDateTime(a.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
