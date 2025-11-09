# Payment Methods API Documentation

## GET /api/payment-methods

Get all payment methods

**Request Body:** None

## GET /api/payment-methods/:id

Get single payment method

**Request Body:** None

## POST /api/payment-methods

Create new payment method

**Request Body:**

```json
{
  "method_name_en": "string (required)",
  "method_name_bd": "string (optional)",
  "agent_wallet_number": "string (optional)",
  "agent_wallet_text": "string (optional)",
  "method_image": "string (optional)",
  "payment_page_image": "string (optional)",
  "gateways": ["string array (optional)"],
  "text_color": "string (optional, default: #000000)",
  "background_color": "string (optional, default: #ffffff)",
  "button_color": "string (optional, default: #000000)",
  "instruction_en": "string (optional)",
  "instruction_bd": "string (optional)",
  "status": "string (optional, enum: Active/Inactive, default: Active)",
  "user_inputs": [
    {
      "name": "string (required)",
      "type": "string (required)",
      "label_en": "string (required)",
      "label_bd": "string (optional)",
      "isRequired": "boolean (optional, default: false)",
      "instruction_en": "string (optional)",
      "instruction_bd": "string (optional)"
    }
  ]
}
```

## PUT /api/payment-methods/:id

Update payment method

**Request Body:**

```json
{
  "method_name_en": "string (optional)",
  "method_name_bd": "string (optional)",
  "agent_wallet_number": "string (optional)",
  "agent_wallet_text": "string (optional)",
  "method_image": "string (optional)",
  "payment_page_image": "string (optional)",
  "gateways": ["string array (optional)"],
  "text_color": "string (optional)",
  "background_color": "string (optional)",
  "button_color": "string (optional)",
  "instruction_en": "string (optional)",
  "instruction_bd": "string (optional)",
  "status": "string (optional, enum: Active/Inactive)",
  "user_inputs": [
    {
      "name": "string (optional)",
      "type": "string (optional)",
      "label_en": "string (optional)",
      "label_bd": "string (optional)",
      "isRequired": "boolean (optional)",
      "instruction_en": "string (optional)",
      "instruction_bd": "string (optional)"
    }
  ]
}
```

## DELETE /api/payment-methods/:id

Delete payment method

**Request Body:** None

## PATCH /api/payment-methods/:id/status

Toggle payment method status

**Request Body:** None
