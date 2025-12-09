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
import {
  Shield,
  AlertCircle,
  Check,
  Plus,
  Clock,
  Gamepad2,
  Zap,
  TrendingUp,
  Users,
  Sparkles,
  ChevronDown,
  RefreshCw,
  Lock,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Admin wallets that can access the admin panel
const ADMIN_WALLETS = [
  "5TY5gts9AktYJMN6S8dGDzjAxmZLbxgbWrhRPpLfxYUD", // Primary admin
  // Add more admin wallets as needed
];

export default function AdminPage() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { markets, loading: marketsLoading, refetch, resolveMarket: resolveMarketHook, withdrawFees: withdrawFeesHook } = usePredictionMarkets();

  // Check if current wallet is an admin
  const isAdmin = wallet ? ADMIN_WALLETS.includes(wallet.publicKey.toString()) : false;

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

  // Withdraw Fees
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  // UI State
  const [showCreateForm, setShowCreateForm] = useState(true);

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

      const marketId = Date.now();
      const days = parseInt(daysUntilEnd);
      const endTime = Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);

      const [marketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), new BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), new BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

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

      setCreateSuccess(`Market created successfully!`);
      setQuestion("");
      setDescription("");
      setCategory("crypto");
      setDaysUntilEnd("7");

      await new Promise(r => setTimeout(r, 2000));
      await refetch();
    } catch (error: any) {
      console.error("Error creating market:", error);
      setCreateError(error.message || "Failed to create market");
    } finally {
      setCreating(false);
    }
  };

  const resolveMarketSimple = async (marketAddress: string, outcome: boolean) => {
    if (!wallet) {
      setResolveError("Please connect your wallet");
      return;
    }

    setResolving(marketAddress);
    setResolveError(null);
    setResolveSuccess(null);

    try {
      const tx = await resolveMarketHook(marketAddress, outcome);
      setResolveSuccess(`Market resolved as ${outcome ? "YES" : "NO"}!`);
      await new Promise(r => setTimeout(r, 2000));
      await refetch();
    } catch (error: any) {
      console.error("Error resolving market:", error);
      setResolveError(error.message || "Failed to resolve market");
    } finally {
      setResolving(null);
    }
  };

  const handleWithdrawFees = async (marketAddress: string, marketId: number) => {
    if (!wallet) {
      setWithdrawError("Please connect your wallet");
      return;
    }

    setWithdrawing(marketAddress);
    setWithdrawError(null);
    setWithdrawSuccess(null);

    try {
      const tx = await withdrawFeesHook(marketAddress, marketId);
      setWithdrawSuccess(`Fees withdrawn successfully!`);
      await new Promise(r => setTimeout(r, 2000));
      await refetch();
    } catch (error: any) {
      console.error("Error withdrawing fees:", error);
      setWithdrawError(error.message || "Failed to withdraw fees");
    } finally {
      setWithdrawing(null);
    }
  };

  const activeMarkets = markets.filter(m => m.status === "Active");
  const resolvedMarkets = markets.filter(m => m.status === "Resolved");

  const categories = [
    { value: "crypto", label: "Crypto", color: "#00F3FF" },
    { value: "sports", label: "Sports", color: "#00FF88" },
    { value: "politics", label: "Politics", color: "#AA00FF" },
    { value: "meme", label: "Meme", color: "#FF8800" },
    { value: "other", label: "Other", color: "#FF00FF" },
  ];

  return (
    <div className="h-screen bg-[#050505] overflow-y-auto">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/">
            <motion.button
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00F3FF]/10 to-[#FF00FF]/10 border border-[#00F3FF]/30 text-[#00F3FF] hover:border-[#00F3FF]/60 transition-all font-game group"
              whileHover={{ scale: 1.02, x: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Gamepad2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>BACK TO ARENA</span>
            </motion.button>
          </Link>

          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => refetch()}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>

            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="font-game text-purple-400">ADMIN</span>
            </div>
          </div>
        </motion.div>

        {!wallet ? (
          /* Connect Wallet State */
          <motion.div
            className="min-h-[60vh] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center max-w-md">
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(139, 92, 246, 0.3)",
                    "0 0 40px rgba(139, 92, 246, 0.5)",
                    "0 0 20px rgba(139, 92, 246, 0.3)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="w-12 h-12 text-purple-400" />
              </motion.div>
              <h1 className="text-3xl font-game text-white mb-4">ADMIN ACCESS</h1>
              <p className="text-gray-400 mb-8">
                Connect your wallet to create and manage prediction markets
              </p>
              <WalletButton />
            </div>
          </motion.div>
        ) : !isAdmin ? (
          /* Access Denied for Non-Admins */
          <motion.div
            className="min-h-[60vh] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center max-w-md">
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(239, 68, 68, 0.3)",
                    "0 0 40px rgba(239, 68, 68, 0.5)",
                    "0 0 20px rgba(239, 68, 68, 0.3)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock className="w-12 h-12 text-red-400" />
              </motion.div>
              <h1 className="text-3xl font-game text-white mb-4">ACCESS DENIED</h1>
              <p className="text-gray-400 mb-4">
                Administrators Only
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Your wallet ({wallet?.publicKey.toString().slice(0, 8)}...) is not authorized to access the admin panel.
              </p>
              <Link href="/">
                <motion.button
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00F3FF]/10 to-[#FF00FF]/10 border border-[#00F3FF]/30 text-[#00F3FF] hover:border-[#00F3FF]/60 transition-all font-game mx-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>BACK TO ARENA</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Main Admin Content */
          <div className="space-y-8">
            {/* Stats Bar */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#00F3FF]/10 to-transparent border border-[#00F3FF]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#00F3FF]/20">
                    <Zap className="w-5 h-5 text-[#00F3FF]" />
                  </div>
                  <div>
                    <p className="text-2xl font-numbers font-bold text-white">{activeMarkets.length}</p>
                    <p className="text-xs text-gray-500 font-game">ACTIVE MARKETS</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#00FF88]/10 to-transparent border border-[#00FF88]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#00FF88]/20">
                    <Check className="w-5 h-5 text-[#00FF88]" />
                  </div>
                  <div>
                    <p className="text-2xl font-numbers font-bold text-white">{resolvedMarkets.length}</p>
                    <p className="text-xs text-gray-500 font-game">RESOLVED</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FF00AA]/10 to-transparent border border-[#FF00AA]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF00AA]/20">
                    <Users className="w-5 h-5 text-[#FF00AA]" />
                  </div>
                  <div>
                    <p className="text-2xl font-numbers font-bold text-white">
                      {markets.reduce((acc, m) => acc + m.totalBetsCount, 0)}
                    </p>
                    <p className="text-xs text-gray-500 font-game">TOTAL BETS</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-numbers font-bold text-white">
                      ${markets.reduce((acc, m) => acc + m.totalVolume, 0).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500 font-game">TOTAL VOLUME</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Create Market Section */}
            <motion.div
              className="rounded-3xl bg-gradient-to-br from-[#0a0a0f] to-[#12121a] border border-white/10 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Header */}
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#00F3FF]/20 to-[#FF00FF]/20 border border-[#00F3FF]/30">
                    <Plus className="w-6 h-6 text-[#00F3FF]" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-game text-white">CREATE NEW MARKET</h2>
                    <p className="text-sm text-gray-500">Deploy a new prediction market to the blockchain</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showCreateForm ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-6 h-6 text-gray-500" />
                </motion.div>
              </button>

              {/* Form */}
              <AnimatePresence>
                {showCreateForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 space-y-6">
                      {/* Question Input */}
                      <div>
                        <label className="block text-sm font-game text-gray-400 mb-3">
                          PREDICTION QUESTION
                        </label>
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="Will Bitcoin hit $100,000 by end of 2025?"
                          className="w-full px-5 py-4 rounded-xl bg-black/50 border-2 border-white/10 text-white text-lg placeholder-gray-600 focus:border-[#00F3FF]/50 focus:outline-none transition-all"
                          maxLength={200}
                        />
                        <div className="flex justify-between mt-2">
                          <p className="text-xs text-gray-600">Make it clear and specific</p>
                          <p className="text-xs text-gray-600 font-numbers">{question.length}/200</p>
                        </div>
                      </div>

                      {/* Description Input */}
                      <div>
                        <label className="block text-sm font-game text-gray-400 mb-3">
                          RESOLUTION CRITERIA
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="This market resolves YES if Bitcoin (BTC) reaches or exceeds $100,000 USD on any major exchange before December 31, 2025 11:59 PM UTC..."
                          className="w-full px-5 py-4 rounded-xl bg-black/50 border-2 border-white/10 text-white placeholder-gray-600 focus:border-[#00F3FF]/50 focus:outline-none transition-all resize-none h-32"
                          maxLength={500}
                        />
                        <div className="flex justify-between mt-2">
                          <p className="text-xs text-gray-600">Define exactly how this will be resolved</p>
                          <p className="text-xs text-gray-600 font-numbers">{description.length}/500</p>
                        </div>
                      </div>

                      {/* Category & Duration */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-game text-gray-400 mb-3">
                            CATEGORY
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {categories.map((cat) => (
                              <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={`px-3 py-2 rounded-lg text-sm font-game transition-all ${category === cat.value
                                    ? "border-2"
                                    : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                                  }`}
                                style={{
                                  borderColor: category === cat.value ? cat.color : "transparent",
                                  backgroundColor: category === cat.value ? `${cat.color}20` : undefined,
                                  color: category === cat.value ? cat.color : "#9ca3af"
                                }}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-game text-gray-400 mb-3">
                            DURATION
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={daysUntilEnd}
                              onChange={(e) => setDaysUntilEnd(e.target.value)}
                              min="1"
                              max="365"
                              className="flex-1 px-4 py-3 rounded-xl bg-black/50 border-2 border-white/10 text-white text-center text-xl font-numbers focus:border-[#00F3FF]/50 focus:outline-none transition-all"
                            />
                            <span className="text-gray-500 font-game">DAYS</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            {[1, 7, 14, 30].map((d) => (
                              <button
                                key={d}
                                onClick={() => setDaysUntilEnd(d.toString())}
                                className={`flex-1 py-2 rounded-lg text-xs font-numbers transition-all ${daysUntilEnd === d.toString()
                                    ? "bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/50"
                                    : "bg-white/5 text-gray-500 hover:bg-white/10"
                                  }`}
                              >
                                {d}d
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <AnimatePresence>
                        {createError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                          >
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{createError}</p>
                          </motion.div>
                        )}
                        {createSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center gap-3"
                          >
                            <Sparkles className="w-5 h-5 text-[#00FF88] flex-shrink-0" />
                            <p className="text-[#00FF88] text-sm">{createSuccess}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <motion.button
                        onClick={createMarket}
                        disabled={creating || !question || !description}
                        className="w-full py-4 rounded-xl font-game text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        style={{
                          background: "linear-gradient(135deg, #00F3FF 0%, #FF00FF 100%)"
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <span className="relative z-10 text-black font-bold flex items-center justify-center gap-2">
                          {creating ? (
                            <>
                              <motion.div
                                className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              CREATING MARKET...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5" />
                              DEPLOY MARKET
                            </>
                          )}
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Active Markets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-[#00F3FF]" />
                <h2 className="text-xl font-game text-white">ACTIVE MARKETS</h2>
                <span className="px-2 py-1 rounded-lg bg-[#00F3FF]/20 text-[#00F3FF] text-xs font-numbers">
                  {activeMarkets.length}
                </span>
              </div>

              {/* Messages */}
              <AnimatePresence>
                {resolveError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-400">{resolveError}</p>
                  </motion.div>
                )}
                {resolveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-4 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center gap-3"
                  >
                    <Check className="w-5 h-5 text-[#00FF88]" />
                    <p className="text-[#00FF88]">{resolveSuccess}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeMarkets.length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-white/5 border border-white/10">
                  <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 font-game">NO ACTIVE MARKETS</p>
                  <p className="text-gray-600 text-sm mt-2">Create your first market above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeMarkets.map((market, index) => (
                    <motion.div
                      key={market.publicKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-2xl bg-gradient-to-br from-[#0a0a0f] to-[#12121a] border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="px-2 py-1 rounded text-xs font-game"
                              style={{
                                backgroundColor: categories.find(c => c.value === market.category.toLowerCase())?.color + "20",
                                color: categories.find(c => c.value === market.category.toLowerCase())?.color || "#00F3FF"
                              }}
                            >
                              {market.category.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-numbers ${market.endsIn === "Ended"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                              }`}>
                              {market.endsIn === "Ended" ? "READY TO RESOLVE" : market.endsIn}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2">{market.question}</h3>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-gray-500">
                              <TrendingUp className="w-4 h-4 text-[#00FF88]" />
                              <span className="text-gray-400">Volume:</span>
                              <span className="font-numbers text-white">${market.totalVolume.toFixed(2)}</span>
                            </span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <Users className="w-4 h-4 text-[#FF00AA]" />
                              <span className="text-gray-400">Bets:</span>
                              <span className="font-numbers text-white">{market.totalBetsCount}</span>
                            </span>
                          </div>
                        </div>

                        {/* Battle Bar */}
                        <div className="w-32 text-right">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#00FF88] font-numbers">{market.yesPrice}%</span>
                            <span className="text-[#FF0044] font-numbers">{market.noPrice}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-black/50 overflow-hidden flex">
                            <div
                              className="h-full bg-[#00FF88]"
                              style={{ width: `${market.yesPrice}%` }}
                            />
                            <div
                              className="h-full bg-[#FF0044]"
                              style={{ width: `${market.noPrice}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Resolution Buttons */}
                      {market.endsIn === "Ended" && !market.isResolved && (
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-xs text-gray-500 mb-3 font-game">RESOLVE THIS MARKET</p>
                          <div className="flex gap-3">
                            <motion.button
                              onClick={() => resolveMarketSimple(market.publicKey, true)}
                              disabled={resolving === market.publicKey}
                              className="flex-1 py-3 rounded-xl bg-[#00FF88]/10 border-2 border-[#00FF88]/50 text-[#00FF88] font-game hover:bg-[#00FF88]/20 transition-all disabled:opacity-50"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {resolving === market.publicKey ? "..." : "YES WON"}
                            </motion.button>
                            <motion.button
                              onClick={() => resolveMarketSimple(market.publicKey, false)}
                              disabled={resolving === market.publicKey}
                              className="flex-1 py-3 rounded-xl bg-[#FF0044]/10 border-2 border-[#FF0044]/50 text-[#FF0044] font-game hover:bg-[#FF0044]/20 transition-all disabled:opacity-50"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {resolving === market.publicKey ? "..." : "NO WON"}
                            </motion.button>
                          </div>
                        </div>
                      )}

                      {market.endsIn !== "Ended" && (
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-xs text-gray-600 text-center">
                            Market will be resolvable after it ends
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Resolved Markets */}
            {resolvedMarkets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Check className="w-5 h-5 text-[#00FF88]" />
                  <h2 className="text-xl font-game text-white">RESOLVED MARKETS</h2>
                  <span className="px-2 py-1 rounded-lg bg-[#00FF88]/10 text-[#00FF88] text-xs font-numbers">
                    {resolvedMarkets.length}
                  </span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-game">WITHDRAW FEES</span>
                  </div>
                </div>

                {/* Withdraw Messages */}
                <AnimatePresence>
                  {withdrawError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-400">{withdrawError}</p>
                    </motion.div>
                  )}
                  {withdrawSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 p-4 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center gap-3"
                    >
                      <DollarSign className="w-5 h-5 text-[#00FF88]" />
                      <p className="text-[#00FF88]">{withdrawSuccess}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {resolvedMarkets.map((market) => (
                    <motion.div
                      key={market.publicKey}
                      className="p-4 rounded-xl bg-gradient-to-br from-[#0a0a0f] to-[#12121a] border border-white/10 hover:border-white/20 transition-all"
                      whileHover={{ scale: 1.005 }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-white font-medium">{market.question}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-gray-500">
                              Volume: <span className="text-white font-numbers">${market.totalVolume.toFixed(2)}</span>
                            </span>
                            <span className="text-gray-500">
                              Bets: <span className="text-white font-numbers">{market.totalBetsCount}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-lg font-game text-sm ${market.outcome ? "bg-[#00FF88]/20 text-[#00FF88]" : "bg-[#FF0044]/20 text-[#FF0044]"
                            }`}>
                            {market.outcome ? "YES" : "NO"}
                          </span>
                          <motion.button
                            onClick={() => handleWithdrawFees(market.publicKey, market.id)}
                            disabled={withdrawing === market.publicKey}
                            className="px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 font-game text-sm hover:bg-yellow-500/20 transition-all disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {withdrawing === market.publicKey ? (
                              <motion.div
                                className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>WITHDRAW</span>
                              </div>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Bottom Spacer */}
            <div className="h-20" />
          </div>
        )}
      </div>
    </div>
  );
}
