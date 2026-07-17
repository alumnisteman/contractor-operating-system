import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import type { UserRole } from '../types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'direktur', label: 'Direktur' }, { value: 'finance', label: 'Finance' },
  { value: 'hrd', label: 'HRD' }, { value: 'purchasing', label: 'Purchasing' },
  { value: 'warehouse', label: 'Warehouse' }, { value: 'pm', label: 'Project Manager' },
  { value: 'supervisor', label: 'Supervisor' }, { value: 'qc', label: 'QC' },
  { value: 'hse', label: 'HSE' }, { value: 'engineer', label: 'Engineer' },
  { value: 'surveyor', label: 'Surveyor' }, { value: 'vendor', label: 'Vendor' },
];

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('pm');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error); else navigate('/');
    } else {
      const { error } = await signUp(email, password, fullName, role);
      if (error) setError(error); else { setMode('login'); setEmail(''); setPassword(''); }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', padding: 16 }}>
      <div className="card" style={{ maxWidth: 460, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, color: 'var(--primary-700)', fontWeight: 700 }}>COS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Contractor Operating System</p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setMode('login')}>Masuk</button>
          <button className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setMode('register')}>Daftar</button>
        </div>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group"><label>Nama Lengkap</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
              <div className="form-group"><label>Peran</label><select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
            </>
          )}
          <div className="form-group"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          {error && <div style={{ color: 'var(--error-600)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}</button>
        </form>
      </div>
    </div>
  );
}
