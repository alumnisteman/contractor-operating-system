import { useAuth } from '../lib/AuthContext';

export function SettingsPage() {
  const { profile } = useAuth();
  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">Settings</h1></div>
      <div className="card" style={{ maxWidth: 500 }}>
        <h3 style={{ marginBottom: 16 }}>Profil Pengguna</h3>
        <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
          <div><label>Nama</label><div>{profile?.full_name}</div></div>
          <div><label>Email</label><div>{profile?.email}</div></div>
          <div><label>Peran</label><div style={{ textTransform: 'capitalize' }}>{profile?.role}</div></div>
          <div><label>Departemen</label><div>{profile?.department || '-'}</div></div>
          <div><label>Telepon</label><div>{profile?.phone || '-'}</div></div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 500, marginTop: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Tentang COS</h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Contractor Operating System v1.0 - Platform operasi terpadu untuk kontraktor PLN. Dibangun dengan React, Supabase, dan Leaflet.</p>
      </div>
    </div>
  );
}
