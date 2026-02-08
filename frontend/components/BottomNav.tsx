"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair, LayoutGrid, Trophy, Gift } from "lucide-react";

const NAV_ITEMS = [
  { name: "Arena", href: "/", icon: Crosshair, color: "#00F3FF" },
  { name: "Markets", href: "/markets", icon: LayoutGrid, color: "#00FF88" },
  { name: "Bets", href: "/my-bets", icon: Gift, color: "#FF00AA" },
  { name: "Ranks", href: "/leaderboard", icon: Trophy, color: "#FFD700" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show on game route
  if (pathname === "/game") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <div className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all">
                <div
                  className={`p-1.5 rounded-lg transition-all ${
                    isActive ? "bg-white/10" : ""
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow: `0 0 12px ${item.color}40`,
                          border: `1px solid ${item.color}30`,
                        }
                      : {}
                  }
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isActive ? item.color : "#6b7280" }}
                  />
                </div>
                <span
                  className={`text-[9px] font-game ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
