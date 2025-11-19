# 🧪 SOLANA SAGA - Complete Testing Guide

This guide explains how the prediction market app works and how to test every feature.

---

## 📖 How The App Works

**Solana Saga** is a prediction market where users bet real USDC on YES/NO outcomes.

### **Market Lifecycle:**
1. **Created** - Admin creates a new market with a question and end time
2. **Active** - Users place bets (YES or NO) with USDC
3. **Ended** - Time expires, no more bets allowed
4. **Resolved** - Admin declares the outcome (YES or NO)
5. **Claimed** - Winners claim their USDC winnings

### **How Betting Works:**
- Users bet USDC on either YES or NO
- Odds are determined by the size of each pool (YES pool vs NO pool)
- Example: If $100 is bet on YES and $50 on NO:
  - YES odds: 67% (100/150)
  - NO odds: 33% (50/150)
- Winners split the entire pool proportionally to their bet size
- Losers lose their entire bet

### **Payout Calculation:**
```
Winner's Payout = (Their Bet / Winning Pool) × Total Pool
```

**Example:**
- Total Pool: $150 ($100 YES, $50 NO)
- Outcome: YES wins
- Alice bet $60 on YES → Gets ($60/$100) × $150 = $90
- Bob bet $40 on YES → Gets ($40/$100) × $150 = $60
- Charlie bet $50 on NO → Loses everything

---

## 🎯 Complete Testing Flow

### **Prerequisites**
1. Have 2+ Solana wallets with Devnet SOL
2. Get Devnet USDC from faucet: https://spl-token-faucet.com
3. Run the app: `cd frontend && npm run dev`

---

## **STEP 1: Admin Creates Market**

### Go to Admin Panel
1. Go to http://localhost:3000
2. Click **"Admin"** button
3. Connect your **deployer wallet**

### Create a Test Market
1. Fill in:
   - Question: "Will Bitcoin hit $100k by end of 2025?"
   - Description: "Market resolves YES if BTC reaches $100,000"
   - Category: Crypto
   - Days Until End: 1 (for quick testing)
2. Click **"Create Market"**
3. Copy the market address from success message

**Verify:**
- ✅ Transaction succeeds
- ✅ Market appears in Active Markets
- ✅ Volume = $0, Bets = 0

---

## **STEP 2: Users Place Bets**

### Wallet 1 Bets YES ($10)
1. Connect Wallet 1
2. Go to Markets → Click your market
3. Enter $10, select YES
4. Place Bet

**Verify:**
- ✅ Volume = $10, YES 100%, NO 0%, Bets = 1

### Wallet 2 Bets NO ($5)
1. Connect Wallet 2
2. Same market, $5 on NO
3. Place Bet

**Verify:**
- ✅ Volume = $15, YES ~67%, NO ~33%, Bets = 2

### Wallet 1 Adds MORE YES ($15)
1. Back to Wallet 1
2. Bet $15 on YES

**Verify:**
- ✅ Volume = $30, YES ~83%, NO ~17%, Bets = 3

---

## **STEP 3: View My Bets**

### Check Wallet 1
1. Go to "/my-bets"
2. See 2 active bets totaling $25

### Check Wallet 2
1. Go to "/my-bets"
2. See 1 active bet of $5

---

## **STEP 4: Resolve Market**

### As Admin
1. Wait for market to end (or modify code for instant end)
2. Go to "/admin"
3. Click **"Resolve YES"**
4. Approve transaction

**Verify:**
- ✅ Market moves to Resolved section
- ✅ Shows "Outcome: YES"

---

## **STEP 5: Claim Winnings**

### Wallet 1 (Winner) Claims
1. Go to "/my-bets"
2. See "Claimable Winnings" section
3. Should show ~$30 total (entire pool)
4. Click "Claim Winnings" for each bet
5. Approve transactions

**Verify:**
- ✅ USDC arrives in wallet
- ✅ Bets move to "Claimed" section
- ✅ Stats update correctly

### Wallet 2 (Loser) Checks
1. Go to "/my-bets"
2. See bet in "Lost Bets" section
3. No claim button

**Verify:**
- ✅ Shows $5 lost
- ✅ Cannot claim

---

## **Edge Cases to Test**

1. **Min bet**: Try $0.50 → Fails
2. **Max bet**: Try $10,001 → Fails
3. **Ended market**: Try betting → Fails
4. **Double claim**: Claim twice → Fails
5. **No USDC account**: Auto-creates on first bet

---

## **All Features Work When:**

✅ Create markets
✅ Place bets
✅ Odds update correctly
✅ Resolve markets
✅ Claim winnings
✅ All stats accurate
✅ Edge cases handled

---

## **Ready for Submission!**

Record demo showing full flow:
1. Create market
2. Multiple bets
3. Resolve
4. Claim winnings

Submit to Indie.fun! 🚀
