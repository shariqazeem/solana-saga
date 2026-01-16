import type { Metadata, Viewport } from "next";
import { Inter, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";
import { TransactionOverlay } from "@/components/TransactionOverlay";
import { FEATURES } from "@/lib/solana/config";

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
  title: "Solana Saga | Swipe-to-Predict Gaming",
  description: "The first Tinder-style prediction market on Solana. Swipe YES or NO on real-world events powered by Jupiter & Kalshi. Built for PSG1.",
  keywords: [
    "prediction market",
    "solana",
    "jupiter",
    "kalshi",
    "psg1",
    "play solana",
    "defi",
    "web3",
    "gaming",
    "swipe",
    "crypto",
  ],
  authors: [{ name: "Solana Saga Team" }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Solana Saga | Swipe-to-Predict Gaming",
    description: "The first Tinder-style prediction market on Solana. Swipe to predict real-world events powered by Jupiter & Kalshi.",
    type: "website",
    url: "https://solanasaga.fun",
    siteName: "Solana Saga",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Solana Saga - Swipe to Predict",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solana Saga | Swipe-to-Predict Gaming",
    description: "The first Tinder-style prediction market on Solana. Built for PSG1.",
    creator: "@playsolanasaga",
    images: ["/og-image.png"],
  },
  other: {
    "play-solana-hackathon": "matrix-2026",
    "jupiter-track": "prediction-markets-expansion",
    "psg1-optimized": "true",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const psg1Mode = FEATURES.PSG1_MODE;

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        {/* PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} font-sans antialiased bg-[#050505] text-white ${psg1Mode ? "psg1-mode" : ""}`}
      >
        <AppProvider>
          <div className={psg1Mode ? "psg1-container psg1-safe-area" : ""}>
            {children}
          </div>
          <TransactionOverlay />
        </AppProvider>
      </body>
    </html>
  );
}
