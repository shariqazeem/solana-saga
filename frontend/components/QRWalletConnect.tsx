"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";

// Reown/WalletConnect Project ID
const PROJECT_ID = "28d5bd001f01f925b327ed9405773ba3";

interface QRWalletConnectProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (publicKey: string) => void;
}

export function QRWalletConnect({ isOpen, onClose, onConnect }: QRWalletConnectProps) {
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWalletConnectUri = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Generate a WalletConnect URI for Solana
      // Format: wc:{topic}@2?relay-protocol=irn&symKey={symKey}
      const topic = crypto.randomUUID().replace(/-/g, '');
      const symKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const uri = `wc:${topic}@2?relay-protocol=irn&symKey=${symKey}`;
      setWcUri(uri);

      console.log("[QR] Generated WalletConnect URI");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate QR code";
      setError(message);
      console.error("[QR] Error:", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !wcUri) {
      generateWalletConnectUri();
    }
  }, [isOpen, wcUri, generateWalletConnectUri]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0f] border border-cyan-500/30 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-[0_0_60px_rgba(0,240,255,0.2)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center">
          {loading ? (
            <div className="w-64 h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : error ? (
            <div className="w-64 h-64 flex flex-col items-center justify-center text-red-400">
              <p className="text-center mb-4">{error}</p>
              <button
                onClick={generateWalletConnectUri}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : wcUri ? (
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG
                value={wcUri}
                size={240}
                level="M"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          ) : null}

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm mb-2">
              Scan with your mobile wallet
            </p>
            <p className="text-gray-500 text-xs">
              Phantom, Solflare, or any WalletConnect compatible wallet
            </p>
          </div>

          {/* Jupiter Powered Badge */}
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
            <span>Powered by</span>
            <span className="text-cyan-400 font-semibold">Jupiter</span>
            <span>×</span>
            <span className="text-purple-400 font-semibold">WalletConnect</span>
          </div>
        </div>
      </div>
    </div>
  );
}
