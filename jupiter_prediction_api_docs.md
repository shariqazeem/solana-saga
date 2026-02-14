> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# About Prediction

> Overview of Jupiter Prediction Market

<Note>
  **BETA**

  The Prediction Market API is currently in beta and subject to breaking changes as we continue to improve the product. If you have any feedback, please reach out in [Discord](https://discord.gg/jup).
</Note>

<Note>
  The API guides will be coming soon.

  In the meantime, refer to the [API Reference](/api-reference/prediction) for the latest API documentation.
</Note>

The Jupiter Prediction Market enables you to participate in binary prediction markets on Solana, allowing users to trade on the outcomes of real-world events across categories like Sports, Crypto, Politics, E-sports, Culture, Economics, and Tech.

### How It Works

Users can interact with the markets directly on Solana, and Jupiter will handle the off-chain actions required to:

* **Open Positions**: Buy YES or NO contracts on market outcomes
* **Manage Positions**: Buy to increase exposure or sell to reduce positions
* **Claim Winnings**: Receive JupUSD payouts when your predictions are correct
* **Track Performance**: Monitor positions, P\&L, and trading history

Typical flow of actions:

1. **Events are created** around real-world occurrences (e.g., "Will Solana reach \$100k by end of 2026?")
2. **Markets are established** within events, each representing a binary outcome (YES or NO)
3. **Users trade contracts** at dynamic prices that reflect market sentiment (prices range from \$0 to \$1 per contract)
4. **Events resolve** based on predetermined rules when the outcome is known
5. **Winners claim payouts** - each winning contract is worth \$1 (no payout fees)

## Architectural Components

We have generalized the Prediction Market architecture to be agnostic of the underlying data provider. This allows us to support multiple data providers and easily add new ones in the future.

### Events

Events are the top-level container for prediction markets. Each event represents a real-world occurrence that will have a determinable outcome.

**Event Properties:**

* **Event ID**: Unique identifier for the event
* **Series**: Groups related events (e.g., "NFL Week 1")
* **Category**: Primary classification (crypto, sports, politics, esports, culture, economics, tech)
* **Subcategory**: More specific classification within the category
* **Markets**: One or more binary markets within the event
* **Metadata**: Title, subtitle, images, rules documents
* **Metrics**: Total TVL, trading volume, close conditions

**Event Lifecycle:**

* Events can contain multiple markets (e.g., "Who will win the championship?" might have markets for each team)
* Events can support single winners or multiple winners depending on configuration
* Events track overall volume and liquidity across all their markets

### Markets

Markets are binary prediction markets within an event, representing specific YES/NO outcomes.

**Market Properties:**

* **Market ID**: Unique identifier derived as a PDA (Program Derived Address)
* **Status**: `open`, `closed`, or `cancelled`
* **Result**: Empty string (unresolved), `pending`, `yes`, or `no`
* **Pricing Data**: Buy/sell prices for YES and NO sides, volume, open interest, liquidity
* **Metadata**: Title, description, trading rules, resolution criteria

**Market States:**

1. **Open**: Market is actively trading, users can create orders
2. **Closed**: Trading has stopped, awaiting settlement
3. **Settled**: Result has been determined, winners can claim payouts
4. **Cancelled**: Market voided, positions returned

**Pricing Model:**

* Prices are quoted in USD (stored as micro USD on-chain)
* Each contract represents a claim to \$1 if the outcome is correct
* Separate buy and sell prices for YES and NO sides
* Prices reflect probability (e.g., 70¢ YES price = 70% probability)

### Orders

Orders represent user intentions to buy or sell contracts in a market.

**Order Properties:**

* **Order Pubkey**: Solana account address for the order
* **Owner**: User's public key
* **Market**: Target market identifier
* **Side**: YES or NO position
* **Direction**: Buy (increase exposure) or Sell (decrease exposure)
* **Contracts**: Number of contracts to trade
* **Price Limits**: `maxBuyPriceUsd` or `minSellPriceUsd`
* **Status**: `pending`, `filled`, or `failed`
* **Fill Details**: Filled contracts, average fill price, fees paid

**Order Flow:**

1. User creates an order request with desired parameters
2. API returns an unsigned Solana transaction
3. User signs and submits the transaction to Solana
4. Keeper network matches and fills the order
5. Order status updates reflect fill progress
6. Settled orders update associated positions

**Order Types:**

* **Buy Orders**: Acquire new contracts or increase position size
* **Sell Orders**: Reduce position size or exit entirely
* **Limit Orders**: Execute only at specified price or better

### Positions

Positions represent a user's holdings in a specific market side (YES or NO).

**Position Properties:**

* **Position Pubkey**: PDA derived from owner, market, and side
* **Owner**: User's public key
* **Market**: Associated market identifier
* **Side**: YES or NO position
* **Contracts**: Total contracts held
* **Cost Basis**: `totalCostUsd`, `avgPriceUsd`
* **Mark-to-Market**: `valueUsd`, `markPriceUsd` (current market value)
* **P\&L Metrics**: Unrealized P\&L, P\&L after fees, percentage returns
* **Order Activity**: Number of open orders
* **Settlement**: `claimable`, `claimed`, `claimedUsd`, `payoutUsd`

**Position States:**

* **Active**: Market is open, position has mark-to-market value and P\&L
* **Closed Market**: Market closed but not settled, P\&L frozen
* **Claimable**: Market settled favorably, payout available
* **Lost**: Market settled against the position (no payout)
* **Claimed**: Payout has been withdrawn

**P\&L Calculation:**

* **Unrealized P\&L**: (Current market value) - (Cost basis)
* **Realized P\&L**: Calculated on partial or full position closes
* **Fees**: Protocol and venue fees reduce net returns

### Vault

The Vault manages the settlement and escrow mechanism for the prediction market system.

**Vault Functions:**

* **Escrow Management**: Holds deposited JupUSD during active trading
* **Settlement Distribution**: Pays out winning positions
* **Fee Collection**: Accumulates protocol and venue fees
* **Balance Tracking**: Maintains total locked liquidity

The vault is implemented as a Solana PDA that securely holds all user deposits and ensures payouts are available when positions are claimable.

### History & Events

The History system tracks all on-chain activity for audit and user interface purposes.

**Event Types:**

* `order_created`: New order placed
* `order_filled`: Order matched and executed
* `order_failed`: Order could not be filled
* `position_updated`: Position modified by order fill
* `position_lost`: Position resolved against user
* `payout_claimed`: User withdrew winnings

**History Properties:**

* Signature and slot for on-chain verification
* Full order and position details at time of event
* Fee breakdown and P\&L calculations
* Market and event metadata snapshots

### Orderbook & Price Discovery

The orderbook system facilitates price discovery and order matching.

**Orderbook Structure:**

* **Bid/Ask Spreads**: Separate order books for YES and NO sides
* **Liquidity Depth**: Available contracts at various price levels
* **Market Data**: Best bid/ask, spreads, recent trades
* **Volume Tracking**: 24h volume, all-time volume

**Price Discovery:**

* Prices are determined by supply and demand
* Market makers can provide liquidity at various price points
* Keepers match orders efficiently
* Slippage protection via price limits

### Settlement Process

The settlement process resolves markets and enables winners to claim payouts.

**Settlement Flow:**

1. **Market Closes**: Trading stops at predetermined `closeTime`
2. **Result Determined**: Authoritative source provides outcome
3. **Market Settles**: Result recorded on-chain (`yes` or `no`)
4. **Positions Become Claimable**: Winning positions can claim payouts
5. **Users Claim**: Winners receive \$1 per contract (no payout/claim fees)
6. **Losing Positions**: Contracts become worthless

**Settlement Guarantees:**

* All outcomes are determined by transparent rules
* Settlement is final and immutable once recorded
* Payouts are guaranteed by vault reserves
* Disputed outcomes follow documented resolution procedures

## Key Concepts

### Binary Market Structure

Every market has exactly two outcomes: YES or NO. This simplicity ensures:

* Clear resolution criteria
* Straightforward pricing (probability-based)
* Easy position management
* Transparent payouts

### Contract Value

Each contract represents a claim to **\$1 if correct**:

* If you buy YES at 70¢ and YES wins, you profit 30¢ per contract
* If you buy NO at 40¢ and NO wins, you profit 60¢ per contract
* Losing contracts expire worthless

### Price as Probability

Market prices reflect implied probability:

* 70¢ YES price ≈ 70% probability of YES outcome
* 30¢ NO price ≈ 30% probability of NO outcome
* YES price + NO price ≈ \$1.00 (minus spread and fees)

### Position Management

Users can actively manage positions:

* **Buy more**: Increase exposure to an outcome
* **Sell partial**: Take profits or reduce risk
* **Close entirely**: Exit the market completely
* **Hold to settlement**: Wait for final payout

### Fees

The system charges fees on certain trading activity:

* **Platform Fees**: Underlying protocol fee
* **Total Fee**: Displayed before order execution
* **Payout Fees**: No payout/claim fees

### Account Structure (Solana)

There are a few accounts involved in the prediction market system:

1. **Position Account**: Represents a user's position in a market.
2. **Order Account**: Represents a user's order to open, close, or modify a position.
3. **Vault Account**: Represents the vault that holds the user's funds.

Upon position creation, there will be 3 transactions involved:

1. Create order: When opening a position, you sign a transaction to create an order for the position.
2. Fill order: Once the order is created, our keeper system will pick up the order and fill them directly on the underlying prediction markets.
3. Close order: Once the order is filled or not, the order will be closed.


> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Prediction API

> Overview of Jupiter Prediction Market API

<Note>
  **BETA**

  The Prediction Market API is currently in beta and subject to breaking changes. If you have any feedback, please reach out in [Discord](https://discord.gg/jup).
</Note>

## Events

<CardGroup>
  <Card title="Get Events" href="/api-reference/prediction/get-events" icon="file-lines" horizontal>
    Get a list of all available prediction events with optional filtering and pagination
  </Card>

  <Card title="Search Events" href="/api-reference/prediction/search-events" icon="file-lines" horizontal>
    Search for events by title or keyword
  </Card>

  <Card title="Get Event" href="/api-reference/prediction/get-event" icon="file-lines" horizontal>
    Get detailed information about a specific event
  </Card>

  <Card title="Get Suggested Events" href="/api-reference/prediction/get-suggested-events" icon="file-lines" horizontal>
    Get personalized event suggestions based on user activity
  </Card>
</CardGroup>

## Markets

<CardGroup>
  <Card title="Get Event Markets" href="/api-reference/prediction/get-event-markets" icon="file-lines" horizontal>
    Get all markets for a specific event
  </Card>

  <Card title="Get Event Market" href="/api-reference/prediction/get-event-market" icon="file-lines" horizontal>
    Get detailed market information for a specific market within an event
  </Card>

  <Card title="Get Market" href="/api-reference/prediction/get-market" icon="file-lines" horizontal>
    Get detailed market information by market ID
  </Card>
</CardGroup>

## Orders

<CardGroup>
  <Card title="Get Orders" href="/api-reference/prediction/get-orders" icon="file-lines" horizontal>
    Get a list of orders with optional filtering by owner or market
  </Card>

  <Card title="Get Order" href="/api-reference/prediction/get-order" icon="file-lines" horizontal>
    Get detailed information about a specific order
  </Card>

  <Card title="Get Order Status" href="/api-reference/prediction/get-order-status" icon="file-lines" horizontal>
    Get the latest status and history for an order
  </Card>

  <Card title="Create Order" href="/api-reference/prediction/create-order" icon="file-lines" horizontal>
    Request an unsigned transaction to create a new order
  </Card>

  <Card title="Close Order" href="/api-reference/prediction/close-order" icon="file-lines" horizontal>
    Request an unsigned transaction to close a pending order
  </Card>

  <Card title="Close All Orders" href="/api-reference/prediction/close-all-orders" icon="file-lines" horizontal>
    Request unsigned transactions to close multiple orders
  </Card>
</CardGroup>

## Positions

<CardGroup>
  <Card title="Get Positions" href="/api-reference/prediction/get-positions" icon="file-lines" horizontal>
    Get a list of positions with optional filtering
  </Card>

  <Card title="Get Position" href="/api-reference/prediction/get-position" icon="file-lines" horizontal>
    Get detailed information about a specific position
  </Card>

  <Card title="Close Position" href="/api-reference/prediction/close-position" icon="file-lines" horizontal>
    Request an unsigned transaction to sell all contracts in a position
  </Card>

  <Card title="Close All Positions" href="/api-reference/prediction/close-all-positions" icon="file-lines" horizontal>
    Request unsigned transactions to close all open positions
  </Card>

  <Card title="Claim Position" href="/api-reference/prediction/claim-position" icon="file-lines" horizontal>
    Request an unsigned transaction to claim payout from a winning position
  </Card>
</CardGroup>

## History & Data

<CardGroup>
  <Card title="Get History" href="/api-reference/prediction/get-history" icon="file-lines" horizontal>
    Get trading history and event records for an account
  </Card>

  <Card title="Get Orderbook" href="/api-reference/prediction/get-orderbook" icon="file-lines" horizontal>
    Get orderbook data for a specific market
  </Card>

  <Card title="Get Trading Status" href="/api-reference/prediction/get-trading-status" icon="file-lines" horizontal>
    Get current trading status of the prediction market
  </Card>
</CardGroup>

## Profile & Social

<CardGroup>
  <Card title="Get Profile" href="/api-reference/prediction/get-profile" icon="file-lines" horizontal>
    Get profile statistics for a user
  </Card>

  <Card title="Get PnL History" href="/api-reference/prediction/get-pnl-history" icon="file-lines" horizontal>
    Get historical PnL data for charting
  </Card>

  <Card title="Get Trades" href="/api-reference/prediction/get-trades" icon="file-lines" horizontal>
    Get recent filled trades across all markets
  </Card>

  <Card title="Get Leaderboards" href="/api-reference/prediction/get-leaderboards" icon="file-lines" horizontal>
    Get leaderboard rankings by various metrics
  </Card>

  <Card title="Follow User" href="/api-reference/prediction/follow-user" icon="file-lines" horizontal>
    Follow a user to track their predictions
  </Card>

  <Card title="Unfollow User" href="/api-reference/prediction/unfollow-user" icon="file-lines" horizontal>
    Unfollow a previously followed user
  </Card>

  <Card title="Get Followers" href="/api-reference/prediction/get-followers" icon="file-lines" horizontal>
    Get list of followers for a user
  </Card>

  <Card title="Get Following" href="/api-reference/prediction/get-following" icon="file-lines" horizontal>
    Get list of users being followed
  </Card>
</CardGroup>

## Vault

<CardGroup>
  <Card title="Get Vault Info" href="/api-reference/prediction/get-vault-info" icon="file-lines" horizontal>
    Get vault account information and balance
  </Card>
</CardGroup>


