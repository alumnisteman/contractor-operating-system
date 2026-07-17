import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '../../lib/supabase';
import { EmptyState, Badge, ProgressBar } from '../../components/ui';
import L from 'leaflet';
import type { Project } from '../../types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function GISMapPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase.from('projects').select('*').not('latitude', 'is', null);
    setProjects(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const hasCoords = projects.filter(p => p.latitude && p.longitude);

  return (
    <div className="page">
      <div className="page-header"><div><h1 className="page-title">GIS Map</h1><p className="page-subtitle">Peta lokasi semua project</p></div></div>
      {hasCoords.length === 0 ? <EmptyState message="Belum ada project dengan koordinat. Tambahkan latitude/longitude saat membuat project." /> :
        <div className="map-container">
          <MapContainer center={[hasCoords[0].latitude!, hasCoords[0].longitude!]} zoom={6} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            {hasCoords.map(p => (
              <Marker key={p.id} position={[p.latitude!, p.longitude!]}>
                <Popup>
                  <div style={{ minWidth: 200 }}>
                    <strong>{p.name}</strong><br />
                    Type: {p.project_type}<br />
                    Status: <Badge status={p.status} /><br />
                    Progress: {p.progress}%<ProgressBar value={p.progress} /><br />
                    PM: {p.pm_name || '-'}<br />
                    Lokasi: {p.location_name || '-'}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      }
    </div>
  );
}
