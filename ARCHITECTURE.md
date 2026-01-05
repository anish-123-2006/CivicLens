# CivicLens - Architecture & Data Flow

## System Architecture Diagram

```
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
"                       CLIENT-SIDE (BROWSER)                      "
"                          React 18 + TypeScript                   "
"-"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
                                    "
        """""""""""""""""""""""""""""""""""""""""""""""""""""""""
        "                           "                           "
        -                           -                           -
   """""""""""                """""""""""                """""""""""
   "  Login  "                "  Home   "                " Report  "
   "  Page   "                "  Page   "                "  Page   "
   """"""""""""                """"""""""""                """"""""""""
        "                          "                          "
        " Authenticate             " View Map                 " Capture/Upload
        "                          "                          "
        """""""""""""""""""""""""""""""""""""""""""""""""""""""""
                                    "
                    """""""""""""""""""""""""""""""""
                    "               "               "
                    -               -               -
            """"""""""""""""  """"""""""""""""  """"""""""""""""
            "   Firebase   "  " Google Maps  "  " Gemini API   "
            "   Auth       "  "  Integration "  "  (Image AI)  "
            """""""""""""""""  """""""""""""""""  """""""""""""""""
                   "                 "                 "
        """""""""""""""""""""""""""""""""""""""""""""""""""""""""""
        "                                                          "
        -                                                          -
   """""""""""""""""""                               """""""""""""""""""
   "   Firebase      "                               "  Google Cloud   "
   "   Services      "                               "  Services       "
   "  """"""""""""   "                               "  """""""""""""  "
   "  "Auth      "   "                               "  "Gemini API "  "
   "  """"""""""""   "                               "  """""""""""""  "
   "  "Firestore "   "  -"""""""""""""""""""""""""-  "  "Maps API   "  "
   "  """"""""""""   "                               "  """"""""""""""  "
   "  "Storage   "   "                               "                 "
   "  """""""""""""   "                               "                 "
   """"""""""""""""""""                               """"""""""""""""""""
        "
        """- Firestore Database
        "    """- Reports Collection
        "        "" imageUrl
        "        "" location {lat, lng}
        "        "" category
        "        "" severity
        "        "" description
        "        "" timestamp
        "        """ userId
        "
        """"- Cloud Storage
             """- /reports/[timestamp]_[filename].jpg
```


## Component Hierarchy

```
App (Main Router)
" 
"" Theme Provider
"  """ Auth Provider
"     "
"     "" Route: /login
"     "  """ Login
"     "     """ Google Sign-In Button
"     "
"     "" Route: /
"     "  """ Home
"     "     "" AppBar
"     "     "  "" Logo
"     "     "  """ User Menu
"     "     "
"     "     "" MapComponent
"     "     "  "" Google Map
"     "     "  "  """ Markers[]
"     "     "  "     """ InfoWindow
"     "     "  "        """ CardMedia (image)
"     "     "  """ Firestore Listener
"     "     "
"     "     """ FAB (Floating Action Button)
"     "        """ Navigate to /report
"     "
"     """ Route: /report (Protected)
"        """ ProtectedRoute
"           """ ReportComponent
"              "" Camera Capture
"              "" File Upload
"              "" Image Preview
"              "" Gemini Analysis
"              "  """ Loading State
"              "" Form
"              "  "" Category
"              "  "" Severity
"              "  """ Description
"              """ Submit Button
"     "
"     "" Route: /admin (Protected)
"        """ AdminDashboard
"           """ AdminRouteOptimizer (Smart Routing)
"              "" Optimized route suggestions for municipal teams
```

## Data Flow Diagram

```
USER CAPTURES/UPLOADS IMAGE
         "
         -
   """"""""""""""""
   " Image File   "
   " (.jpg/.png)  "
   """""""""""""""""
          "
          -
   """"""""""""""""""""
   " Validate Image   "
   " - Type check     "
   " - Size check     "
   """""""""""""""""""""
          "
          -
   """"""""""""""""""""
   " Get User Location"
   " Via GPS/Geoloc   "
   """""""""""""""""""""
          "
          -
   """"""""""""""""""""
   " Send to Gemini   "
   " AI Analysis      "
   """""""""""""""""""""
          "
    """""""""""""
    "           "
    -           -
""""""""""   """""""""""
"Civic   "   " Not a   "
"Issue   "   "Civic    "
"Found   "   "Issue    "
"""""""""""   """"""""""""
    "             "
    -             -
""""""""""""  """"""""""""
"Auto-fill "  "Show Error"
"Form with "  "Message   "
"AI Results"  "Try Again "
"""""""""""""  """""""""""""
    "
    -
"""""""""""""""""""""""
"User Reviews/Edits   "
"- Category           "
"- Severity           "
"- Description        "
"- Location           "
""""""""""""""""""""""""
       "
       -
"""""""""""""""""""""""
"Submit Report        "
""""""""""""""""""""""""
       "
    """""""
    "     "
    -     -
  """""" """""""""""""""""
  "Image Upload  Firestore
  "to Cloud  "    Report
  "Storage   "    Document
  """""""""""""    """"""""""""
      "                "
      "                "
      """""""""""""""""""
           "
           -
   """""""""""""""""""
   "Real-time Update "
   "All Users See    "
   "New Marker on    "
   "Map              "
   """"""""""""""""""""
```


## Route Structure

```
/              (Home)
       - Public: Shows map with all reports
/login        (Login)
       - Public: Google Sign-in
/report       (Report)
       - Protected: Image capture & submission form
/admin        (Admin Dashboard)
       - Protected: Admin-only
       - Shows: Kanban board, Smart Routing (route optimizer for municipal teams)
```

## State Management Flow

```
"""""""""""""""""""""""""""""""
"   AuthContext               "
"  (User Authentication)      "
"""""""""""""""""""""""""""""""
" - user (Firebase User)      "
" - loading (bool)            "
" - signInWithGoogle()        "
" - signOut()                 "
""""""""""""""""""""""""""""""""
           "
           " Provides
           "
    """""""-"""""""
    " Protected   "
    " Routes      "
    """"""""""""""""

"""""""""""""""""""""""""""""""
"  Local Component State      "
"""""""""""""""""""""""""""""""
" MapComponent:               "
"  - reports (Firestore)      "
"  - selectedReport           "
"  - userLocation             "
"                             "
" ReportComponent:            "
"  - selectedFile             "
"  - issueData (from Gemini)  "
"  - location                 "
"  - analyzing (loading)      "
""""""""""""""""""""""""""""""""
```

## API Integration Points

```
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
"                    GEMINI SERVICE                        "
"  analyzeImage(imageFile: File)                           "
"  "" Convert image to Base64                             "
"  "" Send to Gemini 1.5 Flash model                      "
"  "" Parse JSON response                                 "
"  """ Return: CivicIssue | null                           "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
           "
           ""- Input: Image file
           """- Output: {type, severity, description}

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
"               FIREBASE INTEGRATION                       "
"                                                          "
" Authentication:                                          "
"  - signInWithPopup(auth, googleProvider)               "
"  - signOut(auth)                                        "
"  - onAuthStateChanged(auth, setUser)                    "
"                                                          "
" Firestore:                                              "
"  - onSnapshot(reports query)  (Real-time listener)     "
"  - addDoc(collection, data)   (Create report)          "
"                                                          "
" Storage:                                                "
"  - uploadBytes(ref, file)      (Upload image)          "
"  - getDownloadURL(ref)         (Get image URL)         "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
"              GOOGLE MAPS API                             "
"                                                          "
" LoadScript: Loads Maps JS library                       "
" GoogleMap: Renders map container                        "
" Marker: Renders issue markers with custom icons         "
" InfoWindow: Shows report details on click               "
" Options: DisableStreetView, Zoom level, etc            "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
```

## Security Model

```
"""""""""""""""""""""""""""""""""""""""""""""""""""
"          AUTHENTICATION LAYER                   "
"  Google Sign-in ' Firebase Auth ' Session      "
""""""""""""""""""""""""""""""""""""""""""""""""""""
           "
           -
"""""""""""""""""""""""""""""""""""""""""""""""""""
"         AUTHORIZATION LAYER                     "
"  Protected Routes ' Check user state            "
"  /report: Requires authenticated user           "
"  /: Public to all                               "
""""""""""""""""""""""""""""""""""""""""""""""""""""
           "
           -
"""""""""""""""""""""""""""""""""""""""""""""""""""
"      FIRESTORE SECURITY RULES                   "
"  reports collection:                            "
"  - Read: Allow for all (public)                 "
"  - Write: Require request.auth != null          "
"  - Delete: Require userId match                 "
""""""""""""""""""""""""""""""""""""""""""""""""""""
           "
           -
"""""""""""""""""""""""""""""""""""""""""""""""""""
"    CLOUD STORAGE SECURITY RULES                 "
"  /reports/* path:                               "
"  - Read: Allow for all (public images)         "
"  - Write: Require request.auth != null         "
""""""""""""""""""""""""""""""""""""""""""""""""""""
```

## Performance Considerations

```
"""""""""""""""""""""""""""""""""""""""""""""""""""
"           OPTIMIZATION STRATEGIES               "
"""""""""""""""""""""""""""""""""""""""""""""""""""
"                                                  "
" Frontend:                                       "
"  React.memo() for MapComponent                "
"  useCallback() for event handlers             "
"  Code splitting via React Router              "
"  Lazy loading pages                           "
"                                                  "
" Backend:                                        "
"  Index reports by timestamp (recent first)    "
"  Real-time listeners instead of polling       "
"  Image optimization in Cloud Storage          "
"  CDN for static assets                        "
"                                                  "
" Network:                                        "
"  Compress images before upload                "
"  Batch Firestore writes                       "
"  Cache Google Maps tiles                      "
"  PWA service worker caching                   "
"                                                  "
""""""""""""""""""""""""""""""""""""""""""""""""""""
```

## Deployment Architecture

```
"""""""""""""""""""""""""""""""""""""""""""""""""""
"            PRODUCTION DEPLOYMENT                "
"""""""""""""""""""""""""""""""""""""""""""""""""""
"                                                  "
"  Option 1: Firebase Hosting                     "
"  npm run build ' firebase deploy                "
"  """ Automatic HTTPS, CDN, custom domain        "
"                                                  "
"  Option 2: Vercel                               "
"  Automatic deployments on git push              "
"  """ Edge functions, preview URLs                "
"                                                  "
"  Option 3: Docker                               "
"  docker build -t civiclens .                    "
"  """ Deploy to any cloud provider                "
"                                                  "
""""""""""""""""""""""""""""""""""""""""""""""""""""
```

---


---

**Smart Routing** is a core part of the admin dashboard. It leverages report data (severity, upvotes, location) and Google Maps Directions API to suggest optimal routes for municipal field teams. This enables efficient resource allocation and faster issue resolution, directly from the admin interface.

This architecture ensures:
- Security through multi-layer authentication
- Real-time updates via Firestore listeners
- Scalability through Google Cloud services
- Performance through optimizations
- Reliability through proven services




