import { EmptyState } from '../../components/ui';

export function ReportsPage() {
  return (
    <div className="page">
      <div className="page-header"><div><h1 className="page-title">Reports</h1><p className="page-subtitle">Report builder & analytics</p></div></div>
      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Executive Analytics</h3>
        <EmptyState message="Report builder akan menampilkan data agregat dari semua project: progress, cashflow, profit, safety, QC, stock, equipment utilization, dan more. Filter by project, date range, dan export to Excel/PDF." />
      </div>
    </div>
  );
}
