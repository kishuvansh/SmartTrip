import type { FlightOption, HotelOption, PlanEvent } from '../data/mocks';

export interface Trip {
  _id?: string;
  userId: string;
  destination: string;
  origin: string;
  dates: string;
  itineraryJson: Record<number, PlanEvent[]>;
  selectedFlight?: FlightOption;
  selectedHotel?: HotelOption;
  isFavorite: boolean;
  isSaved: boolean;
  status: 'generated' | 'booked' | 'completed';
  createdAt?: string;
}
