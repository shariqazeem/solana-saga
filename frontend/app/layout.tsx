import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import '@solana/wallet-adapter-react-ui/styles.css';
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Solana Saga - Viral Prediction Market Game",
  description: "The most addictive prediction market game on Solana. Bet on the future. Win real money. Built for Indie.fun Hackathon 2025.",
  keywords: ["Solana", "Prediction Markets", "DeFi", "Gaming", "Betting", "Crypto"],
  openGraph: {
    title: "Solana Saga - Predict. Compete. Dominate.",
    description: "The most addictive prediction market game on Solana",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solana Saga",
    description: "Predict. Compete. Dominate. The most fun prediction markets on Solana.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(20px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
              },
              success: {
                duration: 4000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}