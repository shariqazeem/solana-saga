# 🧪 Testing Guide for Prediction Markets

This guide explains how to test your Solana prediction markets contract using the comprehensive test suite.

## 📋 Overview

We've created two types of tests:

1. **Comprehensive Anchor Tests** (`tests/prediction-markets.ts`) - Full integration tests that create a local test environment
2. **Deployed Contract Tests** (`scripts/test-deployed-contract.js`) - Tests that work with the already-deployed contract on devnet

## 🚀 Quick Start - Test Deployed Contract

The easiest way to test is using the deployed contract test script:

### Step 1: Setup Wallet

```bash
# Create a devnet wallet if you don't have one
solana-keygen new --outfile ~/.config/solana/devnet.json

# Or copy your existing wallet to /root/.config/solana/
cp ~/.config/solana/devnet.json /root/.config/solana/devnet.json

# Set config to devnet
solana config set --url devnet

# Airdrop some SOL for testing
solana airdrop 2 --url devnet
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

## 🔗 Useful Links

- **Contract on Solana Explorer**: https://explorer.solana.com/address/G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j?cluster=devnet
- **Anchor Documentation**: https://www.anchor-lang.com/docs
- **Solana Web3.js Docs**: https://solana-labs.github.io/solana-web3.js/

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
