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

// New Delhi locations (spread across the city)
const LOCATIONS = [
  { lat: 28.6139, lng: 77.2090, name: 'Connaught Place' },
  { lat: 28.6562, lng: 77.2410, name: 'Kashmere Gate' },
  { lat: 28.6692, lng: 77.4538, name: 'Noida Sector 18' },
  { lat: 28.5355, lng: 77.3910, name: 'Nehru Place' },
  { lat: 28.5494, lng: 77.2501, name: 'Saket' },
  { lat: 28.7041, lng: 77.1025, name: 'Rohini' },
  { lat: 28.4595, lng: 77.0266, name: 'Gurgaon' },
  { lat: 28.6304, lng: 77.2177, name: 'India Gate' },
  { lat: 28.5244, lng: 77.1855, name: 'Hauz Khas' },
  { lat: 28.5355, lng: 77.2635, name: 'Lajpat Nagar' },
  { lat: 28.6692, lng: 77.2315, name: 'Chandni Chowk' },
  { lat: 28.5706, lng: 77.3272, name: 'Mayur Vihar' },
  { lat: 28.6139, lng: 77.2295, name: 'Barakhamba Road' },
  { lat: 28.5921, lng: 77.0460, name: 'Dwarka' },
  { lat: 28.5672, lng: 77.2100, name: 'Green Park' },
  { lat: 28.5383, lng: 77.1250, name: 'Vasant Kunj' },
  { lat: 28.6280, lng: 77.3648, name: 'Preet Vihar' },
  { lat: 28.6448, lng: 77.2167, name: 'Rajiv Chowk' },
  { lat: 28.5494, lng: 77.1960, name: 'Malviya Nagar' },
  { lat: 28.6692, lng: 77.4371, name: 'Ghaziabad' },
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
    console.log('🌱 Starting to seed 60 sample reports...');
    let successCount = 0;

    for (let i = 0; i < 60; i++) {
      const location = LOCATIONS[i % LOCATIONS.length];
      // Add slight variation to coordinates for nearby reports
      const offsetLat = location.lat + (Math.random() - 0.5) * 0.01;
      const offsetLng = location.lng + (Math.random() - 0.5) * 0.01;

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
      console.log(`✅ Added report ${successCount}/60`);
    }

    console.log('🎉 Successfully seeded 60 sample reports!');
    return { success: true, count: successCount };
  } catch (error) {
    console.error('❌ Error seeding reports:', error);
    throw error;
  }
};
