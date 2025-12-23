import type { Metadata } from "next";
import { Inter, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/providers/WalletProvider";
import { TransactionStateProvider } from "@/providers/TransactionStateProvider";
import { TransactionOverlay } from "@/components/TransactionOverlay";

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
  title: "Solana Saga | Prediction Market",
  description: "A decentralized prediction market platform on Solana blockchain. Make predictions on real-world events with cryptocurrency.",
  keywords: ["prediction market", "solana", "crypto", "defi", "web3", "blockchain", "forecasting"],
  openGraph: {
    title: "Solana Saga | Prediction Market",
    description: "Decentralized prediction market platform built on Solana blockchain.",
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
      <body className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} font-sans antialiased bg-[#050505] text-white`}>
        <WalletProvider>
          <TransactionStateProvider>
            {children}
            <TransactionOverlay />
          </TransactionStateProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
