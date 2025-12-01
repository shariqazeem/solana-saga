# 🧪 Testing Guide for Prediction Markets

This guide explains how to test your Solana prediction markets contract using the comprehensive test suite.

## 📋 Overview

We've created two types of tests:

1. **Comprehensive Anchor Tests** (`tests/prediction-markets.ts`) - Full integration tests that create a local test environment
2. **Deployed Contract Tests** (`scripts/test-deployed-contract.js`) - Tests that work with the already-deployed contract on devnet

## 🚀 Quick Start Options

### Option 1: End-to-End Test (Recommended - Full User Journey)

**This simulates the complete user experience** - creating a market, placing bets, resolving, and claiming winnings.

```bash
cd prediction-markets-contracts
node scripts/e2e-test.js
```

This test will:
1. ✅ Create a test market (ends in 2 minutes)
2. ✅ Place multiple YES/NO bets
3. ✅ Wait for market to end
4. ✅ Resolve the market as YES
5. ✅ Claim all winnings
6. ✅ Show final stats and leaderboard

**Duration**: ~3 minutes (includes 2-minute wait for market to end)

**Requirements**:
- At least 0.1 SOL for transaction fees
- At least 10 USDC devnet tokens for betting

### Option 2: Test Deployed Contract (Quick Data Check)

The easiest way to verify existing data:

### Step 1: Setup Wallet & Get Tokens

```bash
# Create a devnet wallet if you don't have one
solana-keygen new --outfile ~/.config/solana/devnet.json

# Set config to devnet
solana config set --url devnet

# Airdrop SOL for transaction fees
solana airdrop 2 --url devnet

# Get USDC devnet tokens (required for E2E test)
# Visit: https://faucet.solana.com/
# Or use the SPL Token Faucet:
#   1. Connect your wallet at https://spl-token-faucet.com/
#   2. Select USDC devnet token
#   3. Request airdrop
```

### Step 2: Run the Test Script

```bash
cd prediction-markets-contracts
node scripts/test-deployed-contract.js
```

This will test:
- ✅ Fetching all markets from the deployed contract
- ✅ Fetching user stats for your wallet
- ✅ Fetching all bets placed by your wallet
- ✅ Verifying the contract is accessible
- ✅ Fetching leaderboard data

### Example Output:

```
🧪 Testing Deployed Prediction Markets Contract

Program ID: G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j
USDC Mint: Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr

📊 TEST 1: Fetching all markets...
✅ Found 12 markets

   Market 1:
   - Question: Will Bitcoin reach $100k by end of 2024?
   - Status: resolved
   - YES Pool: 250.00 USDC
   - NO Pool: 100.00 USDC
   - Total Bets: 8
   - Outcome: YES

📊 TEST 2: Fetching user stats...
✅ User stats found:
   - Total Bets: 15
   - Total Wagered: 500.00 USDC
   - Total Won: 650.00 USDC
   - Win Count: 10
   - Loss Count: 5
   - Net Profit: 150.00 USDC
   - Current Streak: 3
   - Best Streak: 7

🎉 Testing complete!
```

## 🔬 Advanced Testing - Full Anchor Test Suite

For comprehensive integration testing with a local test environment:

### Prerequisites:

1. **Install Anchor** (if not already installed):
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.1
avm use 0.30.1
```

2. **Start Local Validator**:
```bash
solana-test-validator
```

3. **Run Tests**:
```bash
cd prediction-markets-contracts
anchor test --skip-local-validator
```

### What the Full Test Suite Tests:

#### 1️⃣ Market Creation
- ✅ Creates prediction market successfully
- ✅ Verifies all market data is correct
- ✅ Rejects markets with past end times
- ✅ Validates creator permissions

#### 2️⃣ Placing Bets
- ✅ User can bet YES with USDC
- ✅ User can bet NO with USDC
- ✅ Multiple bets from same user work
- ✅ Market pools update correctly
- ✅ User stats track all bets
- ✅ Rejects bets with insufficient USDC

#### 3️⃣ Creator-Only Resolution
- ✅ Only creator can resolve market
- ✅ Non-creator resolution is rejected
- ✅ Market resolves instantly (no bonds)
- ✅ Market is marked as finalized
- ✅ Cannot resolve twice

#### 4️⃣ Claiming Winnings
- ✅ Winners can claim winnings
- ✅ Payout calculation is correct (including fees)
- ✅ Bets marked as claimed
- ✅ Double claims are rejected
- ✅ Losers cannot claim
- ✅ User stats updated (wins/losses)

#### 5️⃣ User Stats Tracking
- ✅ Total bets tracked
- ✅ Total wagered tracked
- ✅ Total won tracked
- ✅ Win/loss count tracked
- ✅ Net profit calculated correctly
- ✅ Win streaks tracked

#### 6️⃣ Complete Market Lifecycle
- ✅ Create → Bet → Wait → Resolve → Claim
- ✅ Multiple markets work independently
- ✅ Different outcomes work correctly

## 📊 Test Results Format

The comprehensive test suite uses Mocha and Chai for testing. You'll see output like:

```
Prediction Markets - Comprehensive Test Suite
  1️⃣  Market Creation
    ✓ Should create a prediction market (2145ms)
    ✓ Should fail to create market with past end time (421ms)

  2️⃣  Placing Bets
    ✓ Should allow user1 to bet YES with 100 USDC (1834ms)
    ✓ Should allow user2 to bet NO with 50 USDC (1723ms)
    ✓ Should allow user1 to place a second bet (1891ms)
    ✓ Should fail to bet with insufficient USDC (567ms)

  3️⃣  Market Resolution (Creator-Only)
    ⏳ Waiting for market to end...
    ✓ Should fail if non-creator tries to resolve (512ms)
    ✓ Should allow creator to resolve market as YES (1456ms)
    ✓ Should fail to resolve an already resolved market (389ms)

  4️⃣  Claiming Winnings
    ✓ Should allow user1 (winner) to claim first bet winnings (2134ms)
    ✓ Should allow user1 to claim second bet winnings (1987ms)
    ✓ Should fail if user1 tries to claim already claimed bet (412ms)
    ✓ Should fail if loser (user2) tries to claim (534ms)

  5️⃣  User Stats Tracking
    ✓ Should correctly track user1 stats (winner) (189ms)
    ✓ Should correctly track user2 stats (loser) (167ms)

  6️⃣  Complete Market Lifecycle (Second Market)
    ✓ Should create second market and resolve as NO (70145ms)

  17 passing (85s)

🎉 All tests completed successfully!
```

## 🐛 Troubleshooting

### Error: "Wallet not found"
```bash
# Create a new wallet
solana-keygen new --outfile ~/.config/solana/devnet.json

# Or copy your existing wallet
cp /path/to/your/wallet.json ~/.config/solana/devnet.json
```

### Error: "Insufficient SOL"
```bash
# Airdrop more SOL
solana airdrop 2 --url devnet

# Wait a bit and try again
sleep 5
solana airdrop 2 --url devnet
```

### Error: "Anchor not found"
```bash
# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.1
avm use 0.30.1
```

### Error: "Cannot find module '@solana/spl-token'"
```bash
# Install dependencies
cd prediction-markets-contracts
npm install
```

## 📝 Writing Your Own Tests

You can add more tests to `tests/prediction-markets.ts`:

```typescript
it("Should test custom functionality", async () => {
  console.log("🧪 Testing custom functionality...");

  // Your test code here
  const result = await program.methods
    .yourMethod()
    .accounts({ /* accounts */ })
    .rpc();

  assert.isTrue(someCondition);
  console.log("✅ Test passed!");
});
```

## 🎮 End-to-End Test Details

The `scripts/e2e-test.js` script simulates the complete user journey:

### What It Does:

```
STEP 1: CREATE A TEST MARKET
├── Creates a market that ends in 2 minutes
├── Verifies market creation
└── Shows market PDA and transaction

STEP 2: PLACE BETS
├── Places 3 bets: 5 USDC YES, 3 USDC NO, 2 USDC YES
├── Updates market pools in real-time
└── Tracks user stats

STEP 3: WAIT FOR MARKET TO END
├── 2-minute countdown timer
└── Ensures market is ended before resolution

STEP 4: RESOLVE THE MARKET
├── Resolves market as YES (creator-only)
├── Verifies resolution and finalization
└── Shows outcome and timestamp

STEP 5: CLAIM WINNINGS
├── Finds all winning bets
├── Claims each winning bet
├── Shows payout amounts
└── Tracks claimed vs unclaimed

STEP 6: CHECK STATS & LEADERBOARD
├── Shows updated user stats
├── Displays leaderboard rankings
└── Verifies all data updates
```

### Example Output:

```
================================================================================
🎮 END-TO-END INTEGRATION TEST - FULL USER JOURNEY
================================================================================

👤 Creator Wallet: 5TY5gts9AktYJMN6S8dGDzjAxmZLbxgbWrhRPpLfxYUD
💰 SOL Balance: 8.1906 SOL

================================================================================
STEP 1: CREATE A TEST MARKET
================================================================================

📊 Creating market...
   Question: 🚀 Will this E2E test pass?
   Ends in: 2 minutes
   Category: Test

✅ Market created successfully!
   TX: 4xJ8Kf7Hn...
   Market PDA: 9Xd2pQ3...

   Verified market data:
   - Status: active
   - YES Pool: 0.00 USDC
   - NO Pool: 0.00 USDC

[... continues through all steps ...]

✅ END-TO-END TEST COMPLETED SUCCESSFULLY!

📋 Test Summary:
   ✅ Market creation
   ✅ Bet placement (YES/NO)
   ✅ Market resolution
   ✅ Claiming winnings
   ✅ Stats tracking
   ✅ Leaderboard updates

🎉 All user features are working correctly!
```

### Requirements:

- **SOL**: At least 0.1 SOL for transaction fees (~0.00001 SOL per transaction × ~10 transactions)
- **USDC**: At least 10 USDC for placing test bets (you get most of it back when you win!)
- **Time**: About 3 minutes total (includes 2-minute wait)

### Getting USDC Devnet Tokens:

Since you need USDC for betting, here are ways to get devnet USDC:

**USDC Mint Address**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

1. **Circle USDC Devnet Faucet** (recommended):
   - Visit https://faucet.circle.com/
   - Connect your Solana wallet
   - Select "Solana Devnet"
   - Request USDC tokens (up to 10,000 USDC per request!)

2. **Solana Faucet**:
   - Visit https://faucet.solana.com/
   - Paste your wallet address
   - Request USDC devnet tokens

3. **SPL Token Faucet**:
   - Visit https://spl-token-faucet.com/
   - Connect your wallet
   - Paste the USDC mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
   - Request tokens

4. **Use your frontend**:
   - Your frontend already handles USDC devnet
   - Just connect and the app will help you get tokens

## 🔗 Useful Links

- **Contract on Solana Explorer**: https://explorer.solana.com/address/G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j?cluster=devnet
- **Anchor Documentation**: https://www.anchor-lang.com/docs
- **Solana Web3.js Docs**: https://solana-labs.github.io/solana-web3.js/
- **Solana Devnet Faucet**: https://faucet.solana.com/
- **SPL Token Faucet**: https://spl-token-faucet.com/

## 🎯 What Each Test Verifies

### Security Tests:
- ✅ Only market creator can resolve
- ✅ Users can only claim their own winnings
- ✅ Losers cannot claim
- ✅ Double claims are prevented
- ✅ Markets can only be resolved once

### Economic Tests:
- ✅ Pool balances update correctly
- ✅ Payout calculations are accurate
- ✅ 2% fee is applied correctly
- ✅ Winners get proportional share

### Data Integrity Tests:
- ✅ User stats track all activity
- ✅ Bet records are immutable (once claimed)
- ✅ Market status updates correctly
- ✅ Timestamps are recorded

## 📋 Test Checklist

Before deploying to production, ensure:

- [ ] All 17 tests pass
- [ ] No console errors
- [ ] Market creation works
- [ ] Betting works (YES and NO)
- [ ] Creator-only resolution works
- [ ] Claim winnings works for winners
- [ ] Losers cannot claim
- [ ] User stats update correctly
- [ ] Multiple markets work independently
- [ ] Frontend integration works
- [ ] Leaderboard displays correctly

## 🚀 Next Steps

1. Run the deployed contract test: `node scripts/test-deployed-contract.js`
2. Verify all existing data looks correct
3. Create a test market from the frontend
4. Place some bets
5. Resolve the market
6. Claim winnings
7. Check the leaderboard

If everything works, you're ready to demo! 🎉
