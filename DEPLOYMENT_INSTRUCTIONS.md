# 🚀 Deployment Instructions - Decentralized Resolution

## ✅ Smart Contract Changes Complete

I've successfully implemented a **fully decentralized resolution system** for your prediction market! Here's what changed:

### 🔧 What's New:

1. **Anyone Can Propose Outcomes** - No more centralized admin resolver
2. **Economic Incentives** - Proposers must stake 100 USDC bond
3. **Challenge Mechanism** - Anyone can challenge with 2x the current bond
4. **24-Hour Challenge Period** - Ensures fair resolution process
5. **Final Proposer Gets Rewarded** - Bond is returned after successful finalization

### 📋 How It Works:

1. **Market Ends** → Anyone can propose outcome (YES/NO) with 100 USDC bond
2. **Challenge Period** → 24 hours for anyone to challenge with 200 USDC bond
3. **Counter-Challenge** → If challenged, can counter with 400 USDC, etc.
4. **Finalization** → After 24h with no challenges, anyone calls finalize
5. **Winner** → Final proposer gets their bond back + previous challenger's bonds stay in market

---

## 🛠️ Steps to Deploy (Run on Your M1 Mac):

### 1. Pull Latest Changes

```bash
cd ~/path/to/solana-saga
git pull origin claude/build-solnb-014AEhaWpww1jbd3ShideS2M
```

### 2. Build the Smart Contract

```bash
cd prediction-markets-contracts
anchor build
```

### 3. Deploy to Devnet

```bash
# Ensure you have SOL in your devnet wallet
anchor deploy --provider.cluster devnet
```

**Expected Output:**
```
Program Id: EhMD2NdBfgsrJmXUgxWwpQrWbAockZ4GAs5G5NkwCmsa
Deploy success
```

### 4. Copy New IDL to Frontend

```bash
# From the contracts directory
cp target/idl/prediction_markets.json ../frontend/lib/solana/idl/
```

### 5. Verify IDL Update

Check that the new IDL includes these new instructions:
- `finalize_resolution` - New instruction for finalizing after challenge period

And new Market fields:
- `resolution_proposer` - Who proposed the current resolution
- `resolution_bond` - Current bond amount staked
- `challenge_deadline` - When challenge period ends
- `is_finalized` - True after challenge period with no disputes

---

## 🚨 Important Notes:

### ⚠️ Breaking Changes:

Since we added new fields to the Market account, you have **two options**:

**Option A: Fresh Start (Recommended for Hackathon)**
1. Deploy with a new Program ID
2. Create fresh markets
3. Test the full decentralized flow

**Option B: Upgrade Existing Markets**
- Would require migration scripts
- More complex, not recommended for hackathon timeline

### 💡 Recommendation:

For the hackathon, go with **Option A** - deploy fresh:

```bash
# Generate new keypair
solana-keygen new -o new-program-keypair.json

# Update Anchor.toml with new program ID
# [programs.devnet]
# prediction_markets = "<NEW_PROGRAM_ID>"

# Update lib.rs declare_id
# declare_id!("<NEW_PROGRAM_ID>");

# Build and deploy
anchor build
anchor deploy
```

---

## 🧪 After Deployment:

Once deployed, I'll help you:
1. ✅ Update frontend with new IDL
2. ✅ Modify admin panel for decentralized resolution UI
3. ✅ Add finalize button for anyone to call
4. ✅ Update testing guide

Let me know when the deployment is complete!
