export interface Location {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  type: string;
  location: Location;
  timestamp: string;
  description?: string;
  reporterId: string;
}

export interface BuddySession {
  id: string;
  userId: string;
  currentLocation: Location;
  lastUpdated: string;
  status: 'active' | 'completed' | 'alert';
}

export const INCIDENT_TYPES = [
  { id: 'theft', label: 'Theft/Robbery', weight: 15 },
  { id: 'harassment', label: 'Harassment', weight: 12 },
  { id: 'assault', label: 'Physical Assault', weight: 20 },
  { id: 'lighting', label: 'Poor Lighting', weight: 10 },
  { id: 'suspicious', label: 'Suspicious Activity', weight: 8 },
  { id: 'other', label: 'Other', weight: 5 },
];
