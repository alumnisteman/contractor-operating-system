import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import type { NotificationItem } from '../types';
import { timeAgo } from './ui';

const NAV = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/projects', label: 'Projects', icon: '📂' },
  { to: '/material', label: 'Material', icon: '📦' },
  { to: '/warehouse', label: 'Warehouse', icon: '🚛' },
  { to: '/finance', label: 'Finance', icon: '💰' },
  { to: '/hr', label: 'HR', icon: '👷' },
  { to: '/documents', label: 'Documents', icon: '📄' },
  { to: '/equipment', label: 'Equipment', icon: '🛠' },
  { to: '/tenders', label: 'Tenders', icon: '📋' },
  { to: '/vendors', label: 'Vendors', icon: '🏢' },
  { to: '/gis', label: 'GIS Map', icon: '🗺' },
  { to: '/gallery', label: 'Gallery', icon: '📷' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

const CMD_ITEMS = [
  { label: 'Project', cat: 'Navigasi', to: '/projects' },
  { label: 'Material', cat: 'Navigasi', to: '/material' },
  { label: 'Warehouse', cat: 'Navigasi', to: '/warehouse' },
  { label: 'Finance', cat: 'Navigasi', to: '/finance' },
  { label: 'HR / SDM', cat: 'Navigasi', to: '/hr' },
  { label: 'Equipment', cat: 'Navigasi', to: '/equipment' },
  { label: 'Documents', cat: 'Navigasi', to: '/documents' },
  { label: 'Tenders', cat: 'Navigasi', to: '/tenders' },
  { label: 'Vendors', cat: 'Navigasi', to: '/vendors' },
  { label: 'GIS Map', cat: 'Navigasi', to: '/gis' },
  { label: 'Gallery', cat: 'Navigasi', to: '/gallery' },
  { label: 'Reports', cat: 'Navigasi', to: '/reports' },
  { label: 'Settings', cat: 'Navigasi', to: '/settings' },
];

export function COSLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);

  const loadNotifs = useCallback(async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    setNotifs(data || []);
  }, []);

  useEffect(() => { loadNotifs(); }, [loadNotifs]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(v => !v); }
      if (e.key === 'Escape') { setCmdOpen(false); setNotifOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const unreadCount = notifs.filter(n => !n.is_read).length;
  const dotClass = (p: string) => `notif-dot notif-dot-${p}`;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: 'var(--n-900)', color: 'var(--n-300)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--n-800)' }}>
          <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>COS</h2>
          <p style={{ fontSize: 11, color: 'var(--n-400)' }}>Contractor OS</p>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {NAV.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 24px',
                color: isActive ? '#fff' : 'var(--n-400)',
                background: isActive ? 'var(--primary-600)' : 'transparent',
                fontSize: 14, fontWeight: isActive ? 500 : 400,
                transition: 'all 180ms ease',
              })}>
              <span style={{ fontSize: 16 }}>{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: '1px solid var(--n-800)' }}>
          <div style={{ fontSize: 13, color: 'var(--n-400)', marginBottom: 4 }}>{profile?.full_name}</div>
          <div style={{ fontSize: 11, color: 'var(--n-500)', marginBottom: 8, textTransform: 'capitalize' }}>{profile?.role}</div>
          <button className="btn btn-sm btn-outline" style={{ color: 'var(--n-300)', borderColor: 'var(--n-700)' }}
            onClick={async () => { await signOut(); navigate('/'); }}>Keluar</button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 56, borderBottom: '1px solid var(--border)', background: 'var(--n-0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <button onClick={() => setCmdOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--n-100)', borderRadius: 8, color: 'var(--n-500)', fontSize: 14, width: 320 }}>
            <span>🔍</span> Cari atau lompat ke... <kbd style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 6px', background: 'var(--n-200)', borderRadius: 4 }}>Ctrl+K</kbd>
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setNotifOpen(v => !v)} style={{ position: 'relative', padding: 8, borderRadius: 8, fontSize: 20 }}>
              🔔
              {unreadCount > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'var(--error-500)', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{unreadCount}</span>}
            </button>
            {notifOpen && (
              <div style={{ position: 'absolute', right: 0, top: 48, width: 360, background: 'var(--n-0)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-md)', maxHeight: 480, overflowY: 'auto', zIndex: 100 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14 }}>Notifikasi</div>
                {notifs.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Tidak ada notifikasi</div> :
                  notifs.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                      <span className={dotClass(n.priority)} style={{ marginTop: 5 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
                        {n.message && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.message}</div>}
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </div>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const filtered = CMD_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-palette" onClick={(e) => e.stopPropagation()}>
        <input className="cmd-input" autoFocus placeholder="Cari project, material, vendor, invoice..." value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
            if (e.key === 'Enter' && filtered[active]) { navigate(filtered[active].to); onClose(); }
          }} />
        <div className="cmd-list">
          {filtered.map((item, i) => (
            <div key={item.to} className={`cmd-item ${i === active ? 'active' : ''}`}
              onClick={() => { navigate(item.to); onClose(); }}>
              <span>🔍</span> {item.label} <span className="cmd-cat">{item.cat}</span>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Tidak ditemukan</div>}
        </div>
      </div>
    </div>
  );
}
