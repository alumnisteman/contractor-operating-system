import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { EmptyState, formatDateTime } from '../../components/ui';

export function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase.from('daily_photos').select('*, daily_progress(project_id, projects(name))').order('taken_at', { ascending: false }).limit(100);
    setPhotos(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped: Record<string, any[]> = {};
  photos.forEach(p => {
    const date = new Date(p.taken_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(p);
  });

  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  if (photos.length === 0) return <div className="page"><div className="page-header"><h1 className="page-title">Gallery</h1></div><EmptyState message="Belum ada foto" /></div>;

  return (
    <div className="page">
      <div className="page-header"><div><h1 className="page-title">Gallery</h1><p className="page-subtitle">{photos.length} foto dari semua project</p></div></div>
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)' }}>{date === today ? 'Hari Ini' : date === yesterday ? 'Kemarin' : date}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {items.map(p => (
              <div key={p.id} className="card" style={{ padding: 8 }}>
                <div style={{ width: '100%', height: 160, background: 'var(--n-200)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📷</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>{p.caption || 'Progress foto'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(p as any).daily_progress?.projects?.name || '-'}</div>
                {p.latitude && p.longitude && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</div>}
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDateTime(p.taken_at)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
