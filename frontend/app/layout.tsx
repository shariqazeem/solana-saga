import type { Metadata, Viewport } from "next";
import { Inter, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { SmartWalletProvider } from "@/providers/SmartWalletProvider";
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
  title: "Solana Saga | Swipe to Predict",
  description: "The Tinder of Prediction Markets - Swipe YES or NO on markets powered by Solana. Built for PSG1 gaming handheld.",
  keywords: ["prediction market", "solana", "crypto", "defi", "web3", "blockchain", "psg1", "gaming", "play solana"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Solana Saga",
  },
  openGraph: {
    title: "Solana Saga | Swipe to Predict",
    description: "The Tinder of Prediction Markets. Swipe-to-bet on Solana, optimized for PSG1 handheld gaming.",
    type: "website",
    images: ["/icons/icon-512x512.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solana Saga | Swipe to Predict",
    description: "The Tinder of Prediction Markets. Swipe-to-bet on Solana.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#00F3FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Solana Saga" />
        <meta name="msapplication-TileColor" content="#050505" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} font-sans antialiased bg-[#050505] text-white`}>
        <SmartWalletProvider>
          <TransactionStateProvider>
            {children}
            <TransactionOverlay />
          </TransactionStateProvider>
        </SmartWalletProvider>
      </body>
    </html>
  );
}
