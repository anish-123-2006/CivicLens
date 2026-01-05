# CivicLens - AI-Powered Civic Issue Reporting PWA

A Progressive Web App that empowers citizens to report civic issues (potholes, garbage, broken infrastructure) using AI-powered image analysis and real-time mapping.


## Features

- **AI-Powered Analysis**: Uses Google Gemini AI to automatically analyze images and categorize civic issues
- **Real-time Map Dashboard**: Interactive Google Maps interface showing all reported issues with color-coded severity markers
- **Smart Routing**: Optimizes and suggests the most efficient route for municipal teams to address reported issues, factoring in severity, location, and upvotes. Admins can view and manage optimal routes for field operations.
- **Google Authentication**: Secure sign-in with Google accounts
- **Camera/Upload**: Capture photos directly or upload from device
- **Auto-location**: Automatically captures GPS coordinates for each report
- **Responsive Design**: Mobile-first design using Material UI
- **PWA Ready**: Installable as a mobile app


## Tech Stack

- **Frontend**: React 18 with Vite
- **UI Framework**: Material UI (MUI)
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Maps**: Google Maps API via @react-google-maps/api
- **AI**: Google Gemini API (Generative AI)
- **Routing**: React Router DOM
- **Smart Routing**: Custom route optimization logic for municipal teams, leveraging report data and Google Maps Directions API (admin dashboard only)

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
2. **Firebase Project** ([Create one](https://console.firebase.google.com/))
3. **Google Maps API Key** ([Get one](https://developers.google.com/maps/documentation/javascript/get-api-key))
4. **Google Gemini API Key** ([Get one](https://makersuite.google.com/app/apikey))

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication** ' Enable Google Sign-in provider
   - **Firestore Database** ' Create database in production mode
   - **Storage** ' Enable Firebase Storage
4. Go to Project Settings ' General ' Your apps
5. Copy your Firebase configuration

### 3. Set Up Environment Variables

1. Copy the example file:
```bash
copy .env.example .env
```

2. Edit `.env` and add your API keys:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API Key
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key_here

# Google Gemini API Key
VITE_GEMINI_KEY=your_gemini_api_key_here
```

### 4. Configure Firestore Rules

In Firebase Console ' Firestore Database ' Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{report} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Configure Storage Rules

In Firebase Console ' Storage ' Rules, add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{allPaths} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 6. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## +/- Usage Guide


### For Users:

1. **Sign In**: Click "Sign in with Google" on the login page
2. **View Map**: See all reported civic issues on the interactive map
  - Red markers = High severity
  - Orange markers = Medium severity
  - Yellow markers = Low severity
3. **Report Issue**: 
  - Click the "+" button (bottom right)
  - Take a photo or upload an image
  - AI will automatically analyze and categorize the issue
  - Review and edit if needed
  - Submit to add to the public map
4. **(For Admins) Smart Routing**:
  - Access the Admin Dashboard
  - View optimized routes for field teams based on live reports
  - Routes are prioritized by severity, upvotes, and proximity
  - Use suggested routes to efficiently resolve issues in the field

### For Developers:

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Data Structure

### Firestore Collection: `reports`

```typescript
{
  imageUrl: string,
  location: {
    lat: number,
    lng: number
  },
  category: string,      // e.g., "Pothole", "Garbage"
  severity: string,      // "High" | "Medium" | "Low"
  description: string,   // AI-generated description
  timestamp: Timestamp,
  userId: string
}
```


## Key Components

- **AuthContext**: Manages authentication state
- **MapComponent**: Displays Google Map with issue markers
- **ReportComponent**: Handles image capture and AI analysis
- **ProtectedRoute**: Guards routes requiring authentication
- **geminiService**: Interfaces with Google Gemini AI
- **AdminRouteOptimizer**: Provides Smart Routing logic and UI for admins to view and manage optimal routes for municipal teams

## Security Notes

- Never commit `.env` file to version control
- Restrict API keys to specific domains in production
- Enable Firebase App Check for additional security
- Review Firestore and Storage rules before production deployment

## Troubleshooting

### Map not loading
- Verify `VITE_GOOGLE_MAPS_KEY` is correct
- Check browser console for API errors
- Ensure Maps JavaScript API is enabled

### Authentication fails
- Verify Google Sign-in is enabled in Firebase Console
- Check `authDomain` in Firebase config
- Add authorized domains in Firebase Authentication settings

### Image upload fails
- Verify Storage is enabled in Firebase
- Check Storage rules allow authenticated writes

### AI analysis fails
- Verify `VITE_GEMINI_KEY` is valid
- Check API quota limits

## License

MIT License

---

Built with  using Google Cloud Technologies




