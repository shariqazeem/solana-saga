# Solana Saga

<div align="center">

### **The World's First Gamified Prediction Market on Solana**

![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Jupiter](https://img.shields.io/badge/Jupiter-4%20API%20Integrations-c7f83e?style=for-the-badge)
![PSG1](https://img.shields.io/badge/PSG1-Native%20Gamepad-00f0ff?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/PlaySolana-Matrix%20Hackathon%202026-ff6b00?style=for-the-badge)

**Swipe Right = YES | Swipe Left = NO | Win Real USDC**

[Live App](https://www.solanasaga.fun) | [APK Download](#android-build) | [Video Demo](#)

</div>

---

> **PlaySolana Matrix Hackathon 2026** -- Competing in **PSG1-first** ($6K/$3K/$1K) + **Jupiter Gamification** ($6K/$3K/$1K) tracks. Built with 4 Jupiter APIs on Solana mainnet with real USDC. Full gamepad controls on every page. [View submission details](./HACKATHON_SUBMISSION.md).

---

## What is Solana Saga?

A mobile-first, gamified prediction market that turns DeFi into an arcade experience. Instead of complex trading dashboards, users **swipe cards** to bet YES or NO on real markets -- powered by **4 Jupiter API integrations** on Solana mainnet. Built natively for the **PSG1 handheld** with hardware gamepad controls, haptic feedback, and an optimized screen layout.

**Core loop:** Swipe to predict -> Earn XP -> Complete daily missions -> Claim payouts -> Swap tokens -> Climb the leaderboard.

---

## Jupiter API Integrations (4 APIs)

| # | API | Usage | Endpoint |
|---|-----|-------|----------|
| 1 | **Jupiter Prediction Markets** | Real-time markets, place bets, sell positions, claim payouts | `api.jup.ag/prediction/v1` |
| 2 | **Jupiter Swap v1** | In-app SOL <-> USDC token swapping with live quotes | `api.jup.ag/swap/v1` |
| 3 | **Jupiter Price API v2** | Live token prices for portfolio valuation + market pricing | `api.jup.ag/price/v2` |
| 4 | **Jupiter Token API v2** | Token metadata, icons, and search for portfolio display | `api.jup.ag/tokens/v2` |

---

## Key Features

### Prediction Market (Jupiter Prediction API)
- **Swipe-to-Bet UX** -- Tinder-style card stack with drag gestures, touch, or gamepad
- **8 Market Categories** -- Crypto, Sports, Politics, Esports, Culture, Economics, Tech
- **Sort modes** -- Default mix, Hot (by volume), Ending Soon
- **Bet management** -- View open positions, sell early, claim winning payouts
- **Real USDC** -- All bets settle in real USDC on Solana mainnet

### Jupiter Swap (Jupiter Swap API)
- **In-app token swap** -- SOL to USDC conversion without leaving the app
- **Quick swap presets** -- $5, $10, $25, $50 one-tap amounts
- **General swap** -- Any token pair with token search and selection
- **Live quotes** -- Exchange rate, price impact, minimum received, route info
- **Balance pre-check** -- Validates SOL balance before attempting transaction

### Token Portfolio (Jupiter Token + Price APIs)
- **Full portfolio view** -- All SPL tokens in connected wallet with icons and names
- **USD valuation** -- Live prices from Jupiter Price API v2
- **Total value** -- Aggregated portfolio worth
- **Sorted by value** -- Highest holdings first

### Gamification Engine
- **Daily Missions** -- 6 missions tied to real Jupiter interactions:
  - First Blood: Place your first prediction
  - Diversify: Predict on 3 different categories (tracks unique categories)
  - Whale Watch: Place a $10+ prediction
  - Hot Streak: Place 3 predictions in a row
  - Jupiter Swap: Complete a token swap (Jupiter Swap API)
  - Claim Victory: Claim a winning payout
  - **+500 XP bonus** for completing all 6
- **XP & Levels** -- Earned from predictions, wins, daily missions, login streaks
- **10 Achievements** -- Unlockable milestones with confetti celebrations
- **Win Streaks** -- Escalating visual effects at 5x, 10x, 15x milestones
- **Trust Score** -- Win-rate based health indicator
- **Leaderboard** -- Jupiter API-powered global rankings by PnL, volume, win rate

### PSG1 / Gamepad Support
- **Full gamepad controls** on every page (Arena, Swap, Bets, Markets, Profile, Leaderboard)
- **Button mapping**: A=Yes, B=No/Back, Y=Skip/Search, X=Status filter, D-pad=Navigate
- **L1/R1** for bet amounts, tab switching, period selection
- **SELECT** cycles bottom nav tabs
- **START** opens controls overlay
- **60fps polling** via `requestAnimationFrame`
- **Haptic feedback** patterns for bets, wins, streaks, errors
- **PSG1 auto-detection** via screen dimensions, user agent, and URL params

### Audio & Visual Polish
- **Synthesized sound effects** via Web Audio API (hover, swipe, bet, win, streak, error)
- **Canvas confetti** celebrations with context-aware colors
- **Framer Motion animations** throughout (page transitions, card stacks, modals)
- **Retro arcade aesthetic** with neon colors and animated grid background

---

## Architecture

```
Jupiter Prediction API ──> useJupiterPrediction (hook)
Jupiter Swap API ────────> useJupiterSwap (hook)
Jupiter Price API ───────> fetchTokenPrices (lib)
Jupiter Token API ───────> getTokensByMints (lib)
                               |
                               v
              React Components (Arena, Swap, Profile, etc.)
                               |
                               v
              Wallet Adapter (Phantom, Jupiter Mobile)
                               |
                               v
              Solana Mainnet (sendTransaction)
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Arena -- Swipe-to-bet card stack with category filter, sort, bet amounts |
| `/swap` | Token swap -- Quick SOL->USDC presets + general swap with token selector |
| `/my-bets` | Position manager -- Open, claimable, and closed bets with sell/claim actions |
| `/markets` | Market browser -- Search, filter by category/status, sort by volume/ending |
| `/leaderboard` | Global rankings -- Top 3 podium + full leaderboard with period switching |
| `/profile` | Player profile -- Stats, XP, achievements, token portfolio, daily missions |
| `/game` | Arcade mode -- Play-money practice game with instant resolution |
| `/admin` | Admin panel -- Wallet-gated admin controls |

---

## Input Methods

| Method | YES | NO | SKIP |
|--------|-----|-----|------|
| **Touch** | Swipe Right | Swipe Left | Swipe Up |
| **Mouse** | Drag Right | Drag Left | Drag Up |
| **Keyboard** | Arrow Right | Arrow Left | Arrow Up |
| **PSG1 Gamepad** | A / D-Right | B / D-Left | Y / D-Up |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js, React 18, TypeScript |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion, canvas-confetti |
| **Blockchain** | Solana Web3.js, Mainnet |
| **Jupiter APIs** | Prediction, Swap v1, Price v2, Token v2 |
| **Wallet** | @solana/wallet-adapter + @jup-ag/wallet-adapter |
| **Gamepad** | Web Gamepad API (60fps polling) |
| **Audio** | Web Audio API (synthesized SFX) |
| **Haptics** | Vibration API |
| **Android** | Kotlin WebView wrapper |
| **Deployment** | Vercel (auto-deploy) |

---

## Local Development

```bash
# Clone
git clone https://github.com/shariqazeem/solana-saga.git
cd solana-saga/frontend

# Install
npm install

# Configure
cp .env.local.example .env.local
# Add your Jupiter API key and RPC endpoint

# Run
npm run dev
```

### Environment Variables

```
NEXT_PUBLIC_SOLANA_RPC_HOST=https://solana-rpc.publicnode.com
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_JUP_PREDICTION_API_KEY=<your-jupiter-api-key>
NEXT_PUBLIC_REOWN_PROJECT_ID=<your-reown-project-id>
```

### Android Build

```bash
cd android-wrapper
export JAVA_HOME=/path/to/java17
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## Hackathon Tracks

### PSG1-First Track (Play Solana)
- Hardware-first design with gamepad controls on every page
- Haptic feedback patterns for every interaction
- PSG1 auto-detection and screen-optimized layout
- Android APK with branded splash screen and app icon
- Physical controls feel natural -- not an afterthought

### Gamification, DeFi & Mobile Adventures Track (Jupiter)
- **4 Jupiter API integrations** (Prediction, Swap, Price, Token)
- Daily missions requiring real Jupiter interactions (swap, predict, claim)
- In-app SOL->USDC swap so users never leave the app
- Token portfolio with live Jupiter Price API valuation
- Full gamification: XP, levels, achievements, streaks, leaderboard
- Jupiter Mobile wallet support

---

## Screenshots

| Arena (Swipe to Bet) | Gamepad Mode | My Bets |
|:---:|:---:|:---:|
| *Swipe cards with confetti and streak counter* | *PSG1 controller hints with button mapping* | *Orders, open positions, claimable payouts* |

| Leaderboard | Profile & Missions | Jupiter Swap |
|:---:|:---:|:---:|
| *Top 3 podium with global rankings* | *XP, achievements, daily missions, portfolio* | *In-app SOL to USDC swap* |

---

<div align="center">

**Swipe. Predict. Win.**

Built for the PlaySolana Matrix Hackathon 2026

[www.solanasaga.fun](https://www.solanasaga.fun)

</div>
