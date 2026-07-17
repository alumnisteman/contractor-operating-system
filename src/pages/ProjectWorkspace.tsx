import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Badge, ProgressBar, EmptyState, formatCurrency, formatDate, formatDateTime } from '../components/ui';
import type { Project, ProjectWBS, Task, Equipment, Personnel, DailyProgress, QCInspection, Drawing, ProjectDocument, Meeting } from '../types';
import { OverviewTab } from './workspace/OverviewTab';
import { WBSTab } from './workspace/WBSTab';
import { TaskTab } from './workspace/TaskTab';
import { TimelineTab } from './workspace/TimelineTab';
import { EquipmentTab } from './workspace/EquipmentTab';
import { WorkerTab } from './workspace/WorkerTab';
import { QCTab } from './workspace/QCTab';
import { HSETab } from './workspace/HSETab';
import { MeetingTab } from './workspace/MeetingTab';
import { GalleryTab } from './workspace/GalleryTab';
import { MaterialTab } from './workspace/MaterialTab';
import { PurchaseTab } from './workspace/PurchaseTab';
import { FilesTab } from './workspace/FilesTab';

const TABS = ['Overview', 'Task', 'Timeline', 'WBS', 'Files', 'Material', 'Purchase', 'Worker', 'Equipment', 'QC', 'HSE', 'Meeting', 'Gallery'];

export function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState('Overview');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
    setProject(data as Project | null);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="page"><p>Memuat...</p></div>;
  if (!project) return <div className="page"><EmptyState message="Project tidak ditemukan" /><button className="btn btn-primary" onClick={() => navigate('/projects')}>Kembali</button></div>;

  return (
    <div className="page">
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-sm btn-outline" style={{ marginBottom: 8 }} onClick={() => navigate('/projects')}>← Kembali</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">{project.name}</h1>
            <p className="page-subtitle">{project.project_type} • {project.location_name || '-'} • <Badge status={project.status} /></p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: project.progress >= 80 ? 'var(--success-500)' : project.progress >= 50 ? 'var(--primary-600)' : 'var(--warning-500)' }}>{project.progress}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Progress</div>
          </div>
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map(t => <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      {tab === 'Overview' && <OverviewTab project={project} />}
      {tab === 'Task' && <TaskTab projectId={project.id} />}
      {tab === 'Timeline' && <TimelineTab projectId={project.id} />}
      {tab === 'WBS' && <WBSTab projectId={project.id} />}
      {tab === 'Files' && <FilesTab projectId={project.id} />}
      {tab === 'Material' && <MaterialTab projectId={project.id} />}
      {tab === 'Purchase' && <PurchaseTab projectId={project.id} />}
      {tab === 'Worker' && <WorkerTab projectId={project.id} />}
      {tab === 'Equipment' && <EquipmentTab projectId={project.id} />}
      {tab === 'QC' && <QCTab projectId={project.id} />}
      {tab === 'HSE' && <HSETab projectId={project.id} />}
      {tab === 'Meeting' && <MeetingTab projectId={project.id} />}
      {tab === 'Gallery' && <GalleryTab projectId={project.id} />}
    </div>
  );
}
