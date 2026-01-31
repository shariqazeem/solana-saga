#!/bin/bash

# Build TWA APK for Solana Saga
# Run this script from the frontend directory

set -e

echo "======================================"
echo "Solana Saga TWA Builder for PSG1"
echo "======================================"

# Check if bubblewrap is installed
if ! command -v npx &> /dev/null; then
    echo "Error: npx not found. Please install Node.js"
    exit 1
fi

# Create twa directory if it doesn't exist
if [ ! -d "twa" ]; then
    echo "Creating TWA directory..."
    mkdir -p twa
fi

cd twa

# Check if already initialized
if [ ! -f "twa-manifest.json" ]; then
    echo ""
    echo "Initializing TWA project..."
    echo "Make sure your app is deployed to https://solana-saga.vercel.app"
    echo ""

    # Copy the pre-configured manifest
    cp ../twa-manifest.json ./twa-manifest.json

    echo "TWA manifest copied."
    echo ""
    echo "IMPORTANT: Before building, you need to:"
    echo "1. Update the 'host' in twa-manifest.json to your deployed URL"
    echo "2. Generate a signing keystore (run: keytool -genkey -v -keystore solana-saga.keystore -alias solanasaga -keyalg RSA -keysize 2048 -validity 10000)"
    echo ""

    read -p "Press Enter when ready to continue..."
fi

# Check for keystore
if [ ! -f "solana-saga.keystore" ]; then
    echo ""
    echo "Generating signing keystore..."
    echo "You'll be prompted to create a password and enter your details."
    echo ""

    keytool -genkey -v \
        -keystore solana-saga.keystore \
        -alias solanasaga \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000

    echo ""
    echo "Keystore generated. SAVE YOUR PASSWORD!"
    echo ""
fi

# Build the APK
echo ""
echo "Building APK..."
echo ""

npx @nicotrop/pwa-to-twa build

# Check if build succeeded
if [ -f "app-release-signed.apk" ]; then
    cp app-release-signed.apk ../solana-saga-psg1.apk
    echo ""
    echo "======================================"
    echo "BUILD SUCCESSFUL!"
    echo "======================================"
    echo ""
    echo "APK location: ./solana-saga-psg1.apk"
    echo ""
    echo "Next steps:"
    echo "1. Test on Android device: adb install solana-saga-psg1.apk"
    echo "2. Submit to Play<Gate>: https://playgate.playsolana.com/"
    echo ""
    echo "Don't forget to update your assetlinks.json with the SHA-256 fingerprint!"
    echo "Run: keytool -list -v -keystore twa/solana-saga.keystore -alias solanasaga"
    echo ""
else
    echo ""
    echo "Build failed. Check the error messages above."
    exit 1
fi
