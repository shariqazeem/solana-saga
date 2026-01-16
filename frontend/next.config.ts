import type { NextConfig } from "next";

// Check if we're building for Capacitor (static export)
const isCapacitorBuild = process.env.BUILD_TARGET === "capacitor";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // Static export for Capacitor APK builds
  // Set BUILD_TARGET=capacitor to enable
  ...(isCapacitorBuild && {
    output: "export",
    trailingSlash: true,
  }),

  images: {
    // Use unoptimized for static export
    unoptimized: isCapacitorBuild,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Disable Turbopack for production builds (compatibility issues with @reown/appkit)
  // turbopack: {},

  webpack: (config, { isServer }) => {
    // Only apply pino stub for client-side builds
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use browser stub for pino (required by @jup-ag/jup-mobile-adapter)
        pino: require.resolve("./lib/pino-stub.js"),
        "pino-pretty": require.resolve("./lib/pino-stub.js"),
      };
    }

    config.externals.push(
      "lokijs",
      "encoding",
      "thread-stream"
    );
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },

  // Environment variables
  env: {
    BUILD_TARGET: process.env.BUILD_TARGET || "web",
  },
};

export default nextConfig;
