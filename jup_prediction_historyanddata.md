> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Get History

> Get trading history and event records for an account



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /history
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
  /history:
    get:
      tags:
        - History
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
            minLength: 32
            description: History owner public key
          required: false
          description: History owner public key
          name: ownerPubkey
          in: query
        - schema:
            type: string
            minLength: 32
            description: History owner public key (deprecated alias; use ownerPubkey)
          required: false
          description: History owner public key (deprecated alias; use ownerPubkey)
          name: userPubkey
          in: query
        - schema:
            type: integer
            minimum: 1
            description: History event ID
          required: false
          description: History event ID
          name: id
          in: query
        - schema:
            type: string
            minLength: 32
            description: Filter by position public key
          required: false
          description: Filter by position public key
          name: positionPubkey
          in: query
      responses:
        '200':
          description: Paginated event history, or single event when id is provided
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/HistoryEvent'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
                required:
                  - data
                  - pagination
components:
  schemas:
    HistoryEvent:
      type: object
      properties:
        id:
          type: integer
        eventType:
          type: string
          enum:
            - order_created
            - order_filled
            - order_failed
            - payout_claimed
            - position_updated
            - position_lost
        signature:
          type: string
        slot:
          type: string
        timestamp:
          type: integer
        orderPubkey:
          type: string
        positionPubkey:
          type: string
        marketId:
          type: string
        ownerPubkey:
          type: string
        keeperPubkey:
          type: string
        externalOrderId:
          type: string
        orderId:
          type: string
        isBuy:
          type: boolean
        isYes:
          type: boolean
        contracts:
          type: string
        filledContracts:
          type: string
        contractsSettled:
          type: string
        maxFillPriceUsd:
          type: string
        avgFillPriceUsd:
          type: string
        maxBuyPriceUsd:
          type: string
          nullable: true
        minSellPriceUsd:
          type: string
          nullable: true
        depositAmountUsd:
          type: string
        totalCostUsd:
          type: string
        feeUsd:
          type: string
          nullable: true
        grossProceedsUsd:
          type: string
        netProceedsUsd:
          type: string
        transferAmountToken:
          type: string
          nullable: true
        realizedPnl:
          type: string
          nullable: true
        realizedPnlBeforeFees:
          type: string
          nullable: true
        payoutAmountUsd:
          type: string
        eventId:
          type: string
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
        eventMetadata:
          $ref: '#/components/schemas/EventMetadata'
      required:
        - id
        - eventType
        - signature
        - slot
        - timestamp
        - orderPubkey
        - positionPubkey
        - marketId
        - ownerPubkey
        - keeperPubkey
        - externalOrderId
        - orderId
        - isBuy
        - isYes
        - contracts
        - filledContracts
        - contractsSettled
        - maxFillPriceUsd
        - avgFillPriceUsd
        - maxBuyPriceUsd
        - minSellPriceUsd
        - depositAmountUsd
        - totalCostUsd
        - feeUsd
        - grossProceedsUsd
        - netProceedsUsd
        - transferAmountToken
        - realizedPnl
        - realizedPnlBeforeFees
        - payoutAmountUsd
        - eventId
        - marketMetadata
        - eventMetadata
    Pagination:
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

# Get History

> Get trading history and event records for an account



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /history
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
  /history:
    get:
      tags:
        - History
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
            minLength: 32
            description: History owner public key
          required: false
          description: History owner public key
          name: ownerPubkey
          in: query
        - schema:
            type: string
            minLength: 32
            description: History owner public key (deprecated alias; use ownerPubkey)
          required: false
          description: History owner public key (deprecated alias; use ownerPubkey)
          name: userPubkey
          in: query
        - schema:
            type: integer
            minimum: 1
            description: History event ID
          required: false
          description: History event ID
          name: id
          in: query
        - schema:
            type: string
            minLength: 32
            description: Filter by position public key
          required: false
          description: Filter by position public key
          name: positionPubkey
          in: query
      responses:
        '200':
          description: Paginated event history, or single event when id is provided
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/HistoryEvent'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
                required:
                  - data
                  - pagination
components:
  schemas:
    HistoryEvent:
      type: object
      properties:
        id:
          type: integer
        eventType:
          type: string
          enum:
            - order_created
            - order_filled
            - order_failed
            - payout_claimed
            - position_updated
            - position_lost
        signature:
          type: string
        slot:
          type: string
        timestamp:
          type: integer
        orderPubkey:
          type: string
        positionPubkey:
          type: string
        marketId:
          type: string
        ownerPubkey:
          type: string
        keeperPubkey:
          type: string
        externalOrderId:
          type: string
        orderId:
          type: string
        isBuy:
          type: boolean
        isYes:
          type: boolean
        contracts:
          type: string
        filledContracts:
          type: string
        contractsSettled:
          type: string
        maxFillPriceUsd:
          type: string
        avgFillPriceUsd:
          type: string
        maxBuyPriceUsd:
          type: string
          nullable: true
        minSellPriceUsd:
          type: string
          nullable: true
        depositAmountUsd:
          type: string
        totalCostUsd:
          type: string
        feeUsd:
          type: string
          nullable: true
        grossProceedsUsd:
          type: string
        netProceedsUsd:
          type: string
        transferAmountToken:
          type: string
          nullable: true
        realizedPnl:
          type: string
          nullable: true
        realizedPnlBeforeFees:
          type: string
          nullable: true
        payoutAmountUsd:
          type: string
        eventId:
          type: string
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
        eventMetadata:
          $ref: '#/components/schemas/EventMetadata'
      required:
        - id
        - eventType
        - signature
        - slot
        - timestamp
        - orderPubkey
        - positionPubkey
        - marketId
        - ownerPubkey
        - keeperPubkey
        - externalOrderId
        - orderId
        - isBuy
        - isYes
        - contracts
        - filledContracts
        - contractsSettled
        - maxFillPriceUsd
        - avgFillPriceUsd
        - maxBuyPriceUsd
        - minSellPriceUsd
        - depositAmountUsd
        - totalCostUsd
        - feeUsd
        - grossProceedsUsd
        - netProceedsUsd
        - transferAmountToken
        - realizedPnl
        - realizedPnlBeforeFees
        - payoutAmountUsd
        - eventId
        - marketMetadata
        - eventMetadata
    Pagination:
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

# Get Trading Status

> Get current trading status of the prediction market



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /trading-status
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
  /trading-status:
    get:
      tags:
        - Trading
      responses:
        '200':
          description: Current Kalshi exchange trading status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TradingStatusResponse'
components:
  schemas:
    TradingStatusResponse:
      type: object
      properties:
        trading_active:
          type: boolean
      required:
        - trading_active
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: Get API key via https://portal.jup.ag

````

