# Contact Settings API

API endpoints for managing contact URLs (24/7 Service, WhatsApp, Telegram, Facebook).

## Base URL

```
/api/contact
```

## Endpoints

### 1. Get Contact Settings

Get all contact URLs.

**Endpoint:** `GET /api/contact`  
**Access:** Public  
**Authentication:** Not required

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "service247Url": "https://example.com/support",
    "whatsappUrl": "https://wa.me/1234567890",
    "telegramUrl": "https://t.me/yourusername",
    "facebookUrl": "https://facebook.com/yourpage",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Update Contact Settings

Update contact URLs (Admin only).

**Endpoint:** `PUT /api/contact`  
**Access:** Private (Admin only)  
**Authentication:** Required (Bearer token)

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "service247Url": "https://example.com/support",
  "whatsappUrl": "https://wa.me/1234567890",
  "telegramUrl": "https://t.me/yourusername",
  "facebookUrl": "https://facebook.com/yourpage"
}
```

**Note:** All fields are optional. Only send the fields you want to update.

**Response:**

```json
{
  "success": true,
  "message": "Contact settings updated successfully",
  "data": {
    "_id": "...",
    "service247Url": "https://example.com/support",
    "whatsappUrl": "https://wa.me/1234567890",
    "telegramUrl": "https://t.me/yourusername",
    "facebookUrl": "https://facebook.com/yourpage",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (Not Admin):**

```json
{
  "success": false,
  "message": "Access denied. Admin only."
}
```

## Frontend Usage

### Fetch Contact URLs

```javascript
// Get contact settings
const response = await fetch("http://localhost:5000/api/contact");
const data = await response.json();

if (data.success) {
  const { service247Url, whatsappUrl, telegramUrl, facebookUrl } = data.data;

  // Use these URLs for redirects
  // Example: window.location.href = whatsappUrl;
}
```

### Update Contact URLs (Admin)

```javascript
// Update contact settings (admin only)
const response = await fetch("http://localhost:5000/api/contact", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    service247Url: "https://example.com/support",
    whatsappUrl: "https://wa.me/1234567890",
    telegramUrl: "https://t.me/yourusername",
    facebookUrl: "https://facebook.com/yourpage",
  }),
});

const data = await response.json();
console.log(data.message);
```

## URL Format Examples

### 24/7 Service

- `https://example.com/support`
- `https://support.yoursite.com`

### WhatsApp

- `https://wa.me/1234567890` (with country code, no + or spaces)
- `https://wa.me/1234567890?text=Hello` (with pre-filled message)

### Telegram

- `https://t.me/yourusername` (for user)
- `https://t.me/yourchannel` (for channel)
- `https://t.me/+groupinvitelink` (for group)

### Facebook

- `https://facebook.com/yourpage`
- `https://m.me/yourpage` (for Messenger)
- `https://www.facebook.com/messages/t/yourpage` (direct message)

## Notes

- The system uses a singleton pattern - only one contact settings document exists
- If no settings exist, default empty strings are created automatically
- All URLs are stored as strings and can be any valid URL
- Frontend should handle URL validation and opening in new tabs
- Admin authentication is required for updates
