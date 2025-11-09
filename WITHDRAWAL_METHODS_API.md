# Withdrawal Methods API

## Endpoints

### 1. Get All Methods (Public)

```
GET /api/withdrawal-methods
```

Returns list of all withdrawal methods

### 2. Get Single Method (Public)

```
GET /api/withdrawal-methods/:id
```

Returns details of specific withdrawal method

### 3. Create Method (Admin)

```
POST /api/withdrawal-methods
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>
```

Creates new withdrawal method with images

### 4. Update Method (Admin)

```
PUT /api/withdrawal-methods/:id
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>
```

Updates existing withdrawal method (all fields optional)

### 5. Delete Method (Admin)

```
DELETE /api/withdrawal-methods/:id
Authorization: Bearer <admin_token>
```

Deletes withdrawal method and its images

### 6. Toggle Status (Admin)

```
PATCH /api/withdrawal-methods/:id/status
Authorization: Bearer <admin_token>
```

Toggles between Active/Inactive status

## Fields

```
method_name_en: "bKash" (required)
method_name_bd: "বিকাশ"
method_image: <file>
withdrawal_page_image: <file>
min_withdrawal: 100
max_withdrawal: 50000
processing_time: "24 hours"
withdrawal_fee: 10
fee_type: "fixed" or "percentage"
text_color: "#000000"
background_color: "#E2136E"
button_color: "#E2136E"
instruction_en: "Enter account number"
instruction_bd: "অ্যাকাউন্ট নম্বর লিখুন"
status: "Active" or "Inactive"
user_inputs: JSON array
```

## Examples

### Create

```javascript
const formData = new FormData();
formData.append("method_name_en", "bKash");
formData.append("min_withdrawal", "100");
formData.append("max_withdrawal", "50000");

await fetch("http://localhost:8000/api/withdrawal-methods", {
  method: "POST",
  headers: { Authorization: `Bearer ${adminToken}` },
  body: formData,
});
```

### Update

```javascript
const formData = new FormData();
formData.append("min_withdrawal", "200");
formData.append("withdrawal_fee", "15");

await fetch("http://localhost:8000/api/withdrawal-methods/METHOD_ID", {
  method: "PUT",
  headers: { Authorization: `Bearer ${adminToken}` },
  body: formData,
});
```

### Delete

```javascript
await fetch("http://localhost:8000/api/withdrawal-methods/METHOD_ID", {
  method: "DELETE",
  headers: { Authorization: `Bearer ${adminToken}` },
});
```

### Toggle Status

```javascript
await fetch("http://localhost:8000/api/withdrawal-methods/METHOD_ID/status", {
  method: "PATCH",
  headers: { Authorization: `Bearer ${adminToken}` },
});
```
