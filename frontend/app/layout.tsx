import type { Metadata } from "next";
import { Inter, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
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
  title: "Solana Saga | Prediction Arena",
  description: "The ultimate gamified prediction market on Solana. Swipe to bet, build streaks, and win big!",
  keywords: ["prediction market", "solana", "crypto", "betting", "defi", "web3", "gaming"],
  openGraph: {
    title: "Solana Saga | Prediction Arena",
    description: "Swipe. Bet. Win. The gamified prediction market on Solana.",
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
      <body className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} font-sans antialiased bg-[#050505] text-white overflow-hidden`}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
