# 🚀 Deploy Your Simplified Contract NOW

## Quick Start - 3 Steps

### Step 1: Install Anchor (if you haven't already)

```bash
# Install AVM (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install Anchor 0.30.1
avm install 0.30.1
avm use 0.30.1

# Verify installation
anchor --version
# Should show: anchor-cli 0.30.1
```

### Step 2: Build & Deploy

```bash
# Navigate to contracts folder
cd prediction-markets-contracts

# Build the contract
anchor build

# Make sure you have SOL for deployment
solana config set --url devnet
solana balance
# If balance is low: solana airdrop 2

# Deploy!
anchor deploy
```

### Step 3: Copy IDL to Frontend

```bash
# Copy the new IDL (interface definition) to frontend
cp target/idl/prediction_markets.json ../frontend/lib/solana/idl/

# Done! Your app now works with the simplified contract
```

## ✅ What Will Work

After deploying, you can:

1. **Create markets** - No changes, works the same
2. **Place bets** - No changes, works the same
3. **Resolve markets** - ✨ **NEW!** Click "✓ YES Won" or "✗ NO Won" → INSTANT!
   - No 100 USDC bond required
   - No 24-hour waiting period
   - Only creator can resolve
   - Users can claim immediately
4. **Claim winnings** - No changes, works the same

## 🔍 Verify It Worked

After deploying:

1. **Check Program ID** matches everywhere:
   ```bash
   # Should all show: G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j
   grep -r "G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j" .
   ```

2. **Test resolution**:
   - Create a market with 1-minute duration
   - Wait for it to end
   - Go to `/admin`
   - Click "✓ YES Won"
   - Should see: "✓ Market instantly resolved as YES! Users can now claim winnings."

## 🐛 If Something Goes Wrong

### Error: "anchor: command not found"

```bash
# Add to PATH
export PATH="$HOME/.avm/bin:$PATH"

# Make permanent
echo 'export PATH="$HOME/.avm/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Error: "Error: Account $PROGRAM_ID is not an upgradeable program"

This means the program is already deployed. Use:

```bash
anchor upgrade target/deploy/prediction_markets.so --program-id G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j
```

### Error: Build fails with Rust errors

```bash
# Update Rust
rustup update stable
rustup default stable

# Try again
anchor build
```

### Error: "insufficient funds"

```bash
# Get more SOL
solana airdrop 2
sleep 5  # Wait a bit
solana airdrop 2

# Check balance
solana balance
```

## 📝 What Changed in the Contract

### Before (Complex):
```rust
// Needed: market, vault, proposer_token_account, proposer, token_program
// Required: 100 USDC bond
// Process: Propose → Wait 24h → Finalize
```

### After (Simple):
```rust
// Needs: market, creator
// Required: Nothing!
// Process: Click button → Done!
```

## 🎯 For Your Demo

When presenting:

> "Our prediction market uses **creator-only instant resolution**. When a market ends, the creator clicks one button and it's instantly resolved. No bonds, no waiting, just simple and fast. Winners can claim their USDC immediately!"

Much better than explaining bonds and challenge periods! 🚀

---

**Questions?** Check the error messages in your terminal or browser console. The new contract is simpler, so there are fewer things that can go wrong!
