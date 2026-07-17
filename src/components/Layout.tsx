import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { CommandPalette } from './CommandPalette';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const NAV = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/workspace', label: 'Workspace', icon: '📁' },
  { to: '/projects', label: 'Projects', icon: '📂' },
  { to: '/material', label: 'Material', icon: '📦' },
  { to: '/warehouse', label: 'Warehouse', icon: '🚛' },
  { to: '/finance', label: 'Finance', icon: '💰' },
  { to: '/hr', label: 'HR', icon: '👷' },
  { to: '/documents', label: 'Documents', icon: '📄' },
  { to: '/equipment', label: 'Equipment', icon: '🛠' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/suppliers', label: 'Supplier', icon: '🏭' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export function Layout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase.from('approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      setPendingApprovals(count || 0);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 240, background: 'var(--sidebar-bg)', display: 'flex',
        flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--n-800)' }}>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>COS</h2>
          <p style={{ fontSize: 11, color: 'var(--n-400)', marginTop: 2 }}>Contractor OS</p>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {NAV.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 24px', color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                background: isActive ? 'var(--sidebar-active)' : 'transparent',
                fontSize: 14, fontWeight: isActive ? 500 : 400,
                transition: 'all 180ms ease',
              })}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{l.icon}</span>
              <span>{l.label}</span>
              {l.to === '/' && pendingApprovals > 0 && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--error-500)', color: '#fff',
                  fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 999,
                }}>{pendingApprovals}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: '1px solid var(--n-800)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14, fontWeight: 600,
            }}>{profile?.full_name?.charAt(0) || '?'}</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--n-200)', fontWeight: 500 }}>{profile?.full_name}</div>
              <div style={{ fontSize: 11, color: 'var(--n-500)', textTransform: 'capitalize' }}>{profile?.role}</div>
            </div>
          </div>
          <button className="btn btn-sm btn-outline" style={{ color: 'var(--n-300)', borderColor: 'var(--n-700)', width: '100%' }}
            onClick={async () => { await signOut(); navigate('/login'); }}>
            Keluar
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </div>
  );
}
