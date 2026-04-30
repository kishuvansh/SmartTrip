export interface TravelPreferences {
  _id?: string;
  userId: string;
  preferredAirlines?: string[];
  hotelStarRating?: number;
  seatPreference?: 'window' | 'aisle' | 'middle';
  mealPreference?: 'veg' | 'non-veg' | 'vegan';
  interests?: string[];
  budgetRange?: {
    min: number;
    max: number;
    currency: string;
  };
  travelerType?: 'solo' | 'couple' | 'family';
  updatedAt?: string;
}
