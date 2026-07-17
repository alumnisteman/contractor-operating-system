import { useAuth } from '../../lib/AuthContext';

export function SettingsPage() {
  const { profile } = useAuth();
  return (
    <div className="page">
      <div className="page-header"><div><h1 className="page-title">Settings</h1><p className="page-subtitle">Konfigurasi akun & sistem</p></div></div>
      <div className="card" style={{ maxWidth: 500 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Profil</h3>
        <div style={{ fontSize: 14, lineHeight: 2 }}>
          <div><strong>Nama:</strong> {profile?.full_name}</div>
          <div><strong>Email:</strong> {profile?.email}</div>
          <div><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{profile?.role}</span></div>
          <div><strong>Phone:</strong> {profile?.phone || '-'}</div>
        </div>
      </div>
    </div>
  );
}
