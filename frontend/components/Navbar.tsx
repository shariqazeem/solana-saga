"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";
import {
    Gamepad2, Trophy, LayoutGrid, User, Zap, Star,
    Volume2, VolumeX, Bell, Settings, Sparkles, X, Shield, Rocket
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

// Admin wallets that can access the admin panel
const ADMIN_WALLETS = [
    "5TY5gts9AktYJMN6S8dGDzjAxmZLbxgbWrhRPpLfxYUD",
];
export function Navbar() {
    const pathname = usePathname();
    const wallet = useAnchorWallet();
    const [isScrolled, setIsScrolled] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [performanceMode, setPerformanceMode] = useState<"high" | "lite">("high");

    // Check if current wallet is admin
    const isAdmin = wallet ? ADMIN_WALLETS.includes(wallet.publicKey.toString()) : false;

    // Load settings from localStorage
    useEffect(() => {
        const savedSound = localStorage.getItem("soundEnabled");
        const savedPerformance = localStorage.getItem("performanceMode");
        if (savedSound !== null) setSoundEnabled(savedSound === "true");
        if (savedPerformance) setPerformanceMode(savedPerformance as "high" | "lite");
    }, []);

    // Save settings to localStorage
    const toggleSound = () => {
        const newValue = !soundEnabled;
        setSoundEnabled(newValue);
        localStorage.setItem("soundEnabled", String(newValue));
    };

    const togglePerformance = () => {
        const newValue = performanceMode === "high" ? "lite" : "high";
        setPerformanceMode(newValue);
        localStorage.setItem("performanceMode", newValue);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Simulate notification
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 5000);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    const navItems = [
        { name: "Markets", href: "/markets", icon: LayoutGrid, color: "#00f0ff" },
        { name: "Leaderboard", href: "/leaderboard", icon: Trophy, color: "#ffd700" },
        { name: "My Bets", href: "/my-bets", icon: User, color: "#ff00aa" },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? "bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                        : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group" onClick={() => {}}>
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            
                        >
                            <div className="absolute inset-0 bg-[#00ff88] blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00f0ff] flex items-center justify-center border border-white/20">
                                <Gamepad2 className="w-7 h-7 text-black" />
                            </div>
                            {/* Level Badge */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ffd700] flex items-center justify-center shadow-lg border border-black/20">
                                <span className="text-[10px] font-bold text-black font-numbers">42</span>
                            </div>
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-wider font-game bg-gradient-to-r from-[#00ff88] via-[#00f0ff] to-[#ff00aa] bg-clip-text text-transparent drop-shadow-sm">
                                SOLANA SAGA
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-[#00ff88] to-[#00f0ff]"
                                        initial={{ width: 0 }}
                                        animate={{ width: "75%" }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 font-numbers">7,500 XP</span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link key={item.name} href={item.href} onClick={() => {}}>
                                    <motion.div
                                        className={`relative px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 ${isActive
                                                ? "bg-white/10 border border-white/20"
                                                : "hover:bg-white/5 border border-transparent"
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 rounded-xl"
                                                style={{
                                                    background: `linear-gradient(135deg, ${item.color}10, transparent)`,
                                                    border: `1px solid ${item.color}40`,
                                                    boxShadow: `0 0 20px ${item.color}20`,
                                                }}
                                            />
                                        )}
                                        <Icon
                                            className={`w-4 h-4 relative z-10 ${isActive ? "" : "text-gray-400"}`}
                                            style={{ color: isActive ? item.color : undefined }}
                                        />
                                        <span
                                            className={`font-game text-sm tracking-wide relative z-10 ${isActive ? "text-white" : "text-gray-400"
                                                }`}
                                        >
                                            {item.name}
                                        </span>
                                        {item.name === "Leaderboard" && (
                                            <span className="relative z-10 px-1.5 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] text-[10px] font-bold border border-[#ffd700]/30">
                                                #42
                                            </span>
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Indie.fun Badge */}
                        <motion.a
                            href="https://indie.fun"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00]/20 to-[#FFD700]/20 border border-[#FF6B00]/50 text-[#FFD700] font-game text-xs hover:from-[#FF6B00]/30 hover:to-[#FFD700]/30 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{
                                boxShadow: [
                                    "0 0 10px rgba(255, 107, 0, 0.3)",
                                    "0 0 20px rgba(255, 215, 0, 0.5)",
                                    "0 0 10px rgba(255, 107, 0, 0.3)",
                                ],
                            }}
                            transition={{
                                boxShadow: { duration: 2, repeat: Infinity },
                            }}
                        >
                            <Rocket className="w-4 h-4" />
                            <span>Back us on Indie.fun</span>
                        </motion.a>

                        {/* Notification Bell */}
                        <motion.button
                            className="hidden md:flex relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-gray-400 hover:text-white transition-colors hover:bg-white/10"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}

                            onClick={() => {}}
                        >
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff0044] rounded-full animate-pulse shadow-[0_0_5px_#ff0044]" />
                        </motion.button>

                        {/* Settings Button */}
                        <div className="relative">
                            <motion.button
                                className="hidden md:flex w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-gray-400 hover:text-white transition-colors hover:bg-white/10"
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowSettings(!showSettings)}
                            >
                                <Settings className="w-4 h-4" />
                            </motion.button>

                            {/* Settings Dropdown */}
                            <AnimatePresence>
                                {showSettings && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className="absolute right-0 top-14 w-72 bg-[#0a0a0f]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
                                    >
                                        {/* Header */}
                                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                            <span className="font-game text-white">Settings</span>
                                            <button
                                                onClick={() => setShowSettings(false)}
                                                className="text-gray-400 hover:text-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="p-4 space-y-4">
                                            {/* Sound Effects Toggle */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {soundEnabled ? (
                                                        <Volume2 className="w-5 h-5 text-[#00f0ff]" />
                                                    ) : (
                                                        <VolumeX className="w-5 h-5 text-gray-500" />
                                                    )}
                                                    <span className="text-sm text-gray-300">Sound Effects</span>
                                                </div>
                                                <button
                                                    onClick={toggleSound}
                                                    className={`relative w-12 h-6 rounded-full transition-all ${
                                                        soundEnabled
                                                            ? "bg-[#00f0ff]/30 border border-[#00f0ff]/50"
                                                            : "bg-white/10 border border-white/20"
                                                    }`}
                                                >
                                                    <motion.div
                                                        className={`absolute top-1 w-4 h-4 rounded-full ${
                                                            soundEnabled ? "bg-[#00f0ff]" : "bg-gray-500"
                                                        }`}
                                                        animate={{ left: soundEnabled ? 26 : 4 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    />
                                                </button>
                                            </div>

                                            {/* Performance Mode Toggle */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Zap className={`w-5 h-5 ${
                                                        performanceMode === "high" ? "text-[#ffd700]" : "text-gray-500"
                                                    }`} />
                                                    <div>
                                                        <span className="text-sm text-gray-300">Animations</span>
                                                        <p className="text-xs text-gray-500">
                                                            {performanceMode === "high" ? "High Quality" : "Lite Mode"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={togglePerformance}
                                                    className={`relative w-12 h-6 rounded-full transition-all ${
                                                        performanceMode === "high"
                                                            ? "bg-[#ffd700]/30 border border-[#ffd700]/50"
                                                            : "bg-white/10 border border-white/20"
                                                    }`}
                                                >
                                                    <motion.div
                                                        className={`absolute top-1 w-4 h-4 rounded-full ${
                                                            performanceMode === "high" ? "bg-[#ffd700]" : "bg-gray-500"
                                                        }`}
                                                        animate={{ left: performanceMode === "high" ? 26 : 4 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    />
                                                </button>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-white/10 pt-4">
                                                {/* Admin Access - Only shown to admins */}
                                                {isAdmin && (
                                                    <Link href="/admin" onClick={() => setShowSettings(false)}>
                                                        <motion.button
                                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 text-red-400 hover:border-red-500/50 transition-all"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <Shield className="w-5 h-5" />
                                                            <div className="text-left">
                                                                <div className="font-game text-sm">Admin Command</div>
                                                                <div className="text-xs text-red-400/70">Access control panel</div>
                                                            </div>
                                                        </motion.button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block h-8 w-px bg-white/10" />

                        {/* Streak Badge */}
                        <motion.div
                            className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#ff8800]/10 to-[#ff4400]/10 border border-[#ff8800]/30"
                            whileHover={{ scale: 1.05 }}
                            
                        >
                            <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-[#ff8800]" />
                                <span className="font-numbers font-bold text-[#ff8800]">5</span>
                            </div>
                            <span className="text-xs text-gray-400 font-game">Streak</span>
                        </motion.div>

                        {/* Wallet Button */}
                        <WalletButton />
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 z-50 safe-area-bottom">
                    <div className="flex items-center justify-around">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link key={item.name} href={item.href} onClick={() => {}}>
                                    <motion.div
                                        className="flex flex-col items-center gap-1 p-2"
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <div
                                            className={`p-2 rounded-xl transition-all ${isActive ? "bg-white/10" : ""}`}
                                            style={isActive ? {
                                                boxShadow: `0 0 20px ${item.color}40`,
                                                border: `1px solid ${item.color}40`,
                                            } : {}}
                                        >
                                            <Icon
                                                className="w-5 h-5"
                                                style={{ color: isActive ? item.color : "#9ca3af" }}
                                            />
                                        </div>
                                        <span
                                            className={`text-[10px] font-game ${isActive ? "text-white" : "text-gray-400"}`}
                                        >
                                            {item.name}
                                        </span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </motion.nav>

            {/* Notification Toast */}
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        className="fixed top-24 right-4 z-50 holo-card p-4 flex items-center gap-3 max-w-sm rounded-xl border border-[#00ff88]/30 shadow-[0_0_30px_rgba(0,255,136,0.2)]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#00ff88]/20 flex items-center justify-center border border-[#00ff88]/30">
                            <Sparkles className="w-5 h-5 text-[#00ff88]" />
                        </div>
                        <div>
                            <div className="font-game text-sm text-white">New Hot Market!</div>
                            <div className="text-xs text-gray-400">Will SOL hit $300? 🚀</div>
                        </div>
                        <button
                            onClick={() => setShowNotification(false)}
                            className="text-gray-400 hover:text-white ml-2"
                        >
                            ×
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
