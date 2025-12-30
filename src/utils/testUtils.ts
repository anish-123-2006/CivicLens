/**
 * Integration Test Utilities for CivicLens
 * Run these tests manually to verify all APIs are connected
 */

/**
 * Test Firebase Connection
 * Run this in browser console after app loads
 */
export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase Connection...');
  try {
    const { db } = await import('../config/firebaseConfig');
    const { collection, getDocs, query, limit } = await import('firebase/firestore');

    // Try to fetch one report
    const q = query(collection(db, 'reports'), limit(1));
    const snapshot = await getDocs(q);

    console.log('✅ Firebase Firestore: Connected');
    console.log(`📊 Total reports in database: ${snapshot.size}`);
    return true;
  } catch (error) {
    console.error('❌ Firebase Firestore: Failed', error);
    return false;
  }
};

/**
 * Test Google Maps API
 * Run this after map loads
 */
export const testGoogleMapsAPI = () => {
  console.log('🗺️ Testing Google Maps API...');
  try {
    if (typeof google !== 'undefined' && google.maps) {
      console.log('✅ Google Maps API: Loaded');
      console.log(`📍 Maps version: ${google.maps.version}`);
      return true;
    } else {
      console.error('❌ Google Maps API: Not loaded');
      return false;
    }
  } catch (error) {
    console.error('❌ Google Maps API: Error', error);
    return false;
  }
};

/**
 * Test Gemini API
 * Run this after signing in
 */
export const testGeminiAPI = async () => {
  console.log('🤖 Testing Gemini API...');
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Test with a simple prompt
    const result = await model.generateContent('Say "Hello CivicLens"');
    const response = await result.response;

    console.log('✅ Gemini API: Connected');
    console.log(`💬 Response: ${response.text()}`);
    return true;
  } catch (error) {
    console.error('❌ Gemini API: Failed', error);
    return false;
  }
};

/**
 * Test Authentication
 * Run this after signing in
 */
export const testAuthentication = async () => {
  console.log('🔐 Testing Authentication...');
  try {
    const { auth } = await import('../config/firebaseConfig');
    const { currentUser } = auth;

    if (currentUser) {
      console.log('✅ Authentication: Logged in');
      console.log(`👤 User: ${currentUser.displayName || currentUser.email}`);
      console.log(`🆔 UID: ${currentUser.uid}`);
      return true;
    } else {
      console.warn('⚠️ Authentication: Not logged in');
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication: Error', error);
    return false;
  }
};

/**
 * Test Geolocation
 * Run this in browser console
 */
export const testGeolocation = async (): Promise<boolean> => {
  console.log('📍 Testing Geolocation...');
  return new Promise<boolean>((resolve) => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocation: Not supported');
      resolve(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Geolocation: Enabled');
        console.log(`📍 Latitude: ${position.coords.latitude}`);
        console.log(`📍 Longitude: ${position.coords.longitude}`);
        console.log(`📊 Accuracy: ${position.coords.accuracy}m`);
        resolve(true);
      },
      (error) => {
        console.error('❌ Geolocation: Denied or Error', error);
        resolve(false);
      }
    );
  });
};

/**
 * Run All Tests
 */
export const runAllTests = async () => {
  console.log('========================================');
  console.log('🧪 CivicLens Integration Tests');
  console.log('========================================\n');

  const results = {
    firebase: false,
    maps: false,
    gemini: false,
    auth: false,
    geo: false,
  };

  // Firebase
  results.firebase = await testFirebaseConnection();
  console.log('');

  // Maps
  results.maps = testGoogleMapsAPI();
  console.log('');

  // Gemini
  results.gemini = await testGeminiAPI();
  console.log('');

  // Auth
  results.auth = await testAuthentication();
  console.log('');

  // Geolocation
  results.geo = await testGeolocation();
  console.log('');

  // Summary
  console.log('========================================');
  console.log('📊 Test Summary');
  console.log('========================================');
  console.log(`✅ Firebase: ${results.firebase ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Google Maps: ${results.maps ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Gemini API: ${results.gemini ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Authentication: ${results.auth ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Geolocation: ${results.geo ? 'PASS' : 'FAIL'}`);

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  console.log(`\n${passed}/${total} tests passed`);

  return results;
};

/**
 * Test Image Analysis
 * Use after signing in and on report page
 */
export const testImageAnalysis = async (imageFile: File) => {
  console.log('📷 Testing Image Analysis...');
  try {
    const { analyzeImage } = await import('../services/geminiService');

    console.log('🔍 Analyzing image...');
    const result = await analyzeImage(imageFile);

    if (result) {
      console.log('✅ Image Analysis: Success');
      console.log(`📌 Type: ${result.type}`);
      console.log(`🔴 Severity: ${result.severity}`);
      console.log(`📝 Description: ${result.description}`);
      return result;
    } else {
      console.log('⚠️ Image Analysis: Not a civic issue');
      return null;
    }
  } catch (error) {
    console.error('❌ Image Analysis: Failed', error);
    return null;
  }
};

/**
 * How to Use These Tests
 *
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Run tests:
 *
 * // Test all APIs
 * const tests = await import('./utils/testUtils.ts');
 * await tests.runAllTests();
 *
 * // Test individual APIs
 * await tests.testFirebaseConnection();
 * tests.testGoogleMapsAPI();
 * await tests.testGeminiAPI();
 * await tests.testAuthentication();
 * await tests.testGeolocation();
 *
 * 4. Check console for results
 */
