# Building TWA APK for PSG1

This guide explains how to package Solana Saga as a Trusted Web Activity (TWA) APK for Android/PSG1.

## Prerequisites

1. **Node.js** (v18+)
2. **Java JDK** (v11 or v17)
3. **Android SDK** (or Android Studio)
4. **Your app deployed** to a public URL (e.g., https://solana-saga.vercel.app)

## Step 1: Install Bubblewrap CLI

```bash
npm install -g @nicotrop/pwa-to-twa
# or
npm install -g @nicotrop/pwa-to-twa@latest
```

Alternative (Google's official tool):
```bash
npm install -g @nicotrop/pwa-to-twa
```

## Step 2: Initialize TWA Project

```bash
# Create a twa directory
mkdir -p twa && cd twa

# Initialize with your deployed PWA URL
npx bubblewrap init --manifest=https://solana-saga.vercel.app/manifest.json
```

During initialization, you'll be asked:
- **Package name**: `gg.playsolana.solanasaga` (for PSG1 compatibility)
- **App name**: `Solana Saga`
- **Launcher name**: `Solana Saga`
- **Display mode**: `standalone`
- **Status bar color**: `#050505`
- **Splash screen color**: `#050505`
- **Icon URL**: Will be auto-detected from manifest
- **Signing key**: Generate new or use existing

## Step 3: Build the APK

```bash
npx bubblewrap build
```

This will generate:
- `app-release-signed.apk` - Signed APK ready for distribution
- `app-release-unsigned.apk` - Unsigned APK

## Step 4: Digital Asset Links (Important!)

For TWA to work without the browser bar, you need to verify domain ownership.

1. Get your SHA-256 fingerprint:
```bash
keytool -list -v -keystore [your-keystore.keystore] -alias [your-alias]
```

2. Create `public/.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "gg.playsolana.solanasaga",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

3. Deploy the assetlinks.json file with your app

## Step 5: Test on Device

```bash
# Install on connected Android device
adb install app-release-signed.apk
```

Or transfer the APK to your PSG1 device and install manually.

## PSG1 Specific Configuration

For optimal PSG1 experience, ensure your `twa-manifest.json` includes:

```json
{
  "orientation": "portrait",
  "display": "standalone",
  "features": {
    "locationDelegation": {
      "enabled": false
    },
    "playBilling": {
      "enabled": false
    }
  }
}
```

## Quick Script

Here's a one-liner to build (after initial setup):

```bash
cd twa && npx bubblewrap build && cp app-release-signed.apk ../solana-saga-psg1.apk
```

## Submitting to Play<Gate>

1. Go to https://playgate.playsolana.com/
2. Create a developer account
3. Upload your signed APK
4. Fill in app details:
   - Name: Solana Saga
   - Description: The Tinder of Prediction Markets - Swipe to predict on Solana
   - Category: Games > Casino
   - Screenshots: (see /public/screenshots/)
5. Submit for review

## Troubleshooting

### "Address bar showing"
- Verify assetlinks.json is accessible at `/.well-known/assetlinks.json`
- Check SHA-256 fingerprint matches your signing key

### "App not installing"
- Ensure minimum SDK version is compatible with PSG1 (API 28+)
- Check APK is signed properly

### "Jupiter wallet not connecting"
- TWA runs in Chrome - all wallet connections should work
- If issues persist, add `?jupiter=true` to the URL
