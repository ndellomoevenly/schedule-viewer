# Quick Start Guide

## Test the Dashboard Locally (5 minutes)

1. **Navigate to the project**:
   ```bash
   cd schedule-viewer
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Verify CSV files are in place**:
   ```bash
   ls -lh public/data/
   ```

   You should see:
   - `cloud9_appts.csv`
   - `job_locations.csv`
   - `schedule_data.csv`

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the Evenly Schedule Viewer dashboard!

## What You Should See

✅ **Header**: "Evenly Schedule Viewer"

✅ **Stats Cards**: 5 colored stat cards showing:
   - Active TCs
   - Total Appointments
   - Locations
   - Busy TCs (5+ appointments)
   - Idle TCs (0 appointments)

✅ **Filters**:
   - TC dropdown
   - Date filter (Today/This Week/This Month)
   - Search box

✅ **Schedule Cards**: Grid of cards, each showing:
   - TC name
   - Date
   - Location & address
   - Shift times
   - Number of appointments
   - List of individual appointments with patient names and times

## Color Coding

- **Gray**: No appointments (idle)
- **Green**: 1-2 appointments (light workload)
- **Yellow**: 3-4 appointments (medium workload)
- **Red**: 5+ appointments (heavy workload)

## Testing the Filters

1. **Filter by TC**: Select a specific TC from dropdown
2. **Filter by Date**: Select "This Week" to see only upcoming schedules
3. **Search**: Type a location name or patient name to filter results
4. **Clear filters**: Set all filters back to default to see all schedules

## Deploy to Production

When you're ready to deploy, see [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

The quickest way:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Need Help?

- **README.md**: Full documentation and features
- **DEPLOYMENT.md**: Detailed deployment guide
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
