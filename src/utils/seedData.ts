import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Sample data for civic issues
const CATEGORIES = [
  'pothole',
  'damaged roads',
  'street lights',
  'garbage',
  'water leakage',
  'broken pavement',
  'traffic signs',
  'drainage',
];

const SEVERITIES = ['low', 'medium', 'high'];

const LOCATIONS = [
  { lat: 24.4803, lng: 72.7828, name: 'Abu Road, Santopur' },
  { lat: 24.4850, lng: 72.7900, name: 'Main Street' },
  { lat: 24.4750, lng: 72.7750, name: 'Market Area' },
  { lat: 24.4900, lng: 72.8000, name: 'Highway Junction' },
  { lat: 24.4700, lng: 72.7650, name: 'Downtown' },
  { lat: 24.4950, lng: 72.7950, name: 'Park Road' },
  { lat: 24.4650, lng: 72.7700, name: 'School Street' },
  { lat: 24.4875, lng: 72.7825, name: 'Business District' },
];

const DESCRIPTIONS = [
  'Multiple large potholes creating hazards for vehicles and motorcycles',
  'Road surface severely damaged with uneven patches',
  'Street light not functioning for several days',
  'Garbage accumulation blocking pedestrian path',
  'Water leakage from underground pipe causing street flooding',
  'Broken pavement tiles creating tripping hazard',
  'Traffic sign missing or damaged, causing confusion',
  'Drainage system clogged, causing water stagnation',
  'Streetlight broken and not replaced for weeks',
  'Severe road damage affecting public safety',
];

// Placeholder image URLs (data URIs - simple colored squares)
const SAMPLE_IMAGES = [
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Crect fill="%23FF6B6B" width="500" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white"%3EPothole%3C/text%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Crect fill="%23FFA500" width="500" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white"%3ERoad Damage%3C/text%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Crect fill="%234ECDC4" width="500" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white"%3EStreet Light%3C/text%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Crect fill="%238B4513" width="500" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white"%3EGarbage%3C/text%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Crect fill="%234169E1" width="500" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white"%3EWater Leak%3C/text%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Crect fill="%236A5ACD" width="500" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white"%3EDrainage%3C/text%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Crect fill="%23DC143C" width="500" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white"%3ETraffic Sign%3C/text%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Crect fill="%2398D8C8" width="500" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="white"%3EPavement%3C/text%3E%3C/svg%3E',
];

export const seedSampleReports = async (userId: string) => {
  try {
    console.log('🌱 Starting to seed 30 sample reports...');
    let successCount = 0;

    for (let i = 0; i < 30; i++) {
      const location = LOCATIONS[i % LOCATIONS.length];
      // Add slight variation to coordinates for nearby reports
      const offsetLat = location.lat + (Math.random() - 0.5) * 0.001;
      const offsetLng = location.lng + (Math.random() - 0.5) * 0.001;

      const report = {
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
        description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)],
        location: {
          lat: offsetLat,
          lng: offsetLng,
        },
        imageUrl: SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)],
        timestamp: Timestamp.fromDate(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random date in last 30 days
        userId: userId,
        upvotes: [],
      };

      await addDoc(collection(db, 'reports'), report);
      successCount++;
      console.log(`✅ Added report ${successCount}/30`);
    }

    console.log('🎉 Successfully seeded 30 sample reports!');
    return { success: true, count: successCount };
  } catch (error) {
    console.error('❌ Error seeding reports:', error);
    throw error;
  }
};
