# 🚀 Solana Saga - Complete Deployment Guide for M1 Mac

This guide will walk you through deploying your Solana prediction markets smart contracts to Devnet and connecting your Neon Arena frontend. **Follow each step carefully!**

---

## 📦 Part 1: Deploy Smart Contracts to Devnet

### Step 1: Navigate to contracts directory

```bash
cd ~/solana-saga/prediction-markets-contracts
```

### Step 2: Configure Solana CLI for Devnet

```bash
# Set network to Devnet
solana config set --url https://api.devnet.solana.com

# Verify configuration
solana config get

# Check your wallet address
solana address

# Check your SOL balance
solana balance
```

### Step 3: Airdrop SOL for deployment

You'll need approximately 4-5 SOL for deployment. Run these commands:

```bash
solana airdrop 2
sleep 5
solana airdrop 2
sleep 5
solana airdrop 2

# Verify balance (should be around 6 SOL)
solana balance
```

**Note**: If airdrop fails with rate limit error, wait 2-3 minutes and try again, or use the [Solana Devnet Faucet](https://faucet.solana.com/).

### Step 4: Build the program

```bash
anchor build
```

This will:
- Compile your Rust smart contracts
- Generate TypeScript types in `target/types/`
- Create the program binary

**Expected output**: Should complete without errors. Takes 1-2 minutes.

### Step 5: Deploy to Devnet

```bash
anchor deploy
```

**🔴 CRITICAL: Save the Program ID!**

After deployment, you'll see output like:

```
Program Id: AbC123XyZ789mN4pQ5rS6tU7vW8xY9zA1bC2dE3fG4h
```

**📝 Copy and save this Program ID somewhere safe** - you'll need it in Part 3!

### Step 6: Verify deployment

```bash
# Check program account (replace with YOUR Program ID)
solana program show <YOUR_PROGRAM_ID>

# You should see: "Program Id", "Owner", "Data Length", etc.
```

---

## 🎯 Part 2: Create 5 Demo Markets

### Step 1: Run the demo markets script

Make sure you're still in the `prediction-markets-contracts` directory:

```bash
# Make sure you're in the right directory
pwd
# Should show: /Users/your-username/solana-saga/prediction-markets-contracts

# Run the demo markets creation script
anchor run create-demo-markets
```

This will create 5 demo markets:
1. "Will SOL hit $300 by Dec 20?" (30 days)
2. "Will Jupiter reach 10M daily transactions?" (14 days)
3. "Will Bonk flip Dogecoin this week?" (7 days)
4. "Will Solana NFT sales exceed 50k this week?" (7 days)
5. "Will any Solana DEX reach $1B volume today?" (1 day)

**🔴 CRITICAL: Save all 5 Market Addresses!**

The script will output something like:

```
📊 Creating Market 1/5:
   Question: Will SOL hit $300 by Dec 20?
   Category: Price
   ✅ Market created!
   Market Address: DeFg456Abc789XyZ123mN4pQ5rS6tU7vW8xY9zA1bC2
   Transaction: tx123abc...

📊 Creating Market 2/5:
   Question: Will Jupiter reach 10M daily transactions?
   ...
```

**📝 Copy all 5 market addresses** and save them like this:

```
Market 1: DeFg456Abc...
Market 2: Gh8Ij9Kl0M...
Market 3: Nop1Qr2St3...
Market 4: Uv4Wx5Yz6A...
Market 5: Bcd7Ef8Gh9...
```

---

## 🔌 Part 3: Connect Frontend to Deployed Contracts

### Step 1: Navigate to frontend directory

```bash
cd ~/solana-saga/frontend
```

### Step 2: Update environment variables

Edit the `.env.local` file and update with YOUR values:

```bash
# Open the file in your favorite editor
nano .env.local
# or
code .env.local
# or
vim .env.local
```

Replace the placeholder values:

```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com

# 🔴 REPLACE with YOUR Program ID from Part 1, Step 5
NEXT_PUBLIC_PROGRAM_ID=AbC123XyZ789mN4pQ5rS6tU7vW8xY9zA1bC2dE3fG4h

# 🔴 REPLACE with YOUR 5 Market Addresses from Part 2, Step 1
NEXT_PUBLIC_MARKET_1=DeFg456Abc789XyZ123mN4pQ5rS6tU7vW8xY9zA1bC2
NEXT_PUBLIC_MARKET_2=Gh8Ij9Kl0Mn1Op2Qr3St4Uv5Wx6Yz7Ab8Cd9Ef0Gh1
NEXT_PUBLIC_MARKET_3=Nop1Qr2St3Uv4Wx5Yz6Ab7Cd8Ef9Gh0Ij1Kl2Mn3Op
NEXT_PUBLIC_MARKET_4=Uv4Wx5Yz6Ab7Cd8Ef9Gh0Ij1Kl2Mn3Op4Qr5St6Uv7
NEXT_PUBLIC_MARKET_5=Bcd7Ef8Gh9Ij0Kl1Mn2Op3Qr4St5Uv6Wx7Yz8Ab9Cd
```

Save and close the file.

### Step 3: Copy IDL to frontend

The frontend needs the contract IDL (Interface Definition Language) to interact with your program:

```bash
# From the frontend directory
mkdir -p lib/solana
cp ../prediction-markets-contracts/target/idl/prediction_markets.json ./lib/solana/
```

Verify it was copied:

```bash
ls -la lib/solana/prediction_markets.json
# Should show the file exists
```

### Step 4: Install dependencies (if needed)

```bash
npm install
```

### Step 5: Start the development server

```bash
npm run dev
```

You should see:

```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Starting...
✓ Ready in 2.3s
```

**🎉 Your app is now running!** Open http://localhost:3000

---

## 🧪 Part 4: Test the Full Integration

### Step 1: Open the app

Navigate to `http://localhost:3000` in your browser (Chrome or Brave recommended).

### Step 2: Connect your wallet

1. Click "Connect Wallet" button in the top right
2. Select **Phantom** or **Solflare**
3. Approve the connection
4. **🔴 IMPORTANT: Switch your wallet to Devnet**

**To switch Phantom to Devnet:**
- Click the Phantom extension
- Settings (gear icon)
- Developer Settings
- Testnet Mode → **Enable**
- Select "Devnet"

**To switch Solflare to Devnet:**
- Click settings
- Network → Select "Devnet"

### Step 3: Airdrop Devnet SOL to your wallet

```bash
# Get your wallet address (shown in the app after connecting)
# Or check it with:
solana address

# Airdrop 2 SOL to your wallet
solana airdrop 2 <YOUR_WALLET_ADDRESS>

# Example:
solana airdrop 2 8Bx...xyz
```

Check your wallet - you should now have ~2 SOL on Devnet.

### Step 4: Browse markets

1. Click "Explore Markets" or go to the Markets page
2. You should see your 5 demo markets loaded from the blockchain
3. Each market should show:
   - Question
   - Category badge
   - YES/NO percentages
   - Time remaining

**🔴 If markets don't show:**
- Check browser console (F12) for errors
- Verify `.env.local` has correct addresses
- Restart dev server: `npm run dev`

### Step 5: Place your first bet!

1. Select any market (click "View Details" or the YES/NO buttons)
2. Select YES or NO side
3. Enter amount: **0.1 SOL** (start small for testing)
4. Click "Place Bet"
5. Approve transaction in your wallet

**Expected result:**
- Transaction should complete in 1-2 seconds
- Your wallet balance decreases by 0.1 SOL
- Market pools update
- You see success message

### Step 6: View transaction on Solana Explorer

After placing a bet, copy the transaction signature from the success message or console.

Visit:
```
https://explorer.solana.com/tx/<TRANSACTION_SIGNATURE>?cluster=devnet
```

You should see:
- Transaction details
- Instructions
- Account inputs
- Success status

---

## 📊 Part 5: Monitoring & Debugging

### View your Program on Solana Explorer

```
https://explorer.solana.com/address/<YOUR_PROGRAM_ID>?cluster=devnet
```

### View a Market account

```
https://explorer.solana.com/address/<MARKET_ADDRESS>?cluster=devnet
```

### Watch program logs in real-time

Open a new terminal and run:

```bash
solana logs <YOUR_PROGRAM_ID>
```

Leave this running while you interact with the app to see all program activity!

### Frontend console logs

Open browser DevTools:
- **Chrome/Brave**: Press F12 or Cmd+Option+I
- Go to **Console** tab

You'll see:
- Wallet connection status
- Transaction signatures
- Market data fetches
- Any errors

---

## 🐛 Common Issues & Solutions

### Issue: "Program not deployed" or "Invalid program ID"

**Symptoms**: Markets don't load, or you see errors about program not found.

**Solution**:
1. Check that `.env.local` has the correct Program ID
2. Verify on Solana Explorer that program exists on Devnet
3. Make sure Solana CLI is on Devnet: `solana config get`

### Issue: "Insufficient funds" when placing bet

**Symptoms**: Transaction fails with "insufficient lamports" error.

**Solutions**:
1. Check wallet balance: should have at least 0.5 SOL
2. Airdrop more: `solana airdrop 2 <YOUR_WALLET_ADDRESS>`
3. Make sure you're on Devnet (mainnet SOL won't work!)

### Issue: "Transaction simulation failed"

**Possible causes:**
1. Market has already ended
2. Invalid bet amount (too small or too large)
3. Not enough SOL in wallet
4. Wrong network (wallet on mainnet, app on devnet)

**Solutions**:
1. Check market end time hasn't passed
2. Try amount between 0.1 - 1 SOL
3. Airdrop more SOL
4. Verify wallet network matches app network

### Issue: "Cannot find module '@/lib/solana/config'"

**Solution**:

```bash
# Make sure all integration files were created
ls -la lib/solana/

# You should see:
# - config.ts
# - prediction_markets.json
# - hooks/usePredictionMarkets.ts

# If missing, re-run git pull to get latest files
```

### Issue: Markets showing but data looks wrong

**Symptoms**: Markets show placeholder data instead of real blockchain data.

**Solution**:
1. Open browser console (F12)
2. Look for errors fetching market data
3. Verify market addresses in `.env.local` are correct
4. Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)

### Issue: Wallet connects but then disconnects

**Solutions**:
1. Make sure wallet is unlocked
2. Make sure wallet is on Devnet (not mainnet)
3. Try disconnecting and reconnecting
4. Refresh the page and try again

### Issue: "RPC request failed" or "429 Too Many Requests"

**Symptoms**: Operations fail intermittently.

**Solution**: Public RPC can be rate-limited. For better reliability:

```env
# In .env.local, use a better RPC endpoint:
NEXT_PUBLIC_SOLANA_RPC_HOST=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# Get free API key at: https://www.helius.dev/
```

---

## ✅ Success Checklist

Before moving forward, verify:

- [ ] Smart contract deployed to Devnet ✅
- [ ] Program ID saved and added to `.env.local` ✅
- [ ] 5 demo markets created ✅
- [ ] All 5 market addresses saved and added to `.env.local` ✅
- [ ] IDL file copied to `frontend/lib/solana/` ✅
- [ ] Frontend dev server running ✅
- [ ] Wallet connects successfully ✅
- [ ] Wallet on Devnet (not mainnet) ✅
- [ ] Markets load from blockchain ✅
- [ ] Can place bets successfully ✅
- [ ] Transactions visible on Solana Explorer ✅
- [ ] No errors in browser console ✅

---

## 🎉 Next Steps: Deploy to Production

Once everything works locally on Devnet, you're ready to deploy!

### 1. Deploy Frontend to Vercel

```bash
cd frontend

# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel

# Follow prompts, then deploy to production:
vercel --prod
```

**🔴 IMPORTANT**: Add environment variables in Vercel dashboard:
- Go to your project → Settings → Environment Variables
- Add all variables from `.env.local`
- Redeploy for changes to take effect

### 2. Create Demo Video (2-3 minutes)

Record a walkthrough showing:
- ✅ The stunning Neon Arena UI
- ✅ Wallet connection
- ✅ Browsing markets
- ✅ Placing a bet (show the whole flow)
- ✅ Transaction on Solana Explorer
- ✅ Leaderboard with your bet

**Tools**: QuickTime (Mac), OBS Studio (free), or Loom

### 3. Set Up Twitter/X

Create account and post launch announcement:

```
🎮 Introducing Solana Saga - The Neon Arena 🔥

The most addictive prediction market game on @solana

✨ Premium gaming UI with neon effects
⚡️ Lightning-fast bets on Solana
🏆 Real-time leaderboard
💰 AMM-powered markets

Built for @indie_fun hackathon

Try it: [your-vercel-url]

#Solana #Web3Gaming #PredictionMarkets
```

Attach your demo video!

### 4. Submit to Indie.fun

Prepare your submission:

**Required**:
- [ ] GitHub repo link (make repo public!)
- [ ] Live demo URL (Vercel deployment)
- [ ] 2-3 minute demo video
- [ ] Description of unique features

**Highlights for submission**:
- 🎨 **Unique Neon Arena UI** - Premium gaming aesthetic (vs generic purple themes)
- ⚡️ **Solana-powered** - Sub-second bet confirmations
- 🤖 **AMM formula** - Decentralized market-making
- 🏆 **Gamification** - Leaderboard, streaks, achievements
- 📱 **Responsive** - Works on mobile & desktop

### 5. Final QA Checklist

- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test bet placement multiple times
- [ ] Verify all pages load correctly
- [ ] Check that markets show real data
- [ ] Confirm transactions appear on explorer
- [ ] Test wallet disconnect/reconnect
- [ ] Check page load performance (Lighthouse)
- [ ] Verify no console errors
- [ ] Test on different browsers (Chrome, Firefox, Safari)

---

## 🚀 You're Ready to Win!

Your Solana Saga app is now:
- ✅ Fully functional on Devnet
- ✅ Connected to real smart contracts
- ✅ Featuring stunning Neon Arena UI
- ✅ Ready for hackathon submission

**The judges will love:**
1. **Visual Impact**: Your Neon Arena theme stands out immediately
2. **Technical Execution**: Real Solana integration, not just mock data
3. **User Experience**: Smooth, fast, addictive betting flow
4. **Completeness**: Full stack - contracts + beautiful frontend

---

## 💡 Tips for Winning

1. **Make a great demo video** - This is what judges will watch first
2. **Emphasize uniqueness** - Your gaming UI is a major differentiator
3. **Show it works** - Real transactions on Devnet prove it's functional
4. **Clear documentation** - Professional presentation matters
5. **Social proof** - Twitter engagement can help

---

## 📞 Need Help?

If you run into issues:

1. **Check browser console** (F12 → Console tab)
2. **Check Solana logs**: `solana logs <PROGRAM_ID>`
3. **View transaction** on Solana Explorer
4. **Verify all IDs** in `.env.local` are correct
5. **Try restarting** dev server: `npm run dev`

---

## 🔗 Useful Resources

- [Solana Devnet Faucet](https://faucet.solana.com/)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Phantom Wallet](https://phantom.app/)
- [Vercel Documentation](https://vercel.com/docs)

---

## 🏆 Final Words

You've built something special. The Neon Arena UI combined with real Solana smart contracts creates a premium prediction markets experience.

**Remember the key differentiators:**
- **Visual Excellence**: Gaming-grade UI design
- **Technical Depth**: Real blockchain integration
- **User Experience**: Fast, fun, addictive
- **Completeness**: Full-stack implementation

**Now go win that $10K prize! 🚀💰**

Good luck! 🍀

---

**Built for Indie.fun Hackathon 2025**
**Deadline: December 12, 2025**
