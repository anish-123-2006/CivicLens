# CivicLens - API Integration Guide

## Overview

CivicLens integrates with three major Google Cloud services. This guide walks through complete setup.

## 1. Firebase Setup (Backend & Auth)

### Create Firebase Project

```
1. Visit https://console.firebase.google.com
2. Click "Create Project"
3. Name: "CivicLens"
4. Disable Analytics (optional)
5. Click "Create Project"
6. Wait for provisioning to complete
```

### Enable Authentication

```
1. Left sidebar ' Authentication
2. Click "Get Started"
3. Sign-in method ' Google
4. Enable toggle
5. Add project name & support email
6. Save
```

### Create Firestore Database

```
1. Left sidebar ' Firestore Database
2. Click "Create Database"
3. Select "Start in production mode"
4. Select region (us-central1)
5. Click "Create"
```

Update Rules to:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read, authenticated write
    match /reports/{document=**} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

### Enable Cloud Storage

```
1. Left sidebar ' Storage
2. Click "Get Started"
3. Start in production mode
4. Select us-central1
5. Click "Done"
```

Update Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Get Firebase Configuration

```
1. Settings ' Project Settings
2. Scroll to "Your apps"
3. Click Web icon (</> symbol)
4. Register app: CivicLens
5. Copy the firebase config object
```

Extract these values for `.env`:
- apiKey ' VITE_FIREBASE_API_KEY
- authDomain ' VITE_FIREBASE_AUTH_DOMAIN
- projectId ' VITE_FIREBASE_PROJECT_ID
- storageBucket ' VITE_FIREBASE_STORAGE_BUCKET
- messagingSenderId ' VITE_FIREBASE_MESSAGING_SENDER_ID
- appId ' VITE_FIREBASE_APP_ID

Example:
```json
{
  "apiKey": "AIzaSyDxI...",
  "authDomain": "civiclens-12345.firebaseapp.com",
  "projectId": "civiclens-12345",
  "storageBucket": "civiclens-12345.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcd1234"
}
```

## 2. Google Maps API Setup

### Create Google Cloud Project

```
1. Visit https://console.cloud.google.com
2. Create new project ' "CivicLens Maps"
3. Wait for creation
```

### Enable Maps JavaScript API

```
1. Top search bar ' Search "Maps JavaScript API"
2. Click the result
3. Click "ENABLE"
4. Wait for API to enable
```

### Create API Key

```
1. Left sidebar ' Credentials
2. Click "Create Credentials" ' API Key
3. Copy the generated key
4. Add to .env as VITE_GOOGLE_MAPS_KEY
```

### Secure the Key (Production)

```
1. Click the API key in Credentials
2. Under "API restrictions":
   - Select "Maps JavaScript API"
3. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add your domain(s)
4. Save
```

Example for localhost:
```
http://localhost:5173/*
```

For production:
```
https://yourdomain.com/*
```

## 3. Google Gemini API Setup

### Get API Key

```
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. In new project dialog, click "Create API Key in existing project"
5. Copy the key
6. Add to .env as VITE_GEMINI_KEY
```

### Enable Generative AI API (Optional but Recommended)

```
1. Visit https://console.cloud.google.com
2. Go to APIs & Services ' Enabled APIs & services
3. Search for "Generative Language API"
4. Click "Enable"
```

### Check Quota Limits

```
1. APIs & Services ' Quotas
2. Search "generative"
3. View daily and per-minute limits
4. Default: 60 requests per minute
```

## Environment File Setup

Create `.env` in project root:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDxI_...
VITE_FIREBASE_AUTH_DOMAIN=civiclens-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=civiclens-12345
VITE_FIREBASE_STORAGE_BUCKET=civiclens-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234

# Google Maps API Key
VITE_GOOGLE_MAPS_KEY=AIzaSyBxJ_...

# Google Gemini API Key
VITE_GEMINI_KEY=AIzaSyXxK_...
```

## Testing API Integration

### Test Firebase Connection

```javascript
// In browser console, after app loads:
import { db } from './src/config/firebaseConfig';
console.log(db);  // Should print Firestore instance
```

### Test Google Maps

```javascript
// Maps should load when you visit home page
// Check for map container and markers
```

### Test Gemini API

```
1. Go to /report page
2. Upload an image
3. Check browser console for Gemini response
```

## Common API Issues

### Firebase Issues

| Error | Fix |
|-------|-----|
| "Missing rules for path" | Update Firestore rules |
| "Permission denied" | Check authentication & rules |
| "Storage bucket not found" | Enable Cloud Storage |

### Maps Issues

| Error | Fix |
|-------|-----|
| "Google is not defined" | Check API key, load script |
| "Map doesn't load" | Verify API enabled, check key |
| "Invalid API key" | Regenerate key, check domain |

### Gemini Issues

| Error | Fix |
|-------|-----|
| "API key invalid" | Verify key in makersuite |
| "Quota exceeded" | Check rate limits |
| "Unsupported image format" | Use JPEG/PNG files |

## Security Best Practices

1. **API Keys in Production**
   - Restrict Maps key to your domain
   - Use separate keys for dev/prod
   - Rotate keys regularly

2. **Firebase Security**
   - Keep .env in .gitignore
   - Enable Firebase App Check
   - Review Firestore rules quarterly

3. **Data Privacy**
   - Store minimal user data
   - Implement data retention policy
   - Comply with local privacy laws

## Quota and Limits

### Firebase
- Firestore: 50,000 reads/day (free tier)
- Storage: 5GB (free tier)
- Users: Unlimited

### Google Maps
- Requests: 25,000 free per day
- Billing: Auto-enables if exceeded

### Gemini
- Requests: 60/minute (free tier)
- Daily: Varies (check quotas)
- Billing: $0.075 per 1K input tokens

## Monitoring & Debugging

### Firebase Console
```
1. Firestore ' Monitor tab
2. View read/write operations
3. Check quota usage
```

### Google Cloud Console
```
1. APIs & Services ' Dashboard
2. View API usage & quota
3. Check recent errors
```

### Application Logging
```javascript
// Enable debug logging
import { getFirestore, enableLogging } from "firebase/firestore";
enableLogging(true);
```

## Scaling Considerations

For production deployment:

1. **Firebase**
   - Upgrade to Blaze plan for scaling
   - Set up indexes for queries
   - Enable backup & disaster recovery

2. **Maps**
   - Set up billing account
   - Monitor quota usage
   - Consider Places API for location features

3. **Gemini**
   - Monitor token usage
   - Implement caching
   - Consider batching requests

---

For more help, see main README.md and SETUP_GUIDE.md!




