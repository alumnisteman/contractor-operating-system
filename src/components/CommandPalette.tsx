import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SearchResult {
  id: string;
  name: string;
  type: string;
  route: string;
  icon: string;
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([
        { id: '1', name: 'Home', type: 'Halaman', route: '/', icon: '🏠' },
        { id: '2', name: 'Projects', type: 'Halaman', route: '/projects', icon: '📂' },
        { id: '3', name: 'Material', type: 'Halaman', route: '/material', icon: '📦' },
        { id: '4', name: 'Warehouse', type: 'Halaman', route: '/warehouse', icon: '🚛' },
        { id: '5', name: 'Finance', type: 'Halaman', route: '/finance', icon: '💰' },
        { id: '6', name: 'HR', type: 'Halaman', route: '/hr', icon: '👷' },
        { id: '7', name: 'Equipment', type: 'Halaman', route: '/equipment', icon: '🛠' },
        { id: '8', name: 'Reports', type: 'Halaman', route: '/reports', icon: '📈' },
        { id: '9', name: 'Suppliers', type: 'Halaman', route: '/suppliers', icon: '🏭' },
      ]);
      return;
    }

    (async () => {
      const items: SearchResult[] = [];
      const q = `%${query}%`;
      const [p, m, pr, inv, eq, per, dr, sup] = await Promise.all([
        supabase.from('projects').select('id,name').ilike('name', q).limit(5),
        supabase.from('materials').select('id,name').ilike('name', q).limit(5),
        supabase.from('purchases').select('id,pr_number,title').or(`pr_number.ilike.${query},title.ilike.${query}`).limit(5),
        supabase.from('invoices').select('id,invoice_number').ilike('invoice_number', q).limit(5),
        supabase.from('equipment').select('id,name').ilike('name', q).limit(5),
        supabase.from('personnel').select('id,name').ilike('name', q).limit(5),
        supabase.from('drawings').select('id,title').ilike('title', q).limit(5),
        supabase.from('suppliers').select('id,name').ilike('name', q).limit(5),
      ]);
      (p.data || []).forEach((i: any) => items.push({ id: i.id, name: i.name, type: 'Project', route: `/projects/${i.id}`, icon: '📂' }));
      (m.data || []).forEach((i: any) => items.push({ id: i.id, name: i.name, type: 'Material', route: '/material', icon: '📦' }));
      (pr.data || []).forEach((i: any) => items.push({ id: i.id, name: `${i.pr_number} - ${i.title}`, type: 'Purchase', route: '/finance', icon: '🛒' }));
      (inv.data || []).forEach((i: any) => items.push({ id: i.id, name: i.invoice_number, type: 'Invoice', route: '/finance', icon: '💰' }));
      (eq.data || []).forEach((i: any) => items.push({ id: i.id, name: i.name, type: 'Equipment', route: '/equipment', icon: '🛠' }));
      (per.data || []).forEach((i: any) => items.push({ id: i.id, name: i.name, type: 'Worker', route: '/hr', icon: '👷' }));
      (dr.data || []).forEach((i: any) => items.push({ id: i.id, name: i.title, type: 'Drawing', route: '/documents', icon: '📐' }));
      (sup.data || []).forEach((i: any) => items.push({ id: i.id, name: i.name, type: 'Supplier', route: '/suppliers', icon: '🏭' }));
      setResults(items);
      setSelected(0);
    })();
  }, [query]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { if (results[selected]) { navigate(results[selected].route); onClose(); } }
  };

  return (
    <div className="cmdk-overlay" onClick={onClose}>
      <div className="cmdk-box" onClick={(e) => e.stopPropagation()}>
        <input ref={inputRef} className="cmdk-input" placeholder="Cari project, material, vendor, invoice, worker, drawing..."
          value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKey} />
        <div className="cmdk-results">
          {results.length === 0 && <div className="empty">Tidak ada hasil</div>}
          {results.map((r, i) => (
            <div key={`${r.type}-${r.id}`} className={`cmdk-item ${i === selected ? 'cmdk-item-selected' : ''}`}
              onClick={() => { navigate(r.route); onClose(); }}
              onMouseEnter={() => setSelected(i)}>
              <div className="cmdk-item-icon">{r.icon}</div>
              <div>
                <div className="cmdk-item-label">{r.name}</div>
                <div className="cmdk-item-type">{r.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
