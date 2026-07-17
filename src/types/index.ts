export type UserRole = 'vendor' | 'director' | 'admin' | 'finance' | 'purchasing' | 'hrd' | 'pm' | 'supervisor' | 'qc' | 'hse' | 'engineer' | 'surveyor' | 'owner';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  company_name: string;
  npwp?: string;
  address?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  dpt_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  dpt_number?: string;
  dpt_expiry?: string;
  classification?: string;
}

export interface Tender {
  id: string;
  tender_number: string;
  title: string;
  description?: string;
  up2d?: string;
  uid?: string;
  up3?: string;
  ulp?: string;
  spmk_no?: string;
  pm_name?: string;
  project_type?: string;
  hps?: number;
  status: string;
  open_date?: string;
  close_date?: string;
  created_at: string;
}

export interface TenderItem {
  id: string;
  tender_id: string;
  name: string;
  description?: string;
  volume: number;
  unit: string;
  hps_price: number;
}

export interface Bid {
  id: string;
  tender_id: string;
  vendor_id: string;
  total_value: number;
  status: string;
  submitted_at?: string;
  created_at: string;
}

export interface Award {
  id: string;
  tender_id: string;
  bid_id: string;
  vendor_id: string;
  contract_value: number;
  spk_number?: string;
  spk_date?: string;
  status: string;
}

export interface Project {
  id: string;
  tender_id?: string;
  award_id?: string;
  vendor_id?: string;
  name: string;
  description?: string;
  up2d?: string;
  uid?: string;
  up3?: string;
  ulp?: string;
  spmk_no?: string;
  spmk_date?: string;
  pm_name?: string;
  project_type?: string;
  contract_value?: number;
  start_date?: string;
  end_date?: string;
  progress: number;
  status: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
}

export interface ProjectWBS {
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
  approved_by?: string;
  approved_at?: string;
  photo_url?: string;
  doc_url?: string;
}

export interface ProjectTermin {
  id: string;
  project_id: string;
  termin_no: number;
  description?: string;
  amount: number;
  percentage: number;
  status: string;
  invoice_date?: string;
  paid_date?: string;
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

export interface DailyPhoto {
  id: string;
  daily_id: string;
  wbs_id?: string;
  photo_url: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  taken_at: string;
  watermark?: string;
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

export interface Material {
  id: string;
  code?: string;
  name: string;
  category?: string;
  unit: string;
  specification?: string;
}

export interface Warehouse {
  id: string;
  project_id?: string;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface Inventory {
  id: string;
  warehouse_id: string;
  material_id: string;
  quantity: number;
  min_stock: number;
  unit_price: number;
}

export interface MaterialMovement {
  id: string;
  project_id?: string;
  warehouse_id?: string;
  material_id: string;
  movement_type: string;
  quantity: number;
  unit?: string;
  unit_price?: number;
  reference_no?: string;
  movement_date: string;
  notes?: string;
}

export interface ProjectAsset {
  id: string;
  project_id: string;
  asset_name: string;
  asset_type?: string;
  serial_number?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  warranty_start?: string;
  warranty_end?: string;
  maintenance_schedule?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  status: string;
  notes?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  project_type: string;
  description?: string;
}

export interface QCChecklist {
  id: string;
  name: string;
  work_type?: string;
  description?: string;
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
  approved_by?: string;
}

export interface HSEIncident {
  id: string;
  project_id: string;
  incident_date: string;
  type?: string;
  location?: string;
  description: string;
  casualties?: string;
  root_cause?: string;
  corrective_action?: string;
  reported_by?: string;
  status: string;
}

export interface VendorDocument {
  id: string;
  vendor_id: string;
  doc_type: string;
  doc_name?: string;
  file_url?: string;
  status: string;
  uploaded_at: string;
}

export interface ActivityFeedItem {
  id: string;
  project_id?: string;
  user_id?: string;
  activity_type: string;
  message: string;
  ref_type?: string;
  ref_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Approval {
  id: string;
  approval_type: string;
  ref_id?: string;
  project_id?: string;
  requester_id: string;
  approver_id?: string;
  status: string;
  notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  project_id?: string;
  priority: string;
  notification_type: string;
  title: string;
  message?: string;
  ref_type?: string;
  ref_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  assignee_id?: string;
  assigned_to_name?: string;
  status: string;
  priority: string;
  due_date?: string;
  checklist?: any[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  project_id?: string;
  title: string;
  agenda?: string;
  participants?: string;
  minutes?: string;
  attachments?: string;
  meeting_date: string;
  status: string;
  created_by?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  project_id?: string;
  invoice_no: string;
  vendor_id?: string;
  termin_id?: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  invoice_date?: string;
  due_date?: string;
  paid_date?: string;
  notes?: string;
}

export interface PurchaseRequest {
  id: string;
  pr_number: string;
  project_id?: string;
  warehouse_id?: string;
  supplier_id?: string;
  requestor_id?: string;
  status: string;
  total_amount: number;
  notes?: string;
  expected_date?: string;
  created_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  material_id?: string;
  description: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  total_price: number;
}

export interface Supplier {
  id: string;
  name: string;
  category?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  rating: number;
  lead_time_days: number;
  notes?: string;
}
