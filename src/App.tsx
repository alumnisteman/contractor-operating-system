import { AuthProvider, useAuth } from './lib/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { MissionControl } from './pages/MissionControl';
import { ProjectsList } from './pages/ProjectsList';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { FinancePage } from './pages/FinancePage';
import { MaterialPage, WarehousePage } from './pages/MaterialWarehouse';
import { HRPage } from './pages/HRPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkspacePage } from './pages/WorkspacePage';
import './styles/global.css';

function ProtectedRoutes() {
  const { session, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--n-500)' }}>Memuat...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<MissionControl />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/:id" element={<ProjectWorkspace />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/material" element={<MaterialPage />} />
        <Route path="/warehouse" element={<WarehousePage />} />
        <Route path="/hr" element={<HRPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
