// Report Type
export interface Report {
  id: string;
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
  };
  category: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  timestamp: any;
  userId: string;
}

// Civic Issue Type (from Gemini)
export interface CivicIssue {
  type: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
}

// User Type
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
