# Matrix Hackathon Submission Guide

## Solana Saga - The Tinder of Prediction Markets

**Tracks:**
- Primary: **PSG1-first Track by Play Solana**
- Secondary: **Gamification, DeFi & Mobile Adventures by Jupiter**

---

## Project Summary

**Solana Saga** transforms prediction markets into a mobile-native, gamified experience built for the PSG1 handheld gaming console. Using Tinder-style swipe mechanics and integrated gamepad controls, players can bet YES or NO on real-world events with a single gesture.

### Key Features

| Feature | Description |
|---------|-------------|
| **Swipe-to-Bet UX** | Swipe right = YES, left = NO, up = SKIP |
| **PSG1 Gamepad Support** | A=YES, B=NO, Y=SKIP, D-pad navigation |
| **Jupiter Wallet Integration** | Jupiter Mobile QR login + wallet connection |
| **On-Chain Prediction Markets** | Custom Anchor smart contracts on Solana |
| **Gamification Suite** | Streaks, leaderboards, sound effects, confetti |
| **PWA + TWA Ready** | Installable app, packaged as Android APK |

---

## Technical Stack

- **Blockchain:** Solana (Devnet)
- **Smart Contracts:** Anchor Framework (Rust)
- **Frontend:** Next.js 16 + React 18 + Tailwind CSS
- **Animations:** Framer Motion
- **Wallet:** Jupiter Wallet Kit + Solana Wallet Adapter
- **Controller:** Web Gamepad API (PSG1 compatible)
- **Packaging:** TWA (Trusted Web Activity) for Android

---

## PSG1 Track Submission

### How We Meet the Objectives

1. **Hardware-First Design**
   - Optimized for PSG1's 1240×1080 portrait screen
   - 60fps gamepad polling with 500ms debounce
   - Button mapping: A=YES, B=NO, Y=SKIP, D-pad support
   - Visual feedback for button presses

2. **Controller UX**
   - `PSG1ControllerHints` component shows button mappings
   - `usePSG1Mode` hook auto-detects PSG1 device
   - Larger touch targets in PSG1 mode (72px buttons)

3. **Integrated Wallet**
   - Jupiter Wallet Kit for seamless auth
   - QR code login via Jupiter Mobile
   - No browser extensions needed

4. **Playable MVP**
   - Full prediction market gameplay
   - Real on-chain transactions
   - Leaderboard and stats tracking

### PSG1 Button Mapping

```
┌─────────────────────────────┐
│  PSG1 Controller Layout     │
├─────────────────────────────┤
│  [Y] Skip                   │
│  [A] YES    [B] NO          │
│  D-pad: ← NO  → YES  ↑ SKIP │
└─────────────────────────────┘
```

---

## Jupiter Track Submission

### Jupiter Integration Points

1. **Jupiter Wallet Kit**
   - Primary authentication via `@jup-ag/wallet-adapter`
   - `UnifiedWalletProvider` for multi-wallet support
   - Jupiter Mobile Adapter with Reown/WalletConnect

2. **Jupiter Mobile QR Login**
   - Scan QR code with Jupiter Mobile app
   - Cross-platform authentication
   - No wallet extension required

3. **Prediction Markets Expansion**
   - Gamified prediction market experience
   - Swipe-based UX makes betting accessible
   - Real-time leaderboard and streaks

### Jupiter Configuration

To enable Jupiter Mobile:
1. Get a project ID from https://dashboard.reown.com/
2. Set `NEXT_PUBLIC_REOWN_PROJECT_ID` in your `.env.local`
3. Users can scan QR to login with Jupiter Mobile

---

## Demo Video Script (2-3 minutes)

### Scene 1: Introduction (15 sec)
"Solana Saga - The Tinder of Prediction Markets, built for PSG1"
- Show PSG1 device or simulator
- App loading screen

### Scene 2: Gamepad Connection (20 sec)
- Connect controller
- "Controller Connected" indicator appears
- Show button hints: A=YES, B=NO, Y=SKIP

### Scene 3: Swipe Gameplay (45 sec)
- Show market card with question
- Swipe right for YES (confetti burst!)
- Swipe left for NO (screen shake)
- Swipe up to SKIP
- Use D-pad: Right for YES, Left for NO

### Scene 4: Jupiter Wallet (30 sec)
- Click "Connect Wallet"
- Show Jupiter wallet options
- QR code for Jupiter Mobile
- Connected state

### Scene 5: On-Chain Transaction (30 sec)
- Place a bet
- Show transaction confirmation
- Real signature on Solana Explorer

### Scene 6: Gamification (20 sec)
- Win streak counter
- Leaderboard page
- Sound effects and animations

### Scene 7: Closing (15 sec)
"Solana Saga - Swipe to Predict on PSG1"
- Show app icon
- GitHub URL
- Live demo URL

---

## Links

| Resource | URL |
|----------|-----|
| **Live Demo** | https://solana-saga.vercel.app |
| **GitHub** | https://github.com/[your-repo] |
| **Smart Contract** | `G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j` (Devnet) |
| **Video Demo** | [YouTube Link] |

---

## Screenshots

Required screenshots for submission:

1. **Arena View** - Main swipe interface with market card
2. **Gamepad Mode** - Controller hints visible
3. **Bet Confirmation** - Success modal with share options
4. **Leaderboard** - Top players ranking
5. **Markets Grid** - Browse all markets

---

## How to Run Locally

```bash
# Clone and install
git clone https://github.com/[your-repo]/solana-saga.git
cd solana-saga/frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Reown project ID

# Run development server
npm run dev

# Build for production
npm run build

# Build Android APK (for PSG1)
npm run build:apk
```

---

## Testing PSG1 Mode

To test PSG1 mode without the device:

1. Add `?psg1=true` to the URL: `http://localhost:3000?psg1=true`
2. Connect any USB gamepad
3. Use browser DevTools to emulate 1240×1080 screen

---

## Team

- **Builder:** [Your Name]
- **Contact:** [Your Email/Twitter]

---

## Closing Statement

Solana Saga demonstrates how dedicated gaming hardware like PSG1, combined with Jupiter's wallet infrastructure, can make DeFi prediction markets as intuitive as swiping on Tinder. Built for gamers, powered by Solana.

**Swipe. Predict. Win.**
