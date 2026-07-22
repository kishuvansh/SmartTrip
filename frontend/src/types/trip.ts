import type { FlightOption, HotelOption, PlanEvent } from '../data/mocks';

export interface Trip {
  _id?: string;
  userId: string;
  destination?: string;
  origin?: string;
  dates?: string;
  itineraryJson?: Record<number, PlanEvent[]>;
  selectedFlight?: FlightOption;
  selectedHotel?: HotelOption;
  isFavorite: boolean;
  isSaved: boolean;
  status: 'active' | 'generated' | 'booked' | 'completed';
  chatHistory?: Array<{ role: string; content: string; timestamp?: string }>;
  vibe?: string;
  flightOptions?: FlightOption[];
  hotelOptions?: HotelOption[];
  currentDay?: number;
  createdAt?: string;
}
