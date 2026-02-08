import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.jup.ag',
      },
      {
        protocol: 'https',
        hostname: 'api.jup.ag',
      },
      {
        protocol: 'https',
        hostname: 'images.jup.ag',
      },
      {
        protocol: 'https',
        hostname: '*.polymarket.com',
      },
      {
        protocol: 'https',
        hostname: '*.kalshi.com',
      },
    ],
  },
  // Transpile Jupiter packages for compatibility
  transpilePackages: [
    '@jup-ag/wallet-adapter',
    '@jup-ag/jup-mobile-adapter',
    '@reown/appkit',
    '@reown/appkit-adapter-solana',
  ],
  // Empty turbopack config to silence warnings during dev
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Externalize problematic packages that cause SSR issues
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Handle node modules that don't work well in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default nextConfig;
