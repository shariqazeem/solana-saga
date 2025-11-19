# 🧪 Testing Guide - Solana Saga Prediction Markets

## Prerequisites Completed ✅
- ✅ Smart contracts deployed to Devnet: `EhMD2NdBfgsrJmXUgxWwpQrWbAockZ4GAs5G5NkwCmsa`
- ✅ 5 demo markets created on-chain
- ✅ Frontend configured with environment variables
- ✅ Wallet connection functionality integrated

## Step 1: Copy the IDL File

The frontend needs the Anchor IDL to communicate with your deployed smart contract.

```bash
# From the root of the project
cp prediction-markets-contracts/target/idl/prediction_markets.json frontend/lib/solana/idl/
```

**Verify the file exists:**
```bash
ls frontend/lib/solana/idl/prediction_markets.json
```

## Step 2: Start the Frontend Development Server

```bash
cd frontend
npm run dev
# or
yarn dev
```

The app should start at `http://localhost:3000`

## Step 3: Prepare Your Wallet

### Get Devnet SOL
1. Install Phantom or Solflare wallet if you haven't already
2. Switch your wallet to **Devnet** network
3. Get free Devnet SOL from faucet:
   - Visit: https://faucet.solana.com/
   - Or use CLI: `solana airdrop 2`

### Get Devnet USDC (if needed)
The markets use USDC for betting. You may need to:
1. Create a USDC token account on Devnet
2. Request test USDC tokens from: https://spl-token-faucet.com/

## Step 4: Test Wallet Connection

1. Open `http://localhost:3000`
2. Navigate to **Markets** page
3. Click **Connect Wallet** button (top-right)
4. Select your wallet (Phantom/Solflare)
5. Approve the connection
6. **Expected Result**: Button shows your wallet address (abbreviated)

### Troubleshooting:
- If wallet doesn't connect, check browser console for errors
- Ensure wallet is on **Devnet** network
- Try refreshing the page

## Step 5: View Live Markets

1. On the Markets page, you should see the 5 demo markets we created
2. **Currently showing**: Mock data (this is expected for now)
3. **Next step**: We'll integrate real blockchain data

### Expected Markets:
1. "Will SOL hit $300 by Dec 20?"
2. "Will Jupiter reach 10M daily transactions?"
3. "Will Bonk flip Dogecoin this week?"
4. "Will Solana NFT sales exceed 50k this week?"
5. "Will any Solana DEX reach $1B volume today?"

## Step 6: View Market Details

1. Click on any market card or "View Details" button
2. You should see:
   - Market question and description
   - Current YES/NO odds
   - Trading volume and bettor count
   - Time remaining
   - Bet placement interface

## Step 7: Place a Test Bet (Coming Soon)

**NOTE**: The betting functionality requires integration of the blockchain hooks.

Once integrated, the flow will be:
1. Select a market
2. Choose YES or NO
3. Enter bet amount (in USDC)
4. Click "Place Bet"
5. Approve transaction in wallet
6. Wait for confirmation
7. View your bet in "My Bets" section

## Step 8: Verify On-Chain Data

You can verify your deployed contracts and markets on Solana Explorer:

**Program:**
- https://explorer.solana.com/address/EhMD2NdBfgsrJmXUgxWwpQrWbAockZ4GAs5G5NkwCmsa?cluster=devnet

**Markets:**
1. https://explorer.solana.com/address/DtnXvtwV72u5qgf5iUrdchCypxdrL7AjuM2RiXzp7dhF?cluster=devnet
2. https://explorer.solana.com/address/2gkUDX1aZzH5wgXyrNhnsG4NziyyNqxZWVHh4kd8V1Mp?cluster=devnet
3. https://explorer.solana.com/address/zuHSba5JDeMiyzjLVzWrApzrF5QRdgtdpHBRkQyyuwg?cluster=devnet
4. https://explorer.solana.com/address/DPQ5LzMo1u8PBX8MSmR825CpmR1DtHPPguXLSBYHR44n?cluster=devnet
5. https://explorer.solana.com/address/6EZi4mEzCSwt3ga7GjjGHa8BrDfxK6NopurBKQMwKWXG?cluster=devnet

## Next Steps: Integrate Real Blockchain Data

To complete the integration, we need to:

### 1. Update Markets Page to Fetch Real Data
```typescript
// In app/markets/page.tsx
import { usePredictionMarkets } from '@/lib/solana/hooks/usePredictionMarkets';

export default function MarketsPage() {
  const { markets, loading } = usePredictionMarkets();

  // Use real markets data instead of MOCK_MARKETS
}
```

### 2. Implement Bet Placement
```typescript
const { placeBet } = usePredictionMarkets();

const handleBet = async (marketId: string, amount: number, prediction: boolean) => {
  try {
    await placeBet(marketId, amount, prediction);
    // Show success message
  } catch (error) {
    // Handle error
  }
};
```

### 3. Add User Bets Display
Show user's active and historical bets using the `userBets` from the hook.

### 4. Implement Claim Winnings
For resolved markets where user won, allow claiming with `claimWinnings` function.

## Common Issues & Solutions

### Issue: "Cannot find module IDL"
**Solution**: Make sure you copied the IDL file to `frontend/lib/solana/idl/`

### Issue: "Transaction failed"
**Solution**:
- Check you have enough Devnet SOL for transaction fees
- Verify wallet is on Devnet network
- Check browser console for specific error

### Issue: "Wallet not connecting"
**Solution**:
- Refresh page
- Clear browser cache
- Check wallet extension is installed and unlocked
- Ensure wallet is set to Devnet

### Issue: "Markets not loading"
**Solution**:
- Check browser console for errors
- Verify environment variables in `.env.local`
- Ensure RPC endpoint is responsive
- Check program ID matches deployed contract

## Success Criteria

✅ **Wallet Connection**: User can connect Phantom/Solflare wallet
✅ **View Markets**: All 5 demo markets display correctly
✅ **Market Details**: Can view individual market information
🔲 **Place Bet**: Can place a bet and see transaction on explorer
🔲 **View Bets**: Can see personal bet history
🔲 **Claim Winnings**: Can claim winnings from won bets

## Testing Checklist

- [ ] Wallet connects successfully
- [ ] Markets page loads without errors
- [ ] Can navigate to individual market pages
- [ ] Wallet button shows abbreviated address when connected
- [ ] Can switch between different markets
- [ ] Leaderboard page loads correctly
- [ ] All pages maintain neon gaming theme
- [ ] Responsive design works on mobile
- [ ] No console errors in browser dev tools

## Ready for Hackathon Submission

Once testing is complete:
1. ✅ Deploy to Vercel
2. ✅ Record 2-3 minute demo video
3. ✅ Set up Twitter account
4. ✅ Post announcement
5. ✅ Submit to Indie.fun

---

**Need Help?** Check the browser console for error messages and refer to the integration files in `frontend/lib/solana/`.
