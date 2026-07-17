# Contractor Operating System (COS)

Pusat operasi perusahaan kontraktor — bukan ERP, bukan Project Management, tetapi platform operasi yang digunakan setiap hari oleh seluruh tim: Direktur, Finance, HRD, Purchasing, Warehouse, Project Manager, Supervisor, QC, HSE, Engineer, Surveyor, Vendor, dan Owner.

## Konsep

Aplikasi ini dirancang sebagai **Contractor Operating System** — satu aplikasi untuk semua peran, dengan pengalaman pengguna setara SaaS modern (mirip Linear, ClickUp, GitHub).

### Lima Area Utama

| Area | Fungsi |
|------|--------|
| **Operations Hub** | Mission Control, Workspace, Timeline, Activity Feed, Approval Queue |
| **Project Hub** | WBS, Progress, QC, HSE, Drawing, Dokumentasi, Gallery |
| **Business Hub** | Finance, Purchasing, Warehouse, Vendor/Supplier, Asset |
| **People Hub** | HR, SDM, Attendance, Sertifikasi, Tim |
| **Intelligence Hub** | AI Insights, Analytics, Health Score, Prediksi |

## Fitur Utama

### Mission Control (Homepage)
Bukan dashboard biasa — seperti Mission Control dengan:
- **Status Cards**: Project Running, Delay, Safety Issue, Cashflow, Invoice, Material Delay
- **Activity Feed**: Timeline universal semua aktivitas perusahaan
- **Approval Queue**: Antrian approval yang perlu ditindaklanjuti
- **Upcoming Deadlines**: Task dan deadline mendatang
- **Quick Actions**: Akses cepat ke aksi utama
- **Daily Focus**: Personalisasi per user — "Halo Budi, hari ini ada..."
- **Project Smart Cards**: Card dengan progress, health score, deadline, risk

### Command Palette (Ctrl+K)
Cari dan lompat ke mana saja: project, material, vendor, invoice, worker, drawing.

### Project Workspace
Setiap project memiliki workspace dengan tab:
- **Overview** — ringkasan + AI insights
- **Task** — kanban board (To Do → In Progress → Review → Done → Blocked)
- **Timeline** — universal timeline aktivitas project
- **WBS** — work breakdown structure dengan progress slider, QC status, approval
- **Files** — drawing (IFC, Shop, As Built, SLD, Layout) & document (Kontrak, SPMK, Addendum, BAST, NCR, RFI, ITP)
- **Material** — monitoring material (purchase → delivery → installed → remaining)
- **Purchase** — kanban purchase request (Draft → Requested → Approved → Ordered → Delivered → Completed)
- **Worker** — SDM (PM, Site Manager, Engineer, QC, HSE, Lineman, dll)
- **Equipment** — alat (Excavator, Crane, Sky Lift, Truck, Generator, dll)
- **QC** — checklist & inspection per jenis pekerjaan
- **HSE** — Toolbox, Permit, Incident
- **Meeting** — agenda, participants, minutes, action items
- **Gallery** — foto progress dengan GPS, dikelompokkan otomatis (Hari Ini, Kemarin, Minggu Ini, Bulan Ini)

### Project Health Score
Setiap project mendapat skor otomatis berdasarkan progress, schedule, dan status. Jika turun di bawah 70, card menjadi merah.

### AI Insights
AI muncul di setiap halaman project — menampilkan peringatan otomatis:
- Progress terlambat
- Material akan habis
- Invoice termin belum ditagih
- Jadwal QC

### GIS Map
Semua project tampil di peta interaktif (Leaflet). Klik marker untuk melihat progress, PIC, lokasi.

### Sidebar Modern
Navigasi mirip Linear: Home, Projects, Material, Warehouse, Finance, HR, Documents, Equipment, Tenders, Vendors, GIS Map, Gallery, Reports, Settings.

### Smart Notification
Hanya notifikasi penting yang muncul: Project Delay, QC Reject, Invoice Paid, Stock Low, Safety Incident.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Map**: Leaflet + React-Leaflet
- **Charts**: Recharts
- **Routing**: React Router v6

## Database Schema

### Core & Procurement
- `profiles` — user dengan role (vendor, director, finance, hrd, purchasing, pm, supervisor, qc, hse, engineer, surveyor, owner)
- `vendor_profiles` — DPT status, company details
- `vendor_documents` — dokumen legalitas
- `tenders` — pengadaan dengan field PLN (UP2D, UID, UP3, ULP, SPMK, PM, Jenis Project)
- `tender_items`, `tender_schedules`, `tender_clarifications`
- `bids`, `bid_items` — penawaran vendor
- `evaluation_aspects`, `evaluations` — evaluasi
- `awards` — hasil pengadaan

### Project Management
- `projects` — dengan field PLN lengkap, koordinat GIS, health score
- `project_wbs` — WBS dengan target/volume/foto/dokumen/QC/approval
- `project_termin` — termin pembayaran
- `project_cashflow` — cashflow rencana vs aktual
- `project_templates`, `project_template_wbs` — template per jenis project
- `equipment` — unit alat
- `personnel` — SDM dengan sertifikasi

### QC, HSE, Progress
- `qc_checklists`, `qc_checklist_items`, `qc_inspections`
- `hse_toolbox`, `hse_jsa`, `hse_permits`, `hse_apd`, `hse_near_miss`, `hse_incidents`
- `daily_progress`, `daily_progress_items`, `daily_photos` — dengan GPS + watermark
- `drawings` — IFC, Shop, As Built, SLD, Layout dengan revision
- `documents` — Kontrak, SPMK, Addendum, BAST, NCR, RFI, ITP

### Material & Warehouse
- `materials` — katalog
- `warehouses` — gudang dengan koordinat GIS
- `inventory` — stok per gudang
- `material_movements` — pergerakan (purchase, delivery, installed, transfer)
- `project_assets` — asset setelah project (warranty, maintenance)

### COS Core
- `activity_feed` — universal timeline
- `approvals` — approval queue
- `notifications` — smart notifications
- `tasks` — universal tasks dengan kanban
- `meetings`, `meeting_action_items`
- `invoices` — invoice management
- `purchase_requests`, `purchase_items` — purchase lifecycle
- `suppliers` — supplier directory dengan rating & lead time

## Setup

```bash
npm install
npm run dev
```

Database dan auth sudah terkonfigurasi via Supabase. Semua env vars sudah pre-populated.

## Roadmap

- [x] Mission Control dengan stats & activity feed
- [x] Project Workspace dengan 13 tab
- [x] WBS dengan progress slider & approval
- [x] Kanban untuk Task & Purchase Request
- [x] GIS Map dengan Leaflet
- [x] Gallery dengan auto-grouping
- [x] Command Palette (Ctrl+K)
- [x] Smart Notifications
- [x] AI Insights per project
- [x] Health Score
- [ ] Offline First (PWA + sync)
- [ ] QR Everything
- [ ] Dashboard Builder
- [ ] Report Builder dengan export Excel/PDF
- [ ] Predictive Analytics
- [ ] Digital Twin
- [ ] IoT Ready
- [ ] Drawing Compare
- [ ] BOQ Engine (import Excel RAB)
- [ ] Approval Engine terpadu

## License

Private — Internal use
