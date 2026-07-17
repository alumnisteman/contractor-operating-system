import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Project } from '../types';
import { ProgressBar, formatCurrency, formatDate, daysUntil } from './ui';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function ProjectMap({ projects }: { projects: Project[] }) {
  const withCoords = projects.filter((p) => p.latitude && p.longitude);
  const center = withCoords[0] ? [withCoords[0].latitude!, withCoords[0].longitude!] as [number, number] : [-2.5, 118] as [number, number];

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        {withCoords.map((p) => (
          <Marker key={p.id} position={[p.latitude!, p.longitude!]}>
            <Popup>
              <div style={{ minWidth: 200 }}>
                <strong>{p.name}</strong><br />
                <div style={{ marginTop: 8 }}>
                  Progress: {p.progress}%
                  <ProgressBar value={p.progress} />
                </div>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  PM: {p.pm_name || '-'}<br />
                  Kontrak: {formatCurrency(p.contract_value || 0)}<br />
                  Deadline: {formatDate(p.end_date)} ({daysUntil(p.end_date)} hari)<br />
                  Health: {p.health_score}/100
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
