"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";
import { 
  Gamepad2, Trophy, LayoutGrid, User, Zap, Star, 
  Volume2, VolumeX, Bell, Settings 
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

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
      setTimeout(() => setShowNotification(false), 3000);
    }, 5000);
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#00f0ff]/20 shadow-[0_0_30px_rgba(0,240,255,0.1)]" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="absolute inset-0 bg-[#00ff88] blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00f0ff] flex items-center justify-center">
                <Gamepad2 className="w-7 h-7 text-black" />
              </div>
              {/* Level Badge */}
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ffd700] flex items-center justify-center">
                <span className="text-[10px] font-bold text-black font-numbers">42</span>
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider font-game bg-gradient-to-r from-[#00ff88] via-[#00f0ff] to-[#ff00aa] bg-clip-text text-transparent">
                SOLANA SAGA
              </span>
              <div className="flex items-center gap-2">
                <div className="xp-bar w-20">
                  <motion.div 
                    className="xp-bar-fill"
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
                <Link key={item.name} href={item.href}>
                  <motion.div
                    className={`relative px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                      isActive
                        ? "bg-white/10 border border-white/20"
                        : "hover:bg-white/5"
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
                      className={`font-game text-sm tracking-wide relative z-10 ${
                        isActive ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.name === "Leaderboard" && (
                      <span className="relative z-10 px-1.5 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] text-[10px] font-bold">
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
            {/* Sound Toggle */}
            <motion.button
              className={`hidden md:flex w-10 h-10 rounded-xl items-center justify-center transition-all ${
                isSoundOn 
                  ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30" 
                  : "bg-white/5 text-gray-400 border border-white/10"
              }`}
              onClick={() => setIsSoundOn(!isSoundOn)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </motion.button>

            {/* Notification Bell */}
            <motion.button
              className="hidden md:flex relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff0044] rounded-full animate-pulse" />
            </motion.button>

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
              <span className="text-xs text-gray-400">Streak</span>
            </motion.div>

            {/* Wallet Button */}
            <WalletButton />
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 z-50">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    className="flex flex-col items-center gap-1 p-2"
                    whileTap={{ scale: 0.9 }}
                  >
                    <div 
                      className={`p-2 rounded-xl ${isActive ? "bg-white/10" : ""}`}
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
            className="fixed top-24 right-4 z-50 game-card p-4 flex items-center gap-3 max-w-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-[#00ff88]/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#00ff88]" />
            </div>
            <div>
              <div className="font-game text-sm text-white">New Hot Market!</div>
              <div className="text-xs text-gray-400">Will SOL hit $300? 🚀</div>
            </div>
            <button 
              onClick={() => setShowNotification(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
