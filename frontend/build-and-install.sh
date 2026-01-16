#!/bin/bash

# Solana Saga PSG1 - Build and Install Script
# This script builds the Android APK and installs it on a connected device

set -e

echo "🔧 Setting up Java environment..."
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

echo "☕ Java version:"
java -version

echo ""
echo "📱 Checking connected devices..."
adb devices

echo ""
echo "🏗️  Building Next.js app..."
npm run build:static

echo ""
echo "📦 Syncing with Capacitor..."
npm run cap:sync

echo ""
echo "🔨 Building Android APK..."
cd android
./gradlew clean assembleDebug
cd ..

echo ""
echo "📲 Installing APK on connected device..."
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    adb install -r "$APK_PATH"

    # Copy to project root
    cp "$APK_PATH" "../solana-saga-psg1-latest.apk"
    echo ""
    echo "✅ APK installed successfully!"
    echo "📦 APK also saved to: solana-saga-psg1-latest.apk"
else
    echo "❌ APK not found at $APK_PATH"
    exit 1
fi

echo ""
echo "🚀 Done! Open the app on your device."
