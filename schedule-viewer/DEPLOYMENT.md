# Evenly Schedule Viewer - Deployment Guide

## Quick Start: Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works fine)

### Step-by-Step Deployment

#### 1. Initialize Git Repository (if not already done)
```bash
cd schedule-viewer
git init
git add .
git commit -m "Initial commit: Evenly Schedule Viewer"
```

#### 2. Push to GitHub
```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/evenly-schedule-viewer.git
git branch -M main
git push -u origin main
```

#### 3. Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"
6. Wait 1-2 minutes for deployment
7. Your app will be live at `https://your-project.vercel.app`

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

## Updating CSV Data

You mentioned you have a daily process to update the CSVs. Here are your options:

### Option 1: Git Push (Simple)
1. Update the CSV files in `public/data/`
2. Commit and push to GitHub:
   ```bash
   git add public/data/*.csv
   git commit -m "Update schedule data"
   git push
   ```
3. Vercel automatically redeploys (takes ~1-2 minutes)

**Pros:** Simple, version controlled
**Cons:** Requires git commit/push, creates deployment for every update

### Option 2: Automated Git Updates (Recommended)
Create a script that automatically commits and pushes CSV updates:

```bash
#!/bin/bash
# update-schedules.sh

cd /path/to/schedule-viewer

# Copy updated CSVs from your source
cp /path/to/cloud9_appts.csv public/data/
cp /path/to/job_locations.csv public/data/
cp /path/to/schedule_data.csv public/data/

# Commit and push
git add public/data/*.csv
git commit -m "Auto-update: Schedule data $(date +%Y-%m-%d)"
git push origin main

echo "Schedule data updated and deployed!"
```

Run this script via cron job daily:
```bash
# Run at 6 AM daily
0 6 * * * /path/to/update-schedules.sh
```

### Option 3: Vercel Blob Storage (Advanced - For Large Files)
If your CSV files become very large (>10MB), consider using Vercel Blob Storage:

1. Install Vercel Blob SDK:
   ```bash
   npm install @vercel/blob
   ```

2. Create an API route to upload CSVs
3. Update data-loader.ts to fetch from Blob Storage
4. Upload CSVs via API instead of git commits

[Documentation](https://vercel.com/docs/storage/vercel-blob)

### Option 4: External API Integration (Most Scalable)
Instead of static CSVs, fetch data from an API:

1. Create API routes in `app/api/`
2. Connect directly to Cloud9 API and Connect Teams
3. Cache responses using Vercel's Data Cache
4. Real-time updates without manual CSV exports

## Environment Variables

If you need to add any secrets (API keys, etc.) for future enhancements:

1. In Vercel Dashboard → Project Settings → Environment Variables
2. Add your variables:
   - `NEXT_PUBLIC_API_URL`
   - `API_SECRET_KEY`
   - etc.

3. Redeploy for changes to take effect

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your custom domain (e.g., `schedules.evenly.com`)
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

## Monitoring & Analytics

Vercel provides:
- **Analytics**: Track page views and performance
- **Speed Insights**: Monitor Core Web Vitals
- **Logs**: View deployment and function logs

Access these in your Vercel Dashboard → Project → Analytics

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure CSV files are in `public/data/`

### Data Not Loading
- Check browser console for errors
- Verify CSV files are accessible at `/data/*.csv`
- Check CSV format matches expected structure

### Slow Performance
- Large CSV files: Consider pagination or filtering server-side
- Enable Vercel Analytics to identify bottlenecks
- Consider using Vercel Edge Functions for faster global access

## Performance Optimization Tips

1. **Image Optimization**: If you add images, use Next.js `<Image>` component
2. **Code Splitting**: Already handled by Next.js App Router
3. **Caching**: CSV data is cached by browser; set cache headers if needed
4. **Compression**: Gzip enabled automatically by Vercel

## Support

For issues:
- Check [Next.js Documentation](https://nextjs.org/docs)
- Check [Vercel Documentation](https://vercel.com/docs)
- Review build logs in Vercel Dashboard
