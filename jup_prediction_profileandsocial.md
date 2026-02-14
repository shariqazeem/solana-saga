> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Profile

> Get profile statistics for a user



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /profiles/{ownerPubkey}
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
  /profiles/{ownerPubkey}:
    get:
      tags:
        - Profile
      parameters:
        - schema:
            type: string
          required: true
          name: ownerPubkey
          in: path
      responses:
        '200':
          description: Profile stats
          content:
            application/json:
              schema:
                type: object
                properties:
                  ownerPubkey:
                    type: string
                  realizedPnlUsd:
                    type: string
                  totalVolumeUsd:
                    type: string
                  predictionsCount:
                    type: string
                  correctPredictions:
                    type: string
                  wrongPredictions:
                    type: string
                  totalActiveContracts:
                    type: string
                  totalPositionsValueUsd:
                    type: string
                required:
                  - ownerPubkey
                  - realizedPnlUsd
                  - totalVolumeUsd
                  - predictionsCount
                  - correctPredictions
                  - wrongPredictions
                  - totalActiveContracts
                  - totalPositionsValueUsd
        '404':
          description: Profile not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                required:
                  - error
components:
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

# Get PnL History

> Get historical PnL data for charting



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /profiles/{ownerPubkey}/pnl-history
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
  /profiles/{ownerPubkey}/pnl-history:
    get:
      tags:
        - Profile
      parameters:
        - schema:
            type: string
          required: true
          name: ownerPubkey
          in: path
        - schema:
            type: string
            enum:
              - 24h
              - 1w
              - 1m
            default: 1w
          required: false
          name: interval
          in: query
        - schema:
            type: integer
            minimum: 0
            exclusiveMinimum: true
            maximum: 1000
            default: 10
          required: false
          name: count
          in: query
      responses:
        '200':
          description: PnL history for charting
          content:
            application/json:
              schema:
                type: object
                properties:
                  ownerPubkey:
                    type: string
                  history:
                    type: array
                    items:
                      type: object
                      properties:
                        timestamp:
                          type: integer
                        realizedPnlUsd:
                          type: string
                      required:
                        - timestamp
                        - realizedPnlUsd
                required:
                  - ownerPubkey
                  - history
components:
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

# Get Trades

> Get recent filled trades across all markets



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /trades
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
  /trades:
    get:
      tags:
        - Trades
      responses:
        '200':
          description: Recent order_filled events
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: number
                        ownerPubkey:
                          type: string
                        marketId:
                          type: string
                        message:
                          type: string
                        timestamp:
                          type: number
                        action:
                          type: string
                          enum:
                            - buy
                            - sell
                        side:
                          type: string
                          enum:
                            - 'yes'
                            - 'no'
                        eventTitle:
                          type: string
                        marketTitle:
                          type: string
                        amountUsd:
                          type: string
                        priceUsd:
                          type: string
                        eventImageUrl:
                          type: string
                        eventId:
                          type: string
                      required:
                        - id
                        - ownerPubkey
                        - marketId
                        - message
                        - timestamp
                        - action
                        - side
                        - eventTitle
                        - marketTitle
                        - amountUsd
                        - priceUsd
                        - eventImageUrl
                        - eventId
                required:
                  - data
components:
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

# Get Leaderboards

> Get leaderboard rankings by various metrics



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /leaderboards
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
  /leaderboards:
    get:
      tags:
        - Leaderboards
      parameters:
        - schema:
            type: string
            enum:
              - all_time
              - weekly
              - monthly
            default: all_time
          required: false
          name: period
          in: query
        - schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 100
          required: false
          name: limit
          in: query
        - schema:
            type: string
            enum:
              - pnl
              - volume
              - win_rate
            default: pnl
          required: false
          name: metric
          in: query
      responses:
        '200':
          description: Leaderboard entries
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        ownerPubkey:
                          type: string
                        realizedPnlUsd:
                          type: string
                        totalVolumeUsd:
                          type: string
                        predictionsCount:
                          type: number
                        correctPredictions:
                          type: number
                        wrongPredictions:
                          type: number
                        winRatePct:
                          type: string
                        period:
                          type: string
                        periodStart:
                          type: string
                          nullable: true
                        periodEnd:
                          type: string
                          nullable: true
                      required:
                        - ownerPubkey
                        - realizedPnlUsd
                        - totalVolumeUsd
                        - predictionsCount
                        - correctPredictions
                        - wrongPredictions
                        - winRatePct
                        - period
                        - periodStart
                        - periodEnd
                  summary:
                    type: object
                    properties:
                      all_time:
                        type: object
                        properties:
                          totalVolumeUsd:
                            type: string
                          predictionsCount:
                            type: number
                        required:
                          - totalVolumeUsd
                          - predictionsCount
                      weekly:
                        type: object
                        properties:
                          totalVolumeUsd:
                            type: string
                          predictionsCount:
                            type: number
                        required:
                          - totalVolumeUsd
                          - predictionsCount
                      monthly:
                        type: object
                        properties:
                          totalVolumeUsd:
                            type: string
                          predictionsCount:
                            type: number
                        required:
                          - totalVolumeUsd
                          - predictionsCount
                    required:
                      - all_time
                      - weekly
                      - monthly
                required:
                  - data
                  - summary
components:
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

# Follow User

> Follow a user to track their predictions



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml post /follow/{ownerPubkey}
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
  /follow/{ownerPubkey}:
    post:
      tags:
        - Following
      parameters:
        - schema:
            type: string
          required: true
          name: ownerPubkey
          in: path
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                followerPubkey:
                  type: string
              required:
                - followerPubkey
      responses:
        '201':
          description: Successfully followed user
          content:
            application/json:
              schema:
                type: object
                properties:
                  followerPubkey:
                    type: string
                  followingPubkey:
                    type: string
                  createdAt:
                    type: string
                required:
                  - followerPubkey
                  - followingPubkey
                  - createdAt
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                required:
                  - error
        '404':
          description: User not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                required:
                  - error
        '409':
          description: Already following
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                required:
                  - error
components:
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

# Unfollow User

> Unfollow a previously followed user



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml delete /unfollow/{ownerPubkey}
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
  /unfollow/{ownerPubkey}:
    delete:
      tags:
        - Following
      parameters:
        - schema:
            type: string
          required: true
          name: ownerPubkey
          in: path
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                followerPubkey:
                  type: string
              required:
                - followerPubkey
      responses:
        '200':
          description: Successfully unfollowed user
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                required:
                  - success
        '404':
          description: Follow relationship not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                required:
                  - error
components:
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

# Get Followers

> Get list of followers for a user



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /followers/{ownerPubkey}
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
  /followers/{ownerPubkey}:
    get:
      tags:
        - Following
      parameters:
        - schema:
            type: string
          required: true
          name: ownerPubkey
          in: path
      responses:
        '200':
          description: List of followers
          content:
            application/json:
              schema:
                type: object
                properties:
                  followers:
                    type: array
                    items:
                      type: object
                      properties:
                        pubkey:
                          type: string
                        createdAt:
                          type: string
                      required:
                        - pubkey
                        - createdAt
                  count:
                    type: number
                required:
                  - followers
                  - count
        '404':
          description: User not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                required:
                  - error
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: Get API key via https://portal.jup.ag

````> ## Documentation Index
> Fetch the complete documentation index at: https://dev.jup.ag/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Followers

> Get list of followers for a user



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /followers/{ownerPubkey}
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
  /followers/{ownerPubkey}:
    get:
      tags:
        - Following
      parameters:
        - schema:
            type: string
          required: true
          name: ownerPubkey
          in: path
      responses:
        '200':
          description: List of followers
          content:
            application/json:
              schema:
                type: object
                properties:
                  followers:
                    type: array
                    items:
                      type: object
                      properties:
                        pubkey:
                          type: string
                        createdAt:
                          type: string
                      required:
                        - pubkey
                        - createdAt
                  count:
                    type: number
                required:
                  - followers
                  - count
        '404':
          description: User not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                required:
                  - error
components:
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

# Get Vault Info

> Get vault account information and balance



## OpenAPI

````yaml openapi-spec/prediction/prediction.yaml get /vault-info
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
  /vault-info:
    get:
      tags:
        - Vault
      responses:
        '200':
          description: Vault account data
          content:
            application/json:
              schema:
                type: object
                properties:
                  pubkey:
                    type: string
                  data:
                    type: object
                    additionalProperties:
                      type: string
                  vaultBalance:
                    type: string
                required:
                  - pubkey
                  - data
                  - vaultBalance
        '404':
          description: Vault account not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                required:
                  - error
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: Get API key via https://portal.jup.ag

````