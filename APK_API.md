# APK File Management API

API endpoints for uploading, managing, and downloading Android APK files.

## Base URL

```
/api/apk
```

## Endpoints

### 1. Upload APK File

Upload a new APK file (Admin only).

**Endpoint:** `POST /api/apk/upload`  
**Access:** Private (Admin only)  
**Authentication:** Required (Bearer token)  
**Content-Type:** `multipart/form-data`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Form Data:**

```
apk: <file> (required - APK file, max 200MB)
version: "1.0.0" (optional - app version)
description: "Latest version with bug fixes" (optional)
customName: "myapp" (optional - custom filename without .apk extension)
```

**Response:**

```json
{
  "success": true,
  "message": "APK file uploaded successfully",
  "data": {
    "id": "...",
    "filename": "myapp.apk",
    "originalName": "MyApp-v1.0.0.apk",
    "version": "1.0.0",
    "size": 52428800,
    "downloadUrl": "/api/apk/download/...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get All APK Files

Get list of all uploaded APK files.

**Endpoint:** `GET /api/apk`  
**Access:** Public

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "...",
      "filename": "myapp.apk",
      "originalName": "MyApp-v1.0.0.apk",
      "version": "1.0.0",
      "size": 52428800,
      "sizeInMB": "50.00 MB",
      "downloadCount": 150,
      "isActive": true,
      "description": "Latest version",
      "downloadUrl": "/api/apk/download/...",
      "uploadedBy": {
        "_id": "...",
        "name": "Admin",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Get Latest Active APK

Get the most recent active APK file.

**Endpoint:** `GET /api/apk/latest`  
**Access:** Public

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "filename": "myapp.apk",
    "originalName": "MyApp-v1.0.0.apk",
    "version": "1.0.0",
    "size": 52428800,
    "sizeInMB": "50.00 MB",
    "downloadCount": 150,
    "description": "Latest version",
    "downloadUrl": "/api/apk/download/...",
    "uploadedBy": {
      "_id": "...",
      "name": "Admin",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Download APK File

Download an APK file by ID.

**Endpoint:** `GET /api/apk/download/:id`  
**Access:** Public

**Response:** Binary file download (APK file)

**Note:** This endpoint automatically increments the download counter.

### 5. Update APK Details

Update APK metadata (Admin only).

**Endpoint:** `PUT /api/apk/:id`  
**Access:** Private (Admin only)  
**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "version": "1.0.1",
  "description": "Updated description",
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "APK details updated successfully",
  "data": {
    "_id": "...",
    "filename": "myapp.apk",
    "version": "1.0.1",
    "description": "Updated description",
    "isActive": true,
    ...
  }
}
```

### 6. Toggle APK Active Status

Activate or deactivate an APK file (Admin only).

**Endpoint:** `PATCH /api/apk/:id/toggle`  
**Access:** Private (Admin only)  
**Authentication:** Required (Bearer token)

**Response:**

```json
{
  "success": true,
  "message": "APK file activated successfully",
  "data": {
    "id": "...",
    "isActive": true
  }
}
```

### 7. Delete APK File

Delete an APK file (Admin only).

**Endpoint:** `DELETE /api/apk/:id`  
**Access:** Private (Admin only)  
**Authentication:** Required (Bearer token)

**Response:**

```json
{
  "success": true,
  "message": "APK file deleted successfully"
}
```

## Frontend Usage Examples

### Upload APK (Admin)

```javascript
const formData = new FormData();
formData.append("apk", apkFile); // File from input
formData.append("version", "1.0.0");
formData.append("description", "Latest version with bug fixes");

const response = await fetch("http://localhost:5000/api/apk/upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
  body: formData,
});

const data = await response.json();
console.log(data);
```

### Get Latest APK

```javascript
const response = await fetch("http://localhost:5000/api/apk/latest");
const data = await response.json();

if (data.success) {
  const { version, sizeInMB, downloadUrl } = data.data;
  console.log(`Version: ${version}, Size: ${sizeInMB}`);

  // Create download button
  const downloadBtn = document.createElement("a");
  downloadBtn.href = `http://localhost:5000${downloadUrl}`;
  downloadBtn.textContent = "Download APK";
  downloadBtn.download = true;
}
```

### Download APK

```javascript
// Method 1: Direct link
<a href="http://localhost:5000/api/apk/download/APK_ID" download>
  Download App
</a>;

// Method 2: Programmatic download
const downloadApk = async (apkId) => {
  window.location.href = `http://localhost:5000/api/apk/download/${apkId}`;
};
```

### Get All APKs

```javascript
const response = await fetch("http://localhost:5000/api/apk");
const data = await response.json();

if (data.success) {
  data.data.forEach((apk) => {
    console.log(
      `${apk.version} - ${apk.sizeInMB} - ${apk.downloadCount} downloads`
    );
  });
}
```

### Delete APK (Admin)

```javascript
const response = await fetch(`http://localhost:5000/api/apk/${apkId}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
});

const data = await response.json();
console.log(data.message);
```

## File Storage

- APK files are stored in the `/apk` directory
- Maximum file size: 200MB
- Only `.apk` files are accepted
- Files can be accessed via API or direct URL (if enabled)

## Features

✅ Admin-only upload with authentication  
✅ Public download access  
✅ Download counter tracking  
✅ Version management  
✅ Active/Inactive status toggle  
✅ File size tracking and display  
✅ Metadata (version, description)  
✅ Multiple APK versions support  
✅ Automatic file cleanup on delete

## Notes

- Only admins can upload, update, or delete APK files
- Anyone can view and download APK files
- The "latest" endpoint returns the most recent active APK
- Download count is automatically incremented on each download
- Files are stored with their original or custom names
- Maximum upload size is 200MB (configurable in middleware)
