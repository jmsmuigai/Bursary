# Google Drive API Setup Guide

## ⚠️ Important Note

**The current Garissa Bursary System does NOT require Google Drive API.** It uses localStorage for demo purposes and is designed to work with Firebase in production.

This guide is for **future integration** if you want to add document storage capabilities.

## When Would You Need Google Drive API?

- Uploading applicant documents (ID copies, fee structures, certificates)
- Storing application PDFs
- Sharing documents with administrators
- Backup and archival of applications

## Current System Storage

- **Demo Mode**: Uses browser localStorage
- **Production Ready**: Designed for Firebase Firestore + Storage
- **No Google Drive Required**: The system works perfectly without it

## If You Want to Add Google Drive (Optional)

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name: "Garissa Bursary System"
4. Click "Create"

### Step 2: Enable Google Drive API

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: "Garissa Bursary System"
   - Support email: jmsmuigai@gmail.com
   - Scopes: Add `https://www.googleapis.com/auth/drive.file`
   - Test users: Add jmsmuigai@gmail.com
4. Create OAuth client:
   - Application type: Web application
   - Name: "Garissa Bursary Web"
   - Authorized JavaScript origins:
     - `https://jmsmuigai.github.io`
     - `http://localhost:3000` (for testing)
   - Authorized redirect URIs:
     - `https://jmsmuigai.github.io/auth/callback`
   - Click "Create"
5. **Copy and save**:
   - Client ID
   - Client Secret

### Step 4: Add to Your Code (Future)

1. Add Google API script to HTML:
```html
<script src="https://apis.google.com/js/api.js"></script>
<script src="https://accounts.google.com/gsi/client"></script>
```

2. Update `google_drive_config.js` with your credentials

3. Initialize in your application:
```javascript
await initGoogleDrive();
await gapi.auth2.getAuthInstance().signIn();
```

## Recommended Alternative: Firebase Storage

Instead of Google Drive API, consider using **Firebase Storage**:

1. ✅ Easier to integrate
2. ✅ Better security (Firebase Auth)
3. ✅ Direct file uploads
4. ✅ Automatic CDN distribution
5. ✅ Built-in access control

### Firebase Storage Setup

1. Go to https://console.firebase.google.com/
2. Create/select project
3. Enable "Storage"
4. Update `firebase_config.js`
5. Use Firebase Storage SDK for uploads

## Dismissing the Notification

If you're seeing a Google Drive API notification in Cursor/your IDE:

1. Click "No" or "Don't show again"
2. The notification is from your development environment
3. It's not required for the bursary system to work

## Summary

- ✅ **Current system works without Google Drive API**
- ✅ **Use Firebase Storage for production** (recommended)
- ✅ **Google Drive API is optional** (for future features)
- ✅ **You can dismiss the notification safely**

For the Garissa Bursary System, focus on Firebase integration instead of Google Drive API.

