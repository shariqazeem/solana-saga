"use client";

import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import { usePredictionMarkets } from "@/lib/solana/hooks/usePredictionMarkets";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import idl from "@/lib/solana/idl/prediction_markets.json";
import { USDC_MINT } from "@/lib/solana/hooks/usePredictionMarkets";

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

      // Calculate end time
      const days = parseInt(daysUntilEnd);
      const endTime = Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);

      console.log("Creating market...");
      console.log("Question:", question);
      console.log("End time:", new Date(endTime * 1000).toLocaleString());

      const tx = await program.methods
        .createMarket(
          question,
          description,
          category,
          new BN(endTime),
          USDC_MINT
        )
        .rpc();

      console.log("Market created! TX:", tx);
      setCreateSuccess(`Market created! Transaction: ${tx.slice(0, 8)}...`);

      // Wait for confirmation and get market address
      await new Promise(r => setTimeout(r, 3000));

      const allMarkets = await program.account.market.all();
      const latestMarket = allMarkets[allMarkets.length - 1];
      console.log("Market address:", latestMarket.publicKey.toString());

      setCreateSuccess(`Market created! Address: ${latestMarket.publicKey.toString()}`);

      // Reset form
      setQuestion("");
      setDescription("");
      setCategory("crypto");
      setDaysUntilEnd("7");

      // Refresh markets list
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-gray-400">Create and manage prediction markets</p>
          </div>
          <WalletButton />
        </div>

        {!wallet && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-8">
            <p className="text-yellow-400">Please connect your wallet to access admin features</p>
          </div>
        )}

        {/* Create Market Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create New Market</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Will Bitcoin hit $100k by end of 2025?"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{question.length}/200 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide context and resolution criteria..."
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="crypto">Crypto</option>
                  <option value="sports">Sports</option>
                  <option value="politics">Politics</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Days Until End</label>
                <input
                  type="number"
                  value={daysUntilEnd}
                  onChange={(e) => setDaysUntilEnd(e.target.value)}
                  min="1"
                  max="30"
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {createError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                {createError}
              </div>
            )}

            {createSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400">
                {createSuccess}
              </div>
            )}

            <button
              onClick={createMarket}
              disabled={creating || !wallet}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              {creating ? "Creating..." : "Create Market"}
            </button>
          </div>
        </div>

        {/* Markets List */}
        <div className="space-y-6">
          {/* Active Markets */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Active Markets ({activeMarkets.length})</h2>
            {activeMarkets.length === 0 ? (
              <p className="text-gray-500">No active markets</p>
            ) : (
              <div className="grid gap-4">
                {activeMarkets.map((market) => (
                  <div key={market.publicKey} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{market.question}</h3>
                        <p className="text-gray-400 text-sm mb-2">{market.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-gray-500">Volume: ${market.totalVolume.toFixed(2)}</span>
                          <span className="text-gray-500">Bets: {market.totalBetsCount}</span>
                          <span className="text-gray-500">Ends: {market.endsIn}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Address: {market.publicKey}</p>
                      </div>
                    </div>

                    {market.endsIn !== "Ended" ? (
                      <p className="text-yellow-400 text-sm">Market still active - wait for end time to resolve</p>
                    ) : market.resolutionProposer === null ? (
                      // No proposal yet - anyone can propose with 100 USDC bond
                      <div>
                        <p className="text-blue-400 text-sm mb-2">🔓 Decentralized Resolution: Anyone can propose outcome</p>
                        <p className="text-gray-400 text-xs mb-3">Required bond: 100 USDC • 24h challenge period</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => proposeResolution(market.publicKey, true)}
                            disabled={resolving === market.publicKey}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                          >
                            {resolving === market.publicKey ? "Proposing..." : "Propose YES (100 USDC)"}
                          </button>
                          <button
                            onClick={() => proposeResolution(market.publicKey, false)}
                            disabled={resolving === market.publicKey}
                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                          >
                            {resolving === market.publicKey ? "Proposing..." : "Propose NO (100 USDC)"}
                          </button>
                        </div>
                      </div>
                    ) : market.challengeDeadline && Date.now() / 1000 < market.challengeDeadline ? (
                      // Resolution proposed, challenge period active
                      (() => {
                        const timeLeft = market.challengeDeadline - Math.floor(Date.now() / 1000);
                        const hoursLeft = Math.floor(timeLeft / 3600);
                        const minsLeft = Math.floor((timeLeft % 3600) / 60);
                        const requiredBond = market.resolutionBond * 2;

                        return (
                          <div>
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-3">
                              <p className="text-purple-400 font-bold mb-1">
                                ⏳ Proposed Outcome: {market.outcome ? "YES" : "NO"}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Proposer: {market.resolutionProposer?.slice(0, 8)}...{market.resolutionProposer?.slice(-6)}
                              </p>
                              <p className="text-gray-400 text-sm">Bond: {market.resolutionBond} USDC</p>
                              <p className="text-yellow-400 text-sm font-bold mt-2">
                                Challenge Deadline: {hoursLeft}h {minsLeft}m remaining
                              </p>
                            </div>
                            <p className="text-gray-400 text-xs mb-2">
                              Think the outcome is wrong? Challenge with {requiredBond} USDC bond:
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => proposeResolution(market.publicKey, !market.outcome!)}
                                disabled={resolving === market.publicKey}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                              >
                                {resolving === market.publicKey ? "Challenging..." : `Challenge → ${market.outcome ? "NO" : "YES"} (${requiredBond} USDC)`}
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      // Challenge period expired, ready to finalize
                      <div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-3">
                          <p className="text-green-400 font-bold mb-1">
                            ✅ Challenge Period Ended
                          </p>
                          <p className="text-gray-400 text-sm">
                            Final Outcome: {market.outcome ? "YES" : "NO"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Proposer: {market.resolutionProposer?.slice(0, 8)}...{market.resolutionProposer?.slice(-6)}
                          </p>
                        </div>
                        <button
                          onClick={() => finalizeMarket(market.publicKey)}
                          disabled={resolving === market.publicKey}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                        >
                          {resolving === market.publicKey ? "Finalizing..." : "Finalize Resolution (Anyone Can Call)"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolved Markets */}
          {resolvedMarkets.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Resolved Markets ({resolvedMarkets.length})</h2>
              <div className="grid gap-4">
                {resolvedMarkets.map((market) => (
                  <div key={market.publicKey} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-2">{market.question}</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-500">Volume: ${market.totalVolume.toFixed(2)}</span>
                      <span className="text-gray-500">Bets: {market.totalBetsCount}</span>
                      <span className={market.outcome ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                        Outcome: {market.outcome ? "YES" : "NO"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolveError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
              {resolveError}
            </div>
          )}

          {resolveSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400">
              {resolveSuccess}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
