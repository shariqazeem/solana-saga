# Build and Deploy Instructions

## What Changed?

We've simplified your prediction market contract from a complex decentralized resolution system to a **creator-only instant resolution** model. This makes it:
- ✅ Easier to demo
- ✅ Simpler to test
- ✅ More intuitive for hackathon judges
- ✅ Still secure (only creator can resolve)

## Build & Deploy Steps

### 1. Install Anchor (if not already installed)

```bash
# Install Anchor Version Manager
cargo install --git https://github.com/coral-xyz/anchor avm --force

# Install Anchor CLI (try latest or specific version)
avm install latest
avm use latest

# OR if that fails, try a specific version:
avm install 0.30.1
avm use 0.30.1
```

### 2. Build the Contract

```bash
cd prediction-markets-contracts
anchor build
```

This will compile your Rust contract and generate:
- `target/deploy/prediction_markets.so` (the program binary)
- `target/idl/prediction_markets.json` (the interface definition)

### 3. Deploy to Devnet

```bash
# Make sure you have SOL in your devnet wallet
solana config set --url devnet
solana airdrop 2  # Get some SOL if needed

# Deploy the program
anchor deploy
```

### 4. Update Frontend IDL

After deploying, copy the new IDL to your frontend:

```bash
cp target/idl/prediction_markets.json ../frontend/lib/solana/idl/
```

### 5. Test the New Flow

1. **Create a market** from `/admin` with a short duration (e.g., 1 day)
2. **Place bets** on the market from different wallets (or use the same wallet)
3. **Wait for market to end** (or modify duration to test immediately)
4. **Go to `/admin`** - you'll see the ended market
5. **Click "✓ YES Won" or "✗ NO Won"** - instant resolution!
6. **Go to `/my-bets`** - winners can claim payouts immediately

## What Was Removed?

### From Contract (`lib.rs`):
- ❌ Bond requirements (MIN_RESOLUTION_BOND)
- ❌ Challenge system (2x bond to challenge)
- ❌ 24-hour challenge period
- ❌ `finalize_resolution` function
- ❌ Token transfers for bonds
- ❌ `proposer_token_account` from ResolveMarket accounts

### From Frontend:
- ❌ `finalizeResolution` hook function
- ❌ Bond balance checks
- ❌ Two-step resolution (propose + finalize)
- ❌ Complex resolution UI with bond displays

## New Contract Interface

### Before (Complex):
```rust
pub fn resolve_market(
    ctx: Context<ResolveMarket>,  // Needs: market, vault, proposer_token_account, proposer
    market_id: u64,
    outcome: bool,
) -> Result<()> {
    // Check bond balance
    // Transfer bond to vault
    // Set 24h challenge deadline
    // ...
}
```

### After (Simple):
```rust
pub fn resolve_market(
    ctx: Context<ResolveMarket>,  // Only needs: market, creator
    market_id: u64,
    outcome: bool,
) -> Result<()> {
    // Check creator authorization
    // Instantly resolve market
    // Done!
}
```

## Troubleshooting

### Build Errors

If you get `anchor: command not found`:
```bash
export PATH="$HOME/.avm/bin:$PATH"
echo 'export PATH="$HOME/.avm/bin:$PATH"' >> ~/.bashrc
```

If you get Rust version errors:
```bash
rustup default stable
rustup update
```

If you get `time` crate compilation errors:
```bash
# Try removing the lock file and rebuilding
rm Cargo.lock
anchor build
```

### Deployment Errors

If deployment fails with "insufficient funds":
```bash
solana airdrop 2
# Wait a few seconds, then try again
anchor deploy
```

If program ID mismatch:
```bash
# Your program ID is: G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j
# Make sure it matches in:
# - Anchor.toml
# - lib.rs (declare_id!)
# - frontend config
```

## Demo Flow for Hackathon

1. **Show Market Creation** 📝
   - "Here's our fully on-chain prediction market on Solana"
   - Create market with real question

2. **Show Betting** 💰
   - "Users bet with real USDC using our AMM pricing"
   - Place a few bets, show price updates

3. **Show Leaderboard** 🏆
   - "All stats are real-time from blockchain"
   - Show live user rankings

4. **Show Resolution** ✅
   - "When market ends, creator resolves it instantly"
   - Click one button, done!

5. **Show Payouts** 💸
   - "Winners claim their USDC immediately"
   - Show successful claim transaction

## Questions?

The key improvement: **What the frontend shows now matches exactly what the contract does.** No more confusion, no more waiting periods, just clean instant resolution! 🚀
