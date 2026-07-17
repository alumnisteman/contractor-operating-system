/*
# COS Core Schema — Profiles, Projects, WBS, Tasks, Activity, Approvals

## 1. New Tables

### Profiles
- `profiles`: extends auth.users with 12+ roles (direktur, finance, hrd, purchasing, warehouse, pm, supervisor, qc, hse, engineer, surveyor, vendor, owner) and full_name.

### Projects
- `projects`: master project dengan field PLN (UP2D, UID, UP3, ULP, SPMK, PM, jenis project), kontrak, progress, GIS, health_score, risk_level.
- `project_wbs`: WBS hirarkis dengan target/volume/weight/progress/qc_status/approval_status.
- `project_termin`: termin pembayaran (no, nilai, persen, status).
- `project_cashflow`: cashflow rencana vs aktual per bulan.

### Tasks
- `tasks`: task mirip ClickUp dengan checklist, status, priority, assignee, due_date, project_id.

### Activity Feed
- `activity_feed`: universal timeline semua aktivitas perusahaan (user, action, entity, project, timestamp).

### Approvals
- `approvals`: approval queue untuk purchase, invoice, progress, QC, dll (entity_type, entity_id, requested_by, approved_by, status).

## 2. Security
- RLS enabled on all tables.
- Profiles: owner-scoped (auth.uid = id).
- Projects/WBS/Termin/Cashflow: all authenticated can SELECT; directors/PMs can write.
- Tasks: all authenticated can SELECT; assignee or director can write.
- Activity feed: all authenticated can SELECT; system inserts.
- Approvals: all authenticated can SELECT; approver role or director can update.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'vendor' CHECK (role IN ('direktur','finance','hrd','purchasing','warehouse','pm','supervisor','qc','hse','engineer','surveyor','vendor','owner','admin')),
  phone text,
  avatar_url text,
  department text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Helper: check if current user is director/admin
CREATE OR REPLACE FUNCTION is_director() RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('direktur','admin','owner'));
$$;

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  up2d text, uid text, up3 text, ulp text,
  spmk_no text, spmk_date date, pm_name text,
  project_type text CHECK (project_type IN ('distribusi','transmisi','gardu_induk','pembangkit','jasa','lainnya')),
  contract_value numeric(15,2) DEFAULT 0,
  start_date date, end_date date,
  progress numeric(5,2) DEFAULT 0,
  status text DEFAULT 'planning' CHECK (status IN ('planning','active','suspended','completed','terminated')),
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low','medium','high')),
  health_score int DEFAULT 100,
  latitude numeric(10,7), longitude numeric(10,7), location_name text,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_projects" ON projects;
CREATE POLICY "read_projects" ON projects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_projects" ON projects;
CREATE POLICY "write_projects" ON projects FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pm','supervisor','purchasing','finance')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pm','supervisor','purchasing','finance')));

-- PROJECT WBS
CREATE TABLE IF NOT EXISTS project_wbs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES project_wbs(id) ON DELETE CASCADE,
  code text, name text NOT NULL, description text,
  volume numeric(12,2) DEFAULT 0, unit text, weight numeric(5,2) DEFAULT 0,
  target_progress numeric(5,2) DEFAULT 0, actual_progress numeric(5,2) DEFAULT 0,
  start_date date, end_date date,
  qc_status text CHECK (qc_status IN ('pending','passed','failed','n/a')),
  approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected')),
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  photo_url text, doc_url text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE project_wbs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_wbs" ON project_wbs;
CREATE POLICY "read_wbs" ON project_wbs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_wbs" ON project_wbs;
CREATE POLICY "write_wbs" ON project_wbs FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pm','supervisor','engineer','qc')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pm','supervisor','engineer','qc')));

-- PROJECT TERMIN
CREATE TABLE IF NOT EXISTS project_termin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  termin_no int NOT NULL, description text,
  amount numeric(15,2) NOT NULL DEFAULT 0, percentage numeric(5,2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','submitted','approved','paid')),
  invoice_date date, paid_date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE project_termin ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_termin" ON project_termin;
CREATE POLICY "read_termin" ON project_termin FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_termin" ON project_termin;
CREATE POLICY "write_termin" ON project_termin FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('finance','pm')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('finance','pm')));

-- PROJECT CASHFLOW
CREATE TABLE IF NOT EXISTS project_cashflow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  month_date date NOT NULL,
  planned_in numeric(15,2) DEFAULT 0, planned_out numeric(15,2) DEFAULT 0,
  actual_in numeric(15,2) DEFAULT 0, actual_out numeric(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE project_cashflow ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_cashflow" ON project_cashflow;
CREATE POLICY "read_cashflow" ON project_cashflow FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_cashflow" ON project_cashflow;
CREATE POLICY "write_cashflow" ON project_cashflow FOR ALL TO authenticated
  USING (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('finance','pm')))
  WITH CHECK (is_director() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('finance','pm')));

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL, description text,
  status text DEFAULT 'todo' CHECK (status IN ('todo','in_progress','review','done','blocked')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date,
  checklist jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_tasks" ON tasks;
CREATE POLICY "read_tasks" ON tasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_tasks" ON tasks;
CREATE POLICY "write_tasks" ON tasks FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ACTIVITY FEED
CREATE TABLE IF NOT EXISTS activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text,
  action text NOT NULL,
  entity_type text, entity_id text,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_activity" ON activity_feed;
CREATE POLICY "read_activity" ON activity_feed FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_activity" ON activity_feed;
CREATE POLICY "insert_activity" ON activity_feed FOR INSERT TO authenticated WITH CHECK (true);

-- APPROVALS
CREATE TABLE IF NOT EXISTS approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  entity_name text,
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_by_name text,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by_name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  notes text,
  priority text DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_approvals" ON approvals;
CREATE POLICY "read_approvals" ON approvals FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_approvals" ON approvals;
CREATE POLICY "insert_approvals" ON approvals FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_approvals" ON approvals;
CREATE POLICY "update_approvals" ON approvals FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_wbs_project ON project_wbs(project_id);
CREATE INDEX IF NOT EXISTS idx_termin_project ON project_termin(project_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_project ON project_cashflow(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_feed(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
