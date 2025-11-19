"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Markets", href: "/markets" },
    { label: "Leaderboard", href: "/leaderboard" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
              SOLANA SAGA
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </nav>

          {/* Connect Wallet Button */}
          <div className="hidden md:block">
            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:scale-105 transition-all shadow-lg shadow-purple-500/50">
              Connect Wallet
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <nav className="flex flex-col gap-2 py-4">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <button
                      className={`w-full px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  </Link>
                ))}
                <button className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold">
                  Connect Wallet
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
