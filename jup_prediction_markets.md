> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Event Markets

> Get all markets for a specific event



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /events/{eventId}/markets
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
  /events/{eventId}/markets:
    get:
      tags:
        - Markets
      parameters:
        - schema:
            type: string
            minLength: 1
            description: Event identifier
          required: true
          description: Event identifier
          name: eventId
          in: path
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
      responses:
        '200':
          description: List of markets for the given event
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Market'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
                required:
                  - data
                  - pagination
components:
  schemas:
    Market:
      type: object
      properties:
        marketId:
          type: string
          description: Market identifier
        event:
          type: string
          description: Associated event identifier
        status:
          type: string
          enum:
            - open
            - closed
            - cancelled
          description: Current market status
        result:
          type: string
          enum:
            - ''
            - pending
            - 'yes'
            - 'no'
          description: Current market result
        openTime:
          type: number
          description: Unix timestamp (seconds) when the market opens
        closeTime:
          type: number
          description: Unix timestamp (seconds) when the market closes
        settlementTime:
          type: number
          description: Unix timestamp (seconds) when the market settled (0 if pending)
        metadata:
          $ref: '#/components/schemas/MarketMetadata'
        pricing:
          $ref: '#/components/schemas/MarketPricing'
      required:
        - marketId
        - event
        - status
        - result
        - openTime
        - closeTime
        - settlementTime
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
    MarketPricing:
      type: object
      properties:
        buyYesPriceUsd:
          type: number
          nullable: true
        buyNoPriceUsd:
          type: number
          nullable: true
        sellYesPriceUsd:
          type: number
          nullable: true
        sellNoPriceUsd:
          type: number
          nullable: true
        volume:
          type: number
        openInterest:
          type: number
        volume24h:
          type: number
        liquidityDollars:
          type: number
        notionalValueDollars:
          type: number
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

# Get Event Market

> Get detailed market information for a specific market within an event



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /events/{eventId}/markets/{marketId}
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
  /events/{eventId}/markets/{marketId}:
    get:
      tags:
        - Markets
      parameters:
        - schema:
            type: string
            minLength: 1
            description: Event identifier
          required: true
          description: Event identifier
          name: eventId
          in: path
        - schema:
            type: string
            minLength: 1
            description: Market identifier
          required: true
          description: Market identifier
          name: marketId
          in: path
      responses:
        '200':
          description: Market data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Market'
        '404':
          description: Market not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    Market:
      type: object
      properties:
        marketId:
          type: string
          description: Market identifier
        event:
          type: string
          description: Associated event identifier
        status:
          type: string
          enum:
            - open
            - closed
            - cancelled
          description: Current market status
        result:
          type: string
          enum:
            - ''
            - pending
            - 'yes'
            - 'no'
          description: Current market result
        openTime:
          type: number
          description: Unix timestamp (seconds) when the market opens
        closeTime:
          type: number
          description: Unix timestamp (seconds) when the market closes
        settlementTime:
          type: number
          description: Unix timestamp (seconds) when the market settled (0 if pending)
        metadata:
          $ref: '#/components/schemas/MarketMetadata'
        pricing:
          $ref: '#/components/schemas/MarketPricing'
      required:
        - marketId
        - event
        - status
        - result
        - openTime
        - closeTime
        - settlementTime
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
    MarketPricing:
      type: object
      properties:
        buyYesPriceUsd:
          type: number
          nullable: true
        buyNoPriceUsd:
          type: number
          nullable: true
        sellYesPriceUsd:
          type: number
          nullable: true
        sellNoPriceUsd:
          type: number
          nullable: true
        volume:
          type: number
        openInterest:
          type: number
        volume24h:
          type: number
        liquidityDollars:
          type: number
        notionalValueDollars:
          type: number
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

# Get Market

> Get detailed market information by market ID



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /markets/{marketId}
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
  /markets/{marketId}:
    get:
      tags:
        - Markets
      parameters:
        - schema:
            type: string
            minLength: 1
            description: Market identifier
          required: true
          description: Market identifier
          name: marketId
          in: path
      responses:
        '200':
          description: Market data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Market'
        '404':
          description: Market not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    Market:
      type: object
      properties:
        marketId:
          type: string
          description: Market identifier
        event:
          type: string
          description: Associated event identifier
        status:
          type: string
          enum:
            - open
            - closed
            - cancelled
          description: Current market status
        result:
          type: string
          enum:
            - ''
            - pending
            - 'yes'
            - 'no'
          description: Current market result
        openTime:
          type: number
          description: Unix timestamp (seconds) when the market opens
        closeTime:
          type: number
          description: Unix timestamp (seconds) when the market closes
        settlementTime:
          type: number
          description: Unix timestamp (seconds) when the market settled (0 if pending)
        metadata:
          $ref: '#/components/schemas/MarketMetadata'
        pricing:
          $ref: '#/components/schemas/MarketPricing'
      required:
        - marketId
        - event
        - status
        - result
        - openTime
        - closeTime
        - settlementTime
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
    MarketPricing:
      type: object
      properties:
        buyYesPriceUsd:
          type: number
          nullable: true
        buyNoPriceUsd:
          type: number
          nullable: true
        sellYesPriceUsd:
          type: number
          nullable: true
        sellNoPriceUsd:
          type: number
          nullable: true
        volume:
          type: number
        openInterest:
          type: number
        volume24h:
          type: number
        liquidityDollars:
          type: number
        notionalValueDollars:
          type: number
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: Get API key via https://portal.jup.ag

````