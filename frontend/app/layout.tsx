import type { Metadata } from "next";
import { Inter, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import '@solana/wallet-adapter-react-ui/styles.css';
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Background } from "@/components/Background";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-rajdhani"
});

export const metadata: Metadata = {
  title: "Solana Saga | Next-Gen Prediction Markets",
  description: "Experience the future of prediction markets. Bet on crypto, sports, and culture with lightning-fast Solana settlements.",
  keywords: ["Solana", "Prediction Markets", "DeFi", "Gaming", "Web3", "Crypto Betting"],
  openGraph: {
    title: "Solana Saga - Predict. Win. Dominate.",
    description: "The most immersive prediction market on Solana.",
    type: "website",
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solana Saga",
    description: "Predict. Win. Dominate.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} font-sans antialiased bg-[#02040A] text-white min-h-screen flex flex-col`}>
        <Providers>
          <Background />
          <Navbar />
          <main className="flex-grow pt-20 relative z-10">
            {children}
          </main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(5, 10, 20, 0.9)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                border: '1px solid rgba(0, 243, 255, 0.2)',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'var(--font-inter)',
              },
              success: {
                iconTheme: {
                  primary: '#00FF9D',
                  secondary: '#000',
                },
              },
              error: {
                iconTheme: {
                  primary: '#FF3366',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}