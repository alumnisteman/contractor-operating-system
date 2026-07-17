import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { EmptyState } from '../../components/ui';

export function MaterialTab({ projectId }: { projectId: string }) {
  const [movements, setMovements] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  const load = useCallback(async () => {
    const { data: m } = await supabase.from('material_movements').select('*, materials(*)').eq('project_id', projectId).order('movement_date', { ascending: false });
    setMovements(m || []);
    const { data: mat } = await supabase.from('materials').select('*').limit(50);
    setMaterials(mat || []);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h3 style={{ fontSize: 16, marginBottom: 16 }}>Material Monitoring</h3>
      <div className="grid grid-2">
        <div className="card">
          <h4 style={{ fontSize: 14, marginBottom: 12 }}>Pergerakan Material</h4>
          {movements.length === 0 ? <EmptyState message="Belum ada pergerakan material" /> :
            <table className="table"><thead><tr><th>Material</th><th>Tipe</th><th>Qty</th><th>Tanggal</th></tr></thead>
              <tbody>{movements.map(m => <tr key={m.id}><td>{m.materials?.name || '-'}</td><td>{m.movement_type}</td><td>{m.quantity}</td><td>{new Date(m.movement_date).toLocaleDateString('id-ID')}</td></tr>)}</tbody>
            </table>
          }
        </div>
        <div className="card">
          <h4 style={{ fontSize: 14, marginBottom: 12 }}>Katalog Material</h4>
          {materials.length === 0 ? <EmptyState message="Belum ada material" /> :
            <table className="table"><thead><tr><th>Nama</th><th>Kategori</th><th>Satuan</th></tr></thead>
              <tbody>{materials.map(m => <tr key={m.id}><td>{m.name}</td><td>{m.category || '-'}</td><td>{m.unit}</td></tr>)}</tbody>
            </table>
          }
        </div>
      </div>
    </div>
  );
}
