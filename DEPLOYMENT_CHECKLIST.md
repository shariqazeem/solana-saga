# 🚀 Vercel Deployment Checklist

## Prerequisites
- [ ] GitHub account
- [ ] Vercel account (free tier is fine)
- [ ] Project pushed to GitHub

## Step-by-Step Deployment

### 1. Push to GitHub
```bash
cd /Users/macbookair/projects/solana-saga
git push origin main  # or your branch name
```

### 2. Deploy to Vercel

**Option A: Via Vercel Website (RECOMMENDED)**
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository: `shariqazeem/solana-saga`
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com
   NEXT_PUBLIC_PROGRAM_ID=G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j
   ```

6. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: solana-saga
# - Directory: ./
# - Override settings? No

# After deployment, set environment variables
vercel env add NEXT_PUBLIC_SOLANA_NETWORK
# Enter: devnet

vercel env add NEXT_PUBLIC_SOLANA_RPC_HOST
# Enter: https://api.devnet.solana.com

vercel env add NEXT_PUBLIC_PROGRAM_ID
# Enter: G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j

# Redeploy with env vars
vercel --prod
```

### 3. Verify Deployment
- [ ] Visit your deployment URL (e.g., https://solana-saga.vercel.app)
- [ ] Check that wallet connection works
- [ ] Browse markets page
- [ ] Verify all assets load correctly
- [ ] Test on mobile (responsive design)

### 4. Custom Domain (Optional but IMPRESSIVE)
If you have a domain:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., solanasaga.com)
3. Follow DNS configuration instructions

### 5. Performance Optimization
After deployment, check:
- [ ] Lighthouse score (aim for 90+)
- [ ] Page load time (<3s)
- [ ] Mobile performance

Run in Chrome DevTools:
```
Right-click → Inspect → Lighthouse → Generate Report
```

## Post-Deployment Checklist

### Update Documentation
- [ ] Update README.md with live demo link
- [ ] Update WINNING_STRATEGY.md with deployment URL
- [ ] Add deployment badge to README

### Test Critical Flows
- [ ] Connect wallet (Phantom)
- [ ] Browse markets
- [ ] Place a bet
- [ ] View leaderboard
- [ ] Check my bets page
- [ ] AI Analyst shows insights
- [ ] Twitter share works

### Share Links
- [ ] Copy deployment URL: `https://your-project.vercel.app`
- [ ] Test on different devices (phone, tablet, desktop)
- [ ] Share with a friend to test

## Common Issues & Fixes

### Build Fails
```bash
# Clear build cache locally and test
cd frontend
rm -rf .next node_modules
npm install
npm run build

# If it builds locally, check Vercel logs
```

### Environment Variables Not Working
- Make sure they start with `NEXT_PUBLIC_`
- Redeploy after adding env vars
- Check Vercel Dashboard → Settings → Environment Variables

### Slow Performance
- Enable caching in next.config.js
- Optimize images (use Next.js Image component)
- Minimize RPC calls

### 404 Errors on Refresh
- Vercel handles this automatically for Next.js
- If issues, check vercel.json routing config

## Quick Deploy Script

Create `deploy.sh` in project root:
```bash
#!/bin/bash
echo "🚀 Deploying Solana Saga to Vercel..."

# Ensure latest changes are committed
git add -A
git commit -m "chore: deploy to production" || echo "No changes to commit"
git push origin main

# Deploy to Vercel (if using CLI)
cd frontend
vercel --prod

echo "✅ Deployment complete!"
echo "Visit your site at the URL above"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Your Deployment URL

After deployment, your app will be live at:
```
https://solana-saga-[your-username].vercel.app
```

**Update this URL in:**
- [ ] README.md (Live Demo button)
- [ ] WINNING_STRATEGY.md
- [ ] Indie.fun project page
- [ ] Twitter bio
- [ ] GitHub repo description

## Vercel Free Tier Limits

You have:
- ✅ 100GB bandwidth/month (plenty for hackathon)
- ✅ Unlimited projects
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic preview deployments

## Next Steps After Deployment

1. **Create markets** - Use the admin panel to create 10 diverse markets
2. **Generate activity** - Create test wallets and place bets
3. **Record demo video** - Show the LIVE site, not localhost!
4. **Share on Twitter** - "Just launched Solana Saga on @vercel! 🚀"

---

**Remember:** A live, working product is worth 10x more than a localhost demo!

Judges want to click a link and see it work immediately.

**Deploy now. Perfect later.**
