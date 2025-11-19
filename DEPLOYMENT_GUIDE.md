# 🚀 Deployment Guide - Solana Saga

Complete guide for deploying Solana Saga to production or running locally for demo/testing.

---

## 📋 Table of Contents

1. [Quick Start (Local)](#quick-start-local)
2. [Deploy to Vercel (Recommended)](#deploy-to-vercel)
3. [Deploy Smart Contracts](#deploy-smart-contracts)
4. [Environment Variables](#environment-variables)
5. [Troubleshooting](#troubleshooting)

---

## 🏃 Quick Start (Local)

### Prerequisites

- **Node.js**: 18+ (check with `node -v`)
- **npm**: 9+ (check with `npm -v`)
- **Git**: Latest version

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/shariqazeem/RizqFi.git
cd RizqFi/solana-saga/frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Visit http://localhost:3000
```

**That's it!** The app runs with mock data - no blockchain connection needed for demo.

---

## 🌐 Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy a Next.js app. Free tier works perfectly!

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Set root directory to `solana-saga/frontend`
   - Click "Deploy"

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Add Environment Variables** (if needed)
   - See [Environment Variables](#environment-variables) section

5. **Deploy!**
   - Vercel will build and deploy automatically
   - You'll get a URL like `solana-saga.vercel.app`

### Option 2: Deploy via CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy (from frontend directory)
cd solana-saga/frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? solana-saga
# - Directory? ./
# - Override settings? No

# 4. Deploy to production
vercel --prod
```

---

## 🔗 Deploy Smart Contracts

### Prerequisites

- **Rust**: Latest stable
- **Solana CLI**: 1.18+
- **Anchor**: 0.32.1+
- **SOL tokens**: For devnet/mainnet deployment

### Setup Solana CLI

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Verify installation
solana --version

# Set to devnet
solana config set --url https://api.devnet.solana.com

# Create wallet (or import existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Airdrop SOL for testing
solana airdrop 2
```

### Setup Anchor

```bash
# Install Anchor (via AVM)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.32.1
avm use 0.32.1

# Verify installation
anchor --version
# Should show: anchor-cli 0.32.1
```

### Deploy Prediction Markets Contract

```bash
# Navigate to contracts directory
cd solana-saga/prediction-markets-contracts

# Build the program
anchor build

# Get program ID
solana address -k target/deploy/prediction_markets-keypair.json

# Update Anchor.toml and lib.rs with new program ID
# (Replace the ID in both files)

# Rebuild
anchor build

# Deploy to devnet
anchor deploy

# Note the program ID from output
# Example: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

### Initialize Program

```bash
# Run initialization script (if you have one)
anchor run initialize

# Or manually call initialize instruction via web app
```

---

## 🔧 Environment Variables

### Frontend (.env.local)

Create `solana-saga/frontend/.env.local`:

```bash
# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=devnet
# Options: devnet, testnet, mainnet-beta

# Solana RPC URL
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
# For better performance, use a private RPC:
# - https://www.helius.dev/ (recommended, free tier available)
# - https://www.quicknode.com/

# Program IDs
NEXT_PUBLIC_PREDICTION_MARKET_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
# Replace with your actual deployed program ID

# USDC Mint Address (Devnet)
NEXT_PUBLIC_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Optional: Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://...

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_REAL_BETTING=false
# Set to true when contracts are deployed
```

### Backend / Scripts (.env)

If you add backend scripts, create `.env` in root:

```bash
# Solana
SOLANA_NETWORK=devnet
ANCHOR_WALLET=~/.config/solana/id.json
PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

# Database (if needed)
DATABASE_URL=postgresql://...

# API Keys
ORACLE_API_KEY=...
```

---

## 🎯 Production Deployment Checklist

Before deploying to mainnet:

### Smart Contracts
- [ ] Full security audit completed
- [ ] All tests passing (unit + integration)
- [ ] Program authority set correctly
- [ ] Upgrade authority configured
- [ ] Fee structure finalized
- [ ] Oracle integration tested

### Frontend
- [ ] All environment variables set
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics enabled (Google Analytics)
- [ ] Social meta tags configured
- [ ] Custom domain configured
- [ ] SSL enabled (automatic with Vercel)
- [ ] Performance optimized (Lighthouse score 90+)

### Legal & Compliance
- [ ] Terms of Service added
- [ ] Privacy Policy added
- [ ] Disclaimer about gambling laws
- [ ] Age verification (18+)
- [ ] Geo-blocking if needed

---

## 🚨 Troubleshooting

### Build Errors

**Error: "Cannot find module 'next'"**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 3000 already in use"**
```bash
# Solution: Kill process or use different port
lsof -ti:3000 | xargs kill -9
# Or
npm run dev -- -p 3001
```

**Error: "Failed to fetch fonts from Google"**
```bash
# Solution: This is a build environment issue, not a code issue
# Option 1: Use local fonts instead
# Option 2: Build will succeed in Vercel deployment
```

### Smart Contract Errors

**Error: "Insufficient funds"**
```bash
# Solution: Airdrop more SOL
solana airdrop 2
# Check balance
solana balance
```

**Error: "Program deploy failed"**
```bash
# Solution: Increase compute units
solana program deploy \
  --program-id target/deploy/prediction_markets-keypair.json \
  target/deploy/prediction_markets.so \
  --max-len 500000
```

**Error: "Account does not exist"**
```bash
# Solution: Initialize the program first
anchor run initialize
```

### Wallet Connection Issues

**Phantom not detected:**
- Make sure Phantom extension is installed
- Refresh page
- Check browser console for errors

**Wrong network:**
```javascript
// Ensure app is configured for same network as wallet
// In Phantom: Settings > Developer Settings > Change Network
```

---

## 📊 Performance Optimization

### Frontend

1. **Enable Turbopack** (already configured)
   ```json
   "scripts": {
     "dev": "next dev --turbopack"
   }
   ```

2. **Image Optimization**
   - Use Next.js `<Image>` component
   - Serve images from CDN
   - Use WebP format

3. **Code Splitting**
   - Already automatic with Next.js App Router
   - Use dynamic imports for heavy components

4. **Caching**
   - Configure `Cache-Control` headers
   - Use Vercel Edge Network
   - Enable SWR for data fetching

### Smart Contracts

1. **Optimize Compute Units**
   - Remove unnecessary logs
   - Use efficient data structures
   - Batch transactions when possible

2. **Reduce Account Size**
   - Use compact data types
   - Remove unused fields
   - Use zero-copy deserialization

---

## 🌍 Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `solanasaga.com`)
3. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (~24 hours)
5. SSL certificate auto-generated

---

## 🔐 Security Best Practices

### Frontend
- Never expose private keys
- Validate all user inputs
- Use Content Security Policy
- Enable HTTPS only
- Implement rate limiting

### Smart Contracts
- Use `require!` for all constraints
- Validate signer authority
- Check account ownership
- Implement emergency pause
- Set proper access controls

---

## 📈 Monitoring

### Frontend Monitoring

**Vercel Analytics** (built-in):
- Real-time page views
- Web Vitals (CLS, FID, LCP)
- Geographic distribution

**Sentry** (errors):
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Smart Contract Monitoring

**Solana Explorer**:
- Watch program transactions
- Monitor account balances
- Track error rates

**Custom Monitoring**:
```typescript
// Set up webhooks for program events
import { Connection } from '@solana/web3.js';

const connection = new Connection(rpcUrl);
connection.onProgramAccountChange(
  programId,
  (accountInfo) => {
    // Log to monitoring service
    console.log('Account changed:', accountInfo);
  }
);
```

---

## 📞 Support

**Issues:**
- GitHub Issues: [github.com/shariqazeem/RizqFi/issues](https://github.com/shariqazeem/RizqFi/issues)
- Email: shariqshaukat786@gmail.com

**Community:**
- Twitter: [@SolanaSaga](#)
- Discord: [Solana Saga Community](#)
- Telegram: [t.me/solanasaga](#)

---

## 🎓 Additional Resources

**Solana:**
- [Solana Docs](https://docs.solana.com)
- [Solana Cookbook](https://solanacookbook.com)
- [Anchor Book](https://book.anchor-lang.com)

**Next.js:**
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)

**Web3:**
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

---

**Built for Indie.fun Hackathon 2025** 🎮

Good luck with your deployment! 🚀
