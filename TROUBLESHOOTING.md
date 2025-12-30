# CivicLens - Troubleshooting Guide

## 🔍 Quick Diagnosis

### App Won't Start
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm run dev
```

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3001
```

### Map Not Showing
Check:
1. `VITE_GOOGLE_MAPS_KEY` in `.env`
2. Maps API enabled in Google Cloud Console
3. Browser console for errors (F12)

### Sign-in Fails
Check:
1. Firebase Auth enabled
2. Google provider configured
3. Domain added to authorized domains in Firebase
4. Firebase config values correct in `.env`

---

## 🐛 Common Issues & Solutions

### Issue: "Google is not defined"
**Cause**: Maps API script not loaded  
**Solution**:
- Verify `VITE_GOOGLE_MAPS_KEY` is set
- Check browser console
- Restart dev server

### Issue: "Cannot find module '@google/generative-ai'"
**Cause**: Dependency not installed  
**Solution**:
```bash
npm install @google/generative-ai
```

### Issue: "Error: Firebase app not initialized"
**Cause**: Firebase config not loaded  
**Solution**:
- Check all `VITE_FIREBASE_*` variables in `.env`
- Verify `.env` file exists
- Restart dev server

### Issue: Image analysis not working
**Cause**: Gemini API issues  
**Solution**:
```javascript
// Test in browser console
const { analyzeImage } = await import('./src/services/geminiService');
const result = await analyzeImage(imageFile);
console.log(result);
```

### Issue: Map markers not showing
**Cause**: Firestore query not returning data  
**Solution**:
1. Check Firestore console for data
2. Verify Firestore rules allow read
3. Check MapComponent in browser console

### Issue: Image upload fails
**Cause**: Storage rules or quotas  
**Solution**:
1. Check Storage in Firebase console
2. Verify Storage rules allow write
3. Check file size (< 10MB)

---

## 🧪 Testing Checklist

### Authentication
```
□ Can sign in with Google
□ Can see user info in AppBar
□ Can sign out
□ /report route protected
□ Redirects to /login when not authenticated
```

### Reporting
```
□ Can access /report when logged in
□ Camera button works (or file input fallback)
□ Image preview shows
□ AI analysis happens (check console)
□ Form auto-fills from AI
□ Can edit form values
□ Location captured
□ Submit button works
□ Redirects to home on success
```

### Map
```
□ Map loads on /
□ Map centers on user location
□ Reports show as markers
□ Markers have correct colors
□ Can click marker
□ Info window shows image
□ Info window shows details
□ Can close info window
```

### Responsive
```
□ Works on mobile (360px)
□ Works on tablet (768px)
□ Works on desktop (1920px)
□ No horizontal scrolling
□ Touch targets are large
□ Text is readable
```

---

## 📊 Debugging with Browser DevTools

### Check Network Requests
```
F12 → Network tab
- Look for API calls
- Check response status (200 = OK)
- Check response content
```

### Check Console Errors
```
F12 → Console tab
- Look for red errors
- Note error messages
- Check stack traces
```

### Check Firebase
```
https://console.firebase.google.com
- Check Firestore data
- Check Storage files
- Check Auth logs
- Check quota usage
```

### Debug JavaScript
```javascript
// In browser console, after page loads

// Test Firebase
import { db } from './src/config/firebaseConfig';
console.log(db);

// Test Maps
console.log(google.maps);

// Test Auth
import { useAuth } from './src/contexts/AuthContext';
// (can't use hooks in console, but can check window.firebase)

// Test Gemini
const { analyzeImage } = await import('./src/services/geminiService');
```

---

## 🔧 Environment Variables Troubleshooting

### Check Environment Variables Loaded
```javascript
// In browser console
console.log(import.meta.env.VITE_FIREBASE_API_KEY);
// Should print your API key (not undefined)
```

### Verify .env File
```bash
# Check if .env exists
ls -la .env

# Check contents (don't commit this!)
cat .env

# Should see all VITE_* variables
```

---

## 🔒 Authentication Issues

### Sign-in Button Doesn't Work
1. Check Firebase console → Authentication → Google provider enabled
2. Check .env has all Firebase keys
3. Check browser console for error message
4. Try in private/incognito window

### "auth/popup-blocked"
- App is blocking popup
- Sign-in opens in popup window
- Check browser popup blocker settings

### "auth/invalid-api-key"
- Firebase API key is wrong
- Copy exact value from Firebase console
- Don't include quotes or spaces

---

## 🗺️ Map Issues

### Map Is Blank
1. Check if Google Maps API is enabled
2. Check if API key is correct
3. Check if there are errors in console
4. Verify Maps JavaScript API is in enabled APIs

### Markers Don't Show
1. Check if Firestore has data
2. Check if Firestore rules allow read
3. Verify location data is valid {lat, lng}
4. Check browser console for errors

### Map Not Centered
1. Check if geolocation is enabled
2. Check browser permissions
3. Verify location coordinates are valid
4. Try specifying default location

---

## 🤖 Gemini API Issues

### "API key not configured"
```bash
# Add to .env
VITE_GEMINI_KEY=your_key_here

# Restart dev server
npm run dev
```

### "Quota exceeded"
1. Check Google AI Studio for quota limits
2. Wait for quota reset
3. Reduce request frequency
4. Check for API issues on status page

### Image Analysis Returns Null
1. Image may not show a civic issue
2. Try with clear infrastructure photo
3. Check Gemini API logs
4. Verify API key is valid

### "Unsupported image format"
- Only supports JPEG, PNG, GIF, WebP
- Check file extension
- Try converting image format
- Check file is not corrupted

---

## 💾 Database Issues

### Can't Save Report
1. Check Firestore exists in Firebase
2. Check Firestore rules (must allow write)
3. Check user is authenticated
4. Check storage bucket exists

### Reports Not Showing on Map
1. Check Firestore data exists
2. Check coordinates are valid
3. Check Firestore rules allow read
4. Check real-time listener is active

### Old Reports Still Showing
1. Firestore may be caching
2. Try hard refresh (Ctrl+Shift+R)
3. Clear browser cache
4. Check real-time listener working

---

## 📱 Mobile Issues

### Camera Not Working
1. Check browser permissions (Settings)
2. Check HTTPS is enabled
3. Check browser supports camera API
4. Try file upload alternative

### Touch Not Working
1. Check buttons are large enough
2. Check no pointer-events: none
3. Verify touch event listeners
4. Test in Chrome DevTools mobile mode

### Map Not Responsive
1. Check viewport meta tag in HTML
2. Check CSS has width: 100%
3. Check no fixed widths on Map
4. Test on different devices

---

## 🐳 Docker Issues

### Build Fails
```bash
# Check Docker is installed
docker --version

# Check syntax
docker build -t civiclens . --progress=plain

# Check for layer errors
```

### Container Won't Start
```bash
# Check logs
docker logs <container_id>

# Try rebuild
docker build -t civiclens .
docker run -p 3000:3000 civiclens
```

---

## 📊 Performance Issues

### App Loads Slowly
1. Check network tab (F12)
2. Look for large files
3. Check API response times
4. Verify server response headers

### Map Renders Slowly
1. Check number of markers
2. Consider clustering for 100+ markers
3. Optimize image sizes
4. Check geolocation performance

### Image Upload Slow
1. Check file size (compress before upload)
2. Check internet connection
3. Check Storage quotas
4. Monitor network tab

---

## 🔐 Security Concerns

### Secrets in Console
⚠️ Don't share console output with API keys
- API keys visible in console
- Use incognito window for testing
- Clear browser history after testing

### .env File Accidentally Committed
```bash
# Remove from git
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Remove .env from tracking"

# Rotate all API keys immediately
```

---

## 📈 Scaling Issues

### Too Many Reports on Map
- Implement clustering
- Add pagination/filtering
- Limit to user's city
- Cache older reports

### Database Quota Exceeded
- Upgrade Firebase to Blaze plan
- Implement data archival
- Set retention policies
- Optimize queries

---

## 🆘 Still Having Issues?

### Gather Information
```bash
# System info
node --version
npm --version

# Check logs
npm run dev 2>&1 | head -50

# Check Firebase
# Go to Firebase console and check:
# - Authentication logs
# - Firestore operations
# - Storage operations
```

### Check Documentation
1. SETUP_GUIDE.md - Setup problems
2. API_SETUP_GUIDE.md - API configuration
3. DEVELOPMENT_GUIDE.md - Coding issues
4. ARCHITECTURE.md - Design questions

### Test Incrementally
1. Test Firebase connection first
2. Then test Maps
3. Then test Gemini
4. Then test integration

### Run Tests
```javascript
// In browser console
const { runAllTests } = await import('./src/utils/testUtils');
await runAllTests();
```

---

## 📋 Debugging Workflow

1. **Identify the problem**
   - What's not working?
   - When does it fail?
   - Error message?

2. **Check logs**
   - Browser console (F12)
   - Firebase console
   - Network tab
   - Server logs

3. **Isolate the issue**
   - Is it frontend or backend?
   - Is it an API or local issue?
   - Run test in console

4. **Test fix**
   - Make small change
   - Test in dev
   - Check console
   - Restart if needed

5. **Verify solution**
   - Test scenario again
   - Check no new errors
   - Test on mobile if relevant
   - Commit if working

---

## 📞 Getting Help

### Before Asking
1. ✅ Checked the console for errors
2. ✅ Checked Firebase console
3. ✅ Verified all .env variables
4. ✅ Tried restarting dev server
5. ✅ Checked documentation

### Share Information
- Error message (full text)
- Browser/OS
- Steps to reproduce
- What you've tried

### Resources
- React Docs: https://react.dev
- Firebase Docs: https://firebase.google.com/docs
- Material UI: https://mui.com/docs
- Gemini API: https://ai.google.dev/docs
- Google Maps: https://developers.google.com/maps

---

**Most issues are configuration related. Double-check .env first!** ✅

*Last Updated: December 30, 2025*
