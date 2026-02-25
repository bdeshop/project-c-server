# Swagger API Documentation

## Overview

This project now includes comprehensive Swagger/OpenAPI documentation for all API endpoints.

## Accessing Swagger UI

Once the server is running, access the interactive API documentation at:

```
http://localhost:8000/api-docs
```

## Features

- **Interactive API Explorer**: Test endpoints directly from the browser
- **Complete Route Documentation**: All 17 API modules documented
- **Authentication**: Bearer token support for protected routes
- **Request/Response Examples**: Schema definitions for all endpoints
- **Tags**: Organized by resource type (Users, Payments, Promotions, etc.)

## API Modules Documented

1. **Users** - Authentication, profile management, balance
2. **Payment Methods** - Deposit methods with image uploads
3. **Promotions** - Game promotions and discounts
4. **Transactions** - Transaction history and statistics
5. **Referral** - Referral system management
6. **Withdrawal Methods** - Withdrawal options
7. **Withdrawal Requests** - User withdrawal requests
8. **Settings** - Application configuration
9. **Theme Config** - Theme customization
10. **Sliders** - Homepage sliders
11. **Top Winners** - Winner display
12. **Upcoming Matches** - Match scheduling
13. **Banner Text** - Banner content
14. **Promo Section** - Promotional sections
15. **Contact** - Contact information
16. **APK** - Mobile app management
17. **Statistics** - Dashboard analytics

## Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Running the Server

```bash
npm run dev
```

Then navigate to `http://localhost:8000/api-docs`

## Markdown Files Removed

All markdown API documentation files have been removed as they are now integrated into Swagger:

- APK_API.md
- COMPREHENSIVE_REFERRAL_SYSTEM.md
- CONTACT_API.md
- IMPLEMENTATION_SUMMARY.md
- payment-methods-api.md
- promotions-api.md
- REFERRAL_SETTINGS_IMPLEMENTATION.md
- WITHDRAWAL_METHODS_API.md
- WITHDRAWAL_REQUEST_API.md
