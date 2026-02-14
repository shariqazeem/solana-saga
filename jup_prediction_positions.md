> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Positions

> Get a list of positions with optional filtering



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /positions
openapi: 3.0.3
info:
  title: Prediction Market API
  version: 1.0.0
  description: Jupiter Prediction Market API Schema
servers:
  - url: https://api.jup.ag/prediction/v1
    description: Jupiter Prediction Market API Endpoint
security:
  - ApiKeyAuth: []
tags:
  - name: Events
  - name: Markets
  - name: Orders
  - name: Positions
  - name: History
  - name: Trading
  - name: Orderbook
  - name: Milestones
  - name: Vault
paths:
  /positions:
    get:
      tags:
        - Positions
      parameters:
        - schema:
            type: integer
            nullable: true
            minimum: 0
          required: false
          name: start
          in: query
        - schema:
            type: integer
            nullable: true
            minimum: 0
          required: false
          name: end
          in: query
        - schema:
            type: string
            minLength: 1
            description: Position owner public key
          required: false
          description: Position owner public key
          name: ownerPubkey
          in: query
        - schema:
            type: string
            minLength: 1
            description: Position owner public key (deprecated alias; use ownerPubkey)
          required: false
          description: Position owner public key (deprecated alias; use ownerPubkey)
          name: userPubkey
          in: query
        - schema:
            type: string
            minLength: 1
          required: false
          name: marketPubkey
          in: query
        - schema:
            type: string
            minLength: 1
          required: false
          name: marketId
          in: query
        - schema:
            type: string
            enum:
              - 'true'
              - 'false'
            description: Filter by position side (true = YES, false = NO)
          required: false
          description: Filter by position side (true = YES, false = NO)
          name: isYes
          in: query
      responses:
        '200':
          description: List of on-chain positions
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Position'
                  pagination:
                    type: object
                    properties:
                      start:
                        type: integer
                        minimum: 0
                      end:
                        type: integer
                        minimum: 0
                      total:
                        type: integer
                        minimum: 0
                      hasNext:
                        type: boolean
                    required:
                      - start
                      - end
                      - total
                      - hasNext
                required:
                  - data
                  - pagination
        '400':
          description: Failed to fetch positions
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    Position:
      type: object
      properties:
        pubkey:
          type: string
          description: Position account public key
        owner:
          type: string
          description: Position owner public key
        ownerPubkey:
          type: string
          description: >-
            Position owner public key (alias of owner, prefer ownerPubkey going
            forward)
        market:
          type: string
          description: Deterministic market PDA derived from marketId
        marketId:
          type: string
          description: External market identifier (ticker)
        marketIdHash:
          type: string
          description: Hashed market identifier used for on-chain PDAs
        isYes:
          type: boolean
          description: True if this is a YES position
        contracts:
          type: string
          description: Contracts held (u64 as string)
        totalCostUsd:
          type: string
          description: Total cost basis in micro USD (u128 as string)
        sizeUsd:
          type: string
          description: Alias of total cost basis in micro USD (u128 as string)
        valueUsd:
          type: string
          nullable: true
          description: >-
            Mark-to-market value in micro USD (u128 as string); null once market
            is closed
        avgPriceUsd:
          type: string
          description: Average entry price per contract in micro USD (u64 as string)
        markPriceUsd:
          type: string
          nullable: true
          description: >-
            Current mark price per contract in micro USD (u64 as string); null
            once market is closed
        sellPriceUsd:
          type: string
          nullable: true
          description: >-
            Current best exit price for this side (micro USD string), or null
            when unavailable
        pnlUsd:
          type: string
          nullable: true
          description: >-
            Unrealized PnL in micro USD (i128 as string); null once market is
            closed
        pnlUsdPercent:
          type: number
          nullable: true
          description: >-
            Unrealized PnL percentage relative to size; null once market is
            closed
        pnlUsdAfterFees:
          type: string
          nullable: true
          description: >-
            Unrealized PnL after fees in micro USD (i128 as string); null once
            market is closed
        pnlUsdAfterFeesPercent:
          type: number
          nullable: true
          description: >-
            Unrealized PnL after fees percentage relative to size; null once
            market is closed
        openOrders:
          type: integer
          minimum: 0
          description: Number of open orders
        feesPaidUsd:
          type: string
          description: Total fees paid in micro USD (u64 as string)
        realizedPnlUsd:
          type: number
          description: Realized PnL in micro USD (i64 as number)
        claimed:
          type: boolean
          description: Whether payout has been claimed
        claimedUsd:
          type: string
          description: Amount claimed in micro USD (u64 as string)
        openedAt:
          type: integer
          description: Unix timestamp when the position was opened
        updatedAt:
          type: integer
          description: Unix timestamp of the last position update
        claimableAt:
          type: integer
          nullable: true
          description: >-
            Unix timestamp (seconds) when the position becomes claimable; null
            when unavailable
        payoutUsd:
          type: string
          description: Notional payout if position wins (contracts * $1)
        bump:
          type: integer
          minimum: 0
        eventId:
          type: string
          description: External event identifier if available
        eventMetadata:
          $ref: '#/components/schemas/EventMetadata'
        marketMetadata:
          allOf:
            - $ref: '#/components/schemas/MarketMetadata'
            - properties:
                marketId:
                  type: string
                eventId:
                  type: string
                title:
                  type: string
                subtitle:
                  type: string
                description:
                  type: string
                status:
                  type: string
                result:
                  type: string
                closeTime:
                  type: number
                openTime:
                  type: number
                settlementTime:
                  type: number
                isTradable:
                  type: boolean
        settlementDate:
          type: integer
          nullable: true
          description: >-
            Unix timestamp (seconds) when the market settles; null when
            unavailable
        claimable:
          type: boolean
          description: True when the position qualifies for payout claim
      required:
        - pubkey
        - owner
        - ownerPubkey
        - market
        - marketId
        - marketIdHash
        - isYes
        - contracts
        - totalCostUsd
        - sizeUsd
        - valueUsd
        - avgPriceUsd
        - markPriceUsd
        - sellPriceUsd
        - pnlUsd
        - pnlUsdPercent
        - pnlUsdAfterFees
        - pnlUsdAfterFeesPercent
        - openOrders
        - feesPaidUsd
        - realizedPnlUsd
        - claimed
        - claimedUsd
        - openedAt
        - updatedAt
        - claimableAt
        - payoutUsd
        - bump
        - eventId
        - eventMetadata
        - marketMetadata
        - settlementDate
        - claimable
    ErrorResponse:
      type: object
      properties:
        type:
          type: string
          enum:
            - invalid_request_error
            - authentication_error
            - permission_error
            - idempotency_error
            - rate_limit_error
            - api_error
        message:
          type: string
        code:
          type: string
        param:
          type: string
        request_id:
          type: string
        doc_url:
          type: string
      required:
        - type
        - message
        - request_id
    EventMetadata:
      type: object
      properties:
        eventId:
          type: string
        title:
          type: string
        subtitle:
          type: string
        imageUrl:
          type: string
          format: uri
        isLive:
          type: boolean
      required:
        - eventId
    MarketMetadata:
      type: object
      properties:
        marketId:
          type: string
        title:
          type: string
        subtitle:
          type: string
        description:
          type: string
        status:
          type: string
        result:
          type: string
        closeTime:
          type: number
        openTime:
          type: number
        settlementTime:
          type: number
        isTradable:
          type: boolean
        rulesPrimary:
          type: string
        rulesSecondary:
          type: string
      required:
        - marketId
        - isTradable
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: Get API key via https://portal.jup.ag

````
> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Positions

> Get a list of positions with optional filtering



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /positions
openapi: 3.0.3
info:
  title: Prediction Market API
  version: 1.0.0
  description: Jupiter Prediction Market API Schema
servers:
  - url: https://api.jup.ag/prediction/v1
    description: Jupiter Prediction Market API Endpoint
security:
  - ApiKeyAuth: []
tags:
  - name: Events
  - name: Markets
  - name: Orders
  - name: Positions
  - name: History
  - name: Trading
  - name: Orderbook
  - name: Milestones
  - name: Vault
paths:
  /positions:
    get:
      tags:
        - Positions
      parameters:
        - schema:
            type: integer
            nullable: true
            minimum: 0
          required: false
          name: start
          in: query
        - schema:
            type: integer
            nullable: true
            minimum: 0
          required: false
          name: end
          in: query
        - schema:
            type: string
            minLength: 1
            description: Position owner public key
          required: false
          description: Position owner public key
          name: ownerPubkey
          in: query
        - schema:
            type: string
            minLength: 1
            description: Position owner public key (deprecated alias; use ownerPubkey)
          required: false
          description: Position owner public key (deprecated alias; use ownerPubkey)
          name: userPubkey
          in: query
        - schema:
            type: string
            minLength: 1
          required: false
          name: marketPubkey
          in: query
        - schema:
            type: string
            minLength: 1
          required: false
          name: marketId
          in: query
        - schema:
            type: string
            enum:
              - 'true'
              - 'false'
            description: Filter by position side (true = YES, false = NO)
          required: false
          description: Filter by position side (true = YES, false = NO)
          name: isYes
          in: query
      responses:
        '200':
          description: List of on-chain positions
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Position'
                  pagination:
                    type: object
                    properties:
                      start:
                        type: integer
                        minimum: 0
                      end:
                        type: integer
                        minimum: 0
                      total:
                        type: integer
                        minimum: 0
                      hasNext:
                        type: boolean
                    required:
                      - start
                      - end
                      - total
                      - hasNext
                required:
                  - data
                  - pagination
        '400':
          description: Failed to fetch positions
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    Position:
      type: object
      properties:
        pubkey:
          type: string
          description: Position account public key
        owner:
          type: string
          description: Position owner public key
        ownerPubkey:
          type: string
          description: >-
            Position owner public key (alias of owner, prefer ownerPubkey going
            forward)
        market:
          type: string
          description: Deterministic market PDA derived from marketId
        marketId:
          type: string
          description: External market identifier (ticker)
        marketIdHash:
          type: string
          description: Hashed market identifier used for on-chain PDAs
        isYes:
          type: boolean
          description: True if this is a YES position
        contracts:
          type: string
          description: Contracts held (u64 as string)
        totalCostUsd:
          type: string
          description: Total cost basis in micro USD (u128 as string)
        sizeUsd:
          type: string
          description: Alias of total cost basis in micro USD (u128 as string)
        valueUsd:
          type: string
          nullable: true
          description: >-
            Mark-to-market value in micro USD (u128 as string); null once market
            is closed
        avgPriceUsd:
          type: string
          description: Average entry price per contract in micro USD (u64 as string)
        markPriceUsd:
          type: string
          nullable: true
          description: >-
            Current mark price per contract in micro USD (u64 as string); null
            once market is closed
        sellPriceUsd:
          type: string
          nullable: true
          description: >-
            Current best exit price for this side (micro USD string), or null
            when unavailable
        pnlUsd:
          type: string
          nullable: true
          description: >-
            Unrealized PnL in micro USD (i128 as string); null once market is
            closed
        pnlUsdPercent:
          type: number
          nullable: true
          description: >-
            Unrealized PnL percentage relative to size; null once market is
            closed
        pnlUsdAfterFees:
          type: string
          nullable: true
          description: >-
            Unrealized PnL after fees in micro USD (i128 as string); null once
            market is closed
        pnlUsdAfterFeesPercent:
          type: number
          nullable: true
          description: >-
            Unrealized PnL after fees percentage relative to size; null once
            market is closed
        openOrders:
          type: integer
          minimum: 0
          description: Number of open orders
        feesPaidUsd:
          type: string
          description: Total fees paid in micro USD (u64 as string)
        realizedPnlUsd:
          type: number
          description: Realized PnL in micro USD (i64 as number)
        claimed:
          type: boolean
          description: Whether payout has been claimed
        claimedUsd:
          type: string
          description: Amount claimed in micro USD (u64 as string)
        openedAt:
          type: integer
          description: Unix timestamp when the position was opened
        updatedAt:
          type: integer
          description: Unix timestamp of the last position update
        claimableAt:
          type: integer
          nullable: true
          description: >-
            Unix timestamp (seconds) when the position becomes claimable; null
            when unavailable
        payoutUsd:
          type: string
          description: Notional payout if position wins (contracts * $1)
        bump:
          type: integer
          minimum: 0
        eventId:
          type: string
          description: External event identifier if available
        eventMetadata:
          $ref: '#/components/schemas/EventMetadata'
        marketMetadata:
          allOf:
            - $ref: '#/components/schemas/MarketMetadata'
            - properties:
                marketId:
                  type: string
                eventId:
                  type: string
                title:
                  type: string
                subtitle:
                  type: string
                description:
                  type: string
                status:
                  type: string
                result:
                  type: string
                closeTime:
                  type: number
                openTime:
                  type: number
                settlementTime:
                  type: number
                isTradable:
                  type: boolean
        settlementDate:
          type: integer
          nullable: true
          description: >-
            Unix timestamp (seconds) when the market settles; null when
            unavailable
        claimable:
          type: boolean
          description: True when the position qualifies for payout claim
      required:
        - pubkey
        - owner
        - ownerPubkey
        - market
        - marketId
        - marketIdHash
        - isYes
        - contracts
        - totalCostUsd
        - sizeUsd
        - valueUsd
        - avgPriceUsd
        - markPriceUsd
        - sellPriceUsd
        - pnlUsd
        - pnlUsdPercent
        - pnlUsdAfterFees
        - pnlUsdAfterFeesPercent
        - openOrders
        - feesPaidUsd
        - realizedPnlUsd
        - claimed
        - claimedUsd
        - openedAt
        - updatedAt
        - claimableAt
        - payoutUsd
        - bump
        - eventId
        - eventMetadata
        - marketMetadata
        - settlementDate
        - claimable
    ErrorResponse:
      type: object
      properties:
        type:
          type: string
          enum:
            - invalid_request_error
            - authentication_error
            - permission_error
            - idempotency_error
            - rate_limit_error
            - api_error
        message:
          type: string
        code:
          type: string
        param:
          type: string
        request_id:
          type: string
        doc_url:
          type: string
      required:
        - type
        - message
        - request_id
    EventMetadata:
      type: object
      properties:
        eventId:
          type: string
        title:
          type: string
        subtitle:
          type: string
        imageUrl:
          type: string
          format: uri
        isLive:
          type: boolean
      required:
        - eventId
    MarketMetadata:
      type: object
      properties:
        marketId:
          type: string
        title:
          type: string
        subtitle:
          type: string
        description:
          type: string
        status:
          type: string
        result:
          type: string
        closeTime:
          type: number
        openTime:
          type: number
        settlementTime:
          type: number
        isTradable:
          type: boolean
        rulesPrimary:
          type: string
        rulesSecondary:
          type: string
      required:
        - marketId
        - isTradable
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: Get API key via https://portal.jup.ag

````
> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Positions

> Get a list of positions with optional filtering



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /positions
openapi: 3.0.3
info:
  title: Prediction Market API
  version: 1.0.0
  description: Jupiter Prediction Market API Schema
servers:
  - url: https://api.jup.ag/prediction/v1
    description: Jupiter Prediction Market API Endpoint
security:
  - ApiKeyAuth: []
tags:
  - name: Events
  - name: Markets
  - name: Orders
  - name: Positions
  - name: History
  - name: Trading
  - name: Orderbook
  - name: Milestones
  - name: Vault
paths:
  /positions:
    get:
      tags:
        - Positions
      parameters:
        - schema:
            type: integer
            nullable: true
            minimum: 0
          required: false
          name: start
          in: query
        - schema:
            type: integer
            nullable: true
            minimum: 0
          required: false
          name: end
          in: query
        - schema:
            type: string
            minLength: 1
            description: Position owner public key
          required: false
          description: Position owner public key
          name: ownerPubkey
          in: query
        - schema:
            type: string
            minLength: 1
            description: Position owner public key (deprecated alias; use ownerPubkey)
          required: false
          description: Position owner public key (deprecated alias; use ownerPubkey)
          name: userPubkey
          in: query
        - schema:
            type: string
            minLength: 1
          required: false
          name: marketPubkey
          in: query
        - schema:
            type: string
            minLength: 1
          required: false
          name: marketId
          in: query
        - schema:
            type: string
            enum:
              - 'true'
              - 'false'
            description: Filter by position side (true = YES, false = NO)
          required: false
          description: Filter by position side (true = YES, false = NO)
          name: isYes
          in: query
      responses:
        '200':
          description: List of on-chain positions
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Position'
                  pagination:
                    type: object
                    properties:
                      start:
                        type: integer
                        minimum: 0
                      end:
                        type: integer
                        minimum: 0
                      total:
                        type: integer
                        minimum: 0
                      hasNext:
                        type: boolean
                    required:
                      - start
                      - end
                      - total
                      - hasNext
                required:
                  - data
                  - pagination
        '400':
          description: Failed to fetch positions
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    Position:
      type: object
      properties:
        pubkey:
          type: string
          description: Position account public key
        owner:
          type: string
          description: Position owner public key
        ownerPubkey:
          type: string
          description: >-
            Position owner public key (alias of owner, prefer ownerPubkey going
            forward)
        market:
          type: string
          description: Deterministic market PDA derived from marketId
        marketId:
          type: string
          description: External market identifier (ticker)
        marketIdHash:
          type: string
          description: Hashed market identifier used for on-chain PDAs
        isYes:
          type: boolean
          description: True if this is a YES position
        contracts:
          type: string
          description: Contracts held (u64 as string)
        totalCostUsd:
          type: string
          description: Total cost basis in micro USD (u128 as string)
        sizeUsd:
          type: string
          description: Alias of total cost basis in micro USD (u128 as string)
        valueUsd:
          type: string
          nullable: true
          description: >-
            Mark-to-market value in micro USD (u128 as string); null once market
            is closed
        avgPriceUsd:
          type: string
          description: Average entry price per contract in micro USD (u64 as string)
        markPriceUsd:
          type: string
          nullable: true
          description: >-
            Current mark price per contract in micro USD (u64 as string); null
            once market is closed
        sellPriceUsd:
          type: string
          nullable: true
          description: >-
            Current best exit price for this side (micro USD string), or null
            when unavailable
        pnlUsd:
          type: string
          nullable: true
          description: >-
            Unrealized PnL in micro USD (i128 as string); null once market is
            closed
        pnlUsdPercent:
          type: number
          nullable: true
          description: >-
            Unrealized PnL percentage relative to size; null once market is
            closed
        pnlUsdAfterFees:
          type: string
          nullable: true
          description: >-
            Unrealized PnL after fees in micro USD (i128 as string); null once
            market is closed
        pnlUsdAfterFeesPercent:
          type: number
          nullable: true
          description: >-
            Unrealized PnL after fees percentage relative to size; null once
            market is closed
        openOrders:
          type: integer
          minimum: 0
          description: Number of open orders
        feesPaidUsd:
          type: string
          description: Total fees paid in micro USD (u64 as string)
        realizedPnlUsd:
          type: number
          description: Realized PnL in micro USD (i64 as number)
        claimed:
          type: boolean
          description: Whether payout has been claimed
        claimedUsd:
          type: string
          description: Amount claimed in micro USD (u64 as string)
        openedAt:
          type: integer
          description: Unix timestamp when the position was opened
        updatedAt:
          type: integer
          description: Unix timestamp of the last position update
        claimableAt:
          type: integer
          nullable: true
          description: >-
            Unix timestamp (seconds) when the position becomes claimable; null
            when unavailable
        payoutUsd:
          type: string
          description: Notional payout if position wins (contracts * $1)
        bump:
          type: integer
          minimum: 0
        eventId:
          type: string
          description: External event identifier if available
        eventMetadata:
          $ref: '#/components/schemas/EventMetadata'
        marketMetadata:
          allOf:
            - $ref: '#/components/schemas/MarketMetadata'
            - properties:
                marketId:
                  type: string
                eventId:
                  type: string
                title:
                  type: string
                subtitle:
                  type: string
                description:
                  type: string
                status:
                  type: string
                result:
                  type: string
                closeTime:
                  type: number
                openTime:
                  type: number
                settlementTime:
                  type: number
                isTradable:
                  type: boolean
        settlementDate:
          type: integer
          nullable: true
          description: >-
            Unix timestamp (seconds) when the market settles; null when
            unavailable
        claimable:
          type: boolean
          description: True when the position qualifies for payout claim
      required:
        - pubkey
        - owner
        - ownerPubkey
        - market
        - marketId
        - marketIdHash
        - isYes
        - contracts
        - totalCostUsd
        - sizeUsd
        - valueUsd
        - avgPriceUsd
        - markPriceUsd
        - sellPriceUsd
        - pnlUsd
        - pnlUsdPercent
        - pnlUsdAfterFees
        - pnlUsdAfterFeesPercent
        - openOrders
        - feesPaidUsd
        - realizedPnlUsd
        - claimed
        - claimedUsd
        - openedAt
        - updatedAt
        - claimableAt
        - payoutUsd
        - bump
        - eventId
        - eventMetadata
        - marketMetadata
        - settlementDate
        - claimable
    ErrorResponse:
      type: object
      properties:
        type:
          type: string
          enum:
            - invalid_request_error
            - authentication_error
            - permission_error
            - idempotency_error
            - rate_limit_error
            - api_error
        message:
          type: string
        code:
          type: string
        param:
          type: string
        request_id:
          type: string
        doc_url:
          type: string
      required:
        - type
        - message
        - request_id
    EventMetadata:
      type: object
      properties:
        eventId:
          type: string
        title:
          type: string
        subtitle:
          type: string
        imageUrl:
          type: string
          format: uri
        isLive:
          type: boolean
      required:
        - eventId
    MarketMetadata:
      type: object
      properties:
        marketId:
          type: string
        title:
          type: string
        subtitle:
          type: string
        description:
          type: string
        status:
          type: string
        result:
          type: string
        closeTime:
          type: number
        openTime:
          type: number
        settlementTime:
          type: number
        isTradable:
          type: boolean
        rulesPrimary:
          type: string
        rulesSecondary:
          type: string
      required:
        - marketId
        - isTradable
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: Get API key via https://portal.jup.ag

````

> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Close Position

> Request an unsigned transaction to sell all contracts in a position



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml delete /positions/{positionPubkey}
openapi: 3.0.3
info:
  title: Prediction Market API
  version: 1.0.0
  description: Jupiter Prediction Market API Schema
servers:
  - url: https://api.jup.ag/prediction/v1
    description: Jupiter Prediction Market API Endpoint
security:
  - ApiKeyAuth: []
tags:
  - name: Events
  - name: Markets
  - name: Orders
  - name: Positions
  - name: History
  - name: Trading
  - name: Orderbook
  - name: Milestones
  - name: Vault
paths:
  /positions/{positionPubkey}:
    delete:
      tags:
        - Positions
      parameters:
        - schema:
            type: string
            minLength: 32
            description: Position account public key
          required: true
          description: Position account public key
          name: positionPubkey
          in: path
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ClosePositionRequest'
      responses:
        '200':
          description: Unsigned transaction that sells all contracts for a position
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreateOrderResponse'
        '400':
          description: Unable to build close position transaction
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Position not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    ClosePositionRequest:
      type: object
      properties:
        ownerPubkey:
          type: string
          minLength: 32
          description: Position owner public key
        userPubkey:
          type: string
          minLength: 32
          description: Position owner public key (deprecated alias; use ownerPubkey)
        minSellPriceUsd:
          anyOf:
            - type: string
            - type: number
      required:
        - minSellPriceUsd
    CreateOrderResponse:
      type: object
      properties:
        transaction:
          type: string
          nullable: true
          description: Base64 encoded transaction
        txMeta:
          type: object
          nullable: true
          properties:
            blockhash:
              type: string
            lastValidBlockHeight:
              type: integer
              minimum: 0
          required:
            - blockhash
            - lastValidBlockHeight
          description: Transaction metadata
        externalOrderId:
          type: string
          nullable: true
        order:
          type: object
          properties:
            orderPubkey:
              type: string
              nullable: true
              description: Order account public key
            orderAtaPubkey:
              type: string
              nullable: true
              description: Order escrow token account
            userPubkey:
              type: string
              description: Order owner public key
            marketId:
              type: string
              description: Associated market identifier
            marketIdHash:
              type: string
              description: Hashed market identifier used for on-chain PDAs
            positionPubkey:
              type: string
              description: Position PDA used for the order
            isBuy:
              type: boolean
              description: True when the order increases exposure
            isYes:
              type: boolean
              description: True when the order is on the YES side
            contracts:
              type: string
              description: Contracts included in this order
            newContracts:
              type: string
              description: Position contracts after executing the order
            maxBuyPriceUsd:
              type: string
              nullable: true
              description: Max fill price for buys (micro USD)
            minSellPriceUsd:
              type: string
              nullable: true
              description: Min fill price for sells (micro USD)
            externalOrderId:
              type: string
              nullable: true
              description: Client provided order identifier
            orderCostUsd:
              type: string
              description: Notional for this order in micro USD
            newAvgPriceUsd:
              type: string
              description: Average position entry price after the order
            newSizeUsd:
              type: string
              description: Total position cost basis after the order
            newPayoutUsd:
              type: string
              description: Position max payout after the order
            estimatedProtocolFeeUsd:
              type: string
              description: Estimated protocol fee (micro USD)
            estimatedVenueFeeUsd:
              type: string
              description: Estimated venue fee (micro USD)
            estimatedTotalFeeUsd:
              type: string
              description: Estimated total fees applied (micro USD)
          required:
            - orderPubkey
            - orderAtaPubkey
            - userPubkey
            - marketId
            - marketIdHash
            - positionPubkey
            - isBuy
            - isYes
            - contracts
            - newContracts
            - maxBuyPriceUsd
            - minSellPriceUsd
            - externalOrderId
            - orderCostUsd
            - newAvgPriceUsd
            - newSizeUsd
            - newPayoutUsd
            - estimatedProtocolFeeUsd
            - estimatedVenueFeeUsd
            - estimatedTotalFeeUsd
      required:
        - transaction
        - txMeta
        - externalOrderId
        - order
    ErrorResponse:
      type: object
      properties:
        type:
          type: string
          enum:
            - invalid_request_error
            - authentication_error
            - permission_error
            - idempotency_error
            - rate_limit_error
            - api_error
        message:
          type: string
        code:
          type: string
        param:
          type: string
        request_id:
          type: string
        doc_url:
          type: string
      required:
        - type
        - message
        - request_id
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: Get API key via https://portal.jup.ag

````
> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Close All Positions

> Request unsigned transactions to close all open positions



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml delete /positions
openapi: 3.0.3
info:
  title: Prediction Market API
  version: 1.0.0
  description: Jupiter Prediction Market API Schema
servers:
  - url: https://api.jup.ag/prediction/v1
    description: Jupiter Prediction Market API Endpoint
security:
  - ApiKeyAuth: []
tags:
  - name: Events
  - name: Markets
  - name: Orders
  - name: Positions
  - name: History
  - name: Trading
  - name: Orderbook
  - name: Milestones
  - name: Vault
paths:
  /positions:
    delete:
      tags:
        - Positions
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CloseAllPositionsRequest'
      responses:
        '200':
          description: >-
            Unsigned transactions that sell all contracts across every open
            position for the user
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      anyOf:
                        - $ref: '#/components/schemas/CreateOrderResponse'
                        - $ref: '#/components/schemas/ClaimPositionResponse'
                required:
                  - data
        '400':
          description: Unable to build close positions transactions
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    CloseAllPositionsRequest:
      type: object
      properties:
        ownerPubkey:
          type: string
          minLength: 32
          description: Position owner public key
        userPubkey:
          type: string
          minLength: 32
          description: Position owner public key (deprecated alias; use ownerPubkey)
        minSellPriceSlippageBps:
          type: integer
          nullable: true
          minimum: 0
          maximum: 10000
      required:
        - minSellPriceSlippageBps
    CreateOrderResponse:
      type: object
      properties:
        transaction:
          type: string
          nullable: true
          description: Base64 encoded transaction
        txMeta:
          type: object
          nullable: true
          properties:
            blockhash:
              type: string
            lastValidBlockHeight:
              type: integer
              minimum: 0
          required:
            - blockhash
            - lastValidBlockHeight
          description: Transaction metadata
        externalOrderId:
          type: string
          nullable: true
        order:
          type: object
          properties:
            orderPubkey:
              type: string
              nullable: true
              description: Order account public key
            orderAtaPubkey:
              type: string
              nullable: true
              description: Order escrow token account
            userPubkey:
              type: string
              description: Order owner public key
            marketId:
              type: string
              description: Associated market identifier
            marketIdHash:
              type: string
              description: Hashed market identifier used for on-chain PDAs
            positionPubkey:
              type: string
              description: Position PDA used for the order
            isBuy:
              type: boolean
              description: True when the order increases exposure
            isYes:
              type: boolean
              description: True when the order is on the YES side
            contracts:
              type: string
              description: Contracts included in this order
            newContracts:
              type: string
              description: Position contracts after executing the order
            maxBuyPriceUsd:
              type: string
              nullable: true
              description: Max fill price for buys (micro USD)
            minSellPriceUsd:
              type: string
              nullable: true
              description: Min fill price for sells (micro USD)
            externalOrderId:
              type: string
              nullable: true
              description: Client provided order identifier
            orderCostUsd:
              type: string
              description: Notional for this order in micro USD
            newAvgPriceUsd:
              type: string
              description: Average position entry price after the order
            newSizeUsd:
              type: string
              description: Total position cost basis after the order
            newPayoutUsd:
              type: string
              description: Position max payout after the order
            estimatedProtocolFeeUsd:
              type: string
              description: Estimated protocol fee (micro USD)
            estimatedVenueFeeUsd:
              type: string
              description: Estimated venue fee (micro USD)
            estimatedTotalFeeUsd:
              type: string
              description: Estimated total fees applied (micro USD)
          required:
            - orderPubkey
            - orderAtaPubkey
            - userPubkey
            - marketId
            - marketIdHash
            - positionPubkey
            - isBuy
            - isYes
            - contracts
            - newContracts
            - maxBuyPriceUsd
            - minSellPriceUsd
            - externalOrderId
            - orderCostUsd
            - newAvgPriceUsd
            - newSizeUsd
            - newPayoutUsd
            - estimatedProtocolFeeUsd
            - estimatedVenueFeeUsd
            - estimatedTotalFeeUsd
      required:
        - transaction
        - txMeta
        - externalOrderId
        - order
    ClaimPositionResponse:
      type: object
      properties:
        transaction:
          type: string
          description: Base64 encoded transaction
        txMeta:
          type: object
          properties:
            blockhash:
              type: string
            lastValidBlockHeight:
              type: integer
              minimum: 0
          required:
            - blockhash
            - lastValidBlockHeight
        position:
          type: object
          properties:
            positionPubkey:
              type: string
              description: Position account public key
            marketPubkey:
              type: string
              description: Market account public key
            userPubkey:
              type: string
              description: User public key requesting claim
            ownerPubkey:
              type: string
              description: Position owner public key
            isYes:
              type: boolean
            contracts:
              type: string
              description: Contracts settled (u64 as string)
            payoutAmountUsd:
              type: string
              description: Payout amount in micro USD (u64 as string)
          required:
            - positionPubkey
            - marketPubkey
            - userPubkey
            - ownerPubkey
            - isYes
            - contracts
            - payoutAmountUsd
      required:
        - transaction
        - txMeta
        - position
    ErrorResponse:
      type: object
      properties:
        type:
          type: string
          enum:
            - invalid_request_error
            - authentication_error
            - permission_error
            - idempotency_error
            - rate_limit_error
            - api_error
        message:
          type: string
        code:
          type: string
        param:
          type: string
        request_id:
          type: string
        doc_url:
          type: string
      required:
        - type
        - message
        - request_id
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: Get API key via https://portal.jup.ag

````