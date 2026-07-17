/*
# COS Business Hub — Material, Warehouse, Purchase, Finance, Equipment, HR, QC, HSE, Documents, Gallery

## 1. New Tables

### Material & Warehouse
- `materials`: katalog material.
- `warehouses`: gudang dengan GIS.
- `inventory`: stok per gudang per material.
- `material_movements`: pergerakan stok.

### Purchasing (Kanban)
- `purchases`: purchase request dengan kanban status (draft→requested→approved→ordered→delivered→completed).

### Finance
- `invoices`: invoice dengan status (draft→submitted→approved→paid).

### Equipment
- `equipment`: alat berat dengan status, QR code.

### People (HR)
- `personnel`: SDM dengan role, sertifikasi, attendance.
- `attendance`: absensi harian.

### QC
- `qc_checklists`, `qc_checklist_items`, `qc_inspections`.

### HSE
- `hse_toolbox`, `hse_permits`, `hse_near_miss`, `hse_incidents`.

### Documents & Drawings
- `drawings`: drawing dengan revision, type, status.
- `documents`: dokumen proyek (kontrak, SPMK, addendum, BAST, NCR, RFI, ITP).

### Gallery
- `photos`: foto dengan GPS, watermark, grouping otomatis.

### Meetings
- `meetings`: meeting dengan agenda, minutes, action items.

## 2. Security
- RLS enabled. All authenticated can SELECT. Directors/role-specific can write.
*/

-- MATERIALS
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text, name text NOT NULL, category text, unit text NOT NULL,
  specification text, qr_code text, created_at timestamptz DEFAULT now()
);
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_materials" ON materials;
CREATE POLICY "read_materials" ON materials FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_materials" ON materials;
CREATE POLICY "write_materials" ON materials FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('purchasing','warehouse')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('purchasing','warehouse')));

-- WAREHOUSES
CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  name text NOT NULL, location text,
  latitude numeric(10,7), longitude numeric(10,7),
  qr_code text, created_at timestamptz DEFAULT now()
);
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_warehouses" ON warehouses;
CREATE POLICY "read_warehouses" ON warehouses FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_warehouses" ON warehouses;
CREATE POLICY "write_warehouses" ON warehouses FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('warehouse','purchasing')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('warehouse','purchasing')));

-- INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity numeric(12,2) NOT NULL DEFAULT 0,
  min_stock numeric(12,2) DEFAULT 0,
  unit_price numeric(15,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_inventory" ON inventory;
CREATE POLICY "read_inventory" ON inventory FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_inventory" ON inventory;
CREATE POLICY "write_inventory" ON inventory FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('warehouse','purchasing')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('warehouse','purchasing')));

-- MATERIAL MOVEMENTS
CREATE TABLE IF NOT EXISTS material_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('purchase','delivery','installed','transfer_in','transfer_out','adjustment')),
  quantity numeric(12,2) NOT NULL, unit text, unit_price numeric(15,2) DEFAULT 0,
  reference_no text, movement_date timestamptz DEFAULT now(), notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE material_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_movements" ON material_movements;
CREATE POLICY "read_movements" ON material_movements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_movements" ON material_movements;
CREATE POLICY "write_movements" ON material_movements FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('warehouse','purchasing','pm')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('warehouse','purchasing','pm')));

-- SUPPLIERS (must exist before purchases FK)
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, category text,
  contact_person text, phone text, email text, address text,
  rating numeric(3,2) DEFAULT 0,
  lead_time_days int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_suppliers" ON suppliers;
CREATE POLICY "read_suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_suppliers" ON suppliers;
CREATE POLICY "write_suppliers" ON suppliers FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('purchasing')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('purchasing')));

-- PURCHASES (Kanban)
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_number text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  title text NOT NULL, description text,
  total_amount numeric(15,2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft','requested','approved','ordered','delivered','completed','rejected')),
  requested_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_by_name text,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by_name text,
  qr_code text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_purchases" ON purchases;
CREATE POLICY "read_purchases" ON purchases FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_purchases" ON purchases;
CREATE POLICY "write_purchases" ON purchases FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- PURCHASE ITEMS
CREATE TABLE IF NOT EXISTS purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  material_id uuid REFERENCES materials(id) ON DELETE SET NULL,
  name text NOT NULL, quantity numeric(12,2) NOT NULL DEFAULT 1,
  unit text, unit_price numeric(15,2) DEFAULT 0, total_price numeric(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_purchase_items" ON purchase_items;
CREATE POLICY "read_purchase_items" ON purchase_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_purchase_items" ON purchase_items;
CREATE POLICY "write_purchase_items" ON purchase_items FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  termin_id uuid REFERENCES project_termin(id) ON DELETE SET NULL,
  type text CHECK (type IN ('sales','purchase')),
  amount numeric(15,2) NOT NULL DEFAULT 0,
  tax_amount numeric(15,2) DEFAULT 0,
  total_amount numeric(15,2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','paid','overdue','cancelled')),
  issue_date date, due_date date, paid_date date,
  qr_code text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_invoices" ON invoices;
CREATE POLICY "read_invoices" ON invoices FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_invoices" ON invoices;
CREATE POLICY "write_invoices" ON invoices FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('finance','pm')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('finance','pm')));

-- EQUIPMENT
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('excavator','crane','sky_lift','truck','generator','welding','compressor','manlift','other')),
  model text, serial_number text, capacity text,
  status text DEFAULT 'available' CHECK (status IN ('available','in_use','maintenance','breakdown')),
  rental_rate numeric(15,2) DEFAULT 0, operator text,
  qr_code text, created_at timestamptz DEFAULT now()
);
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_equipment" ON equipment;
CREATE POLICY "read_equipment" ON equipment FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_equipment" ON equipment;
CREATE POLICY "write_equipment" ON equipment FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pm','warehouse','supervisor')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pm','warehouse','supervisor')));

-- PERSONNEL
CREATE TABLE IF NOT EXISTS personnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('pm','site_manager','engineer','qc','hse','lineman','operator','helper','surveyor','other')),
  phone text, certification text, license_no text, license_expiry date,
  status text DEFAULT 'assigned' CHECK (status IN ('assigned','available','on_leave','resigned')),
  daily_rate numeric(12,2) DEFAULT 0,
  qr_code text, created_at timestamptz DEFAULT now()
);
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_personnel" ON personnel;
CREATE POLICY "read_personnel" ON personnel FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_personnel" ON personnel;
CREATE POLICY "write_personnel" ON personnel FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hrd','pm')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hrd','pm')));

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id uuid NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  date date NOT NULL,
  check_in timestamptz, check_out timestamptz,
  status text DEFAULT 'present' CHECK (status IN ('present','absent','late','leave','sick')),
  latitude numeric(10,7), longitude numeric(10,7),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_attendance" ON attendance;
CREATE POLICY "read_attendance" ON attendance FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_attendance" ON attendance;
CREATE POLICY "write_attendance" ON attendance FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- QC CHECKLISTS
CREATE TABLE IF NOT EXISTS qc_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, work_type text, description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE qc_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_qc_checklists" ON qc_checklists;
CREATE POLICY "read_qc_checklists" ON qc_checklists FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_qc_checklists" ON qc_checklists;
CREATE POLICY "write_qc_checklists" ON qc_checklists FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('qc','pm')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('qc','pm')));

CREATE TABLE IF NOT EXISTS qc_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES qc_checklists(id) ON DELETE CASCADE,
  item_name text NOT NULL, standard text, method text, pass_criteria text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE qc_checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_qc_items" ON qc_checklist_items;
CREATE POLICY "read_qc_items" ON qc_checklist_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_qc_items" ON qc_checklist_items;
CREATE POLICY "write_qc_items" ON qc_checklist_items FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('qc','pm')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('qc','pm')));

CREATE TABLE IF NOT EXISTS qc_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  wbs_id uuid REFERENCES project_wbs(id) ON DELETE SET NULL,
  checklist_id uuid NOT NULL REFERENCES qc_checklists(id) ON DELETE CASCADE,
  inspected_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  inspection_date timestamptz DEFAULT now(),
  result text CHECK (result IN ('passed','failed','conditional','pending')),
  notes text, photo_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE qc_inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_qc_inspections" ON qc_inspections;
CREATE POLICY "read_qc_inspections" ON qc_inspections FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_qc_inspections" ON qc_inspections;
CREATE POLICY "write_qc_inspections" ON qc_inspections FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('qc','pm','supervisor')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('qc','pm','supervisor')));

-- HSE
CREATE TABLE IF NOT EXISTS hse_toolbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  meeting_date timestamptz NOT NULL, topic text NOT NULL,
  presenter text, attendees_count int DEFAULT 0, notes text, photo_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hse_toolbox ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_toolbox" ON hse_toolbox;
CREATE POLICY "read_toolbox" ON hse_toolbox FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_toolbox" ON hse_toolbox;
CREATE POLICY "write_toolbox" ON hse_toolbox FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hse','pm','supervisor')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hse','pm','supervisor')));

CREATE TABLE IF NOT EXISTS hse_permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  permit_type text NOT NULL CHECK (permit_type IN ('hot_work','confined_space','height','excavation','electrical','lifting')),
  permit_no text, issued_date timestamptz, valid_until timestamptz,
  location text, description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired','closed')),
  approved_by text, created_at timestamptz DEFAULT now()
);
ALTER TABLE hse_permits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_permits" ON hse_permits;
CREATE POLICY "read_permits" ON hse_permits FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_permits" ON hse_permits;
CREATE POLICY "write_permits" ON hse_permits FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hse','pm','supervisor')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hse','pm','supervisor')));

CREATE TABLE IF NOT EXISTS hse_near_miss (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  report_date timestamptz DEFAULT now(),
  location text, description text NOT NULL,
  reported_by text, action_taken text,
  status text DEFAULT 'open' CHECK (status IN ('open','investigating','closed')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hse_near_miss ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_near_miss" ON hse_near_miss;
CREATE POLICY "read_near_miss" ON hse_near_miss FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_near_miss" ON hse_near_miss;
CREATE POLICY "write_near_miss" ON hse_near_miss FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hse','pm','supervisor')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hse','pm','supervisor')));

CREATE TABLE IF NOT EXISTS hse_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  incident_date timestamptz NOT NULL,
  type text CHECK (type IN ('minor','major','fatal','property','environmental')),
  location text, description text NOT NULL,
  casualties text, root_cause text, corrective_action text,
  reported_by text,
  status text DEFAULT 'open' CHECK (status IN ('open','investigating','closed')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hse_incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_incidents" ON hse_incidents;
CREATE POLICY "read_incidents" ON hse_incidents FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_incidents" ON hse_incidents;
CREATE POLICY "write_incidents" ON hse_incidents FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hse','pm','supervisor')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hse','pm','supervisor')));

-- DRAWINGS
CREATE TABLE IF NOT EXISTS drawings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  drawing_no text, title text NOT NULL,
  drawing_type text CHECK (drawing_type IN ('ifc','shop_drawing','as_built','sld','layout','single_line','other')),
  revision text DEFAULT 'A', file_url text,
  uploaded_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft','reviewed','approved','rejected')),
  qr_code text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_drawings" ON drawings;
CREATE POLICY "read_drawings" ON drawings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_drawings" ON drawings;
CREATE POLICY "write_drawings" ON drawings FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('engineer','pm','supervisor')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('engineer','pm','supervisor')));

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_type text NOT NULL CHECK (doc_type IN ('kontrak','spmk','addendum','bast','ncr','rfi','itp','lainnya')),
  title text NOT NULL, doc_no text, doc_date date, file_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected')),
  notes text, qr_code text, created_at timestamptz DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_documents" ON documents;
CREATE POLICY "read_documents" ON documents FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_documents" ON documents;
CREATE POLICY "write_documents" ON documents FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pm','supervisor','engineer','qc')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pm','supervisor','engineer','qc')));

-- PHOTOS (Gallery)
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  wbs_id uuid REFERENCES project_wbs(id) ON DELETE SET NULL,
  photo_url text NOT NULL, caption text,
  latitude numeric(10,7), longitude numeric(10,7),
  taken_at timestamptz DEFAULT now(),
  watermark text,
  uploaded_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_by_name text,
  category text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_photos" ON photos;
CREATE POLICY "read_photos" ON photos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_photos" ON photos;
CREATE POLICY "write_photos" ON photos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- MEETINGS
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  title text NOT NULL, agenda text,
  meeting_date timestamptz NOT NULL, duration_min int DEFAULT 60,
  participants text[], minutes text,
  action_items jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_meetings" ON meetings;
CREATE POLICY "read_meetings" ON meetings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_meetings" ON meetings;
CREATE POLICY "write_meetings" ON meetings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- DAILY PROGRESS
CREATE TABLE IF NOT EXISTS daily_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  report_date date NOT NULL,
  weather text, temperature text,
  work_summary text, total_workers int DEFAULT 0, issues text,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_daily" ON daily_progress;
CREATE POLICY "read_daily" ON daily_progress FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_daily" ON daily_progress;
CREATE POLICY "write_daily" ON daily_progress FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- SUPPLIER PRICE HISTORY
CREATE TABLE IF NOT EXISTS supplier_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  price numeric(15,2) NOT NULL, quoted_date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE supplier_price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_price_history" ON supplier_price_history;
CREATE POLICY "read_price_history" ON supplier_price_history FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_price_history" ON supplier_price_history;
CREATE POLICY "write_price_history" ON supplier_price_history FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('purchasing')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('purchasing')));

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_purchases_project ON purchases(project_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_equipment_project ON equipment(project_id);
CREATE INDEX IF NOT EXISTS idx_personnel_project ON personnel(project_id);
CREATE INDEX IF NOT EXISTS idx_qc_insp_project ON qc_inspections(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_project ON photos(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_taken ON photos(taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_drawings_project ON drawings(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_project ON daily_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_meetings_project ON meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_price_history_supplier ON supplier_price_history(supplier_id);
CREATE INDEX IF NOT EXISTS idx_price_history_material ON supplier_price_history(material_id);
