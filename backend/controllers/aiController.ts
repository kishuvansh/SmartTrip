import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { geocodePlace } from '../services/geocode';
import { searchFlights as searchDuffelFlights, searchHotels as searchDuffelHotels } from '../services/duffelService';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const callGroq = async (messages: AIChatMessage[], isJson: boolean = false): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY in environment variables");
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      response_format: isJson ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data: any = await response.json();
  return data.choices[0].message.content;
};

/**
 * Handle chatbot conversational responses
 */
export const chatResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;
    
    const systemPrompt: AIChatMessage = {
      role: 'system',
      content: `You are SmartTrip, a futuristic AI travel assistant. Be short, punchy, and cool.
Your job is to gather: destination, origin city, travel dates, number of travelers, and trip vibe.
Ask for ONE piece of info at a time. Don't repeat questions already answered.

Once you have ALL of: origin, destination, dates, and vibe — respond with action "show_flights".
Otherwise respond with action "ask".

ALWAYS reply as valid JSON: {"text": "your message", "action": "ask" or "show_flights"}
Do NOT wrap in markdown code blocks.`
    };

    const raw = await callGroq([systemPrompt, ...messages], true);
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ message: "Failed to generate chat response", error: error.message });
  }
};

/**
 * Extract travel context from chat history
 */
export const extractContext = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;

    const systemPrompt: AIChatMessage = {
      role: 'system',
      content: `Extract travel details from this conversation. Return JSON with:
{"origin": "city name", "destination": "city name", "dates": "date range or description", "vibe": "trip vibe/style", "numDays": number}
"numDays" must be the total number of days for the trip (integer). Calculate it from the date range if possible. If the user said something vague like "next week" or "5 days", use that number. If completely unclear, default to 3.
If any field is unclear, make a reasonable guess based on context. ONLY return valid JSON.`
    };

    const raw = await callGroq([systemPrompt, ...messages], true);
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch (error: any) {
    console.error("AI Extract Context Error:", error);
    res.status(500).json({ message: "Failed to extract travel context", error: error.message });
  }
};

/**
 * Generate options (flights or hotels)
 */
export const generateOptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.body;

    if (type === 'flights') {
      const { origin, destination, dates } = req.body;
      
      try {
        const liveFlights = await searchDuffelFlights(origin, destination, dates);
        if (liveFlights && liveFlights.length > 0) {
            res.json(liveFlights);
            return;
        }
      } catch (e: any) {
        console.warn("[Duffel Fallback] Flights failed. Falling back to Groq.", e.message);
      }

      const prompt: AIChatMessage[] = [
        {
          role: 'system',
          content: `Generate exactly 3 realistic flight options as a JSON array. 
Each flight object must have these exact fields:
- "id": unique string like "f1", "f2", "f3"
- "airline": realistic airline name with flight number (e.g. "IndiGo 6E-234")  
- "path": format as "ORIGIN_CODE → DEST_CODE" (e.g. "BOM → GOI")
- "time": departure and arrival times (e.g. "10:00 AM - 12:30 PM")
- "price": price in INR with ₹ symbol (e.g. "₹5,400")
- "tag": one of "Recommended", "Cheapest", "Premium Economy", "Best Value"
- "scarcityMsg": optional urgency message like "Only 3 seats left" or "Filling fast"

Make prices realistic for Indian domestic/international flights.
Reply ONLY with the JSON array, no other text. No markdown.`
        },
        {
          role: 'user',
          content: `Flights from ${origin} to ${destination} around ${dates}`
        }
      ];

      const raw = await callGroq(prompt, false);
      const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
      const arrMatch = clean.match(/\[[\s\S]*\]/);
      if (!arrMatch) {
        throw new Error("Could not parse flights JSON from model response");
      }
      res.json(JSON.parse(arrMatch[0]));

    } else if (type === 'hotels') {
      const { destination, vibe } = req.body;

      try {
        const geo = await geocodePlace(destination, "");
        if (geo) {
          const liveHotels = await searchDuffelHotels(geo.lat, geo.lon, destination);
          if (liveHotels && liveHotels.length > 0) {
              res.json(liveHotels);
              return;
          }
        }
      } catch (e: any) {
        console.warn("[Duffel Fallback] Hotels failed. Falling back to Groq.", e.message);
      }

      const prompt: AIChatMessage[] = [
        {
          role: 'system',
          content: `Generate exactly 3 realistic hotel options as a JSON array.
Each hotel object must have these exact fields:
- "id": unique string like "h1", "h2", "h3"
- "name": real or realistic hotel name for the destination
- "location": specific area/neighborhood in the destination city
- "rating": string rating like "4.8" or "5.0"
- "price": price per night in INR with ₹ symbol (e.g. "₹18,500")
- "image": one of "bg-purple-900", "bg-orbit-800", "bg-indigo-900"
- "tag": one of "Luxury Match", "Vibe Match", "Budget Friendly", "Trending", "Top Rated"
- "scarcityMsg": optional urgency like "Last room available" or "High demand dates"

Make the hotels match the vibe. Reply ONLY with the JSON array, no other text. No markdown.`
        },
        {
          role: 'user',
          content: `Hotels in ${destination} for a ${vibe} trip`
        }
      ];

      const raw = await callGroq(prompt, false);
      const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
      const arrMatch = clean.match(/\[[\s\S]*\]/);
      if (!arrMatch) {
        throw new Error("Could not parse hotels JSON from model response");
      }
      res.json(JSON.parse(arrMatch[0]));
    } else {
      res.status(400).json({ message: "Invalid options type requested" });
    }
  } catch (error: any) {
    console.error("AI Options Error:", error);
    res.status(500).json({ message: "Failed to generate options", error: error.message });
  }
};

/**
 * Generate full day-by-day itinerary
 */
export const generateItinerary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { origin, destination, flight, hotel, numDays, vibe } = req.body;

    const prompt: AIChatMessage[] = [
      {
        role: 'system',
        content: `Generate a ${numDays}-day travel itinerary as a JSON object.
The keys should be day numbers (1, 2, ... ${numDays}). Each value is an array of events for that day.

Each event object must have:
- "id": unique string like "1-1", "1-2", "2-1" etc (day-eventnum)
- "type": one of "flight", "transfer", "hotel", "activity"
- "title": name of activity/place/flight
- "subtitle": brief description or location
- "time": time of day like "10:00 AM"
- "duration": optional, like "2h 15m"
- "price": optional price string
- "lat": latitude number for the location (MUST be accurate for ${destination})
- "lon": longitude number for the location (MUST be accurate for ${destination})
- "badges": optional array of {"text": "label", "color": "green|purple|blue|orange|yellow|red"}

Rules:
- Day 1 must start with the flight from ${origin} to ${destination}, then transfer, then hotel check-in, then activities
- Last day must end with return flight from ${destination} to ${origin}
- Include 3-5 events per day
- Activities should match a "${vibe}" trip vibe
- Use the selected flight: ${flight.airline} (${flight.path}, ${flight.time})
- Use the selected hotel: ${hotel.name} at ${hotel.location}
- Lat/lon MUST be real coordinates for actual places in/around ${destination}

Reply ONLY with the JSON object. No markdown. No extra text.`
      },
      {
        role: 'user',
        content: `Generate itinerary for ${numDays} days in ${destination} from ${origin}`
      }
    ];

    const raw = await callGroq(prompt, true);
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(clean);
    
    // Pre-geocode the destination city center as an API-based fallback
    const cityGeo = await geocodePlace(destination, "");
    
    // Normalize: ensure lat/lon are converted to the coordinates format used by the map
    const result: Record<number, any[]> = {};
    for (const [dayStr, events] of Object.entries(parsed)) {
      const dayNum = parseInt(dayStr);
      const processedEvents = [];
      
      for (const e of (events as any[])) {
        // Try to geocode the real location via LocationIQ/Nominatim
        const geo = await geocodePlace(e.title, destination);
        
        // Use geocoded coordinate if found; otherwise, fall back to city center (API geocoded) rather than Groq random lat/lon
        const lat = geo ? geo.lat : (cityGeo ? cityGeo.lat : undefined);
        const lon = geo ? geo.lon : (cityGeo ? cityGeo.lon : undefined);
        
        processedEvents.push({
          id: e.id,
          type: e.type,
          title: e.title,
          subtitle: e.subtitle,
          time: e.time,
          duration: e.duration,
          price: e.price,
          badges: e.badges,
          aiReasoning: e.aiReasoning,
          coordinates: (lat && lon) ? { lat, lon } : undefined
        });
      }
      
      result[dayNum] = processedEvents;
    }

    res.json(result);
  } catch (error: any) {
    console.error("AI Itinerary Error:", error);
    res.status(500).json({ message: "Failed to generate itinerary", error: error.message });
  }
};
