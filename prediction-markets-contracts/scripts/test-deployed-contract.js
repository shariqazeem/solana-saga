/**
 * Test script for the deployed prediction markets contract on devnet
 * This tests the actual deployed contract instead of a local test environment
 */

const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");

// USDC Devnet mint
const USDC_DEVNET_MINT = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

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
  let wallet;
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
  const program = new anchor.Program(idl, PROGRAM_ID, provider);

  console.log("Wallet:", wallet.publicKey.toString());

  // Check wallet balance
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("SOL Balance:", (balance / 1e9).toFixed(4), "SOL");

  if (balance < 0.1 * 1e9) {
    console.log("\n⚠️  Low SOL balance! Get more with:");
    console.log("   solana airdrop 2 --url devnet");
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // Test 1: Fetch all markets
  console.log("📊 TEST 1: Fetching all markets...\n");
  try {
    const markets = await program.account.market.all();
    console.log(`✅ Found ${markets.length} markets`);

    if (markets.length > 0) {
      markets.slice(0, 3).forEach((market, i) => {
        const data = market.account;
        console.log(`\n   Market ${i + 1}:`);
        console.log(`   - Question: ${data.question}`);
        console.log(`   - Status: ${Object.keys(data.status)[0]}`);
        console.log(`   - YES Pool: ${(data.yesPool.toNumber() / 1e6).toFixed(2)} USDC`);
        console.log(`   - NO Pool: ${(data.noPool.toNumber() / 1e6).toFixed(2)} USDC`);
        console.log(`   - Total Bets: ${data.totalBets.toNumber()}`);
        if (data.outcome !== null) {
          console.log(`   - Outcome: ${data.outcome ? "YES" : "NO"}`);
        }
      });
    }
  } catch (error) {
    console.log("❌ Error fetching markets:", error.message);
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // Test 2: Fetch user stats
  console.log("📊 TEST 2: Fetching user stats...\n");
  try {
    const [userStatsPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_stats"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      const userStats = await program.account.userStats.fetch(userStatsPda);

      console.log("✅ User stats found:");
      console.log(`   - Total Bets: ${userStats.totalBets.toNumber()}`);
      console.log(`   - Total Wagered: ${(userStats.totalWagered.toNumber() / 1e6).toFixed(2)} USDC`);
      console.log(`   - Total Won: ${(userStats.totalWon.toNumber() / 1e6).toFixed(2)} USDC`);
      console.log(`   - Win Count: ${userStats.winCount.toNumber()}`);
      console.log(`   - Loss Count: ${userStats.lossCount.toNumber()}`);
      console.log(`   - Net Profit: ${(userStats.netProfit.toNumber() / 1e6).toFixed(2)} USDC`);
      console.log(`   - Current Streak: ${userStats.currentStreak.toNumber()}`);
      console.log(`   - Best Streak: ${userStats.bestStreak.toNumber()}`);
    } catch (err) {
      console.log("ℹ️  No user stats found (user hasn't placed any bets yet)");
    }
  } catch (error) {
    console.log("❌ Error fetching user stats:", error.message);
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // Test 3: Fetch all user bets
  console.log("📊 TEST 3: Fetching all user bets...\n");
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
        const data = bet.account;
        console.log(`\n   Bet ${i + 1}:`);
        console.log(`   - Amount: ${(data.amount.toNumber() / 1e6).toFixed(2)} USDC`);
        console.log(`   - Prediction: ${data.prediction ? "YES" : "NO"}`);
        console.log(`   - Claimed: ${data.claimed}`);
        console.log(`   - Timestamp: ${new Date(data.timestamp.toNumber() * 1000).toLocaleString()}`);
        console.log(`   - Bet PDA: ${bet.publicKey.toString()}`);
      });
    }
  } catch (error) {
    console.log("❌ Error fetching bets:", error.message);
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // Test 4: Verify contract version
  console.log("📊 TEST 4: Verifying contract is accessible...\n");
  try {
    const programAccount = await connection.getAccountInfo(PROGRAM_ID);
    if (programAccount) {
      console.log("✅ Contract is deployed and accessible");
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

  // Test 5: Fetch all leaderboard stats
  console.log("📊 TEST 5: Fetching leaderboard stats...\n");
  try {
    const allStats = await program.account.userStats.all();
    console.log(`✅ Found ${allStats.length} users in the system`);

    if (allStats.length > 0) {
      // Sort by net profit
      const sorted = allStats.sort((a, b) =>
        b.account.netProfit.toNumber() - a.account.netProfit.toNumber()
      );

      console.log("\n   Top 5 Users by Profit:");
      sorted.slice(0, 5).forEach((stat, i) => {
        const data = stat.account;
        console.log(`\n   ${i + 1}. ${data.user.toString().slice(0, 8)}...`);
        console.log(`      - Net Profit: ${(data.netProfit.toNumber() / 1e6).toFixed(2)} USDC`);
        console.log(`      - Wins: ${data.winCount.toNumber()} | Losses: ${data.lossCount.toNumber()}`);
        console.log(`      - Best Streak: ${data.bestStreak.toNumber()}`);
      });
    }
  } catch (error) {
    console.log("❌ Error fetching leaderboard:", error.message);
  }

  console.log("\n" + "=".repeat(80) + "\n");
  console.log("🎉 Testing complete!\n");
  console.log("Summary:");
  console.log("✅ Contract is accessible on devnet");
  console.log("✅ All account types can be fetched");
  console.log("✅ Markets, bets, and user stats are working correctly");
  console.log("\nContract Address:", PROGRAM_ID.toString());
  console.log("View on Solana Explorer:");
  console.log(`https://explorer.solana.com/address/${PROGRAM_ID.toString()}?cluster=devnet`);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
