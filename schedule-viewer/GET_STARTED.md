# 🚀 Get Started with Evenly Schedule Viewer

## What You Have Now

A complete, production-ready Next.js dashboard application in the `schedule-viewer/` directory!

## 📁 Complete File Structure

```
schedule-viewer/
├── 📱 App (Next.js 15)
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main dashboard
│   │   └── globals.css         # Styles
│
├── 🧩 Components
│   ├── DashboardFilters.tsx    # Filter controls
│   ├── ScheduleCard.tsx        # Schedule cards
│   └── StatsOverview.tsx       # Statistics
│
├── 📚 Data Layer
│   ├── lib/
│   │   ├── data-loader.ts      # CSV processing
│   │   └── types.ts            # TypeScript types
│   └── public/
│       └── data/               # Your CSV files
│           ├── cloud9_appts.csv
│           ├── job_locations.csv
│           └── schedule_data.csv
│
└── 📖 Documentation
    ├── README.md               # Full documentation
    ├── QUICKSTART.md           # Quick start guide
    ├── DEPLOYMENT.md           # Deployment guide
    ├── PROJECT_SUMMARY.md      # Project overview
    └── GET_STARTED.md          # This file
```

## ⚡ Quick Test (2 minutes)

```bash
cd schedule-viewer
npm run dev
```

Then open: http://localhost:3000

You should see your dashboard with all TC schedules!

## 🌐 Deploy to Production (5 minutes)

### Option 1: Vercel (Easiest)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow prompts** - it will:
   - Ask you to login (creates free account)
   - Auto-detect Next.js settings
   - Deploy your app
   - Give you a live URL

That's it! Your app is live at `https://your-project.vercel.app`

### Option 2: GitHub + Vercel (Recommended for teams)

1. **Create GitHub repo**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/evenly-schedule-viewer.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Click "Deploy"

Now every time you push to GitHub, Vercel auto-deploys!

## 🔄 Daily CSV Updates

Since you mentioned you have a process to update CSVs daily, here's how to automate it:

### Simple Bash Script

Create `update-data.sh`:

```bash
#!/bin/bash
cd /path/to/schedule-viewer

# Copy your updated CSVs
cp /path/to/your/cloud9_appts.csv public/data/
cp /path/to/your/job_locations.csv public/data/
cp /path/to/your/schedule_data.csv public/data/

# Commit and push (triggers auto-deploy on Vercel)
git add public/data/*.csv
git commit -m "Auto-update: $(date +%Y-%m-%d)"
git push origin main

echo "✅ Data updated and deployed!"
```

### Set up Cron Job (runs automatically)

```bash
crontab -e
```

Add this line (runs at 6 AM daily):
```
0 6 * * * /path/to/update-data.sh
```

Now your dashboard updates automatically every day!

## 🎨 Features Overview

### Color-Coded Workload
- 🟦 **0 appts** - Gray (Idle)
- 🟩 **1-2 appts** - Green (Light)
- 🟨 **3-4 appts** - Yellow (Medium)
- 🟥 **5+ appts** - Red (Heavy)

### Filters
- **TC Name** - See specific coordinator
- **Date Range** - Today/Week/Month
- **Search** - Find by location, patient, TC

### Stats Dashboard
- Active TCs
- Total Appointments
- Unique Locations
- Busy vs Idle TCs

## 📱 Mobile Friendly

The dashboard works perfectly on:
- Desktop computers
- Tablets
- Mobile phones

## 🔧 Customization

Want to change something? The code is clean and well-documented:

### Change Color Thresholds
Edit [components/ScheduleCard.tsx](components/ScheduleCard.tsx:12):
```typescript
const getWorkloadColor = (count: number) => {
  if (count === 0) return 'bg-gray-100 border-gray-300';
  if (count <= 2) return 'bg-green-50 border-green-300';
  // Change these numbers ↑ to adjust thresholds
};
```

### Add New Filters
1. Add state in [app/page.tsx](app/page.tsx)
2. Add UI in [components/DashboardFilters.tsx](components/DashboardFilters.tsx)
3. Add filter logic in `filteredSchedules` useMemo

### Modify Card Display
Edit [components/ScheduleCard.tsx](components/ScheduleCard.tsx) to change what's shown on each card

## 💰 Cost

**Total cost: $0/month**

- Next.js: Free (open source)
- Vercel hosting: Free tier (plenty for this use case)
- No database needed
- No API costs

Optional: Custom domain ~$12/year

## 📊 What's Next?

The dashboard is ready to use, but you could add:

1. **Real-time updates** - WebSocket connection
2. **Notifications** - Email/SMS alerts
3. **Export** - Download as PDF/Excel  
4. **Calendar view** - Alternative visualization
5. **Analytics** - Historical trends
6. **API integration** - Direct Cloud9/Connect Teams connection

See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for more ideas.

## 🆘 Need Help?

1. **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
2. **Full Docs**: [README.md](README.md)
3. **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Project Overview**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## ✅ Checklist

- [ ] Test locally (`npm run dev`)
- [ ] Verify CSV data loads correctly
- [ ] Test filters and search
- [ ] Deploy to Vercel
- [ ] Set up automated CSV updates
- [ ] Share URL with team
- [ ] (Optional) Add custom domain

---

**You're all set! 🎉**

The Evenly Schedule Viewer is ready to solve your TC scheduling visibility problem.

Questions? Check the docs above or the inline code comments.
