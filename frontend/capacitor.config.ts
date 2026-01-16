import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "fun.solanasaga.app",
  appName: "Solana Saga",
  webDir: "out",

  // Server configuration for development
  server: {
    // Use this for development with live reload
    // url: "http://localhost:3000",
    // cleartext: true,
    androidScheme: "https",
  },

  // Android-specific configuration for PSG1
  android: {
    // PSG1 optimized settings
    backgroundColor: "#050505",
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true, // Disable in production

    // Build settings
    buildOptions: {
      keystorePath: undefined, // Set during build
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: "APK",
    },
  },

  // Plugins configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#050505",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    Keyboard: {
      resize: "body",
      style: "dark",
    },
  },
};

export default config;
