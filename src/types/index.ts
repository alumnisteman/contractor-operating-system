export type UserRole =
  | 'direktur' | 'finance' | 'hrd' | 'purchasing' | 'warehouse'
  | 'pm' | 'supervisor' | 'qc' | 'hse' | 'engineer' | 'surveyor'
  | 'vendor' | 'owner' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  department?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  up2d?: string; uid?: string; up3?: string; ulp?: string;
  spmk_no?: string; spmk_date?: string; pm_name?: string;
  project_type?: string;
  contract_value?: number;
  start_date?: string; end_date?: string;
  progress: number;
  status: string;
  risk_level: string;
  health_score: number;
  latitude?: number; longitude?: number; location_name?: string;
  created_at: string;
}

export interface WBS {
  id: string;
  project_id: string;
  parent_id?: string;
  code?: string;
  name: string;
  description?: string;
  volume: number;
  unit?: string;
  weight: number;
  target_progress: number;
  actual_progress: number;
  start_date?: string;
  end_date?: string;
  qc_status?: string;
  approval_status: string;
  photo_url?: string;
  doc_url?: string;
}

export interface Task {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: string;
  due_date?: string;
  checklist?: any[];
  created_at: string;
}

export interface ActivityItem {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  project_id?: string;
  description: string;
  metadata?: any;
  created_at: string;
}

export interface Approval {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  requested_by_name: string;
  approved_by_name?: string;
  status: string;
  notes?: string;
  priority: string;
  created_at: string;
}

export interface Material {
  id: string;
  code?: string;
  name: string;
  category?: string;
  unit: string;
  specification?: string;
  qr_code?: string;
}

export interface Warehouse {
  id: string;
  project_id?: string;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  qr_code?: string;
}

export interface Inventory {
  id: string;
  warehouse_id: string;
  material_id: string;
  quantity: number;
  min_stock: number;
  unit_price: number;
}

export interface Purchase {
  id: string;
  pr_number: string;
  project_id?: string;
  supplier_id?: string;
  title: string;
  description?: string;
  total_amount: number;
  status: string;
  requested_by_name?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  project_id?: string;
  type?: string;
  amount: number;
  tax_amount?: number;
  total_amount: number;
  status: string;
  issue_date?: string;
  due_date?: string;
  paid_date?: string;
}

export interface Equipment {
  id: string;
  project_id?: string;
  name: string;
  type: string;
  model?: string;
  serial_number?: string;
  capacity?: string;
  status: string;
  rental_rate?: number;
  operator?: string;
  qr_code?: string;
}

export interface Personnel {
  id: string;
  project_id?: string;
  name: string;
  role: string;
  phone?: string;
  certification?: string;
  license_no?: string;
  license_expiry?: string;
  status: string;
  daily_rate?: number;
  qr_code?: string;
}

export interface DailyProgress {
  id: string;
  project_id: string;
  report_date: string;
  weather?: string;
  temperature?: string;
  work_summary?: string;
  total_workers: number;
  issues?: string;
}

export interface Photo {
  id: string;
  project_id?: string;
  wbs_id?: string;
  photo_url: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  taken_at: string;
  watermark?: string;
  uploaded_by_name?: string;
  category?: string;
}

export interface Drawing {
  id: string;
  project_id: string;
  drawing_no?: string;
  title: string;
  drawing_type: string;
  revision: string;
  file_url?: string;
  status: string;
  qr_code?: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  doc_type: string;
  title: string;
  doc_no?: string;
  doc_date?: string;
  file_url?: string;
  status: string;
  notes?: string;
}

export interface QCInspection {
  id: string;
  project_id: string;
  wbs_id?: string;
  checklist_id: string;
  inspection_date: string;
  result: string;
  notes?: string;
  photo_url?: string;
}

export interface HSEToolbox {
  id: string;
  project_id: string;
  meeting_date: string;
  topic: string;
  presenter?: string;
  attendees_count: number;
  notes?: string;
  photo_url?: string;
}

export interface HSEPermit {
  id: string;
  project_id: string;
  permit_type: string;
  permit_no?: string;
  issued_date?: string;
  valid_until?: string;
  location?: string;
  description?: string;
  status: string;
}

export interface HSEIncident {
  id: string;
  project_id: string;
  incident_date: string;
  type?: string;
  location?: string;
  description: string;
  casualties?: string;
  status: string;
}

export interface Meeting {
  id: string;
  project_id?: string;
  title: string;
  agenda?: string;
  meeting_date: string;
  duration_min: number;
  participants?: string[];
  minutes?: string;
  action_items?: any[];
  status: string;
}

export interface Supplier {
  id: string;
  name: string;
  category?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  rating?: number;
  lead_time_days?: number;
}

export interface ProjectTermin {
  id: string;
  project_id: string;
  termin_no: number;
  description?: string;
  amount: number;
  percentage: number;
  status: string;
}

export interface ProjectCashflow {
  id: string;
  project_id: string;
  month_date: string;
  planned_in: number;
  planned_out: number;
  actual_in: number;
  actual_out: number;
}
