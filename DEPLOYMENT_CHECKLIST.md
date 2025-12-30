# CivicLens - Deployment Checklist

## Pre-Deployment Verification

### Code Quality
- [ ] No TypeScript errors: `npm run build`
- [ ] ESLint passes: `npm run lint`
- [ ] No console warnings in dev mode
- [ ] Environment variables in `.env` (not in code)

### Functionality Testing
- [ ] Sign-in with Google works
- [ ] Can capture photo from device
- [ ] Can upload image from file
- [ ] AI analyzes image correctly
- [ ] Report submits without errors
- [ ] Report appears on map
- [ ] Marker colors match severity
- [ ] Map centers on user location
- [ ] Info windows display correctly
- [ ] Sign out works

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Map renders smoothly
- [ ] No memory leaks
- [ ] Images load quickly
- [ ] No 404 errors

### Security
- [ ] `.env` file not committed
- [ ] Firebase rules reviewed
- [ ] No API keys in code
- [ ] HTTPS enabled
- [ ] CORS configured properly

## Firebase Configuration

### Authentication
- [ ] Google Sign-in provider enabled
- [ ] App domain added to authorized domains
- [ ] User sign-out works

### Firestore
- [ ] Database created in production mode
- [ ] Composite indexes created (if needed)
- [ ] Rules updated for public read
- [ ] Backup enabled

### Cloud Storage
- [ ] Storage bucket created
- [ ] Rules allow authenticated uploads
- [ ] CORS headers configured
- [ ] Storage quota increased (if needed)

## Google Cloud Setup

### Maps API
- [ ] API enabled in Cloud Console
- [ ] API key created
- [ ] Key restricted to domain(s)
- [ ] Maps load without errors

### Gemini API
- [ ] API key generated
- [ ] API enabled in Cloud Console
- [ ] Quota limits reviewed
- [ ] Image analysis working

## Deployment Platform

### Firebase Hosting
- [ ] `firebase.json` configured
- [ ] `.firebaserc` has project ID
- [ ] Rewrite rules set for SPA
- [ ] Build directory set to `dist`

```bash
# Test build
npm run build

# Login to Firebase
firebase login

# Deploy
firebase deploy
```

### Vercel (Alternative)
- [ ] Project connected to Git repo
- [ ] Environment variables added
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

## SSL/HTTPS
- [ ] SSL certificate installed
- [ ] HTTPS redirects from HTTP
- [ ] Mixed content warnings resolved
- [ ] Certificate auto-renewal enabled

## Domain & DNS
- [ ] Custom domain configured
- [ ] DNS records pointing to host
- [ ] Email configured (if applicable)
- [ ] SSL certificate for domain

## Monitoring & Analytics

### Firebase Console
- [ ] Authentication dashboard monitored
- [ ] Firestore usage tracked
- [ ] Storage quota monitored
- [ ] Error logging enabled

### Application Monitoring
- [ ] Sentry/error tracking configured
- [ ] Analytics library added
- [ ] User session tracking
- [ ] Performance monitoring

## Backup & Recovery

### Firestore
- [ ] Backup schedule set
- [ ] Export location configured
- [ ] Restore procedure documented

### Storage
- [ ] Object versioning enabled
- [ ] Retention policy set
- [ ] Geographic redundancy checked

## Documentation

- [ ] README.md updated with production URLs
- [ ] API documentation created
- [ ] Deployment guide written
- [ ] Troubleshooting guide prepared
- [ ] Support contact documented

## Post-Deployment

### Smoke Tests
- [ ] Site loads in browser
- [ ] All pages accessible
- [ ] Sign-in works
- [ ] Report submission works
- [ ] Map displays all reports

### User Testing
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Test with slow network
- [ ] Test offline functionality
- [ ] Get user feedback

### Monitoring
- [ ] Monitor error logs daily
- [ ] Check Firebase dashboard
- [ ] Monitor API quotas
- [ ] Monitor bandwidth usage
- [ ] Monitor cost projections

## Rollback Plan

If issues arise:

1. **Keep previous version** deployed
2. **Document all changes** made
3. **Have rollback script** ready
4. **Monitor after rollback**

```bash
# Rollback to previous version
firebase hosting:channel:deploy main-previous
```

## Scaling Plan

As usage grows:

### Firebase
- [ ] Upgrade to Blaze plan
- [ ] Increase Firestore quotas
- [ ] Enable auto-scaling
- [ ] Set up billing alerts

### Google Cloud
- [ ] Monitor API usage
- [ ] Increase quota limits
- [ ] Consider caching layer
- [ ] Implement CDN

## Post-Launch Improvements

- [ ] Gather user feedback
- [ ] Fix reported bugs
- [ ] Add new features
- [ ] Optimize performance
- [ ] Improve UI/UX

## Version Control

- [ ] Tag production release
- [ ] Document deployment date
- [ ] Create release notes
- [ ] Archive deployment artifacts

## Team Communication

- [ ] Notify stakeholders of launch
- [ ] Update status page
- [ ] Prepare support guide
- [ ] Schedule post-launch review

---

## Quick Deployment Commands

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Vercel
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t civiclens .
docker run -p 3000:3000 civiclens
```

---

**Deployment Status**: ⏳ Ready for Go-Live

Check off items as you complete them. Don't deploy without completing all critical items!
