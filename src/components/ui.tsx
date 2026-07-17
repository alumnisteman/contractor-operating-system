import type { ReactNode } from 'react';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-sm btn-outline" onClick={onClose}>Tutup</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'badge-primary', active: 'badge-success', approved: 'badge-success', verified: 'badge-success',
    passed: 'badge-success', paid: 'badge-success', won: 'badge-success', completed: 'badge-success',
    pending: 'badge-warning', draft: 'badge-neutral', submitted: 'badge-primary', evaluated: 'badge-primary',
    signed: 'badge-primary', closed: 'badge-neutral', rejected: 'badge-error', failed: 'badge-error',
    cancelled: 'badge-error', suspended: 'badge-error', breakdown: 'badge-error', expired: 'badge-error',
    terminated: 'badge-error', lost: 'badge-neutral', planning: 'badge-neutral', available: 'badge-success',
    in_use: 'badge-primary', maintenance: 'badge-warning', assigned: 'badge-primary', on_leave: 'badge-warning',
    resigned: 'badge-neutral', investigating: 'badge-warning', conditional: 'badge-warning',
    warranty_expired: 'badge-error', retired: 'badge-neutral', todo: 'badge-neutral',
    in_progress: 'badge-primary', review: 'badge-warning', done: 'badge-success', blocked: 'badge-error',
    requested: 'badge-primary', ordered: 'badge-primary', delivered: 'badge-success',
    scheduled: 'badge-primary',
  };
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
}

export function ProgressBar({ value }: { value: number }) {
  return <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty">{message}</div>;
}

export function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return <div className="card stat-card"><span className="stat-label">{label}</span><span className="stat-value" style={color ? { color } : undefined}>{value}</span></div>;
}

export function HealthScore({ score }: { score: number }) {
  const cls = score >= 80 ? 'health-good' : score >= 70 ? 'health-warn' : 'health-bad';
  return <div className={`health-score ${cls}`}>{score}</div>;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n || 0);
}

export function formatDate(d?: string): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(d?: string): string {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j lalu`;
  const days = Math.floor(hrs / 24);
  return `${days}h lalu`;
}

export function calcHealthScore(p: { progress?: number; status?: string }): number {
  const progress = p.progress || 0;
  const statusScore = p.status === 'active' ? 100 : p.status === 'completed' ? 100 : p.status === 'suspended' ? 40 : 60;
  return Math.round(progress * 0.5 + statusScore * 0.5);
}
