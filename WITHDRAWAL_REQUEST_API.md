# Withdrawal Request API

## User Endpoints

### 1. Create Withdrawal Request

```
POST /api/withdrawal-requests
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "withdrawal_method_id": "METHOD_ID",
  "amount": 500,
  "phone_number": "01712345678",
  "additional_info": "Optional note"
}
```

**Validations:**

- ✅ Checks if user has sufficient balance
- ✅ Validates min/max withdrawal limits
- ✅ Calculates and includes withdrawal fee
- ✅ Ensures withdrawal method is active

**Response:**

```json
{
  "success": true,
  "message": "Withdrawal request submitted successfully",
  "data": {
    "transaction": {
      "_id": "...",
      "transaction_id": "WD1234567890ABCD",
      "amount": 500,
      "wallet_provider": "bKash",
      "wallet_number": "01712345678",
      "status": "Pending",
      "transaction_type": "Withdrawal",
      "user_id": {...}
    },
    "withdrawalDetails": {
      "method": "bKash",
      "amount": 500,
      "fee": 10,
      "totalDeduction": 510,
      "phoneNumber": "01712345678",
      "processingTime": "24 hours",
      "currentBalance": 1000,
      "balanceAfterWithdrawal": 490
    }
  }
}
```

**Error: Insufficient Balance**

```json
{
  "success": false,
  "message": "Insufficient balance",
  "data": {
    "currentBalance": 300,
    "requestedAmount": 500,
    "shortfall": 200
  }
}
```

### 2. Get My Withdrawal Requests

```
GET /api/withdrawal-requests
Authorization: Bearer <user_token>
```

Returns all withdrawal requests for logged-in user.

### 3. Cancel Withdrawal Request

```
PATCH /api/withdrawal-requests/:id/cancel
Authorization: Bearer <user_token>
```

Cancel pending withdrawal request (only your own).

## Admin Endpoints

### 4. Get All Withdrawal Requests

```
GET /api/withdrawal-requests/all?status=Pending&page=1&limit=20
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `status` - Filter by status (Pending, Completed, Failed, Cancelled)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### 5. Approve Withdrawal (Use Transaction API)

```
PATCH /api/transactions/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "Completed"
}
```

When admin sets status to "Completed", balance is automatically deducted!

## Complete Flow

### User Side:

```javascript
// 1. Get withdrawal methods
const methods = await fetch("http://localhost:8000/api/withdrawal-methods");

// 2. Create withdrawal request
const response = await fetch("http://localhost:8000/api/withdrawal-requests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userToken}`,
  },
  body: JSON.stringify({
    withdrawal_method_id: "METHOD_ID",
    amount: 500,
    phone_number: "01712345678",
    additional_info: "Urgent withdrawal",
  }),
});

const data = await response.json();
if (data.success) {
  console.log("Withdrawal request submitted!");
  console.log("Transaction ID:", data.data.transaction.transaction_id);
  console.log("Fee:", data.data.withdrawalDetails.fee);
}
```

### Admin Side:

```javascript
// 1. Get pending withdrawals
const pending = await fetch(
  "http://localhost:8000/api/withdrawal-requests/all?status=Pending",
  {
    headers: { Authorization: `Bearer ${adminToken}` },
  }
);

// 2. Approve withdrawal
await fetch(`http://localhost:8000/api/transactions/${transactionId}/status`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({ status: "Completed" }),
});

// Balance automatically deducted!
```

## Important Notes

✅ **Balance Check:** System validates user has enough balance before creating request  
✅ **Fee Calculation:** Automatically calculates fee (fixed or percentage)  
✅ **Min/Max Limits:** Validates against withdrawal method limits  
✅ **Auto Deduction:** Balance deducted when admin completes the transaction  
✅ **Status Tracking:** Pending → Completed/Failed/Cancelled  
✅ **User Info:** Transaction includes user details for admin review

## Validation Rules

1. Amount must be > 0
2. Amount must be >= min_withdrawal
3. Amount must be <= max_withdrawal
4. User balance must be >= (amount + fee)
5. Withdrawal method must be Active
6. User must be authenticated
