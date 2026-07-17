import type { ReactNode } from 'react';

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={wide ? { maxWidth: 900 } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-sm btn-outline" onClick={onClose}>Tutup</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const badgeMap: Record<string, string> = {
  open: 'badge-primary', active: 'badge-success', approved: 'badge-success', verified: 'badge-success',
  passed: 'badge-success', paid: 'badge-success', won: 'badge-success', completed: 'badge-success',
  done: 'badge-success', available: 'badge-success', assigned: 'badge-primary', in_use: 'badge-primary',
  pending: 'badge-warning', draft: 'badge-neutral', submitted: 'badge-primary', evaluated: 'badge-primary',
  signed: 'badge-primary', scheduled: 'badge-primary', in_progress: 'badge-primary', review: 'badge-primary',
  closed: 'badge-neutral', rejected: 'badge-error', failed: 'badge-error', cancelled: 'badge-error',
  suspended: 'badge-error', breakdown: 'badge-error', expired: 'badge-error', terminated: 'badge-error',
  overdue: 'badge-error', blocked: 'badge-error', lost: 'badge-neutral', planning: 'badge-neutral',
  todo: 'badge-neutral', maintenance: 'badge-warning', on_leave: 'badge-warning', late: 'badge-warning',
  investigating: 'badge-warning', conditional: 'badge-warning',
  ordered: 'badge-primary', delivered: 'badge-primary', requested: 'badge-warning',
  retired: 'badge-neutral', n_a: 'badge-neutral', absent: 'badge-error', sick: 'badge-warning',
  leave: 'badge-neutral', present: 'badge-success',
};

export function Badge({ status }: { status: string }) {
  const cls = badgeMap[status] || 'badge-neutral';
  return <span className={`badge ${cls}`}>{status.replace(/_/g, ' ')}</span>;
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color || 'var(--primary-500)' }} />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty">{message}</div>;
}

export function StatCard({ label, value, color, icon }: { label: string; value: string | number; color?: string; icon?: string }) {
  return (
    <div className="card stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <span className="stat-label">{label}</span>
          <span className="stat-value" style={color ? { color } : undefined}>{value}</span>
        </div>
        {icon && <span style={{ fontSize: 28, opacity: 0.3 }}>{icon}</span>}
      </div>
    </div>
  );
}

export function HealthRing({ score, size }: { score: number; size?: number }) {
  const s = size || 60;
  const r = (s - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 80 ? 'var(--success-500)' : score >= 70 ? 'var(--warning-500)' : 'var(--error-500)';
  return (
    <div className="health-ring" style={{ width: s, height: s }}>
      <svg width={s} height={s}>
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="var(--n-200)" strokeWidth="4" />
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 600ms ease' }} />
      </svg>
      <div className="health-ring-text" style={{ color }}>{score}</div>
    </div>
  );
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
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return formatDate(d);
}

export function daysUntil(d?: string): number {
  if (!d) return 0;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}
