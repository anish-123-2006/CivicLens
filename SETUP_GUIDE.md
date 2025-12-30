# CivicLens - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Create Firebase Project
1. Visit https://console.firebase.google.com
2. Click "Create Project" → CivicLens
3. Enable Analytics (optional)
4. Click "Create"

### Step 2: Set Up Firebase Services

**Authentication:**
- Go to Firestore Database → Rules
- Build with Firestore (select production mode)
- Go to Authentication → Sign-in method
- Enable Google provider

**Storage:**
- Go to Storage → Create bucket (default settings)

### Step 3: Get API Keys

**Firebase Keys:**
1. Go to Settings → Project Settings
2. Scroll to "Your apps" section
3. Click Web icon → Copy Firebase config
4. Extract: apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId

**Google Maps API:**
1. Go to https://console.cloud.google.com
2. Enable Maps JavaScript API
3. Create API Key under Credentials
4. Copy the key

**Gemini API:**
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Step 4: Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env with your keys
# Use your favorite editor to add all API keys
```

### Step 5: Run Application

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## 📋 Project Structure

```
vite-project/
├── src/
│   ├── components/
│   │   ├── MapComponent.tsx      # Google Maps display
│   │   └── ProtectedRoute.tsx    # Auth protection
│   ├── config/
│   │   └── firebaseConfig.ts     # Firebase setup
│   ├── contexts/
│   │   └── AuthContext.tsx       # Auth state management
│   ├── pages/
│   │   ├── Home.tsx              # Map dashboard
│   │   ├── Login.tsx             # Authentication page
│   │   └── Report.tsx            # Report creation
│   ├── services/
│   │   └── geminiService.ts      # AI analysis
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   ├── App.jsx                   # Main routing
│   └── main.jsx                  # Entry point
├── public/
│   └── manifest.json             # PWA manifest
├── .env.example                  # Template env file
├── index.html                    # HTML template
├── package.json                  # Dependencies
└── vite.config.js               # Vite config
```

## 🔑 Environment Variables Reference

```env
# Firebase API Configuration
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Third-party APIs
VITE_GOOGLE_MAPS_KEY=AIzaSy...
VITE_GEMINI_KEY=AIzaSy...
```

## 🧪 Testing the App

### 1. Test Authentication
- Click "Sign in with Google"
- Accept permissions
- You should see the map

### 2. Test Reporting
- Click "+" button
- Upload a test image (of infrastructure, road damage, etc.)
- Wait for AI analysis
- Verify issue is detected
- Click "Submit Report"

### 3. Test Map
- Check if your report appears on the map
- Click marker to see details

## ⚙️ Deployment

### Firebase Hosting

```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Vercel

```bash
npm run build
npm install -g vercel
vercel
```

Don't forget to add environment variables to your hosting dashboard!

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Map not loading" | Check VITE_GOOGLE_MAPS_KEY, enable Maps JavaScript API |
| "Sign in fails" | Verify Google auth enabled, check authorized domains |
| "Image upload fails" | Check Storage rules, verify firebaseapp.com domain |
| "AI not working" | Check VITE_GEMINI_KEY, API quota, image format |

## 📱 PWA Installation

### On Mobile:
1. Open app in Chrome/Safari
2. Click menu → "Install app"
3. App appears on home screen

### On Desktop:
1. Open app in Chrome
2. Click address bar icon → "Install"
3. App launches in window mode

## 🎯 Next Steps

1. **Customize branding**: Edit colors in App.tsx theme
2. **Add more issue types**: Update Gemini prompt in geminiService.ts
3. **Enable offline mode**: Add service worker
4. **Add notifications**: Integrate Firebase Cloud Messaging
5. **Advanced analytics**: Add Firebase Analytics

## 📚 Resources

- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Material UI](https://mui.com)
- [Google Maps](https://developers.google.com/maps)
- [Gemini API](https://ai.google.dev)

---

**Questions?** Check the main README.md for detailed setup instructions!
