# 🚀 Next Steps to Test & Deploy Solana Saga

You're almost ready to test your fully functional prediction markets dApp! Here's what you need to do:

## ✅ What's Already Done

- ✅ **UI Transformation**: Complete Neon Arena gaming theme across all pages
- ✅ **Smart Contracts**: Deployed to Devnet (`EhMD2NdBfgsrJmXUgxWwpQrWbAockZ4GAs5G5NkwCmsa`)
- ✅ **Demo Markets**: 5 markets created and live on Devnet
- ✅ **Wallet Integration**: WalletMultiButton integrated across all pages
- ✅ **Real USDC Betting**: Complete implementation with SPL token support
- ✅ **Environment Config**: `.env.local` configured with deployed addresses
- ✅ **Testing Guides**: Comprehensive documentation created

## 🔥 Critical Next Step: Copy the IDL File

The frontend needs the Anchor IDL to communicate with your deployed smart contract.

**Run this command from the project root:**

```bash
cp prediction-markets-contracts/target/idl/prediction_markets.json frontend/lib/solana/idl/
```

**Verify the file exists:**

```bash
ls -la frontend/lib/solana/idl/prediction_markets.json
```

You should see the file listed. If it doesn't exist, you need to build the contracts first:

```bash
cd prediction-markets-contracts
anchor build
cd ..
# Then copy the IDL again
cp prediction-markets-contracts/target/idl/prediction_markets.json frontend/lib/solana/idl/
```

## 💰 Get Test USDC

You'll need test USDC on Devnet to place bets. See **GET_TEST_USDC.md** for detailed instructions.

**Quick Method:**

1. Ensure wallet is on Devnet
2. Get SOL for fees: https://faucet.solana.com/
3. Get USDC: https://spl-token-faucet.com/
4. Use mint address: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

## 🧪 Test the Betting Flow

### 1. Start the Development Server

```bash
cd frontend
npm run dev
# or
yarn dev
```

The app should start at `http://localhost:3000`

### 2. Connect Your Wallet

1. Open `http://localhost:3000`
2. Click "Connect Wallet" (top-right)
3. Select Phantom or Solflare
4. **IMPORTANT**: Make sure your wallet is on **Devnet**!
5. Approve the connection

### 3. Navigate to a Market

1. Click "Explore Markets" from landing page
2. You should see 5 live markets:
   - "Will SOL hit $300 by Dec 20?"
   - "Will Jupiter reach 10M daily transactions?"
   - "Will Bonk flip Dogecoin this week?"
   - "Will Solana NFT sales exceed 50k this week?"
   - "Will any Solana DEX reach $1B volume today?"

3. Click on any market to view details

### 4. Place a Bet

1. On the market detail page, you'll see:
   - Current odds (YES/NO percentages)
   - Total volume and bets
   - Time remaining

2. In the betting panel (right side):
   - Select YES or NO
   - Enter bet amount (minimum 1 USDC)
   - Or click quick amount buttons: $10, $50, $100, $500

3. Review the calculation:
   - Your bet amount
   - Potential payout
   - Potential ROI
   - Platform fee (2%)

4. Click "Place Bet"

5. Approve the transaction in your wallet

6. Wait for confirmation (usually 2-5 seconds)

7. You should see:
   - Success message with transaction signature
   - Confetti animation 🎉
   - Updated market odds
   - Your bet appears in "Your Bets" section

### 5. Verify on Solana Explorer

Copy the transaction signature from the success message and view it on:

**https://explorer.solana.com/?cluster=devnet**

Paste your transaction signature to see:
- Transaction details
- USDC transfer from your wallet to vault
- Bet account creation
- User stats update

## 📊 Check Your Deployed Markets

View your markets on Solana Explorer:

**Program:**
https://explorer.solana.com/address/EhMD2NdBfgsrJmXUgxWwpQrWbAockZ4GAs5G5NkwCmsa?cluster=devnet

**Markets:**
1. https://explorer.solana.com/address/DtnXvtwV72u5qgf5iUrdchCypxdrL7AjuM2RiXzp7dhF?cluster=devnet
2. https://explorer.solana.com/address/2gkUDX1aZzH5wgXyrNhnsG4NziyyNqxZWVHh4kd8V1Mp?cluster=devnet
3. https://explorer.solana.com/address/zuHSba5JDeMiyzjLVzWrApzrF5QRdgtdpHBRkQyyuwg?cluster=devnet
4. https://explorer.solana.com/address/DPQ5LzMo1u8PBX8MSmR825CpmR1DtHPPguXLSBYHR44n?cluster=devnet
5. https://explorer.solana.com/address/6EZi4mEzCSwt3ga7GjjGHa8BrDfxK6NopurBKQMwKWXG?cluster=devnet

## 🐛 Troubleshooting

### Issue: "Cannot find module 'idl/prediction_markets.json'"

**Solution:** You haven't copied the IDL file. Run:
```bash
cp prediction-markets-contracts/target/idl/prediction_markets.json frontend/lib/solana/idl/
```

### Issue: "Transaction failed: insufficient funds"

**Solutions:**
- Check SOL balance (need ~0.01 SOL for fees): https://faucet.solana.com/
- Check USDC balance: Use wallet UI or `spl-token balance 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- Get more USDC: https://spl-token-faucet.com/

### Issue: Wallet not connecting

**Solutions:**
- Refresh the page
- Ensure wallet extension is installed and unlocked
- Make sure wallet is on **Devnet** network
- Try a different browser

### Issue: Markets not loading

**Solutions:**
- Check browser console for errors (F12)
- Verify `.env.local` has correct program ID
- Ensure RPC endpoint is working: https://api.devnet.solana.com
- Wait a few seconds and refresh

### Issue: "Account does not exist"

**Solution:** Create your USDC token account:
```bash
spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

## ✅ Testing Checklist

Complete this checklist to ensure everything works:

- [ ] IDL file copied to `frontend/lib/solana/idl/`
- [ ] Frontend dev server running
- [ ] Wallet connected (on Devnet)
- [ ] Have test SOL (for fees)
- [ ] Have test USDC (for bets)
- [ ] Markets page loads and shows 5 markets
- [ ] Can navigate to individual market pages
- [ ] Market shows real data from blockchain
- [ ] Can select YES or NO
- [ ] Can enter bet amount
- [ ] Potential payout calculates correctly
- [ ] "Place Bet" button works
- [ ] Transaction confirms successfully
- [ ] Bet appears in "Your Bets" section
- [ ] Transaction visible on Solana Explorer
- [ ] Market odds update after bet

## 🚀 After Testing - Deploy to Production

Once everything works on Devnet:

### 1. Deploy to Vercel

```bash
cd frontend

# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set environment variables:
#   NEXT_PUBLIC_SOLANA_NETWORK=devnet
#   NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com
#   NEXT_PUBLIC_PROGRAM_ID=EhMD2NdBfgsrJmXUgxWwpQrWbAockZ4GAs5G5NkwCmsa
#   (Plus all 5 market addresses)
```

### 2. Record Demo Video

Create a 2-3 minute video showcasing:
- Landing page with Neon Arena theme
- Markets browsing
- Market detail page
- Connecting wallet
- Placing a bet
- Transaction confirmation
- Updated market odds

Use **Loom, OBS, or QuickTime** to record.

### 3. Create Twitter Account

1. Create Twitter account: **@SolanaSagaApp** (or similar)
2. Post announcement:
   ```
   🎮 Introducing Solana Saga - The Future of Prediction Markets! 🚀

   ⚡ Lightning-fast betting on Solana
   💰 Real USDC rewards
   🎨 Stunning Neon Arena UI
   🏆 Compete on the leaderboard

   Try it now: [Your Vercel URL]

   #Solana #Web3 #PredictionMarkets #IndieFun
   ```

### 4. Submit to Hackathon

Go to: **Indie.fun** submission page

Include:
- Project name: **Solana Saga**
- Description: Prediction markets dApp with gaming-inspired UI
- Live demo URL: Your Vercel deployment
- GitHub repo: (Your repo URL)
- Demo video: (YouTube/Loom link)
- Technologies: Solana, Anchor, Next.js 15, TypeScript, Tailwind CSS
- Highlights:
  - Real USDC betting on Devnet
  - 5 live prediction markets
  - AMM-based pricing
  - Neon Arena gaming theme
  - Full wallet integration

**Submission deadline: December 12, 2025**

## 📚 Additional Resources

- **TESTING_GUIDE.md**: Comprehensive testing instructions
- **GET_TEST_USDC.md**: How to get test USDC on Devnet
- **Frontend README**: `/frontend/README.md`
- **Contracts README**: `/prediction-markets-contracts/README.md`

## 🎯 Success Criteria

You're ready for hackathon submission when:

✅ All tests pass
✅ Bets work end-to-end on Devnet
✅ Deployed to Vercel
✅ Demo video recorded
✅ Twitter account created
✅ Submission complete

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Check Solana Explorer for transaction details
3. Review the testing guides
4. Verify all environment variables are set

---

**Let's win this hackathon! 🏆**

You've built something incredible. Now it's time to test, polish, and show it to the world!
