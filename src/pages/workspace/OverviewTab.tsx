import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { StatCard, ProgressBar, Badge, formatCurrency, formatDate } from '../../components/ui';
import type { Project } from '../../types';

export function OverviewTab({ project }: { project: Project }) {
  const [termin, setTermin] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [wbs, setWbs] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase.from('project_termin').select('*').eq('project_id', project.id).order('termin_no');
      setTermin(t || []);
      const { data: c } = await supabase.from('project_cashflow').select('*').eq('project_id', project.id).order('month_date');
      setCashflow(c || []);
      const { data: w } = await supabase.from('project_wbs').select('*').eq('project_id', project.id);
      setWbs(w || []);
      const { data: tk } = await supabase.from('tasks').select('*').eq('project_id', project.id);
      setTasks(tk || []);
      const { data: e } = await supabase.from('equipment').select('*').eq('project_id', project.id);
      setEquipment(e || []);
      const { data: p } = await supabase.from('personnel').select('*').eq('project_id', project.id);
      setPersonnel(p || []);
    })();
  }, [project.id]);

  const paidTermin = termin.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const totalTermin = termin.reduce((s, t) => s + t.amount, 0);
  const openTasks = tasks.filter(t => t.status !== 'done').length;

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Nilai Kontrak" value={formatCurrency(project.contract_value || 0)} />
        <StatCard label="Termin Dibayar" value={formatCurrency(paidTermin)} color="var(--success-500)" />
        <StatCard label="Total Termin" value={formatCurrency(totalTermin)} />
        <StatCard label="Open Tasks" value={openTasks} />
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card"><h4 style={{ fontSize: 14, marginBottom: 8 }}>PLN Info</h4>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div>UP2D: {project.up2d || '-'}</div>
            <div>UID: {project.uid || '-'}</div>
            <div>UP3: {project.up3 || '-'}</div>
            <div>ULP: {project.ulp || '-'}</div>
            <div>SPMK: {project.spmk_no || '-'}</div>
            <div>PM: {project.pm_name || '-'}</div>
          </div>
        </div>
        <div className="card"><h4 style={{ fontSize: 14, marginBottom: 8 }}>Schedule</h4>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div>Mulai: {formatDate(project.start_date)}</div>
            <div>Selesai: {formatDate(project.end_date)}</div>
            <div>Status: {project.status}</div>
            <div style={{ marginTop: 8 }}><ProgressBar value={project.progress} /></div>
          </div>
        </div>
        <div className="card"><h4 style={{ fontSize: 14, marginBottom: 8 }}>Resources</h4>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div>WBS Items: {wbs.length}</div>
            <div>Equipment: {equipment.length}</div>
            <div>Personnel: {personnel.length}</div>
            <div>Tasks: {tasks.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h4 style={{ fontSize: 14, marginBottom: 12 }}>Termin</h4>
          {termin.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Belum ada termin</p> :
            <table className="table"><thead><tr><th>No</th><th>Deskripsi</th><th>Nilai</th><th>Status</th></tr></thead>
              <tbody>{termin.map(t => <tr key={t.id}><td>{t.termin_no}</td><td>{t.description || '-'}</td><td>{formatCurrency(t.amount)}</td><td><Badge status={t.status} /></td></tr>)}</tbody>
            </table>
          }
        </div>
        <div className="card">
          <h4 style={{ fontSize: 14, marginBottom: 12 }}>AI Insights</h4>
          <div style={{ fontSize: 13, lineHeight: 2 }}>
            {project.progress < 50 && project.status === 'active' && <div style={{ color: 'var(--warning-500)' }}>⚠ Progress terlambat — {100 - project.progress}% tersisa</div>}
            {openTasks > 5 && <div style={{ color: 'var(--warning-500)' }}>⚠ {openTasks} task belum selesai</div>}
            {termin.length > 0 && termin.some(t => t.status === 'pending') && <div style={{ color: 'var(--warning-500)' }}>⚠ Ada termin belum ditagih</div>}
            {personnel.length === 0 && <div style={{ color: 'var(--error-500)' }}>⚠ Belum ada SDM ditugaskan</div>}
            {equipment.length === 0 && <div style={{ color: 'var(--error-500)' }}>⚠ Belum ada equipment</div>}
            {project.progress >= 80 && <div style={{ color: 'var(--success-500)' }}>✓ Progress mendekati selesai</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
