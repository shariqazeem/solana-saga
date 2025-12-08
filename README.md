# Solana Saga

<div align="center">

### **The First Swipe-to-Bet Prediction Game on Solana**

![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Hackathon](https://img.shields.io/badge/Indie.fun%20Hackathon-2025-blueviolet?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)

**Swipe Right = YES | Swipe Left = NO | Win the Pool**

[Live Demo](#) | [Video Demo](#) | [Smart Contract](https://explorer.solana.com/address/G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j?cluster=devnet)

</div>

---

## The Problem

Prediction markets are powerful tools for aggregating wisdom, but they're **boring**.

Current platforms feel like stock trading dashboards: complex interfaces, intimidating charts, zero fun. Nobody wants to study order books just to bet on whether their favorite memecoin will moon.

## Our Solution: Gamified Betting

We threw out the dashboard and built **Tinder for Predictions**.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     👉 SWIPE RIGHT = Bet YES                               │
│     👈 SWIPE LEFT = Bet NO                                 │
│     👆 SWIPE UP = Skip                                     │
│                                                             │
│     That's it. No charts. No order books.                  │
│     Just pure, addictive, swipe-to-bet action.             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## How It Works

### The Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   1. CREATE     │────▶│    2. BET       │────▶│   3. RESOLVE    │
│                 │     │                 │     │                 │
│  Market Creator │     │  Players Swipe  │     │ Creator Decides │
│  sets question  │     │  YES / NO / Skip│     │   the outcome   │
│  & end time     │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                        ┌─────────────────────────────────────────┐
                        │           4. CLAIM WINNINGS             │
                        │                                         │
                        │    Winners split the losers' pool!      │
                        │    Original bet + share of losers       │
                        │              (minus 2% fee)             │
                        └─────────────────────────────────────────┘
```

### The Smart Contract Magic (AMM)

Under the hood, we use an **Automated Market Maker (AMM)** inspired by Uniswap:

1. **Virtual Liquidity Pools**: Each market starts with 1000 USDC virtual liquidity on each side (YES/NO)
2. **Dynamic Odds**: As more people bet YES, the YES price goes up (harder to win, but bigger potential payout)
3. **Winner Takes All**: When resolved, winners split the entire losing pool proportionally

**Example:**
```
Market: "Will SOL hit $200?"

YES Pool: $5,000 (60%)    NO Pool: $3,333 (40%)

If YES wins:
  → Every YES bettor gets: Original bet + (their share of $3,333 NO pool)
  → After 2% platform fee
```

---

## Gamification Features

### Visual Feedback
- **Confetti Explosions** - Every bet triggers satisfying particle effects
- **Screen Shake** - Visceral feedback on every action
- **3D Holographic Cards** - Tilt effects and glare on hover
- **HypeHUD** - AI analyst with trash talk and sentiment analysis

### Streak System
- **Fire Counter** - Build betting streaks with animated flames
- **Trust Score** - Health-bar style reputation meter
- **Streak-Reactive Environment**:
  - 0-4 bets: Cyan/Pink cyberpunk theme
  - 5-9 bets: Gold/Fire theme + faster animations
  - 10+ bets: **WARP SPEED MODE** with radial blur!

### Retro-Wave Aesthetic
- Animated synthwave grid floor with perspective
- Floating neon particles
- CRT scan line effects
- Vaporwave sun at horizon

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Solana (Devnet) |
| **Smart Contracts** | Anchor Framework 0.32 (Rust) |
| **Frontend** | Next.js 15 + React 18 |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **Wallet** | Solana Wallet Adapter (Phantom) |
| **Token** | SPL Token (USDC) |

---

## Smart Contract Architecture

```
Program ID: G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j
```

### Instructions

| Instruction | Description | Access |
|-------------|-------------|--------|
| `create_market` | Create new prediction market | Anyone |
| `place_bet` | Bet YES or NO (1-10,000 USDC) | Anyone with USDC |
| `resolve_market` | Decide the winning outcome | Creator only |
| `claim_winnings` | Collect payout | Bettors |
| `cancel_market` | Cancel if no bets | Creator only |

### Key Innovation: Multiple Bets per User

Unlike most prediction markets, users can bet **multiple times** on the same market. Each bet creates a unique PDA:

```rust
seeds = ["bet", market.key(), user.key(), total_bets_count.to_le_bytes()]
```

This allows the "Start Over" feature where players can re-bet on the same questions!

### Security Features

- `require!(!bet.claimed)` - Prevents double claiming
- `require!(bet.user == ctx.accounts.user.key())` - Only bet owners can claim
- `require!(market.status == MarketStatus::Resolved)` - Must be resolved first
- Overflow protection on all math operations
- Min/max bet limits (1 - 10,000 USDC)

---

## Local Development

### Prerequisites

- Node.js 18+
- Phantom Wallet (browser extension)
- Devnet SOL (for gas) + Devnet USDC (for betting)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/solana-saga.git
cd solana-saga/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your RPC endpoint

# Run development server
npm run dev
```

### Get Test Tokens

1. **Devnet SOL**: Use [Solana Faucet](https://faucet.solana.com/)
2. **Devnet USDC** (Mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`):
   - Use [spl-token-faucet](https://spl-token-faucet.com/)
   - Or request in Solana Discord

---

## Project Structure

```
solana-saga/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Main arena (swipe interface)
│   │   ├── admin/page.tsx        # Market creation dashboard
│   │   └── layout.tsx            # Root layout with wallet provider
│   ├── components/
│   │   ├── SwipeableMarketStack.tsx   # Tinder-style card stack
│   │   ├── GameOverlay.tsx            # HUD with stats/notifications
│   │   ├── HypeHUD.tsx                # AI analyst overlay
│   │   └── RetroGrid.tsx              # Animated background
│   ├── hooks/
│   │   ├── useSoundEffects.ts         # Web Audio API sounds
│   │   └── useUsdcBalance.ts          # Real-time USDC balance
│   └── lib/solana/
│       ├── hooks/usePredictionMarkets.ts  # Anchor program interface
│       └── idl/prediction_markets.json    # Contract IDL
│
└── prediction-markets-contracts/
    └── programs/prediction-markets/src/lib.rs  # Anchor program
```

---

## Demo Recording Checklist

### Setup (Before Recording)
- [ ] Wallet A (Creator) has SOL + USDC on Devnet
- [ ] Wallet B (Player) has SOL + USDC on Devnet
- [ ] Browser window sized for screen recording
- [ ] Clear any existing test markets

### Recording Flow

**Step 1: Create Market (Wallet A)**
- [ ] Connect Wallet A
- [ ] Go to Admin panel (gear icon)
- [ ] Create market: "Will SOL hit $200 by end of month?"
- [ ] Category: Crypto, Duration: 1 day
- [ ] Confirm transaction

**Step 2: Place Bets (Wallet B)**
- [ ] Disconnect Wallet A, Connect Wallet B
- [ ] See the market card appear
- [ ] Set bet amount ($5)
- [ ] Swipe RIGHT (YES) - show confetti!
- [ ] Swipe again on same market (demonstrate multiple bets)
- [ ] Show streak counter increasing

**Step 3: Resolve Market (Wallet A)**
- [ ] Disconnect Wallet B, Connect Wallet A
- [ ] Go to Admin panel
- [ ] Find the market
- [ ] Click "YES WON" to resolve
- [ ] Confirm transaction

**Step 4: Claim Winnings (Wallet B)**
- [ ] Disconnect Wallet A, Connect Wallet B
- [ ] Go to My Bets page
- [ ] Find winning bet
- [ ] Click "Claim Winnings"
- [ ] Show USDC balance increase!

**Step 5: Show Off Features**
- [ ] Hover over card - show 3D tilt effect
- [ ] Build streak to 5+ - show gold/fire theme
- [ ] Build streak to 10+ - show WARP SPEED mode!
- [ ] Toggle sound on/off

---

## Competitive Advantage

| Feature | Solana Saga | Polymarket | Augur |
|---------|-------------|------------|-------|
| **Speed** | ~400ms | Minutes | 15+ mins |
| **UX** | Swipe = Done | Complex forms | Complex forms |
| **Mobile** | Native feel | Okay | Poor |
| **Gamification** | Full suite | None | None |
| **Fun Factor** | 🎮🎮🎮 | 📊 | 📊 |
| **Multiple Bets** | ✅ | ❌ | ❌ |

---

## Roadmap

- [x] **Phase 1**: MVP - Swipe-to-bet interface, on-chain betting
- [ ] **Phase 2**: Decentralized resolution (Pyth/Switchboard oracles)
- [ ] **Phase 3**: Mobile app (React Native)
- [ ] **Phase 4**: Token launch + governance
- [ ] **Phase 5**: Mainnet deployment

---

## License

MIT License - Fork it, build on it, make predictions fun!

---

<div align="center">

**Built with caffeine and determination for the Indie.fun Hackathon**

**Powered by Solana**

---

### Swipe. Bet. Win.

[Live Demo](#) | [Smart Contract](https://explorer.solana.com/address/G9tuE1qzcurDeUQcfgkpeEkLgJC3yGsF7crn53pzD79j?cluster=devnet) | [GitHub](https://github.com/your-username/solana-saga)

</div>
