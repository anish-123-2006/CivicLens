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

// Placeholder image URLs (using a service that provides sample images)
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1581578731548-c64695c952952?w=500&h=500',
  'https://images.unsplash.com/photo-1578601471091-bb4a63360ae0?w=500&h=500',
  'https://images.unsplash.com/photo-1581578731548-c64695c952952?w=500&h=500',
  'https://images.unsplash.com/photo-1581092918056-0c4c3004cd22?w=500&h=500',
  'https://images.unsplash.com/photo-1581578731548-c64695c952952?w=500&h=500',
  'https://images.unsplash.com/photo-1590674899462-13baf56d988e?w=500&h=500',
  'https://images.unsplash.com/photo-1581092918056-0c4c3004cd22?w=500&h=500',
  'https://images.unsplash.com/photo-1578601471091-bb4a63360ae0?w=500&h=500',
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
