# PlaySolana Matrix Hackathon — Submission

## Solana Saga — The Tinder of Prediction Markets

**Tracks:**
- Primary: **PSG1-first Track by Play Solana** ($6K / $3K / $1K)
- Secondary: **Gamification, DeFi & Mobile Adventures by Jupiter** ($6K / $3K / $1K)

---

## Project Summary

**Solana Saga** transforms prediction markets into a mobile-native, gamified arcade experience built for the PSG1 handheld gaming console. Using Tinder-style swipe mechanics and native gamepad controls, players bet YES or NO on real Jupiter Prediction Markets with a single gesture — using real USDC on Solana mainnet.

### Key Features

| Feature | Description |
|---------|-------------|
| **Swipe-to-Bet UX** | Swipe right = YES, left = NO, up = SKIP — or use buttons |
| **4 Jupiter API Integrations** | Prediction Markets, Swap v1, Price v2, Token v2 |
| **PSG1 Gamepad Support** | A=YES, B=NO, Y=SKIP, D-pad, L1/R1, SELECT/START on every page |
| **Real USDC on Mainnet** | On-chain betting with real money via Jupiter Prediction API |
| **Gamification Suite** | XP, 10+ levels, 10 achievements, 6 daily missions, streaks |
| **In-App Jupiter Swap** | SOL ↔ USDC swap without leaving the app |
| **Position Management** | View orders, sell positions early, claim winning payouts |
| **Leaderboard** | Jupiter API-powered global rankings by PnL, volume, win rate |
| **Token Portfolio** | Live portfolio with Jupiter Price + Token APIs |
| **PWA + Android APK** | TWA-wrapped for PSG1 installation |

---

## Technical Stack

- **Blockchain:** Solana Mainnet
- **Prediction Markets:** Jupiter Prediction API (`api.jup.ag/prediction/v1`)
- **Token Swap:** Jupiter Swap API v1 (`api.jup.ag/swap/v1`)
- **Prices:** Jupiter Price API v2 (`api.jup.ag/price/v2`)
- **Token Metadata:** Jupiter Token API v2 (`api.jup.ag/tokens/v2`)
- **Frontend:** Next.js + React 18 + TypeScript + Tailwind CSS
- **Animations:** Framer Motion + canvas-confetti
- **Wallet:** @solana/wallet-adapter + @jup-ag/wallet-adapter
- **Audio:** Web Audio API (synthesized sound effects)
- **Controller:** Web Gamepad API (60fps polling, PSG1 compatible)
- **Haptics:** Vibration API
- **Android:** Kotlin WebView TWA wrapper
- **Deploy:** Vercel (auto-deploy from GitHub)

---

## PSG1 Track Submission

### How We Meet the Objectives

1. **Hardware-First Design**
   - Optimized for PSG1's 1240x1080 screen aspect ratio
   - 60fps gamepad polling via `requestAnimationFrame`
   - Larger touch targets in PSG1 mode (72px buttons)
   - Auto-detection via screen dimensions, user agent, and `?psg1=true` URL param
   - PSG1 detection banner confirms controller activation on launch

2. **Full Gamepad Controls on Every Page**
   - **Arena:** A=Yes, B=No, Y=Skip, D-pad=Navigate, R1/L1=Bet amounts
   - **Swap:** A=Confirm, B=Cancel, D-pad=Adjust amounts
   - **My Bets:** L1/R1=Switch tabs, A=Select/Claim, B=Back
   - **Markets:** D-pad=Scroll, X=Status filter, Y=Search
   - **Profile:** D-pad=Scroll, B=Back
   - **Global:** SELECT=Cycle tabs, START=Controls reference overlay
   - Controls reference overlay (START) shows full mapping for all pages

3. **PSG1 Controller Hints**
   - `PSG1ControllerHints` component shows button mappings in real-time
   - `usePSG1Mode` hook auto-detects PSG1 device
   - Visual feedback for every button press (pulse animations)

4. **Playable MVP**
   - Full prediction market gameplay with real USDC
   - 8 market categories (crypto, sports, politics, esports, culture, economics, tech)
   - Complete bet lifecycle: place → hold → sell early or claim payout
   - In-app token swap when low on USDC

### PSG1 Button Mapping

```
ARENA:     A=Yes  B=No  Y=Skip  D-Pad=Navigate  R1/L1=Bet+/-
SWAP:      A=Confirm  B=Cancel  D-Pad=Amounts
MY BETS:   L1/R1=Tabs  A=Select  B=Back
MARKETS:   D-Pad=Categories  X=Status  Y=Search
PROFILE:   D-Pad=Navigate  B=Back
GLOBAL:    SELECT=Switch Tab  START=Controls Menu
```

---

## Jupiter Track Submission

### 4 Jupiter API Integrations

1. **Jupiter Prediction Markets API** (`api.jup.ag/prediction/v1`)
   - Fetch active markets with real-time odds
   - Place bets (buy YES/NO positions)
   - Sell positions early
   - Claim winning payouts
   - User profile and stats
   - Global leaderboard rankings

2. **Jupiter Swap API v1** (`api.jup.ag/swap/v1`)
   - In-app SOL ↔ USDC token swapping
   - Quick swap presets ($5, $10, $25, $50)
   - General swap with any token pair
   - Live quotes with exchange rate, price impact, route info

3. **Jupiter Price API v2** (`api.jup.ag/price/v2`)
   - Live token prices for portfolio valuation
   - Real-time price badges on crypto market cards
   - Total portfolio USD value calculation

4. **Jupiter Token API v2** (`api.jup.ag/tokens/v2`)
   - Token metadata (name, symbol, icon) for portfolio display
   - Token search for swap token selector
   - Mint address resolution

### Gamification Tied to Jupiter

- **Daily Missions** require real Jupiter interactions:
  - Place predictions (Prediction API)
  - Complete a token swap (Swap API)
  - Claim a winning payout (Prediction API)
  - Diversify across categories
  - Hit streak milestones
  - Make a whale bet ($10+)
- **XP & Levels** earned from predictions, wins, and mission completions
- **10 Achievements** with confetti celebrations
- **Leaderboard** powered by Jupiter Prediction API rankings
- **Jupiter branding** visible throughout: arena cards, swap page, leaderboard, footer

---

## Demo Video Script (60-90 seconds)

### Scene 1: Hook (0-5s)
"Prediction Markets Are Boring" → glitch → Solana Saga appears

### Scene 2: Swipe Demo (5-20s)
Rapid swipes with confetti, streak counter climbing, YES/NO flying text

### Scene 3: Real Bet (20-35s)
Connect wallet → place actual USDC bet → tx confirmation on-chain

### Scene 4: Jupiter Swap (35-45s)
Quick SOL → USDC swap in-app, balance updates instantly

### Scene 5: My Bets (45-50s)
Show orders, open positions, claimable payouts

### Scene 6: Leaderboard (50-55s)
Jupiter-powered global rankings with podium

### Scene 7: Gamepad (55-65s)
PSG1 controller hints, button presses with visual feedback

### Scene 8: Gamification (65-75s)
Daily missions, XP bar, achievements, profile stats

### Scene 9: Close (75-85s)
"4 Jupiter APIs. Solana Mainnet. Built for PSG1."

---

## Links

| Resource | URL |
|----------|-----|
| **Live App** | https://www.solanasaga.fun |
| **GitHub** | https://github.com/shariqazeem/solana-saga |
| **Android APK** | Available in `android-wrapper/app/build/outputs/apk/` |
| **Video Demo** | [YouTube Link] |

---

## Screenshots

1. **Arena View** — Swipe interface with market cards and bet controls
2. **Gamepad Mode** — PSG1 controller hints with button mapping
3. **My Bets** — Orders, open positions, claimable payouts
4. **Leaderboard** — Top 3 podium with global rankings
5. **Profile** — XP, achievements, daily missions, token portfolio

---

## How to Run Locally

```bash
# Clone and install
git clone https://github.com/shariqazeem/solana-saga.git
cd solana-saga/frontend
npm install

# Configure environment
cp .env.local.example .env.local
# Add your Jupiter API key and RPC endpoint

# Run development server
npm run dev

# Build for production
npm run build

# Build Android APK (for PSG1)
cd ../android-wrapper
./gradlew assembleDebug
```

---

## Testing PSG1 Mode

To test PSG1 mode without the device:

1. Add `?psg1=true` to the URL: `https://www.solanasaga.fun?psg1=true`
2. Connect any USB gamepad
3. Press START to see the full controls reference overlay
4. Use browser DevTools to emulate 1240x1080 screen

---

## Team

- **Builder:** Shariq Azeem
- **Contact:** [@shariqazeem](https://x.com/shariqazeem)

---

## Closing Statement

Solana Saga proves that DeFi can feel like a game. By combining Jupiter's 4 APIs with Tinder-style swipe UX and PSG1 gamepad controls, we've turned prediction markets into an arcade experience that's actually fun to use. Real USDC. Real markets. Real fun.

**Swipe. Predict. Win.**
