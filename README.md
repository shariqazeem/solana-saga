# Solana Saga

<div align="center">

### **The Tinder of Prediction Markets**

![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Play Solana](https://img.shields.io/badge/Play%20Solana-Gamepad%20Ready-00f0ff?style=for-the-badge)
![Moddio](https://img.shields.io/badge/Moddio-Arcade%20Integrated-ff00aa?style=for-the-badge)
![Indie.fun](https://img.shields.io/badge/Indie.fun-Hackathon%202025-ffd700?style=for-the-badge)

**Swipe Right = YES | Swipe Left = NO | Win the Pool**

[Live Demo](#) | [Video Demo](#) | [Smart Contract](https://explorer.solana.com/address/G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j?cluster=devnet)

</div>

---

## Why We'll Win

### The Problem
Prediction markets are powerful but **boring**. Complex dashboards, intimidating charts, zero fun.

### Our Solution
We threw out the dashboard and built **Tinder for Predictions** — a swipe-to-bet game that makes betting addictive, social, and hardware-ready.

---

## Partner Integrations

### 🎮 Play Solana — Hardware-First Design

> *"Solana Saga is built Hardware-First. We implemented the Gamepad API to ensure native compatibility with the Play Solana Gen1 console. Users can bet using physical D-Pads and buttons for a tactile arcade experience."*

**Technical Implementation:**
- Native `navigator.getGamepads()` API integration
- Real-time polling at 60fps via `requestAnimationFrame`
- Button mapping: **A** = YES, **B** = NO, **Y** = SKIP
- D-Pad support for navigation
- Visual "🎮 Gamepad Connected" indicator
- 500ms debounce to prevent accidental double-bets

```typescript
// Gamepad controls - production ready
if (buttons[0]?.pressed) triggerBet(true);   // A = YES
if (buttons[1]?.pressed) triggerBet(false);  // B = NO
if (buttons[3]?.pressed) triggerSkip();       // Y = SKIP
```

---

### 🕹️ Moddio — Arcade Lounge Integration

> *"To solve the 'waiting time' problem in prediction markets, we integrated a Moddio Arcade Lounge. This keeps users engaged and on the platform while waiting for market resolutions, boosting retention metrics."*

**The Retention Problem:**
- Prediction markets have inherent wait times (hours/days until resolution)
- Users leave → forget to claim → churn

**Our Solution:**
- Embedded Moddio game accessible from main app
- "Arcade Lounge" button in navigation
- Full-screen iframe with ESC to exit
- Keeps users on-platform during wait times
- Increases session duration and return visits

---

### 📱 Social Proof — Viral Loop Engine

> *"We gamified the experience with XP, Levels, and 'Shareable Tickets' to create a viral loop, turning every bet into a marketing impression."*

**Twitter/X Share Integration:**
- One-tap share after every bet
- Pre-formatted tweet with bet details
- Hashtags: #Solana #PredictionMarkets #Web3Gaming
- Mentions @SolanaSaga for tracking impressions

**Gamification Stack:**
- 🔥 Streak counter with fire animations
- 📊 Trust Score (win rate health bar)
- 🎫 Shareable "Bet Tickets" with holographic design
- 🏆 On-chain Leaderboard (real UserStats from blockchain)
- 🎊 Confetti explosions on every bet

---

## The Experience

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     👉 SWIPE RIGHT (or press A) = Bet YES                  │
│     👈 SWIPE LEFT (or press B) = Bet NO                    │
│     👆 SWIPE UP (or press Y) = Skip                        │
│                                                             │
│     Works with: Touch | Mouse | Keyboard | Gamepad         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Input Methods
| Method | YES | NO | SKIP |
|--------|-----|-----|------|
| **Touch** | Swipe Right | Swipe Left | Swipe Up |
| **Mouse** | Drag Right | Drag Left | Drag Up |
| **Keyboard** | → Arrow | ← Arrow | ↑ Arrow |
| **Gamepad** | A Button | B Button | Y Button |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Solana (Devnet) |
| **Smart Contracts** | Anchor Framework 0.32 (Rust) |
| **Frontend** | Next.js 15 + React 18 |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **Wallet** | Solana Wallet Adapter |
| **Gamepad** | Web Gamepad API |
| **Arcade** | Moddio Embed |
| **Token** | SPL Token (USDC) |

---

## Smart Contract

```
Program ID: G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j
Network: Solana Devnet
```

### Instructions
| Instruction | Description |
|-------------|-------------|
| `create_market` | Create prediction market with question & end time |
| `place_bet` | Bet YES or NO (1-10,000 USDC) |
| `resolve_market` | Creator decides winning outcome |
| `claim_winnings` | Winners collect proportional payout |

### Key Innovation: Multiple Bets Per User
Unlike competitors, users can bet **multiple times** on the same market:
```rust
seeds = ["bet", market.key(), user.key(), bet_count.to_le_bytes()]
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

### Leaderboard
- Real on-chain data (UserStats accounts)
- Top 10 players with podium for top 3
- Net profit, win rate, best streak tracking

---

## Local Development

```bash
# Clone
git clone https://github.com/your-username/solana-saga.git
cd solana-saga/frontend

# Install
npm install

# Configure
cp .env.example .env.local

# Run
npm run dev
```

### Test Tokens
1. **Devnet SOL**: [faucet.solana.com](https://faucet.solana.com/)
2. **Devnet USDC**: [spl-token-faucet.com](https://spl-token-faucet.com/) (Mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`)

---

## Competitive Edge

| Feature | Solana Saga | Polymarket | Augur |
|---------|-------------|------------|-------|
| **Swipe UX** | ✅ | ❌ | ❌ |
| **Gamepad Support** | ✅ | ❌ | ❌ |
| **Arcade Mode** | ✅ | ❌ | ❌ |
| **Social Sharing** | ✅ | Limited | ❌ |
| **Gamification** | Full suite | None | None |
| **Speed** | ~400ms | Minutes | 15+ mins |
| **Multiple Bets** | ✅ | ❌ | ❌ |

---

<div align="center">

## Built for Indie.fun Hackathon 2025

**Powered by Solana | Play Solana Ready | Moddio Integrated**

### Swipe. Bet. Win.

[Live Demo](#) | [Smart Contract](https://explorer.solana.com/address/G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j?cluster=devnet)

</div>
