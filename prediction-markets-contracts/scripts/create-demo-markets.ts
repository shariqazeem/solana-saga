import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PredictionMarkets } from "../target/types/prediction_markets";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// USDC Devnet mint address
const USDC_DEVNET_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

// Demo markets data
const DEMO_MARKETS = [
  {
    question: "Will SOL hit $300 by Dec 20?",
    description: "This market resolves YES if Solana (SOL) reaches a price of $300 USD or higher on any major CEX (Binance, Coinbase, or Kraken) at any point before December 20, 2025 at 11:59 PM UTC.",
    category: "Price",
    endTime: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
  },
  {
    question: "Will Jupiter reach 10M daily transactions?",
    description: "This market resolves YES if Jupiter aggregator processes 10 million or more transactions in a single 24-hour period before the end date.",
    category: "Volume",
    endTime: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60), // 14 days
  },
  {
    question: "Will Bonk flip Dogecoin this week?",
    description: "This market resolves YES if BONK's market cap exceeds DOGE's market cap at any point within the next 7 days.",
    category: "Meme",
    endTime: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  },
  {
    question: "Will Solana NFT sales exceed 50k this week?",
    description: "This market resolves YES if total NFT sales on Solana (measured across all major marketplaces) exceed 50,000 units in the next 7 days.",
    category: "NFTs",
    endTime: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  },
  {
    question: "Will any Solana DEX reach $1B volume today?",
    description: "This market resolves YES if any single Solana-based DEX (Orca, Raydium, Jupiter, etc.) processes $1 billion or more in trading volume within the next 24 hours.",
    category: "Volume",
    endTime: Math.floor(Date.now() / 1000) + (1 * 24 * 60 * 60), // 1 day
  },
];

async function createDemoMarkets() {
  // Configure the client to use devnet
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PredictionMarkets as Program<PredictionMarkets>;

  console.log("🚀 Creating 5 demo markets on Devnet...\n");
  console.log(`Program ID: ${program.programId.toString()}\n`);

  for (let i = 0; i < DEMO_MARKETS.length; i++) {
    const market = DEMO_MARKETS[i];
    const marketId = Date.now() + i; // Unique market ID based on timestamp

    try {
      console.log(`\n📊 Creating Market ${i + 1}/${DEMO_MARKETS.length}:`);
      console.log(`   Question: ${market.question}`);
      console.log(`   Category: ${market.category}`);
      console.log(`   Market ID: ${marketId}`);

      // Derive PDA addresses
      const [marketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), new anchor.BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), new anchor.BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      console.log(`   Market PDA: ${marketPda.toString()}`);

      // Create market - match the function signature: market_id, question, description, end_time, category
      const tx = await program.methods
        .createMarket(
          new anchor.BN(marketId),
          market.question,
          market.description,
          new anchor.BN(market.endTime),
          market.category
        )
        .accounts({
          market: marketPda,
          vault: vaultPda,
          usdcMint: USDC_DEVNET_MINT,
          creator: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log(`   ✅ Market created!`);
      console.log(`   Market Address: ${marketPda.toString()}`);
      console.log(`   Transaction: ${tx}`);
      console.log(`   View on Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

      // Wait a bit between markets to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`   ❌ Error creating market ${i + 1}:`, error);
    }
  }

  console.log("\n\n🎉 Demo markets creation complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Copy the market addresses above");
  console.log("2. Update your frontend .env.local with these addresses");
  console.log("3. Test betting on these markets!");
}

createDemoMarkets()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
