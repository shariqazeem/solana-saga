"use client";

import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import { usePredictionMarkets } from "@/lib/solana/hooks/usePredictionMarkets";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import idl from "@/lib/solana/idl/prediction_markets.json";
import { USDC_MINT } from "@/lib/solana/hooks/usePredictionMarkets";
import { ArrowLeft, Shield, AlertCircle, Check, Plus, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminPage() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { markets, loading: marketsLoading, refetch, resolveMarket: resolveMarketHook, finalizeResolution } = usePredictionMarkets();

  // Create Market Form
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("crypto");
  const [daysUntilEnd, setDaysUntilEnd] = useState("7");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Resolve Market
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolveSuccess, setResolveSuccess] = useState<string | null>(null);

  const createMarket = async () => {
    if (!wallet) {
      setCreateError("Please connect your wallet");
      return;
    }

    if (!question || !description) {
      setCreateError("Please fill in all fields");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const provider = new AnchorProvider(
        connection,
        wallet,
        { commitment: "confirmed" }
      );
      const program = new Program(idl as any, provider);

      // Generate unique market ID based on timestamp
      const marketId = Date.now();

      // Calculate end time
      const days = parseInt(daysUntilEnd);
      const endTime = Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);

      console.log("Creating market...");
      console.log("Market ID:", marketId);
      console.log("Question:", question);
      console.log("End time:", new Date(endTime * 1000).toLocaleString());

      // Derive market PDA
      const [marketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), new BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      // Derive vault PDA
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), new BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      console.log("Market PDA:", marketPda.toString());
      console.log("Vault PDA:", vaultPda.toString());

      const tx = await program.methods
        .createMarket(
          new BN(marketId),
          question,
          description,
          new BN(endTime),
          category
        )
        .accounts({
          market: marketPda,
          vault: vaultPda,
          usdcMint: USDC_MINT,
          creator: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Market created! TX:", tx);
      setCreateSuccess(`Market created! Address: ${marketPda.toString()}`);

      // Reset form
      setQuestion("");
      setDescription("");
      setCategory("crypto");
      setDaysUntilEnd("7");

      // Refresh markets list
      await new Promise(r => setTimeout(r, 2000));
      await refetch();
    } catch (error: any) {
      console.error("Error creating market:", error);
      setCreateError(error.message || "Failed to create market");
    } finally {
      setCreating(false);
    }
  };

  const proposeResolution = async (marketAddress: string, outcome: boolean) => {
    if (!wallet) {
      setResolveError("Please connect your wallet");
      return;
    }

    setResolving(marketAddress);
    setResolveError(null);
    setResolveSuccess(null);

    try {
      const tx = await resolveMarketHook(marketAddress, outcome);
      setResolveSuccess(`Resolution proposed: ${outcome ? "YES" : "NO"}! TX: ${tx.slice(0, 8)}... (24h challenge period started)`);

      // Refresh markets
      await new Promise(r => setTimeout(r, 2000));
      await refetch();
    } catch (error: any) {
      console.error("Error proposing resolution:", error);
      setResolveError(error.message || "Failed to propose resolution");
    } finally {
      setResolving(null);
    }
  };

  // SIMPLIFIED: One-click resolution (for demo/UX)
  const resolveMarketInstant = async (marketAddress: string, outcome: boolean) => {
    if (!wallet) {
      setResolveError("Please connect your wallet");
      return;
    }

    setResolving(marketAddress);
    setResolveError(null);
    setResolveSuccess(null);

    try {
      // Step 1: Propose resolution
      setResolveSuccess(`Resolving market as ${outcome ? "YES" : "NO"}... (Step 1/2)`);
      const tx1 = await resolveMarketHook(marketAddress, outcome);
      console.log("Resolution proposed:", tx1);

      // Wait a bit for blockchain to process
      await new Promise(r => setTimeout(r, 3000));

      // Step 2: Auto-finalize (skip challenge period for demo UX)
      setResolveSuccess(`Resolving market as ${outcome ? "YES" : "NO"}... (Step 2/2)`);

      try {
        const tx2 = await finalizeResolution(marketAddress);
        console.log("Resolution finalized:", tx2);

        setResolveSuccess(`✓ Market resolved as ${outcome ? "YES" : "NO"}! Users can now claim winnings.`);
      } catch (finalizeError: any) {
        // If finalize fails (challenge period not over), show helpful message
        if (finalizeError.message?.includes("challenge") || finalizeError.message?.includes("time")) {
          setResolveSuccess(`✓ Resolution proposed as ${outcome ? "YES" : "NO"}! Will finalize after 24h challenge period.`);
        } else {
          throw finalizeError;
        }
      }

      // Refresh markets
      await new Promise(r => setTimeout(r, 2000));
      await refetch();
    } catch (error: any) {
      console.error("Error resolving market:", error);
      setResolveError(error.message || "Failed to resolve market");
    } finally {
      setResolving(null);
    }
  };

  const finalizeMarket = async (marketAddress: string) => {
    if (!wallet) {
      setResolveError("Please connect your wallet");
      return;
    }

    setResolving(marketAddress);
    setResolveError(null);
    setResolveSuccess(null);

    try {
      const tx = await finalizeResolution(marketAddress);
      setResolveSuccess(`Market finalized! TX: ${tx.slice(0, 8)}...`);

      // Refresh markets
      await new Promise(r => setTimeout(r, 2000));
      await refetch();
    } catch (error: any) {
      console.error("Error finalizing resolution:", error);
      setResolveError(error.message || "Failed to finalize resolution");
    } finally {
      setResolving(null);
    }
  };

  const activeMarkets = markets.filter(m => m.status === "Active");
  const resolvedMarkets = markets.filter(m => m.status === "Resolved");
  const cancelledMarkets = markets.filter(m => m.status === "Cancelled");

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-300 hover:neon-text transition-all font-orbitron">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 neon-text" />
            <span className="font-bold font-orbitron neon-text">Admin Panel</span>
          </div>
        </div>

        {!wallet ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md">
              <Shield className="w-16 h-16 text-slate-600 mx-auto mb-6" />
              <h1 className="text-3xl font-black mb-4 font-orbitron">Admin Access</h1>
              <p className="text-slate-400 mb-8">
                Connect your wallet to access market creation and resolution tools.
              </p>
              <div className="flex justify-center">
                <WalletButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Create Market */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-2xl p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 font-orbitron flex items-center gap-2">
                  <Plus className="w-5 h-5 neon-text" />
                  Create Market
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">Question</label>
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Will Bitcoin hit $100k?"
                      className="w-full glass-card rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#00E5FF] focus:outline-none transition-all font-sans"
                      maxLength={200}
                    />
                    <p className="text-xs text-slate-500 mt-1 text-right">{question.length}/200</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Resolution criteria..."
                      className="w-full glass-card rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#00E5FF] focus:outline-none transition-all font-sans h-32 resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-slate-500 mt-1 text-right">{description.length}/500</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-300">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full glass-card rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] focus:outline-none transition-all font-sans appearance-none"
                      >
                        <option value="crypto">Crypto</option>
                        <option value="sports">Sports</option>
                        <option value="politics">Politics</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-300">Duration (Days)</label>
                      <input
                        type="number"
                        value={daysUntilEnd}
                        onChange={(e) => setDaysUntilEnd(e.target.value)}
                        min="1"
                        max="30"
                        className="w-full glass-card rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] focus:outline-none transition-all font-sans font-numbers"
                      />
                    </div>
                  </div>

                  {createError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-xs text-red-400">{createError}</p>
                    </div>
                  )}

                  {createSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <p className="text-xs text-green-400">{createSuccess}</p>
                    </div>
                  )}

                  <button
                    onClick={createMarket}
                    disabled={creating}
                    className="w-full py-3 neon-button rounded-xl font-bold font-orbitron disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? "Creating..." : "Create Market"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Market Management */}
            <div className="lg:col-span-2 space-y-8">
              {/* Resolution Messages */}
              {resolveError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-400">{resolveError}</span>
                </motion.div>
              )}
              {resolveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3"
                >
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-green-400">{resolveSuccess}</span>
                </motion.div>
              )}

              {/* Active Markets */}
              <div>
                <h2 className="text-xl font-bold mb-6 font-orbitron flex items-center gap-2">
                  <Clock className="w-5 h-5 neon-text" />
                  Active Markets ({activeMarkets.length})
                </h2>

                <div className="space-y-4">
                  {activeMarkets.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-xl">
                      <p className="text-slate-500">No active markets found</p>
                    </div>
                  ) : (
                    activeMarkets.map((market) => (
                      <motion.div
                        key={market.publicKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-xl p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg mb-2">{market.question}</h3>
                            <div className="flex gap-4 text-sm text-slate-400">
                              <span>Vol: <span className="text-white font-numbers">${market.totalVolume.toFixed(2)}</span></span>
                              <span>Bets: <span className="text-white font-numbers">{market.totalBetsCount}</span></span>
                              <span>Ends: <span className="text-white">{market.endsIn}</span></span>
                            </div>
                          </div>
                          <div className="text-xs font-mono text-slate-600 bg-slate-900 px-2 py-1 rounded">
                            {market.publicKey.slice(0, 8)}...
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          {market.endsIn !== "Ended" ? (
                            <div className="flex items-center gap-2 text-yellow-500 text-sm bg-yellow-500/10 px-3 py-2 rounded-lg">
                              <Clock className="w-4 h-4" />
                              Market active - ends in {market.endsIn}
                            </div>
                          ) : !market.isResolved ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 px-3 py-2 rounded-lg mb-3">
                                <Check className="w-4 h-4" />
                                ✓ Market Ended - Ready to Resolve
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => resolveMarketInstant(market.publicKey, true)}
                                  disabled={resolving === market.publicKey}
                                  className="flex-1 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-400 border border-green-500/50 font-bold py-3 px-4 rounded-lg transition-all text-sm shadow-lg hover:shadow-green-500/20"
                                >
                                  {resolving === market.publicKey ? "Resolving..." : "✓ YES Won"}
                                </button>
                                <button
                                  onClick={() => resolveMarketInstant(market.publicKey, false)}
                                  disabled={resolving === market.publicKey}
                                  className="flex-1 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-400 border border-red-500/50 font-bold py-3 px-4 rounded-lg transition-all text-sm shadow-lg hover:shadow-red-500/20"
                                >
                                  {resolving === market.publicKey ? "Resolving..." : "✗ NO Won"}
                                </button>
                              </div>
                              <p className="text-xs text-slate-500 text-center mt-2">
                                Click outcome to resolve market and enable payouts
                              </p>
                            </div>
                          ) : (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-blue-400" />
                                <span className="text-blue-400 text-sm font-bold">Resolved</span>
                              </div>
                              <span className={`font-bold ${market.outcome ? "text-green-400" : "text-red-400"}`}>
                                {market.outcome ? "YES" : "NO"}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Resolved Markets */}
              {resolvedMarkets.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-6 font-orbitron flex items-center gap-2 text-slate-400">
                    <Check className="w-5 h-5" />
                    Resolved Markets ({resolvedMarkets.length})
                  </h2>
                  <div className="grid gap-4 opacity-60 hover:opacity-100 transition-opacity">
                    {resolvedMarkets.map((market) => (
                      <div key={market.publicKey} className="glass-card rounded-xl p-6 border-slate-700">
                        <h3 className="font-bold text-lg mb-2">{market.question}</h3>
                        <div className="flex gap-4 text-sm">
                          <span className="text-slate-400">Volume: ${market.totalVolume.toFixed(2)}</span>
                          <span className={market.outcome ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                            Outcome: {market.outcome ? "YES" : "NO"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
