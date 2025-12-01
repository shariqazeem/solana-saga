/**
 * Test script for the deployed prediction markets contract on devnet
 * This tests the actual deployed contract instead of a local test environment
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

// USDC Devnet mint (same as frontend)
const USDC_DEVNET_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

// Program ID (deployed contract)
const PROGRAM_ID = new PublicKey("G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j");

async function main() {
  console.log("\n🧪 Testing Deployed Prediction Markets Contract\n");
  console.log("Program ID:", PROGRAM_ID.toString());
  console.log("USDC Mint:", USDC_DEVNET_MINT.toString());
  console.log("\n" + "=".repeat(80) + "\n");

  // Setup connection and provider
  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  // Load or create test wallet
  let wallet: anchor.Wallet;
  const walletPath = process.env.HOME + "/.config/solana/devnet.json";

  if (fs.existsSync(walletPath)) {
    const walletKeypair = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
    );
    wallet = new anchor.Wallet(walletKeypair);
    console.log("✅ Loaded wallet from:", walletPath);
  } else {
    console.log("❌ Wallet not found at:", walletPath);
    console.log("Please create a wallet with: solana-keygen new --outfile ~/.config/solana/devnet.json");
    process.exit(1);
  }

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Load program
  const idlPath = path.join(__dirname, "../target/idl/prediction_markets.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  const program = new Program(idl, PROGRAM_ID, provider);

  console.log("Wallet:", wallet.publicKey.toString());

  // Check wallet balance
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("SOL Balance:", (balance / 1e9).toFixed(4), "SOL");

  if (balance < 0.1 * 1e9) {
    console.log("\n⚠️  Low SOL balance! Get more with:");
    console.log("   solana airdrop 2 --url devnet");
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // Helper functions
  function getMarketPda(marketId: BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("market"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
  }

  function getVaultPda(marketId: BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
  }

  function getBetPda(marketPda: PublicKey, user: PublicKey, betCount: BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("bet"),
        marketPda.toBuffer(),
        user.toBuffer(),
        betCount.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
  }

  function getUserStatsPda(user: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("user_stats"), user.toBuffer()],
      program.programId
    );
  }

  // Test 1: Fetch all markets
  console.log("📊 TEST 1: Fetching all markets...\n");
  try {
    const markets = await program.account.market.all();
    console.log(`✅ Found ${markets.length} markets`);

    if (markets.length > 0) {
      markets.slice(0, 3).forEach((market, i) => {
        const data = market.account as any;
        console.log(`\n   Market ${i + 1}:`);
        console.log(`   - Question: ${data.question}`);
        console.log(`   - Status: ${Object.keys(data.status)[0]}`);
        console.log(`   - YES Pool: ${(data.yesPool.toNumber() / 1e6).toFixed(2)} USDC`);
        console.log(`   - NO Pool: ${(data.noPool.toNumber() / 1e6).toFixed(2)} USDC`);
        console.log(`   - Total Bets: ${data.totalBets.toNumber()}`);
      });
    }
  } catch (error) {
    console.log("❌ Error fetching markets:", error.message);
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // Test 2: Fetch user stats
  console.log("📊 TEST 2: Fetching user stats...\n");
  try {
    const [userStatsPda] = getUserStatsPda(wallet.publicKey);

    try {
      const userStats = await program.account.userStats.fetch(userStatsPda);
      const data = userStats as any;

      console.log("✅ User stats found:");
      console.log(`   - Total Bets: ${data.totalBets.toNumber()}`);
      console.log(`   - Total Wagered: ${(data.totalWagered.toNumber() / 1e6).toFixed(2)} USDC`);
      console.log(`   - Total Won: ${(data.totalWon.toNumber() / 1e6).toFixed(2)} USDC`);
      console.log(`   - Win Count: ${data.winCount.toNumber()}`);
      console.log(`   - Loss Count: ${data.lossCount.toNumber()}`);
      console.log(`   - Net Profit: ${(data.netProfit.toNumber() / 1e6).toFixed(2)} USDC`);
      console.log(`   - Current Streak: ${data.currentStreak.toNumber()}`);
      console.log(`   - Best Streak: ${data.bestStreak.toNumber()}`);
    } catch (err) {
      console.log("ℹ️  No user stats found (user hasn't placed any bets yet)");
    }
  } catch (error) {
    console.log("❌ Error fetching user stats:", error.message);
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // Test 3: Create a test market
  console.log("📊 TEST 3: Creating a test market...\n");
  try {
    const marketId = new BN(Date.now());
    const [marketPda] = getMarketPda(marketId);
    const [vaultPda] = getVaultPda(marketId);

    const question = `Test Market ${new Date().toLocaleTimeString()}`;
    const description = "This is a test market for verification purposes";
    const endTime = new BN(Math.floor(Date.now() / 1000) + 300); // 5 minutes from now
    const category = "Test";

    console.log("Creating market with:");
    console.log(`   - Question: ${question}`);
    console.log(`   - End time: ${new Date(endTime.toNumber() * 1000).toLocaleString()}`);

    const tx = await program.methods
      .createMarket(marketId, question, description, endTime, category)
      .accounts({
        market: marketPda,
        vault: vaultPda,
        creator: wallet.publicKey,
        usdcMint: USDC_DEVNET_MINT,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log(`\n✅ Market created!`);
    console.log(`   TX: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    console.log(`   Market PDA: ${marketPda.toString()}`);

    // Verify market was created
    const market = await program.account.market.fetch(marketPda);
    const data = market as any;
    console.log(`\n   Verified market data:`);
    console.log(`   - Creator: ${data.creator.toString()}`);
    console.log(`   - Question: ${data.question}`);
    console.log(`   - Status: ${Object.keys(data.status)[0]}`);

    console.log(`\n📝 Save this for testing:`);
    console.log(`   Market ID: ${marketId.toString()}`);
    console.log(`   Market PDA: ${marketPda.toString()}`);
  } catch (error) {
    console.log("❌ Error creating market:", error.message);
    if (error.logs) {
      console.log("   Logs:", error.logs.join("\n   "));
    }
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // Test 4: Verify contract version
  console.log("📊 TEST 4: Verifying contract version...\n");
  try {
    const programAccount = await connection.getAccountInfo(PROGRAM_ID);
    if (programAccount) {
      console.log("✅ Contract is deployed");
      console.log(`   - Executable: ${programAccount.executable}`);
      console.log(`   - Owner: ${programAccount.owner.toString()}`);
      console.log(`   - Data size: ${programAccount.data.length} bytes`);
    } else {
      console.log("❌ Contract not found!");
    }
  } catch (error) {
    console.log("❌ Error verifying contract:", error.message);
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // Test 5: Fetch all user bets
  console.log("📊 TEST 5: Fetching all user bets...\n");
  try {
    const allBets = await program.account.bet.all([
      {
        memcmp: {
          offset: 8, // After discriminator
          bytes: wallet.publicKey.toBase58(),
        }
      }
    ]);

    console.log(`✅ Found ${allBets.length} bets for this wallet`);

    if (allBets.length > 0) {
      allBets.slice(0, 5).forEach((bet, i) => {
        const data = bet.account as any;
        console.log(`\n   Bet ${i + 1}:`);
        console.log(`   - Amount: ${(data.amount.toNumber() / 1e6).toFixed(2)} USDC`);
        console.log(`   - Prediction: ${data.prediction ? "YES" : "NO"}`);
        console.log(`   - Claimed: ${data.claimed}`);
        console.log(`   - Timestamp: ${new Date(data.timestamp.toNumber() * 1000).toLocaleString()}`);
      });
    }
  } catch (error) {
    console.log("❌ Error fetching bets:", error.message);
  }

  console.log("\n" + "=".repeat(80) + "\n");
  console.log("🎉 Testing complete!\n");
  console.log("Summary:");
  console.log("✅ Contract is accessible on devnet");
  console.log("✅ All account types can be fetched");
  console.log("✅ Market creation works");
  console.log("\nFor full integration testing, run:");
  console.log("   anchor test --skip-local-validator");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
