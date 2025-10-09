# Schedule Viewer - Folder Structure

This document explains the consolidated folder structure of the Schedule Viewer project.

## 📁 Project Structure

```
schedule-viewer/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard
│   └── globals.css         # Global styles
│
├── components/             # React components
│   ├── DashboardFilters.tsx
│   ├── ScheduleCard.tsx
│   └── StatsOverview.tsx
│
├── lib/                    # Utilities and types
│   ├── data-loader.ts      # CSV parsing and data loading
│   └── types.ts            # TypeScript definitions
│
├── public/                 # Static assets served by Next.js
│   ├── data/              # ✅ CSV DATA FILES (app reads from here)
│   │   ├── cloud9_appts.csv
│   │   ├── job_locations.csv
│   │   └── schedule_data.csv
│   └── *.svg               # Icon files
│
├── scripts/                # Data extraction scripts
│   ├── connecteam_extractor.py      # Python script to fetch data from Connecteam API
│   └── README.md                     # Documentation for scripts
│
├── data-pipelines/         # Pipeline outputs and logs
│   └── connecteam/
│       ├── location_mapping.csv      # Reference data
│       └── connecteam_extraction.log # Extraction logs
│
└── [config files]          # package.json, tsconfig.json, etc.
```

## 🔄 Data Flow

```
┌─────────────────────┐
│  Connecteam API     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────────────┐
│ scripts/connecteam_extractor.py     │
│ (npm run refresh-data)              │
└──────────┬──────────────────────────┘
           │
           ↓ Writes directly to
┌─────────────────────────────────────┐
│ public/data/schedule_data.csv       │ ← ✅ App reads from here
└─────────────────────────────────────┘
```

## 📝 Important Notes

### Where Data Lives
- **App reads from**: `public/data/` (served via `/data/` URL path)
- **Scripts output to**: `public/data/schedule_data.csv` (directly to app)
- **Pipeline logs**: `data-pipelines/connecteam/`
- **Reference data**: `data-pipelines/connecteam/location_mapping.csv`

### Previous Structure (Cleaned Up)
The following folders have been **removed** to simplify the structure:
- ❌ `~/schedule_viewer/data/` - Old staging folder (removed)
- ❌ `~/schedule_viewer/managed_tables/` - Old pipeline output (removed)
- ❌ Root-level scripts (`connecteam_data_extractor_fixed.py`, `run_connect_teams.R`) - Moved to `scripts/`

### Quick Commands

From the `schedule-viewer/` directory:

```bash
# Refresh Connecteam data
npm run refresh-data

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 Benefits of New Structure

1. **Single source of truth**: All code lives in `schedule-viewer/`
2. **Clear data flow**: Scripts output directly to `public/data/`
3. **No manual copying**: Data goes straight to where the app needs it
4. **Easy to run**: Simple `npm run` commands
5. **Well documented**: READMEs at every level
6. **Git-friendly**: Clean structure for version control

## 🔒 Security Note

The Connecteam API key is currently hardcoded in `scripts/connecteam_extractor.py`. For production deployments, move this to environment variables:

```python
API_KEY = os.getenv("CONNECTEAM_API_KEY")
```

And set in your deployment environment (Vercel, etc.):
```bash
CONNECTEAM_API_KEY=your-key-here
```
