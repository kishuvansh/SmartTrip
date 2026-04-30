export interface UserProfile {
  _id?: string;
  firebaseUid: string;
  name: string;
  email: string;
  authProvider: 'email' | 'google';
  photoUrl?: string;
  homeCity?: string;
  preferredCurrency?: string;
  travelStyle?: 'luxury' | 'budget' | 'backpacking' | 'adventure' | 'family';
  favoriteDestinations?: string[];
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}
