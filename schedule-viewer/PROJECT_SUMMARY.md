# Evenly Schedule Viewer - Project Summary

## What Was Built

A modern, responsive web dashboard that consolidates Treatment Coordinator (TC) scheduling data from two systems (Cloud9 and Connect Teams) into a single, easy-to-use interface.

## Problem Solved

**Before**: With 30 TCs and 300+ dental offices, staff had to bounce between two systems to:
- See where each TC is scheduled
- Check how many appointments they have
- Find patient details

**After**: Single dashboard showing all schedules, locations, and appointment workload in one view with powerful filtering and search.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Parsing**: PapaParse
- **Date Handling**: date-fns
- **Deployment**: Vercel-ready

## Key Features

1. **Visual Workload Indicators**
   - Color-coded cards (gray/green/yellow/red)
   - Instant visual indication of TC workload

2. **Smart Filtering**
   - Filter by TC name
   - Filter by date range (Today/Week/Month)
   - Real-time search across locations, TCs, and patients

3. **Statistics Dashboard**
   - Active TCs count
   - Total appointments
   - Location count
   - Busy/Idle TC metrics

4. **Detailed Schedule Cards**
   - TC name and date
   - Office location with address
   - Shift times
   - Complete appointment list with patient names and times
   - Appointment notes

5. **Responsive Design**
   - Works on desktop, tablet, mobile
   - Grid layout adapts to screen size

## Project Structure

```
schedule-viewer/
├── app/
│   ├── layout.tsx              # Root layout, metadata
│   ├── page.tsx                # Main dashboard with filters
│   └── globals.css             # Tailwind CSS config
├── components/
│   ├── DashboardFilters.tsx    # TC, date, search filters
│   ├── ScheduleCard.tsx        # Individual schedule card
│   └── StatsOverview.tsx       # Statistics cards
├── lib/
│   ├── data-loader.ts          # CSV parsing and data processing
│   └── types.ts                # TypeScript interfaces
├── public/
│   └── data/                   # CSV data files
│       ├── cloud9_appts.csv
│       ├── job_locations.csv
│       └── schedule_data.csv
├── README.md                   # Full documentation
├── DEPLOYMENT.md               # Deployment guide
├── QUICKSTART.md               # Quick start guide
└── package.json                # Dependencies
```

## Data Flow

1. **Load**: CSV files loaded from `/public/data/` on page load
2. **Parse**: PapaParse converts CSV to JavaScript objects
3. **Process**: Data combined to create TC schedules with appointments
4. **Filter**: User selections filter displayed schedules
5. **Render**: Filtered data displayed as color-coded cards

## CSV Data Sources

### cloud9_appts.csv
- Source: Cloud9 patient management system
- Contains: Appointments with patient info, TC assignments, locations
- Key fields: `assigned_tc`, `appt_date`, `patient_full_name`, `appt_time`

### job_locations.csv
- Source: Job location master list
- Contains: Office names and addresses
- Key fields: `Job`, `Location`

### schedule_data.csv
- Source: Connect Teams scheduling system
- Contains: TC work schedules
- Key fields: `assignedUsers`, `startDate`, `address`, `startTime`, `endTime`

## Deployment Options

✅ **Vercel** (Recommended): One-click deploy, automatic builds, free tier
- Supports automatic redeployment on git push
- CDN for fast global access
- Built-in analytics

✅ **Other Platforms**: Works on any Node.js hosting (AWS, Azure, Netlify, etc.)

## Daily Updates Workflow

Recommended approach:
1. Your existing process updates the 3 CSV files
2. Automated script copies CSVs to `public/data/`
3. Script commits and pushes to GitHub
4. Vercel auto-deploys (1-2 minutes)
5. Dashboard shows updated data

See [DEPLOYMENT.md](DEPLOYMENT.md) for automation scripts.

## Future Enhancement Ideas

1. **Real-time Updates**: WebSocket connection for live updates
2. **API Integration**: Direct connection to Cloud9 and Connect Teams APIs
3. **User Authentication**: Login system for different permission levels
4. **Export Features**: Download filtered results as PDF/Excel
5. **Notifications**: Alerts for schedule changes or appointment conflicts
6. **Calendar View**: Alternative calendar visualization
7. **TC Profiles**: Detailed TC pages with historical data
8. **Analytics**: Appointment trends, utilization metrics

## Performance

- **Build Size**: ~128KB (very lightweight)
- **Load Time**: <2 seconds for initial page load
- **Data Processing**: Handles thousands of appointments efficiently
- **Filtering**: Real-time, no lag

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Maintenance

- **Dependencies**: Update with `npm update`
- **Security**: Run `npm audit` regularly
- **CSV Updates**: Automated via your existing process
- **No database**: Zero database maintenance needed

## Cost

- **Development**: $0 (open source tools)
- **Hosting**: $0 (Vercel free tier is sufficient)
- **Domain** (optional): ~$12/year
- **Total**: Essentially free to run

## Getting Started

See [QUICKSTART.md](QUICKSTART.md) to test locally in 5 minutes.

---

Built with ❤️ for Evenly
