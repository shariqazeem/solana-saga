"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";
import { Rocket, Trophy, LayoutGrid, User } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Markets", href: "/markets", icon: LayoutGrid },
        { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
        { name: "My Bets", href: "/my-bets", icon: User },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#02040A]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                        <Rocket className="w-8 h-8 text-[#00F3FF] relative z-10 transform group-hover:-translate-y-1 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-wider font-heading bg-gradient-to-r from-[#00F3FF] to-[#FF00FF] bg-clip-text text-transparent">
                            SOLANA SAGA
                        </span>
                        <span className="text-[10px] tracking-[0.2em] text-cyan-500/60 font-bold uppercase">
                            Prediction Protocol
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  relative px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300
                  ${isActive
                                        ? 'text-[#00F3FF] bg-[#00F3FF]/10 border border-[#00F3FF]/20 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }
                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                <span className="font-bold tracking-wide text-sm font-heading">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Wallet & Mobile Menu Trigger */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:block h-8 w-[1px] bg-white/10" />
                    <WalletButton />
                </div>
            </div>
        </nav>
    );
}
