> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Events

> Get a list of all available prediction events with optional filtering and pagination



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /events
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
  /events:
    get:
      tags:
        - Events
      parameters:
        - schema:
            type: string
            enum:
              - kalshi
              - polymarket
            default: polymarket
            description: Data provider for events (defaults to polymarket)
          required: false
          description: Data provider for events (defaults to polymarket)
          name: provider
          in: query
        - schema:
            type: boolean
            nullable: true
          required: false
          name: includeMarkets
          in: query
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
            enum:
              - all
              - crypto
              - sports
              - politics
              - esports
              - culture
              - economics
              - tech
          required: false
          name: category
          in: query
        - schema:
            anyOf:
              - type: string
              - type: array
                items:
                  type: string
              - type: string
          required: false
          name: subcategory
          in: query
        - schema:
            type: string
            enum:
              - volume
              - beginAt
            description: >-
              Sort field for events (volume or begin time). Pair with
              sortDirection to control ascending/descending.
          required: false
          description: >-
            Sort field for events (volume or begin time). Pair with
            sortDirection to control ascending/descending.
          name: sortBy
          in: query
        - schema:
            type: string
            enum:
              - asc
              - desc
            description: >-
              Direction for the chosen sort field. Defaults to desc for volume
              and asc for beginAt.
          required: false
          description: >-
            Direction for the chosen sort field. Defaults to desc for volume and
            asc for beginAt.
          name: sortDirection
          in: query
        - schema:
            type: string
            enum:
              - new
              - live
              - trending
            description: >-
              Apply named filters. Use `new` for events created in the last 24
              hours, `live` for events that have begun, and `trending` for
              events with recent trade activity.
          required: false
          description: >-
            Apply named filters. Use `new` for events created in the last 24
            hours, `live` for events that have begun, and `trending` for events
            with recent trade activity.
          name: filter
          in: query
      responses:
        '200':
          description: List of all events
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Event'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
                required:
                  - data
                  - pagination
components:
  schemas:
    Event:
      type: object
      properties:
        eventId:
          type: string
          description: Application-level identifier
        series:
          type: string
          description: Series-level identifier
        winner:
          type: string
          description: Winning market public key (empty string when unresolved)
        multipleWinners:
          type: boolean
          description: Whether the event allows multiple winning markets
        isActive:
          type: boolean
          description: Whether the event is active (listed on events)
        isLive:
          type: boolean
          description: Whether the event is currently live
        isTrending:
          type: boolean
          description: Whether the event is trending in the current response context
        isRecommended:
          type: boolean
          description: Whether the event is recommended in the current response context
        category:
          type: string
          description: >-
            The category for the event, allowed values: all, crypto, sports,
            politics, esports, culture, economics, tech
        subcategory:
          type: string
          description: The subcategory for the event
        metadata:
          $ref: '#/components/schemas/EventMetadata'
        markets:
          type: array
          items:
            $ref: '#/components/schemas/Market'
        tvlDollars:
          type: string
          description: Formatted TVL in USD (no currency symbol)
        volumeUsd:
          type: string
          description: Total volume for the event
        closeCondition:
          type: string
          description: Close condition for the event
        beginAt:
          type: string
          nullable: true
          description: Unix timestamp (seconds) when the event begins
        rulesPdf:
          type: string
          description: Document to full rules for the event
      required:
        - eventId
        - series
        - winner
        - multipleWinners
        - isActive
        - isLive
        - isTrending
        - isRecommended
        - category
        - subcategory
        - tvlDollars
        - volumeUsd
        - closeCondition
        - beginAt
        - rulesPdf
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

# Search Events

> Search for events by title or keyword



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /events/search
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
  /events/search:
    get:
      tags:
        - Events
      parameters:
        - schema:
            type: string
            enum:
              - kalshi
              - polymarket
            default: polymarket
            description: Data provider for events (defaults to polymarket)
          required: false
          description: Data provider for events (defaults to polymarket)
          name: provider
          in: query
        - schema:
            type: string
            minLength: 1
            maxLength: 200
            description: Search term matched against event titles
          required: true
          description: Search term matched against event titles
          name: query
          in: query
        - schema:
            type: integer
            minimum: 1
            maximum: 20
          required: false
          name: limit
          in: query
      responses:
        '200':
          description: Events matching the search query
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Event'
                required:
                  - data
components:
  schemas:
    Event:
      type: object
      properties:
        eventId:
          type: string
          description: Application-level identifier
        series:
          type: string
          description: Series-level identifier
        winner:
          type: string
          description: Winning market public key (empty string when unresolved)
        multipleWinners:
          type: boolean
          description: Whether the event allows multiple winning markets
        isActive:
          type: boolean
          description: Whether the event is active (listed on events)
        isLive:
          type: boolean
          description: Whether the event is currently live
        isTrending:
          type: boolean
          description: Whether the event is trending in the current response context
        isRecommended:
          type: boolean
          description: Whether the event is recommended in the current response context
        category:
          type: string
          description: >-
            The category for the event, allowed values: all, crypto, sports,
            politics, esports, culture, economics, tech
        subcategory:
          type: string
          description: The subcategory for the event
        metadata:
          $ref: '#/components/schemas/EventMetadata'
        markets:
          type: array
          items:
            $ref: '#/components/schemas/Market'
        tvlDollars:
          type: string
          description: Formatted TVL in USD (no currency symbol)
        volumeUsd:
          type: string
          description: Total volume for the event
        closeCondition:
          type: string
          description: Close condition for the event
        beginAt:
          type: string
          nullable: true
          description: Unix timestamp (seconds) when the event begins
        rulesPdf:
          type: string
          description: Document to full rules for the event
      required:
        - eventId
        - series
        - winner
        - multipleWinners
        - isActive
        - isLive
        - isTrending
        - isRecommended
        - category
        - subcategory
        - tvlDollars
        - volumeUsd
        - closeCondition
        - beginAt
        - rulesPdf
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

# Get Event

> Get detailed information about a specific event



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /events/{eventId}
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
  /events/{eventId}:
    get:
      tags:
        - Events
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
            type: boolean
            nullable: true
          required: false
          name: includeMarkets
          in: query
      responses:
        '200':
          description: Event data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Event'
        '404':
          description: Event not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    Event:
      type: object
      properties:
        eventId:
          type: string
          description: Application-level identifier
        series:
          type: string
          description: Series-level identifier
        winner:
          type: string
          description: Winning market public key (empty string when unresolved)
        multipleWinners:
          type: boolean
          description: Whether the event allows multiple winning markets
        isActive:
          type: boolean
          description: Whether the event is active (listed on events)
        isLive:
          type: boolean
          description: Whether the event is currently live
        isTrending:
          type: boolean
          description: Whether the event is trending in the current response context
        isRecommended:
          type: boolean
          description: Whether the event is recommended in the current response context
        category:
          type: string
          description: >-
            The category for the event, allowed values: all, crypto, sports,
            politics, esports, culture, economics, tech
        subcategory:
          type: string
          description: The subcategory for the event
        metadata:
          $ref: '#/components/schemas/EventMetadata'
        markets:
          type: array
          items:
            $ref: '#/components/schemas/Market'
        tvlDollars:
          type: string
          description: Formatted TVL in USD (no currency symbol)
        volumeUsd:
          type: string
          description: Total volume for the event
        closeCondition:
          type: string
          description: Close condition for the event
        beginAt:
          type: string
          nullable: true
          description: Unix timestamp (seconds) when the event begins
        rulesPdf:
          type: string
          description: Document to full rules for the event
      required:
        - eventId
        - series
        - winner
        - multipleWinners
        - isActive
        - isLive
        - isTrending
        - isRecommended
        - category
        - subcategory
        - tvlDollars
        - volumeUsd
        - closeCondition
        - beginAt
        - rulesPdf
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

# Get Suggested Events

> Get personalized event suggestions based on user activity



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /events/suggested/{pubkey}
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
  /events/suggested/{pubkey}:
    get:
      tags:
        - Events
      parameters:
        - schema:
            type: string
            minLength: 1
            description: Order public key to base suggested events on
          required: true
          description: Order public key to base suggested events on
          name: pubkey
          in: path
        - schema:
            type: string
            enum:
              - kalshi
              - polymarket
            default: polymarket
            description: Data provider for events (defaults to polymarket)
          required: false
          description: Data provider for events (defaults to polymarket)
          name: provider
          in: query
      responses:
        '200':
          description: Suggested events derived from the user's order activity
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Event'
                required:
                  - data
components:
  schemas:
    Event:
      type: object
      properties:
        eventId:
          type: string
          description: Application-level identifier
        series:
          type: string
          description: Series-level identifier
        winner:
          type: string
          description: Winning market public key (empty string when unresolved)
        multipleWinners:
          type: boolean
          description: Whether the event allows multiple winning markets
        isActive:
          type: boolean
          description: Whether the event is active (listed on events)
        isLive:
          type: boolean
          description: Whether the event is currently live
        isTrending:
          type: boolean
          description: Whether the event is trending in the current response context
        isRecommended:
          type: boolean
          description: Whether the event is recommended in the current response context
        category:
          type: string
          description: >-
            The category for the event, allowed values: all, crypto, sports,
            politics, esports, culture, economics, tech
        subcategory:
          type: string
          description: The subcategory for the event
        metadata:
          $ref: '#/components/schemas/EventMetadata'
        markets:
          type: array
          items:
            $ref: '#/components/schemas/Market'
        tvlDollars:
          type: string
          description: Formatted TVL in USD (no currency symbol)
        volumeUsd:
          type: string
          description: Total volume for the event
        closeCondition:
          type: string
          description: Close condition for the event
        beginAt:
          type: string
          nullable: true
          description: Unix timestamp (seconds) when the event begins
        rulesPdf:
          type: string
          description: Document to full rules for the event
      required:
        - eventId
        - series
        - winner
        - multipleWinners
        - isActive
        - isLive
        - isTrending
        - isRecommended
        - category
        - subcategory
        - tvlDollars
        - volumeUsd
        - closeCondition
        - beginAt
        - rulesPdf
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