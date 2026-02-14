> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Orders

> Get a list of orders with optional filtering by owner or market



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /orders
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
  /orders:
    get:
      tags:
        - Orders
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
          required: false
          name: ownerPubkey
          in: query
        - schema:
            type: string
            minLength: 1
            description: Order owner public key (deprecated alias; use ownerPubkey)
          required: false
          description: Order owner public key (deprecated alias; use ownerPubkey)
          name: userPubkey
          in: query
      responses:
        '200':
          description: List of all orders registered on-chain
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Order'
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
          description: Failed to fetch orders
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    Order:
      type: object
      properties:
        pubkey:
          type: string
          description: Order account public key
        owner:
          type: string
          description: Order owner public key
        ownerPubkey:
          type: string
          description: >-
            Order owner public key (alias of owner, use ownerPubkey when
            available)
        market:
          type: string
          description: Associated market public key
        marketId:
          type: string
          description: External market identifier used to derive the PDA
        marketIdHash:
          type: string
          description: Hashed market identifier used for on-chain PDAs
        eventId:
          type: string
          description: External event identifier
        position:
          type: string
          description: Associated position public key
        status:
          type: string
          enum:
            - pending
            - filled
            - failed
          description: Current order status
        isYes:
          type: boolean
          description: True when order is for the YES side
        isBuy:
          type: boolean
          description: True when order is a buy order
        createdAt:
          type: integer
          description: Unix timestamp (seconds) when the order was created
        updatedAt:
          type: integer
          description: Unix timestamp (seconds) when the order last changed on-chain
        contracts:
          type: string
          description: Number of contracts (u64 as string)
        maxFillPriceUsd:
          type: string
          description: Maximum fill price in micro USD (u64 as string)
        maxBuyPriceUsd:
          type: string
          nullable: true
          description: Buyer-specified max fill price (micro USD)
        minSellPriceUsd:
          type: string
          nullable: true
          description: Seller-specified min fill price (micro USD)
        filledAt:
          type: integer
          description: Unix timestamp (seconds) when the order was filled (0 when pending)
        filledContracts:
          type: string
          description: Number of filled contracts (u64 as string)
        avgFillPriceUsd:
          type: string
          description: Average fill price in micro USD (u64 as string)
        settled:
          type: boolean
          description: Whether the order has been settled on-chain
        orderId:
          type: string
          description: External order identifier from the venue
        sizeUsd:
          type: string
          description: Order notional in micro USD (u128 as string)
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
        externalOrderId:
          type: string
          description: Client-provided order identifier
        bump:
          type: integer
          minimum: 0
      required:
        - pubkey
        - owner
        - ownerPubkey
        - market
        - marketId
        - marketIdHash
        - eventId
        - position
        - status
        - isYes
        - isBuy
        - createdAt
        - updatedAt
        - contracts
        - maxFillPriceUsd
        - maxBuyPriceUsd
        - minSellPriceUsd
        - filledAt
        - filledContracts
        - avgFillPriceUsd
        - settled
        - orderId
        - sizeUsd
        - eventMetadata
        - marketMetadata
        - externalOrderId
        - bump
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

# Get Order

> Get detailed information about a specific order



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /orders/{orderPubkey}
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
  /orders/{orderPubkey}:
    get:
      tags:
        - Orders
      parameters:
        - schema:
            type: string
            minLength: 1
            description: Order account public key
          required: true
          description: Order account public key
          name: orderPubkey
          in: path
      responses:
        '200':
          description: Order data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        '400':
          description: Failed to fetch order
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Order not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    Order:
      type: object
      properties:
        pubkey:
          type: string
          description: Order account public key
        owner:
          type: string
          description: Order owner public key
        ownerPubkey:
          type: string
          description: >-
            Order owner public key (alias of owner, use ownerPubkey when
            available)
        market:
          type: string
          description: Associated market public key
        marketId:
          type: string
          description: External market identifier used to derive the PDA
        marketIdHash:
          type: string
          description: Hashed market identifier used for on-chain PDAs
        eventId:
          type: string
          description: External event identifier
        position:
          type: string
          description: Associated position public key
        status:
          type: string
          enum:
            - pending
            - filled
            - failed
          description: Current order status
        isYes:
          type: boolean
          description: True when order is for the YES side
        isBuy:
          type: boolean
          description: True when order is a buy order
        createdAt:
          type: integer
          description: Unix timestamp (seconds) when the order was created
        updatedAt:
          type: integer
          description: Unix timestamp (seconds) when the order last changed on-chain
        contracts:
          type: string
          description: Number of contracts (u64 as string)
        maxFillPriceUsd:
          type: string
          description: Maximum fill price in micro USD (u64 as string)
        maxBuyPriceUsd:
          type: string
          nullable: true
          description: Buyer-specified max fill price (micro USD)
        minSellPriceUsd:
          type: string
          nullable: true
          description: Seller-specified min fill price (micro USD)
        filledAt:
          type: integer
          description: Unix timestamp (seconds) when the order was filled (0 when pending)
        filledContracts:
          type: string
          description: Number of filled contracts (u64 as string)
        avgFillPriceUsd:
          type: string
          description: Average fill price in micro USD (u64 as string)
        settled:
          type: boolean
          description: Whether the order has been settled on-chain
        orderId:
          type: string
          description: External order identifier from the venue
        sizeUsd:
          type: string
          description: Order notional in micro USD (u128 as string)
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
        externalOrderId:
          type: string
          description: Client-provided order identifier
        bump:
          type: integer
          minimum: 0
      required:
        - pubkey
        - owner
        - ownerPubkey
        - market
        - marketId
        - marketIdHash
        - eventId
        - position
        - status
        - isYes
        - isBuy
        - createdAt
        - updatedAt
        - contracts
        - maxFillPriceUsd
        - maxBuyPriceUsd
        - minSellPriceUsd
        - filledAt
        - filledContracts
        - avgFillPriceUsd
        - settled
        - orderId
        - sizeUsd
        - eventMetadata
        - marketMetadata
        - externalOrderId
        - bump
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

# Get Order Status

> Get the latest status and history for an order



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /orders/status/{orderPubkey}
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
  /orders/status/{orderPubkey}:
    get:
      tags:
        - Orders
      parameters:
        - schema:
            type: string
            minLength: 1
            description: Order account public key
          required: true
          description: Order account public key
          name: orderPubkey
          in: path
      responses:
        '200':
          description: Latest status for an order with event history
          content:
            application/json:
              schema:
                type: object
                properties:
                  orderPubkey:
                    type: string
                  status:
                    type: string
                  latestEventType:
                    type: string
                  latestSignature:
                    type: string
                  externalOrderId:
                    type: string
                  orderId:
                    type: string
                  history:
                    type: array
                    items:
                      type: object
                      properties:
                        eventType:
                          type: string
                        status:
                          type: string
                        rawStatus:
                          type: string
                        timestamp:
                          type: integer
                        signature:
                          type: string
                        externalOrderId:
                          type: string
                        orderId:
                          type: string
                      required:
                        - eventType
                        - status
                        - rawStatus
                        - timestamp
                        - signature
                        - externalOrderId
                        - orderId
                required:
                  - orderPubkey
                  - status
                  - latestEventType
                  - latestSignature
                  - externalOrderId
                  - orderId
                  - history
        '400':
          description: Failed to fetch order status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Order history not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
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

# Create Order

> Request an unsigned transaction to create a new order



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml post /orders
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
  /orders:
    post:
      tags:
        - Orders
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOrderRequest'
      responses:
        '200':
          description: Unsigned transaction for creating an order
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreateOrderResponse'
        '400':
          description: Invalid request parameters
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    CreateOrderRequest:
      type: object
      properties:
        ownerPubkey:
          type: string
          description: Order owner public key
        userPubkey:
          type: string
          description: Order owner public key (deprecated alias; use ownerPubkey)
        marketId:
          type: string
          minLength: 1
          description: Hashed or canonical market ID for buys
        positionPubkey:
          type: string
          minLength: 32
          description: Required for sells
        isYes:
          type: boolean
        isBuy:
          type: boolean
        contracts:
          anyOf:
            - type: string
            - type: number
        maxBuyPriceUsd:
          anyOf:
            - type: string
            - type: number
          description: Must be between 10000 ($0.01) to 999999 ($0.99)
        minSellPriceUsd:
          anyOf:
            - type: string
            - type: number
          description: Must be between 10000 ($0.01) to 999999 ($0.99)
        depositAmount:
          anyOf:
            - type: string
            - type: number
          description: >-
            Amount must conform to the token decimals used by the token mint in
            `depositMint`
        depositMint:
          type: string
          default: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
          description: Mint address for the deposit token
      required:
        - isBuy
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

# Close Order

> Request an unsigned transaction to close a pending order



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml delete /orders
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
  /orders:
    delete:
      tags:
        - Orders
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CloseOrderRequest'
      responses:
        '200':
          description: Unsigned transaction for closing an order
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CloseOrderResponse'
        '400':
          description: Invalid request parameters
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Order not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    CloseOrderRequest:
      type: object
      properties:
        ownerPubkey:
          type: string
          minLength: 32
          description: Order owner public key
        userPubkey:
          type: string
          minLength: 32
          description: Order owner public key (deprecated alias; use ownerPubkey)
        orderPubkey:
          type: string
          minLength: 32
      required:
        - orderPubkey
    CloseOrderResponse:
      type: object
      properties:
        blockhash:
          type: string
        transaction:
          type: string
          description: Base64 encoded transaction
        latestBlockhash:
          type: string
        lastValidBlockHeight:
          type: integer
          minimum: 0
        requiredSigners:
          type: array
          items:
            type: string
        computeUnits:
          type: integer
          minimum: 0
        orderPubkey:
          type: string
        accounts:
          type: object
          properties:
            owner:
              type: string
            authority:
              type: string
            vault:
              type: string
            marketId:
              type: string
            position:
              type: string
            order:
              type: string
            orderAta:
              type: string
            ownerTokenAccount:
              type: string
            settlementMint:
              type: string
          required:
            - owner
            - authority
            - vault
            - marketId
            - position
            - order
            - orderAta
            - ownerTokenAccount
            - settlementMint
      required:
        - blockhash
        - transaction
        - latestBlockhash
        - lastValidBlockHeight
        - requiredSigners
        - computeUnits
        - orderPubkey
        - accounts
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

# Close All Orders

> Request unsigned transactions to close multiple orders



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml delete /orders/close-all
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
  /orders/close-all:
    delete:
      tags:
        - Orders
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CloseAllOrdersRequest'
      responses:
        '200':
          description: Unsigned transactions to close all pending orders
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/CloseOrderResponse'
                required:
                  - data
        '400':
          description: Unable to build close order transactions
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    CloseAllOrdersRequest:
      type: object
      properties:
        ownerPubkey:
          type: string
          minLength: 32
          description: Order owner public key
        userPubkey:
          type: string
          minLength: 32
          description: Order owner public key (deprecated alias; use ownerPubkey)
        statuses:
          type: array
          items:
            type: string
            enum:
              - pending
              - filled
              - failed
    CloseOrderResponse:
      type: object
      properties:
        blockhash:
          type: string
        transaction:
          type: string
          description: Base64 encoded transaction
        latestBlockhash:
          type: string
        lastValidBlockHeight:
          type: integer
          minimum: 0
        requiredSigners:
          type: array
          items:
            type: string
        computeUnits:
          type: integer
          minimum: 0
        orderPubkey:
          type: string
        accounts:
          type: object
          properties:
            owner:
              type: string
            authority:
              type: string
            vault:
              type: string
            marketId:
              type: string
            position:
              type: string
            order:
              type: string
            orderAta:
              type: string
            ownerTokenAccount:
              type: string
            settlementMint:
              type: string
          required:
            - owner
            - authority
            - vault
            - marketId
            - position
            - order
            - orderAta
            - ownerTokenAccount
            - settlementMint
      required:
        - blockhash
        - transaction
        - latestBlockhash
        - lastValidBlockHeight
        - requiredSigners
        - computeUnits
        - orderPubkey
        - accounts
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