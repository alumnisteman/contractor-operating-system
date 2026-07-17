/*
# COS Core Tables — Tasks, Activity, Approvals, Meetings, Invoices, Purchase, Notifications, Suppliers

## 1. New Tables

### Operations Hub
- `activity_feed`: universal timeline of all company activity.
- `approvals`: approval queue.
- `notifications`: smart notifications.
- `tasks`: universal tasks with checklist, kanban status.

### Project Hub
- `meetings`: agenda, participants, minutes, attachments.
- `meeting_action_items`: action items from meetings.

### Business Hub
- `suppliers`: supplier directory with rating, lead time.
- `invoices`: invoice management.
- `purchase_requests`: purchase lifecycle (draft→requested→approved→ordered→delivered→completed).
- `purchase_items`: items in a purchase request.

## 2. Security
- RLS enabled. Authenticated users can read activity, notifications, approvals, tasks, meetings.
- Invoices/suppliers writable by director/admin/finance/purchasing.
- Purchase requests readable by all, writable by all authenticated.
*/

-- SUPPLIERS (first, no FK deps)
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  contact_person text,
  phone text,
  email text,
  address text,
  rating numeric(3,2) DEFAULT 0,
  lead_time_days int DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_suppliers" ON suppliers;
CREATE POLICY "read_suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_suppliers" ON suppliers;
CREATE POLICY "write_suppliers" ON suppliers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('director','admin','purchasing','finance')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('director','admin','purchasing','finance')));

-- ACTIVITY FEED
CREATE TABLE IF NOT EXISTS activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_scope text DEFAULT 'all',
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type text NOT NULL,
  message text NOT NULL,
  ref_type text,
  ref_id uuid,
  metadata jsonb,
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
  approval_type text NOT NULL,
  ref_id uuid,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  approver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_approvals" ON approvals;
CREATE POLICY "read_approvals" ON approvals FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_approvals" ON approvals;
CREATE POLICY "insert_approvals" ON approvals FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_approvals" ON approvals;
CREATE POLICY "update_approvals" ON approvals FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  priority text DEFAULT 'info' CHECK (priority IN ('info','warning','critical','success')),
  notification_type text NOT NULL,
  title text NOT NULL,
  message text,
  ref_type text,
  ref_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_notifications" ON notifications;
CREATE POLICY "read_notifications" ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);
DROP POLICY IF EXISTS "insert_notifications" ON notifications;
CREATE POLICY "insert_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_notifications" ON notifications;
CREATE POLICY "update_notifications" ON notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_name text,
  status text DEFAULT 'todo' CHECK (status IN ('todo','in_progress','review','done','blocked')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  due_date date,
  checklist jsonb DEFAULT '[]'::jsonb,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_tasks" ON tasks;
CREATE POLICY "read_tasks" ON tasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_tasks" ON tasks;
CREATE POLICY "insert_tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_tasks" ON tasks;
CREATE POLICY "update_tasks" ON tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_tasks" ON tasks;
CREATE POLICY "delete_tasks" ON tasks FOR DELETE TO authenticated USING (true);

-- MEETINGS
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  agenda text,
  participants text,
  minutes text,
  attachments text,
  meeting_date timestamptz DEFAULT now(),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_meetings" ON meetings;
CREATE POLICY "read_meetings" ON meetings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_meetings" ON meetings;
CREATE POLICY "insert_meetings" ON meetings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_meetings" ON meetings;
CREATE POLICY "update_meetings" ON meetings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_meetings" ON meetings;
CREATE POLICY "delete_meetings" ON meetings FOR DELETE TO authenticated USING (true);

-- MEETING ACTION ITEMS
CREATE TABLE IF NOT EXISTS meeting_action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  action text NOT NULL,
  assignee text,
  due_date date,
  status text DEFAULT 'open' CHECK (status IN ('open','done')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE meeting_action_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_action_items" ON meeting_action_items;
CREATE POLICY "read_action_items" ON meeting_action_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_action_items" ON meeting_action_items;
CREATE POLICY "write_action_items" ON meeting_action_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  invoice_no text NOT NULL,
  vendor_id uuid REFERENCES vendor_profiles(id) ON DELETE SET NULL,
  termin_id uuid REFERENCES project_termin(id) ON DELETE SET NULL,
  amount numeric(15,2) NOT NULL DEFAULT 0,
  tax numeric(15,2) DEFAULT 0,
  total numeric(15,2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','paid','rejected')),
  invoice_date date,
  due_date date,
  paid_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_invoices" ON invoices;
CREATE POLICY "read_invoices" ON invoices FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_invoices" ON invoices;
CREATE POLICY "write_invoices" ON invoices FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('director','admin','finance')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('director','admin','finance')));

-- PURCHASE REQUESTS
CREATE TABLE IF NOT EXISTS purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_number text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  requestor_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft','requested','approved','ordered','delivered','completed','rejected')),
  total_amount numeric(15,2) DEFAULT 0,
  notes text,
  expected_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_pr" ON purchase_requests;
CREATE POLICY "read_pr" ON purchase_requests FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_pr" ON purchase_requests;
CREATE POLICY "insert_pr" ON purchase_requests FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_pr" ON purchase_requests;
CREATE POLICY "update_pr" ON purchase_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- PURCHASE ITEMS
CREATE TABLE IF NOT EXISTS purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  material_id uuid REFERENCES materials(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric(12,2) NOT NULL DEFAULT 1,
  unit text,
  unit_price numeric(15,2) DEFAULT 0,
  total_price numeric(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_pi" ON purchase_items;
CREATE POLICY "read_pi" ON purchase_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_pi" ON purchase_items;
CREATE POLICY "write_pi" ON purchase_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_feed(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_meetings_project ON meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_pr_project ON purchase_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_pi_purchase ON purchase_items(purchase_id);
