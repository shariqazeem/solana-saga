# Solana Saga

<div align="center">

### **Swipe-to-Predict Gaming on Solana**

![Play Solana](https://img.shields.io/badge/Play%20Solana-Matrix%20Hackathon-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Jupiter](https://img.shields.io/badge/Jupiter-Prediction%20Markets-00f0ff?style=for-the-badge)
![PSG1](https://img.shields.io/badge/PSG1-Optimized-ff00aa?style=for-the-badge)
![Kalshi](https://img.shields.io/badge/Kalshi-Real%20Markets-ffd700?style=for-the-badge)

**Swipe Right = YES | Swipe Left = NO | Win Real Money**

[Live Demo](https://solanasaga.fun) | [Video Demo](#) | [Twitter](https://twitter.com/playsolanasaga)

</div>

---

## Hackathon Tracks

### Jupiter Track: Prediction Markets Expansion
> Create a gamified experience implementing Jupiter's new prediction market product.

**We built exactly this.** Solana Saga transforms the boring prediction market experience into an addictive Tinder-style swipe game powered by Jupiter's infrastructure.

### PSG1-first Track
> Create games designed for the PSG1 gaming console.

**Native PSG1 support.** Optimized for 1240x1080 resolution with full gamepad controls (A=YES, B=NO, Y=SKIP).

---

## What is Solana Saga?

The **first Tinder-style prediction market** on Solana. Swipe through real-world events powered by Kalshi's $11B regulated prediction market, all through Jupiter's infrastructure.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     👉 SWIPE RIGHT (or press A) = Bet YES                  │
│     👈 SWIPE LEFT (or press B) = Bet NO                    │
│     👆 SWIPE UP (or press Y) = Skip                        │
│                                                             │
│     Works with: Touch | Mouse | Keyboard | PSG1 Gamepad    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Jupiter Integration

### Jupiter Mobile Wallet
- Primary authentication method
- QR code login support
- Jupiter Unified Wallet Kit (`@jup-ag/wallet-adapter`)
- Seamless Web3 UX inside the game

### Jupiter Prediction Markets (DFlow/Kalshi)
- Real-world events from Kalshi's CFTC-regulated market
- Tokenized as SPL tokens via DFlow
- Full market coverage: Politics, Crypto, Sports, Weather
- Real USDC payouts

```typescript
// Example: Fetch Kalshi markets via DFlow
const markets = await dflowApi.getFeaturedMarkets(20);
// Transform to swipeable cards
const cards = transformDFlowMarkets(markets);
```

---

## PSG1 Console Features

### Hardware Specifications
| Spec | Value |
|------|-------|
| Resolution | 1240 x 1080 |
| Screen Size | 3.92" |
| Touch | Multi-touch capacitive |
| Buttons | A, B, X, Y, D-Pad, L1, R1 |

### Our Optimizations
- **Resolution-locked UI** — Perfect 1240x1080 layout
- **Large touch targets** — 48px minimum for all interactive elements
- **Gamepad controls** — Native Web Gamepad API at 60fps
- **Button hints** — Visual PSG1 button indicators
- **Safe area padding** — Account for console bezel

### Control Mapping
| Button | Action |
|--------|--------|
| **A** (Green) | Vote YES |
| **B** (Red) | Vote NO |
| **Y** (Yellow) | Skip |
| **D-Pad** | Navigation |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Markets** | Jupiter + DFlow + Kalshi |
| **Wallet** | Jupiter Unified Wallet Kit |
| **Blockchain** | Solana Mainnet |
| **Frontend** | Next.js 15 + React 18 |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **Gamepad** | Web Gamepad API |
| **Token** | USDC (SPL) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SOLANA SAGA                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   Jupiter   │    │    DFlow    │    │   Kalshi    │    │
│  │   Wallet    │◄──►│     API     │◄──►│   Markets   │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│         │                  │                              │
│         ▼                  ▼                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Swipe-to-Predict UI                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │  Touch   │  │ Gamepad  │  │ Keyboard │         │  │
│  │  └──────────┘  └──────────┘  └──────────┘         │  │
│  └─────────────────────────────────────────────────────┘  │
│                           │                               │
│                           ▼                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                   PSG1 Console                      │  │
│  │                 (1240x1080 @ 3.92")                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Gamification Features

### Visual Feedback
- **Confetti Explosions** — Every bet triggers particles
- **Screen Shake** — Visceral feedback on actions
- **3D Holographic Cards** — Tilt effects and glare
- **Streak-Reactive Theme** — Environment changes with streak

### Streak System
| Streak | Theme |
|--------|-------|
| 0-4 | Cyan/Pink cyberpunk |
| 5-9 | Gold/Fire + faster animations |
| 10+ | **WARP SPEED MODE** |

### Social Features
- Share bets to Twitter/X
- Global leaderboard
- Win rate & streak tracking

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/solana-saga.git
cd solana-saga/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```bash
# Production (Hackathon Mode)
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_MARKET_SOURCE=dflow
NEXT_PUBLIC_USE_JUPITER_WALLET=true
NEXT_PUBLIC_PSG1_MODE=true

# Development (Testing)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_MARKET_SOURCE=legacy
NEXT_PUBLIC_USE_JUPITER_WALLET=false
NEXT_PUBLIC_PSG1_MODE=false
```

---

## Why We'll Win

### Jupiter Track
| Requirement | Our Implementation |
|-------------|-------------------|
| Jupiter Mobile authentication | Jupiter Unified Wallet Kit |
| Jupiter prediction market | DFlow API for Kalshi markets |
| Gamified experience | Tinder-style swipe mechanics |
| Seamless Web3 UX | One-tap betting, visual feedback |

### PSG1-first Track
| Requirement | Our Implementation |
|-------------|-------------------|
| PSG1 resolution | 1240x1080 locked layout |
| Gamepad support | Full A/B/Y/D-Pad mapping |
| Touch support | Multi-touch gestures |
| Native feel | Large targets, visual hints |

---

## Competitive Advantage

| Feature | Solana Saga | Polymarket | Others |
|---------|-------------|------------|--------|
| **Swipe UX** | ✅ | ❌ | ❌ |
| **PSG1 Support** | ✅ | ❌ | ❌ |
| **Jupiter Wallet** | ✅ | ❌ | ❌ |
| **Kalshi Markets** | ✅ | ❌ | ❌ |
| **Gamepad Controls** | ✅ | ❌ | ❌ |
| **Gamification** | Full suite | None | Limited |

---

## Links

- **Live Demo**: [solanasaga.fun](https://solanasaga.fun)
- **Twitter**: [@playsolanasaga](https://twitter.com/playsolanasaga)
- **Play Solana**: [playsolana.com](https://playsolana.com)
- **Jupiter**: [jup.ag](https://jup.ag)

---

<div align="center">

## Built for Play Solana Matrix Hackathon 2026

**Jupiter Track** | **PSG1-first Track**

### Swipe. Predict. Win.

*Powered by Jupiter | Kalshi | DFlow | Solana*

</div>
