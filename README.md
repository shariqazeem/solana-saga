# Solana Saga

<div align="center">

### **Tinder meets Prediction Markets on Solana**

![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Jupiter](https://img.shields.io/badge/Jupiter-Prediction%20Markets-c7f83e?style=for-the-badge)
![PSG1](https://img.shields.io/badge/PSG1-Native%20Support-00f0ff?style=for-the-badge)

**Swipe Right = YES | Swipe Left = NO | Win Real USDC**

[Live Demo](https://solana-saga.vercel.app) | [Video Demo](#)

</div>

---

## What is Solana Saga?

A mobile-first prediction market app that replaces complex trading dashboards with **Tinder-style swipe cards**. Users swipe right to bet YES, left to bet NO, and up to skip -- all powered by **Jupiter Prediction Markets API** on Solana mainnet. Built natively for the **PSG1 console** with hardware gamepad controls, haptic feedback, and screen-optimized UI.

---

## Key Features

- **Swipe-to-Bet UX** -- Frictionless prediction market interaction via drag gestures, touch, keyboard, or gamepad
- **Jupiter Prediction Markets** -- Real USDC bets on live markets (crypto, sports, politics, esports, culture, economics, tech)
- **PSG1 Native Support** -- Gamepad button mapping (A=Yes, B=No, Y=Skip), haptic vibration patterns, optimized card dimensions
- **SMWA Bridge** -- Custom Solana Mobile Wallet Adapter bridge for transaction signing inside Android WebView
- **Gamification Engine** -- XP, levels, achievements, streak counters, confetti explosions, screen shake, trust scores
- **Social Sharing** -- One-tap tweet after every bet with @playsolanasaga and @JupiterExchange mentions
- **Onboarding Overlay** -- Animated 3-step tutorial for first-time users and judges

---

## Architecture

```
Jupiter Prediction Markets API
         |
         v
useJupiterPrediction (hook)
  - fetchEvents → transform to Market[]
  - createOrder → unsigned tx
         |
         v
SwipeableMarketStack (UI)
  - Framer Motion drag gestures
  - Gamepad API polling (60fps)
  - Haptic feedback patterns
         |
         v
SMWA Bridge (Android WebView)
  - WebView ↔ Kotlin postMessage
  - Transaction signing via native wallet
  - Base64 serialized VersionedTransaction
         |
         v
Solana Mainnet (sendRawTransaction)
```

---

## SMWA Bridge: WebView-to-Native Wallet

The PSG1 runs apps inside an Android WebView, which means standard browser wallet extensions don't work. We built a custom **Solana Mobile Wallet Adapter bridge** that:

1. **WebView side** (`smwaBridge.ts`): Intercepts `signTransaction` calls and serializes the `VersionedTransaction` to base64
2. **Native side** (Kotlin `WebViewActivity`): Receives the base64 payload via `postMessage`, deserializes it, and invokes the SMWA SDK to sign with the device wallet
3. **Return path**: Signed transaction bytes are posted back to the WebView, deserialized, and submitted to Solana via `sendRawTransaction`

This enables full on-chain transaction signing from a web app running inside the PSG1 hardware.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 18 |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **Blockchain** | Solana Web3.js, Mainnet |
| **Markets API** | Jupiter Prediction Markets API |
| **Wallet** | Solana Wallet Adapter + SMWA SDK 2.0.3 |
| **Gamepad** | Web Gamepad API |
| **Audio** | Web Audio API |
| **Haptics** | Vibration API (`navigator.vibrate`) |
| **Native Wrapper** | Kotlin, Android WebView |
| **Deployment** | Vercel |

---

## Input Methods

| Method | YES | NO | SKIP |
|--------|-----|-----|------|
| **Touch** | Swipe Right | Swipe Left | Swipe Up |
| **Mouse** | Drag Right | Drag Left | Drag Up |
| **Keyboard** | Arrow Right | Arrow Left | Arrow Up |
| **Gamepad** | A Button / D-Right | B Button / D-Left | Y Button / D-Up |

Additional gamepad controls: **R1** = Increase bet, **L1** = Decrease bet, **Start** = Connect wallet.

---

## PSG1 / Gamepad Integration

- Native `navigator.getGamepads()` polling at 60fps via `requestAnimationFrame`
- Full button mapping for Standard Controller Layout (Xbox/PlayStation/PSG1)
- 500ms debounce to prevent accidental double-bets
- Visual controller status badge and button hints
- PSG1-optimized card dimensions (95% width, 420px max)
- Haptic vibration patterns: short tap (YES), double tap (NO), rising pattern (bet confirmed), celebration (streak milestone)

---

## Gamification

- **Streak System**: Visual escalation at 5x and 10x streaks with gold confetti
- **Trust Score**: Win-rate health indicator
- **XP & Levels**: Earned from bets, streaks, daily bonuses
- **10 Achievements**: Unlockable milestones with toast notifications and XP rewards
- **Holographic Bet Tickets**: Animated success modal with share functionality
- **Leaderboard**: Jupiter API-powered rankings by PnL, volume, and win rate

---

## Local Development

```bash
# Clone
git clone https://github.com/shariqazeem/solana-saga.git
cd solana-saga/frontend

# Install
npm install

# Run
npm run dev
```

### Environment Variables

```
NEXT_PUBLIC_SOLANA_RPC_URL=<your mainnet RPC>
```

### Android Build (PSG1)

```bash
cd android-wrapper
./gradlew assembleDebug
# Install APK on PSG1 or Pixel device
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## Hackathon Tracks

### PSG1-First (Play Solana)
Hardware-native design with gamepad controls, haptic feedback, SMWA bridge for WebView wallet signing, and screen-optimized UI.

### Gamification, DeFi & Mobile Adventures (Jupiter)
Jupiter Prediction Markets API integration with swipe UX, achievement system, social sharing with @JupiterExchange branding, and mobile-first design.

---

<div align="center">

**Swipe. Bet. Win.**

Built for the Play Solana / Jupiter Hackathon 2026

</div>
