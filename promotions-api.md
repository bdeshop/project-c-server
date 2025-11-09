# Promotions API Documentation

## GET /api/promotions

Get all promotions

**Request Body:** None

## GET /api/promotions/:id

Get single promotion

**Request Body:** None

## GET /api/promotions/game/:gameType

Get promotions by game type

**Request Body:** None

## POST /api/promotions

Create new promotion

**Request Body:**

```json
{
  "promotion_image": "string (optional)",
  "title_en": "string (required)",
  "title_bd": "string (optional)",
  "description_en": "string (optional)",
  "description_bd": "string (optional)",
  "game_type": "string (required)",
  "payment_methods": ["ObjectId array (optional) - PaymentMethod IDs"],
  "bonus_settings": {
    "bonus_type": "string (optional, enum: percentage/fixed, default: fixed)",
    "bonus_value": "number (optional, default: 0)",
    "max_bonus_limit": "number (optional, default: 0)"
  },
  "status": "string (optional, enum: Active/Inactive, default: Active)"
}
```

## PUT /api/promotions/:id

Update promotion

**Request Body:**

```json
{
  "promotion_image": "string (optional)",
  "title_en": "string (optional)",
  "title_bd": "string (optional)",
  "description_en": "string (optional)",
  "description_bd": "string (optional)",
  "game_type": "string (optional)",
  "payment_methods": ["ObjectId array (optional) - PaymentMethod IDs"],
  "bonus_settings": {
    "bonus_type": "string (optional, enum: percentage/fixed)",
    "bonus_value": "number (optional)",
    "max_bonus_limit": "number (optional)"
  },
  "status": "string (optional, enum: Active/Inactive)"
}
```

## DELETE /api/promotions/:id

Delete promotion

**Request Body:** None

## PATCH /api/promotions/:id/status

Toggle promotion status

**Request Body:** None
