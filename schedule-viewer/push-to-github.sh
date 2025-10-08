#!/bin/bash

# Script to push Evenly Schedule Viewer to GitHub

echo "🚀 Pushing Evenly Schedule Viewer to GitHub"
echo "==========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "✅ Initializing Git repository..."
    git init
    git branch -M main
else
    echo "✅ Git repository already initialized"
fi

# Add all files
echo ""
echo "📦 Adding files to git..."
git add .

# Create initial commit
echo ""
echo "💾 Creating commit..."
git commit -m "Initial commit: Evenly Schedule Viewer

- Next.js 15 dashboard for TC scheduling
- Color-coded workload indicators
- Filters for TC, date, and search
- Stats overview dashboard
- Responsive design
- Complete documentation" || echo "Files already committed"

echo ""
echo "==========================================="
echo "📝 NEXT STEPS:"
echo "==========================================="
echo ""
echo "1. Create a new repository on GitHub:"
echo "   → Go to: https://github.com/new"
echo "   → Name: evenly-schedule-viewer"
echo "   → Description: Treatment Coordinator scheduling dashboard"
echo "   → Choose: Public or Private"
echo "   → DO NOT initialize with README (we already have one)"
echo "   → Click 'Create repository'"
echo ""
echo "2. Then run ONE of these commands:"
echo ""
echo "   If using HTTPS:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/evenly-schedule-viewer.git"
echo ""
echo "   If using SSH:"
echo "   git remote add origin git@github.com:YOUR_USERNAME/evenly-schedule-viewer.git"
echo ""
echo "3. Finally, push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "==========================================="
echo ""
echo "Or copy/paste this complete workflow:"
echo ""
echo "# Replace YOUR_USERNAME with your GitHub username"
echo "git remote add origin https://github.com/YOUR_USERNAME/evenly-schedule-viewer.git"
echo "git push -u origin main"
echo ""
echo "==========================================="
