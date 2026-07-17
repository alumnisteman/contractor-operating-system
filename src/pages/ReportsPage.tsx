import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { StatCard, formatCurrency } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function ReportsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [p, i, pr, e] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('purchases').select('*'),
        supabase.from('equipment').select('*'),
      ]);
      setProjects(p.data || []); setInvoices(i.data || []); setPurchases(pr.data || []); setEquipment(e.data || []);
    })();
  }, []);

  const statusData = ['planning', 'active', 'suspended', 'completed'].map((s) => ({
    name: s, value: projects.filter((p) => p.status === s).length,
  })).filter((d) => d.value > 0);

  const eqStatusData = ['available', 'in_use', 'maintenance', 'breakdown'].map((s) => ({
    name: s.replace(/_/g, ' '), value: equipment.filter((e) => e.status === s).length,
  })).filter((d) => d.value > 0);

  const progressData = projects.slice(0, 10).map((p) => ({ name: p.name.substring(0, 15), progress: p.progress }));

  const invoiceByStatus = ['draft', 'submitted', 'approved', 'paid', 'overdue'].map((s) => ({
    name: s, value: invoices.filter((i) => i.status === s).reduce((sum, i) => sum + i.total_amount, 0),
  })).filter((d) => d.value > 0);

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">Reports & Analytics</h1></div>
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total Project" value={projects.length} />
        <StatCard label="Total Invoice" value={formatCurrency(invoices.reduce((s, i) => s + i.total_amount, 0))} />
        <StatCard label="Total Purchase" value={formatCurrency(purchases.reduce((s, p) => s + p.total_amount, 0))} />
        <StatCard label="Avg Health Score" value={projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.health_score, 0) / projects.length) : 0} />
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Progress per Project</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}><XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} /><YAxis /><Tooltip /><Bar dataKey="progress" fill="#2563eb" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Project Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Legend /><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Invoice by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={invoiceByStatus}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tickFormatter={(v) => `${(v/1e9).toFixed(1)}M`} /><Tooltip formatter={(v: number) => formatCurrency(v)} /><Bar dataKey="value" fill="#10b981" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Equipment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={eqStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{eqStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Legend /><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
