# 💰 How to Get Test USDC on Solana Devnet

To test the betting functionality in Solana Saga, you'll need test USDC on Devnet. Here are multiple methods to get it:

## Method 1: Using Solana CLI (Recommended)

The quickest way is to mint USDC directly to your wallet using Solana CLI:

### Step 1: Ensure you have Solana CLI and SPL Token CLI installed

```bash
# Check if you have spl-token installed
spl-token --version

# If not installed:
cargo install spl-token-cli
```

### Step 2: Set your network to Devnet

```bash
solana config set --url devnet
```

### Step 3: Airdrop some SOL for transaction fees

```bash
solana airdrop 2
```

### Step 4: Create your USDC token account (if you don't have one)

```bash
spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

**USDC Devnet Mint Address:** `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

### Step 5: Mint test USDC to your wallet

Unfortunately, you cannot directly mint USDC on Devnet as it's controlled by Circle. However, you can:

## Method 2: Using SPL Token Faucet (Web-Based)

Visit these faucets to get test USDC:

### Option A: SPL Token Faucet

1. Go to: **https://spl-token-faucet.com/**
2. Connect your wallet (make sure it's on Devnet)
3. Search for "USDC" or paste the mint address: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
4. Request tokens (usually 10-100 USDC per request)
5. Confirm the transaction in your wallet

### Option B: Solana Faucet (for SOL)

1. Go to: **https://faucet.solana.com/**
2. Enter your wallet address
3. Select "Devnet"
4. Click "Airdrop"

## Method 3: Transfer from Another Devnet Wallet

If you have another wallet with Devnet USDC, you can transfer some:

```bash
spl-token transfer 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU <amount> <recipient-address> --fund-recipient --allow-unfunded-recipient
```

## Method 4: Manual Token Account Creation + Testing

If you want to test without real USDC, you can create your own test token for local testing:

### Create a new test token

```bash
# Create a new token mint
spl-token create-token --decimals 6

# This will output a token mint address, use it in the next step
# Example output: Creating token AbC123...

# Create your token account
spl-token create-account <YOUR_TOKEN_MINT>

# Mint yourself some tokens (e.g., 10,000)
spl-token mint <YOUR_TOKEN_MINT> 10000

# Check your balance
spl-token balance <YOUR_TOKEN_MINT>
```

**Note:** This creates a custom token, NOT official USDC. You'd need to update your app to use this mint address instead.

## Method 5: Use Test Scripts

I've prepared a script to help you get test funds. Run this from the `prediction-markets-contracts` directory:

```bash
cd prediction-markets-contracts
```

Create a file `scripts/get-test-funds.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

const USDC_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

async function getTestFunds() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = anchor.AnchorProvider.env().wallet;

  console.log("Wallet:", wallet.publicKey.toString());

  // Airdrop SOL for transaction fees
  console.log("Requesting SOL airdrop...");
  const airdropSig = await connection.requestAirdrop(
    wallet.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSig);
  console.log("✅ Received 2 SOL");

  // Check if USDC account exists, create if not
  console.log("Checking USDC token account...");
  try {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet.payer,
      USDC_DEVNET,
      wallet.publicKey
    );
    console.log("✅ USDC Token Account:", tokenAccount.address.toString());
  } catch (error) {
    console.log("Note: Could not create/access USDC account. You may need to use a faucet.");
  }

  console.log("\n📝 Next steps:");
  console.log("1. Visit https://spl-token-faucet.com/");
  console.log("2. Connect your wallet (make sure it's on Devnet!)");
  console.log("3. Request USDC using mint address:", USDC_DEVNET.toString());
  console.log("4. You should receive 10-100 test USDC");
}

getTestFunds().catch(console.error);
```

Then run:

```bash
npx ts-node scripts/get-test-funds.ts
```

## Verifying Your USDC Balance

### Using Wallet UI

1. Open your wallet (Phantom/Solflare)
2. Ensure you're on **Devnet**
3. Check your token list for USDC
4. If you don't see it, you may need to manually add the token using the mint address

### Using Solana Explorer

1. Go to: https://explorer.solana.com/?cluster=devnet
2. Search for your wallet address
3. Check the "Tokens" tab
4. Look for USDC (mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU)

### Using CLI

```bash
spl-token accounts 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

## Testing the Betting Flow

Once you have test USDC:

1. **Start the frontend**: `cd frontend && npm run dev`
2. **Connect wallet**: Click "Connect Wallet" and select your wallet
3. **Navigate to Markets**: Go to the Markets page
4. **Select a market**: Click on any of the 5 demo markets
5. **Place a bet**:
   - Choose YES or NO
   - Enter amount (minimum 1 USDC)
   - Click "Place Bet"
   - Approve the transaction in your wallet
6. **Verify**: Transaction should appear on Solana Explorer

## Troubleshooting

### "Insufficient funds" error

- Make sure you have enough SOL for transaction fees (at least 0.01 SOL)
- Verify you have USDC in your account: `spl-token balance 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

### "Account not found" error

- Create your USDC token account first:
  ```bash
  spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
  ```

### Wallet not on Devnet

- Open wallet settings
- Change network to "Devnet"
- Refresh the page

### Can't find USDC in wallet

- Manually add the token in your wallet:
  - Click "Add Token" or "Import Token"
  - Paste mint address: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
  - Token should appear as "USDC"

## Important Notes

- ⚠️ **Devnet tokens have NO real value** - they're for testing only
- ⚠️ **Don't use real money** - this is a test environment
- ⚠️ **Devnet can be reset** - your test tokens may disappear
- ✅ **Test extensively** - make sure everything works before mainnet

## Ready to Test?

Once you have test USDC:

1. ✅ Copy the IDL file: `cp prediction-markets-contracts/target/idl/prediction_markets.json frontend/lib/solana/idl/`
2. ✅ Start the dev server: `cd frontend && npm run dev`
3. ✅ Connect your wallet (on Devnet!)
4. ✅ Place your first bet!

---

**Need help?** Check the browser console for error messages or refer to `TESTING_GUIDE.md` for more detailed testing instructions.
