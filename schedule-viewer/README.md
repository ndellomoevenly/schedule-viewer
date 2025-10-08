# Evenly Schedule Viewer

A modern dashboard for viewing Treatment Coordinator (TC) schedules and appointment workload across multiple dental office locations.

## Features

- **Real-time Schedule Visualization**: View all TC schedules with their assigned locations and appointment counts
- **Workload Indicators**: Color-coded cards showing TC workload (0 appts = gray, 1-2 = green, 3-4 = yellow, 5+ = red)
- **Advanced Filtering**: Filter by TC name, date range, or search for specific locations/patients
- **Stats Overview**: At-a-glance metrics showing active TCs, total appointments, locations, and workload distribution
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **PapaParse**: CSV parsing
- **date-fns**: Date formatting and manipulation

## Data Sources

The dashboard combines data from three CSV files:

1. **cloud9_appts.csv**: Appointments from Cloud9 patient management system
2. **job_locations.csv**: Office locations with addresses
3. **schedule_data.csv**: TC scheduling data from Connect Teams

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Place your CSV files in the `public/data/` directory:
   - `cloud9_appts.csv`
   - `job_locations.csv`
   - `schedule_data.csv`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and configure build settings
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to link to your Vercel account

### Updating CSV Data

Since you have a process to update CSVs daily, you have a few options:

**Option A: Commit CSVs to Repository**
- Simply update the CSV files in `public/data/` and push to GitHub
- Vercel will automatically redeploy on push

**Option B: Use Vercel API Routes** (future enhancement)
- Create API routes to fetch data from external sources
- Schedule updates via cron jobs or webhooks

**Option C: Vercel Blob Storage** (for large files)
- Upload CSVs to Vercel Blob Storage
- Update the data loader to fetch from blob storage

## Project Structure

```
schedule-viewer/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx             # Main dashboard page
│   └── globals.css          # Global styles
├── components/
│   ├── DashboardFilters.tsx # Filter controls
│   ├── ScheduleCard.tsx     # Individual TC schedule card
│   └── StatsOverview.tsx    # Statistics display
├── lib/
│   ├── data-loader.ts       # CSV loading and processing
│   └── types.ts             # TypeScript type definitions
└── public/
    └── data/                # CSV data files
        ├── cloud9_appts.csv
        ├── job_locations.csv
        └── schedule_data.csv
```

## Customization

### Adjusting Workload Thresholds

Edit the `getWorkloadColor` function in `components/ScheduleCard.tsx`:

```typescript
const getWorkloadColor = (count: number) => {
  if (count === 0) return 'bg-gray-100 border-gray-300';
  if (count <= 2) return 'bg-green-50 border-green-300';  // Light workload
  if (count <= 4) return 'bg-yellow-50 border-yellow-300'; // Medium workload
  return 'bg-red-50 border-red-300';                       // Heavy workload (5+)
};
```

### Adding More Filters

Add new filter states and logic in `app/page.tsx` and corresponding UI controls in `components/DashboardFilters.tsx`.

## License

Built for Evenly
