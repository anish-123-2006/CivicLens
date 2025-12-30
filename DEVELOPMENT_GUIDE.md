# CivicLens - Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- A text editor (VS Code recommended)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vite-project

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env (see API_SETUP_GUIDE.md)

# Start development server
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable React components
├── config/             # Configuration files (Firebase, etc)
├── contexts/           # React Context for state
├── pages/              # Full page components (routes)
├── services/           # External API services
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Key Components

### MapComponent
**Location**: [src/components/MapComponent.tsx](src/components/MapComponent.tsx)

Displays Google Maps with report markers.

```typescript
// Usage
import MapComponent from '../components/MapComponent';

<MapComponent />
```

**Features**:
- Real-time Firestore updates
- Color-coded severity markers
- Info window with image preview
- Auto-centering on user location

### ReportComponent
**Location**: [src/pages/Report.tsx](src/pages/Report.tsx)

Handles image capture and report submission.

```typescript
// Usage
import Report from '../pages/Report';

<Report />  // Protected route only
```

**Features**:
- Camera capture
- File upload
- Gemini AI analysis
- Form auto-fill
- Location capture
- Firebase submission

### AuthContext
**Location**: [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)

Manages Firebase authentication state.

```typescript
// Usage
import { useAuth } from '../contexts/AuthContext';

const { user, loading, signInWithGoogle, signOut } = useAuth();
```

## Services

### Gemini Service
**Location**: [src/services/geminiService.ts](src/services/geminiService.ts)

Analyzes images with Google Gemini AI.

```typescript
import { analyzeImage } from '../services/geminiService';

const result = await analyzeImage(imageFile);
// Returns: { type: string, severity: string, description: string } | null
```

### Firebase Config
**Location**: [src/config/firebaseConfig.ts](src/config/firebaseConfig.ts)

Initializes Firebase services.

```typescript
import { db, auth, storage } from '../config/firebaseConfig';

// Use in components
const data = await getDocs(query(collection(db, 'reports')));
```

## Common Tasks

### Add a New Page

1. Create file in `src/pages/NewPage.tsx`

```typescript
import React from 'react';

const NewPage: React.FC = () => {
  return <div>New Page</div>;
};

export default NewPage;
```

2. Add route in `src/App.jsx`

```jsx
<Route path="/new" element={<NewPage />} />
```

### Add a New Component

1. Create file in `src/components/NewComponent.tsx`

```typescript
import React from 'react';
import { Box } from '@mui/material';

interface Props {
  title: string;
}

const NewComponent: React.FC<Props> = ({ title }) => {
  return <Box>{title}</Box>;
};

export default NewComponent;
```

2. Use in other components

```typescript
import NewComponent from '../components/NewComponent';

<NewComponent title="Hello" />
```

### Add a New Service

1. Create file in `src/services/newService.ts`

```typescript
export const doSomething = async (data: any) => {
  // Implementation
  return result;
};
```

2. Use in components

```typescript
import { doSomething } from '../services/newService';

const result = await doSomething(data);
```

### Query Firestore Data

```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const getReports = async () => {
  const q = query(
    collection(db, 'reports'),
    where('severity', '==', 'High')
  );
  const docs = await getDocs(q);
  return docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### Listen to Firestore Changes

```typescript
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useEffect, useState } from 'react';

const useReports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'reports'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  return reports;
};
```

### Upload File to Storage

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebaseConfig';

const uploadImage = async (file: File) => {
  const imageRef = ref(storage, `reports/${Date.now()}_${file.name}`);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);
  return url;
};
```

## Styling

### Using Material UI

```typescript
import { Box, Button, TextField, Paper } from '@mui/material';

<Paper sx={{ p: 2, mb: 3 }}>
  <Box sx={{ display: 'flex', gap: 2 }}>
    <TextField label="Name" />
    <Button variant="contained">Submit</Button>
  </Box>
</Paper>
```

### Custom CSS

Add to `src/App.css`:

```css
.custom-class {
  /* Your styles */
}
```

Use in component:

```typescript
import '../App.css';

<div className="custom-class">Content</div>
```

## Environment Variables

All environment variables must start with `VITE_`.

```env
VITE_FIREBASE_API_KEY=...
VITE_GOOGLE_MAPS_KEY=...
VITE_GEMINI_KEY=...
```

Access in code:

```typescript
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
```

## Debugging

### Browser DevTools

```bash
# In Chrome/Firefox DevTools Console
import { db } from './src/config/firebaseConfig';
console.log(db);
```

### Firebase Console

```
https://console.firebase.google.com/project/YOUR_PROJECT_ID
```

### Vite Debug Server

```bash
npm run dev -- --debug
```

## Testing

### Manual Testing Checklist

- [ ] Page loads without errors
- [ ] Components render correctly
- [ ] Forms submit data
- [ ] API calls succeed
- [ ] Firestore updates reflect
- [ ] Error handling works
- [ ] Responsive on mobile

### Debug Tips

1. **Check Network Tab**: Verify API calls
2. **Check Console**: Look for errors
3. **Check Firebase**: Verify data stored
4. **Check Storage**: Verify images uploaded
5. **Check Geolocation**: Verify coordinates

## Performance Tips

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const Report = lazy(() => import('./pages/Report'));

<Suspense fallback={<Loading />}>
  <Report />
</Suspense>
```

### Memoization

```typescript
import { memo } from 'react';

const MapComponent = memo(() => {
  // Component won't re-render unless props change
  return <div>Map</div>;
});
```

### useCallback

```typescript
import { useCallback } from 'react';

const handleSubmit = useCallback((data) => {
  // Function won't recreate unless dependencies change
  submitReport(data);
}, []);
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Map won't load | Check Maps API key, verify API enabled |
| Sign-in fails | Check Firebase auth config, verify domain |
| Image upload fails | Check Storage rules, verify file size |
| Gemini not working | Check API key, verify quota |
| Styles not applying | Check className, verify CSS import |
| Types missing | Run `npm install`, check tsconfig |

## Build & Deploy

### Development

```bash
npm run dev        # Start dev server
npm run lint       # Check code quality
npm run build      # Build for production
npm run preview    # Preview production build
```

### Production

```bash
# Firebase Hosting
npm run build
firebase deploy

# Vercel
npm run build
vercel --prod

# Docker
docker build -t civiclens .
docker run -p 3000:3000 civiclens
```

## Code Style

### TypeScript

Always use TypeScript for type safety:

```typescript
// ✅ Good
interface Report {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
}

// ❌ Avoid
const report: any = { ... };
```

### Naming

- **Components**: PascalCase (MapComponent)
- **Functions**: camelCase (getUserLocation)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL)
- **Files**: kebab-case for utilities (get-image-preview.ts)

### Comments

```typescript
/**
 * Analyzes an image for civic issues
 * @param file - The image file to analyze
 * @returns Issue data or null if not a civic issue
 */
export const analyzeImage = async (file: File) => {
  // Implementation
};
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Commit
git add .
git commit -m "feat: add new feature"

# Push
git push origin feature/new-feature

# Create Pull Request on GitHub
```

## Resources

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Material UI](https://mui.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Docs](https://vitejs.dev)
- [React Router](https://reactrouter.com)

---

**Need help?** Check the main README.md or open an issue!
