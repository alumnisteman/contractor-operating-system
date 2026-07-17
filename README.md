# COS — Contractor Operating System

Platform operasi terpadu untuk kontraktor PLN. Bukan ERP, bukan Project Management — tetapi pusat operasi perusahaan di mana seluruh tim bekerja dari satu aplikasi.

## Konsep

COS (Contractor Operating System) dirancang sebagai "operating system" untuk perusahaan kontraktor. Semua orang — Direktur, Finance, HRD, Purchasing, Warehouse, PM, Supervisor, QC, HSE, Engineer, Surveyor, Vendor, Owner — memakai aplikasi yang sama dengan pengalaman setara SaaS modern (Linear, ClickUp, Notion).

## Fitur Utama

### Mission Control (Homepage)
Bukan dashboard biasa, tetapi seperti Mission Control NASA:
- Status real-time: Project Running, Delay, Safety Issue, Cashflow, Invoice, Material Delay
- Activity Feed (universal timeline seperti GitHub)
- Approval Queue (approve/reject langsung dari homepage)
- Project Map (GIS dengan Leaflet)
- Upcoming Deadlines
- Upcoming Meetings
- Daily Focus (todo harian per user)
- Quick Action FAB

### Command Palette (Ctrl+K)
Cari apa saja: Project, Material, Vendor, Invoice, Worker, Drawing — tanpa berpindah menu.

### Smart Cards
Setiap data berbentuk card dengan informasi kunci: Progress, Cashflow, Deadline, Risk, Health Score. Klik card langsung masuk ke detail.

### Project Health Score
Skor otomatis per proyek (0-100) berdasarkan:
- Progress (30%) - Schedule (25%) - Cashflow (20%) - QC (15%) - Safety (10%)

Jika turun di bawah 70, dashboard menjadi merah.

### AI Insights
AI muncul di setiap halaman tanpa perlu bertanya:
- "Progress terlambat 8%"
- "Material akan habis 5 hari lagi"
- "Invoice Termin 2 belum ditagih"
- "Jadwal QC besok"

### Project Workspace
Satu proyek = satu workspace dengan 12 tab:
- Overview (info proyek, AI insights, termin, tasks)
- WBS (hirarkis dengan slider progress per pekerjaan)
- Tasks (Kanban drag & drop)
- Timeline (aktivitas proyek)
- Material (monitoring purchase → delivery → installed)
- QC (inspeksi dengan checklist)
- HSE (toolbox, permit, near miss, incident)
- Gallery (foto dengan GPS, dikelompokkan otomatis seperti Google Photos)
- Meetings (agenda, minutes, action items)
- Equipment (alat berat dengan status)
- Documents (kontrak, SPMK, addendum, BAST, NCR, RFI, ITP)
- Finance (termin, invoice, cashflow)

### Kanban
Purchase Request dengan drag & drop: Draft → Requested → Approved → Ordered → Delivered → Completed.

### Master Project dengan Field PLN
UP2D, UID, UP3, ULP, SPMK No, PM, Jenis Project (Distribusi, Transmisi, Gardu Induk, Pembangkit, Jasa).

### Supplier Directory (Marketplace Vendor Internal)
- Directory supplier
- Rating dan lead time
- Riwayat harga material
- Perbandingan penawaran

## Arsitektur Produk

| Area | Fungsi |
|------|--------|
| Operations Hub | Dashboard, Workspace, Timeline, Activity Feed, Command Palette |
| Project Hub | WBS, Progress, QC, HSE, Drawing, Gallery, Documents |
| Business Hub | Finance, Purchasing, Warehouse, Material, Supplier |
| People Hub | HR, Personnel, Sertifikasi, Attendance |
| Intelligence Hub | AI Insights, Analytics, Health Score, Reports |

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Maps**: Leaflet + React-Leaflet
- **Charts**: Recharts
- **Routing**: React Router v6

## Database Schema

30+ tabel dengan Row Level Security (RLS):

### Core
- `profiles` — multi-role (14 peran)
- `projects` — master project dengan field PLN + GIS + health_score
- `project_wbs` — WBS hirarkis
- `project_termin` — termin pembayaran
- `project_cashflow` — cashflow rencana vs aktual
- `tasks` — task Kanban dengan checklist
- `activity_feed` — universal timeline
- `approvals` — approval queue

### Business
- `materials`, `warehouses`, `inventory`, `material_movements`
- `purchases`, `purchase_items` — Kanban purchasing
- `invoices` — finance dengan status tracking
- `equipment` — alat berat dengan QR
- `suppliers`, `supplier_price_history` — vendor marketplace

### People
- `personnel` — SDM dengan sertifikasi
- `attendance` — absensi dengan GPS

### Project Hub
- `qc_checklists`, `qc_checklist_items`, `qc_inspections`
- `hse_toolbox`, `hse_permits`, `hse_near_miss`, `hse_incidents`
- `drawings` — dengan revision dan type
- `documents` — kontrak, SPMK, addendum, BAST, NCR, RFI, ITP
- `photos` — gallery dengan GPS + watermark
- `daily_progress` — progress harian
- `meetings` — dengan agenda dan action items

## Roadmap

### Sudah Diimplementasi
- [x] Mission Control dengan stats, activity feed, approval queue, map
- [x] Command Palette (Ctrl+K)
- [x] Project Workspace (12 tab)
- [x] Smart Cards dengan Health Score
- [x] Kanban Purchase
- [x] WBS dengan slider progress
- [x] GIS Map (Leaflet)
- [x] Gallery foto dengan grouping
- [x] AI Insights per proyek
- [x] Supplier Directory
- [x] Equipment, HR, Documents, Reports
- [x] Multi-role auth (14 peran)

### Tahap Berikutnya
- [ ] Offline First (PWA + sync)
- [ ] QR Code scanner
- [ ] Dashboard Builder (custom widgets)
- [ ] Report Builder (filter → kolom → export)
- [ ] Smart Search global
- [ ] Predictive Analytics (ML)
- [ ] Digital Twin (asset di peta)
- [ ] IoT Ready (GPS kendaraan, fuel sensor, CCTV AI)
- [ ] File Manager dengan versioning
- [ ] Meeting dengan video call
- [ ] Infinite Table (sticky, resize, group, export)
- [ ] Approval Engine terpadu
- [ ] BOQ Engine (import Excel RAB)
- [ ] Drawing Compare

## Menjalankan

```bash
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`.

## Lisensi

Proprietary — Internal use only.
