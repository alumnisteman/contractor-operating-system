import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Badge, ProgressBar, HealthRing, EmptyState, daysUntil } from '../components/ui';
import type { Project } from '../types';

export function WorkspacePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { supabase.from('projects').select('*').eq('status', 'active').order('updated_at', { ascending: false }).then(({ data }) => setProjects(data || [])); }, []);
  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">Workspace</h1><p className="page-subtitle">Semua proyek aktif dalam satu tempat</p></div>
      {projects.length === 0 ? <EmptyState message="Belum ada proyek aktif. Buat proyek dari menu Projects." /> : (
        <div className="grid grid-auto">
          {projects.map((p) => (
            <div key={p.id} className="card card-hover" onClick={() => navigate(`/projects/${p.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div><h3 style={{ fontSize: 16 }}>{p.name}</h3><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.project_type} - {p.up3 || ''} {p.ulp || ''}</div></div>
                <HealthRing score={p.health_score} size={48} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span>Progress</span><span>{p.progress}%</span></div>
                <ProgressBar value={p.progress} color={p.health_score < 70 ? 'var(--error-500)' : 'var(--primary-500)'} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}><Badge status={p.status} /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{daysUntil(p.end_date)} hari lagi</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
