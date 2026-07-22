import api from './api';
import type { FlightOption, HotelOption, PlanEvent } from '../data/mocks';

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** Simple chat response - returns JSON with { text, action } via backend proxy */
export const generateChatResponse = async (messages: AIChatMessage[]): Promise<{ text: string; action: string }> => {
  const response = await api.post('/ai/chat', { messages });
  return response.data;
};

/** Extract travel context (origin, destination, dates, vibe) from conversation via backend proxy */
export const extractTravelContext = async (messages: AIChatMessage[]): Promise<{
  origin: string; destination: string; dates: string; vibe: string; numDays: number;
}> => {
  const response = await api.post('/ai/chat/context', { messages });
  return response.data;
};

/** Generate flight options based on user's travel context via backend proxy */
export const generateFlights = async (origin: string, destination: string, dates: string): Promise<FlightOption[]> => {
  const response = await api.post('/ai/options', {
    type: 'flights',
    origin,
    destination,
    dates
  });
  return response.data;
};

/** Generate hotel options based on destination and vibe via backend proxy */
export const generateHotels = async (destination: string, vibe: string): Promise<HotelOption[]> => {
  const response = await api.post('/ai/options', {
    type: 'hotels',
    destination,
    vibe
  });
  return response.data;
};

/** Generate a full multi-day itinerary via backend proxy */
export const generateItinerary = async (
  origin: string,
  destination: string,
  flight: FlightOption,
  hotel: HotelOption,
  numDays: number,
  vibe: string
): Promise<Record<number, PlanEvent[]>> => {
  const response = await api.post('/ai/itinerary', {
    origin,
    destination,
    flight,
    hotel,
    numDays,
    vibe
  });
  return response.data;
};
