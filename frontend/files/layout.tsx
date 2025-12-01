import type { Metadata } from "next";
import { Inter, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Background } from "@/components/Background";
import { WalletProvider } from "@/providers/WalletProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const rajdhani = Rajdhani({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "Solana Saga | Predict. Play. Win.",
  description: "The ultimate prediction market on Solana. Place your bets, compete on the leaderboard, and win big with instant payouts.",
  keywords: ["prediction market", "solana", "crypto", "betting", "defi", "web3"],
  openGraph: {
    title: "Solana Saga | Predict. Play. Win.",
    description: "The ultimate prediction market on Solana",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} font-sans antialiased bg-[#0a0a0f] text-white`}>
        <WalletProvider>
          <Background />
          <Navbar />
          <main className="relative z-10">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="relative z-10 border-t border-white/5 py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="font-game text-xl text-[#00f0ff]">SOLANA</span>
                  <span className="font-game text-xl text-white">SAGA</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <a href="#" className="hover:text-white transition-colors">Docs</a>
                  <a href="#" className="hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="hover:text-white transition-colors">Discord</a>
                  <a href="#" className="hover:text-white transition-colors">GitHub</a>
                </div>
                <div className="text-sm text-gray-500">
                  Built on Solana ⚡
                </div>
              </div>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
