import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { COSLayout } from './components/COSLayout';
import { MissionControl } from './pages/MissionControl';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { MaterialPage } from './pages/modules/MaterialPage';
import { WarehousePage } from './pages/modules/WarehousePage';
import { FinancePage } from './pages/modules/FinancePage';
import { HRPage } from './pages/modules/HRPage';
import { EquipmentPage } from './pages/modules/EquipmentPage';
import { DocumentsPage } from './pages/modules/DocumentsPage';
import { ReportsPage } from './pages/modules/ReportsPage';
import { SettingsPage } from './pages/modules/SettingsPage';
import { TendersPage } from './pages/modules/TendersPage';
import { VendorsPage } from './pages/modules/VendorsPage';
import { GISMapPage } from './pages/modules/GISMapPage';
import { GalleryPage } from './pages/modules/GalleryPage';
import './styles/global.css';

function ProtectedRoutes() {
  const { session, loading, profile } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--n-500)' }}>Memuat...</div>;
  if (!session) return <LoginPage />;
  if (!profile) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Profil belum dibuat. Hubungi admin.</div>;
  return (
    <Routes>
      <Route element={<COSLayout />}>
        <Route path="/" element={<MissionControl />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectWorkspace />} />
        <Route path="/material" element={<MaterialPage />} />
        <Route path="/warehouse" element={<WarehousePage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/hr" element={<HRPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/tenders" element={<TendersPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/gis" element={<GISMapPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProtectedRoutes />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
