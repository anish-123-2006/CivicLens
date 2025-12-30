# 🚀 CivicLens - Deployment & Demo Guide

## **Quick Start (Development)**

### **Prerequisites**
- Node.js 16+ installed
- npm or yarn package manager
- Google account for testing

### **Installation Steps**

```bash
# 1. Navigate to project directory
cd vite-project

# 2. Install dependencies
npm install

# 3. Create .env file with your credentials
cat > .env << EOF

VITE_FIREBASE_AUTH_DOMAIN=anish-baa94.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=anish-baa94
VITE_FIREBASE_STORAGE_BUCKET=anish-baa94.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=XXXXXX
VITE_FIREBASE_APP_ID=1:XXXXXX:web:XXXXXX

EOF

# 4. Start development server
npm run dev

# Server will run on http://localhost:5173 (or next available port)
```

---

## **Access Points**

### **Citizen Application**
- **URL**: http://localhost:5173/
- **Features**: 
  - View public map of reported issues
  - Sign in with Google
  - Report new civic issues
  - Upvote existing issues
  - Share on social media

### **Report Page**
- **URL**: http://localhost:5173/report
- **Requirements**: Must be logged in
- **Features**:
  - Camera capture or photo upload
  - AI image analysis
  - Voice description input
  - Map location tagging
  - Submit and share

### **Success Page**
- **URL**: http://localhost:5173/success (auto-redirect after submit)
- **Features**:
  - Report summary card
  - Twitter/Email/WhatsApp sharing buttons
  - Back to map link

### **Admin Dashboard**
- **URL**: http://localhost:5173/admin
- **Login**: 
  - Email: `admin@gov.in`
  - Password: `CivicLens2024Admin`
- **Features**:
  - Kanban board (To Do | In Progress | Done)
  - Drag-drop issue management
  - Real-time statistics
  - Issue resolution tracking

---

## **Feature Testing Checklist**

### **✅ Citizen Reporting Flow**
- [ ] Sign in with Google account
- [ ] Take photo using camera
- [ ] Upload photo from gallery
- [ ] View AI analysis results
  - Issue type detected
  - Severity level assigned
  - AI-generated description
- [ ] Edit description manually
- [ ] Use voice input to record description
- [ ] See location captured on map
- [ ] Submit report
- [ ] View success page
- [ ] Share on Twitter
- [ ] Share via Email draft
- [ ] Share on WhatsApp

### **✅ Map & Upvote Features**
- [ ] Navigate to home page
- [ ] See all reported issues as map pins
- [ ] Click pins to view details
- [ ] See upvote count on each issue
- [ ] Click upvote button (sign in if needed)
- [ ] Verify upvote count increases
- [ ] Toggle between Map View and Heatmap

### **✅ Heatmap Analytics**
- [ ] Click heatmap toggle button
- [ ] See heat layer overlay on map
- [ ] Verify red zones = high issue concentration
- [ ] See info box with statistics
- [ ] Toggle back to map view
- [ ] Verify markers still visible in map mode

### **✅ Voice Input**
- [ ] In report page, click "🎤 Record Voice Description"
- [ ] Speak your issue description
- [ ] See transcribed text below microphone
- [ ] Click "Use as Description"
- [ ] Verify text appears in description field

### **✅ Admin Dashboard**
- [ ] Navigate to /admin
- [ ] Enter credentials: admin@gov.in / CivicLens2024Admin
- [ ] View dashboard with 3 columns (To Do, In Progress, Done)
- [ ] See all issues in To Do column
- [ ] Click issue card to open dialog
- [ ] Change status to "In Progress"
- [ ] Verify issue moves to middle column
- [ ] Change status to "Done" (Resolved)
- [ ] Verify issue appears in right column with checkmark
- [ ] View dashboard statistics (top right)
  - Show count of issues by status
- [ ] Logout from admin panel

### **✅ Social Sharing**
- [ ] Submit a high-severity issue
- [ ] On success page, click "Tweet to Municipal Corp"
- [ ] Verify Twitter intent window opens
- [ ] Check pre-filled tweet message
- [ ] Click "Email to Government"
- [ ] Verify email client/mailto link is triggered
- [ ] Click "Share on WhatsApp"
- [ ] Verify WhatsApp intent opens

---

## **Browser Requirements**

### **Recommended**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Features by Browser**
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Maps API | ✅ | ✅ | ✅ | ✅ |
| Google Sign-In | ✅ | ✅ | ✅ | ✅ |
| Camera/Photo | ✅ | ✅ | ✅ | ✅ |
| Voice Input | ✅ | ❌ | ⚠️ | ✅ |
| Geolocation | ✅ | ✅ | ✅ | ✅ |
| Heatmap Layer | ✅ | ✅ | ✅ | ✅ |

---

## **API Keys & Configuration**

### **Required APIs**
1. **Firebase** (Authentication, Firestore, Storage)
   - Project: anish-baa94
   - Already configured in .env

2. **Google Maps** (Map display, Geolocation, Heatmap)
   - API: Maps JavaScript API + Geolocation API
   - Heatmap Layer: Visualization Library
   - Key: Already configured in .env

3. **Google Generative AI** (Gemini 2.5 Flash Lite)
   - Model: gemini-2.5-flash-lite
   - Key: Already configured in .env

### **Firestore Database Structure**
```
reports/
├── {reportId}
│   ├── imageUrl: string (base64 compressed image)
│   ├── location: {lat, lng}
│   ├── category: string (Issue type)
│   ├── severity: string (High/Medium/Low)
│   ├── description: string
│   ├── timestamp: timestamp
│   ├── userId: string
│   ├── upvotes: array (userId list)
│   └── status: string (todo/in-progress/done)
```

---

## **Troubleshooting**

### **Issues**

#### **Port Already in Use**
```bash
# Kill process on port 5173
# Linux/Mac:
lsof -ti:5173 | xargs kill -9

# Windows (PowerShell):
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

#### **Module Not Found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

#### **Google Sign-In Fails**
- Verify Google Cloud project has OAuth 2.0 client configured
- Check that localhost is whitelisted in Firebase Console
- Clear browser cookies and try again

#### **Voice Input Not Working**
- Voice API only works on HTTPS or localhost
- Use Chrome/Edge for best support
- Check microphone permissions in browser
- Safari: May have limited support

#### **Images Not Showing on Map**
- Verify Firestore rules allow read access
- Check browser console for CORS errors
- Ensure images are properly compressed to base64

#### **Gemini API Quota Exceeded**
- Free tier has limited requests per day
- Wait 24 hours for quota reset
- Or create new API key from Google AI Studio

---

## **Performance Optimization Tips**

1. **Image Optimization**
   - Images are auto-compressed to <1MB
   - Reduces Firestore storage usage
   - Faster map loading

2. **Real-Time Updates**
   - Firestore listeners optimized for single collection
   - Only subscribes when component mounts
   - Unsubscribes on unmount

3. **Map Rendering**
   - Markers only rendered when selected (InfoWindow)
   - Heatmap layer uses weighted data points
   - Zoom controls disabled for cleaner UI

---

## **Deployment Options (Production)**

### **Option 1: Vercel** (Recommended)
```bash
npm install -g vercel
vercel --env-file .env
```

### **Option 2: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### **Option 3: Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev"]
```

### **Option 4: AWS Amplify**
```bash
npm install -g @aws-amplify/cli
amplify init
amplify hosting add
npm run build
amplify publish
```

---

## **Environment Variables Reference**

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=<your_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_domain>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<your_bucket>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender_id>
VITE_FIREBASE_APP_ID=<app_id>

# Google APIs
VITE_GOOGLE_MAPS_KEY=<your_maps_api_key>
VITE_GEMINI_KEY=<your_gemini_api_key>
```

---

## **Support & Resources**

- **React Docs**: https://react.dev
- **Firebase Docs**: https://firebase.google.com/docs
- **Google Maps API**: https://developers.google.com/maps
- **Gemini API**: https://ai.google.dev/docs
- **Material-UI**: https://mui.com/docs
- **Vite**: https://vitejs.dev/

---

**Ready to Demo CivicLens? Let's go! 🚀**
