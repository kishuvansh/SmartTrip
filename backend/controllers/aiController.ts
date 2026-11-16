import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { AuthRequest } from '../middleware/auth';
import { geocodePlace } from '../services/geocode';
import { searchFlights as searchDuffelFlights, searchHotels as searchDuffelHotels } from '../services/duffelService';

interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const getAIConfig = () => {
  dotenv.config();
  const isGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) || process.env.AI_PROVIDER === 'gemini';

  if (isGemini) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY in environment variables");
    }
    return {
      provider: 'Gemini',
      url: process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      apiKey,
      model: process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-3.8-flash',
    };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY (or GEMINI_API_KEY) in environment variables");
  }

  return {
    provider: 'Groq',
    url: process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1/chat/completions',
    apiKey,
    model: process.env.GROQ_MODEL || process.env.AI_MODEL || 'openai/gpt-oss-120b',
  };
};

const callAI = async (messages: AIChatMessage[], isJson: boolean = false): Promise<string> => {
  const { provider, url, apiKey, model } = getAIConfig();
  console.log(`[AI Engine] Routing request via ${provider} with model: ${model}`);

  const sendRequest = async (useJson: boolean) => {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.5,
        response_format: useJson ? { type: "json_object" } : undefined,
      }),
    });
  };

  let response = await sendRequest(isJson);

  // If strict JSON schema causes HTTP 400 (Failed to generate JSON), retry once without
  // strict response_format constraint so the response can be captured and safeParseJSON can extract it.
  if (!response.ok && isJson && response.status === 400) {
    const errorData = await response.clone().json().catch(() => ({}));
    if (errorData?.error?.message?.includes("Failed to generate JSON")) {
      console.warn(`[${provider} Warning] Strict JSON mode failed; retrying without response_format constraint...`);
      response = await sendRequest(false);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail = errorData.error?.failed_generation
      ? `${errorData.error.message} (failed_generation: ${errorData.error.failed_generation})`
      : errorData.error?.message || response.statusText;
    throw new Error(`${provider} Error: ${response.status} - ${detail}`);
  }

  const data: any = await response.json();
  return data.choices[0].message.content;
};

const callGroq = callAI;

const safeParseJSON = (raw: string): any => {
  const clean = raw.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    const firstBracket = clean.indexOf('[');
    const lastBracket = clean.lastIndexOf(']');

    if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      return JSON.parse(clean.substring(firstBrace, lastBrace + 1));
    } else if (firstBracket !== -1 && lastBracket !== -1) {
      return JSON.parse(clean.substring(firstBracket, lastBracket + 1));
    }
    throw e;
  }
};

/**
 * Handle chatbot conversational responses
 */
export const chatResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;

    const systemPrompt: AIChatMessage = {
      role: 'system',
      content: `You are SmartTrip, a futuristic AI travel assistant. Be short, punchy, and helpful.
Your job is to gather: destination, origin city, travel dates, number of travelers, and trip vibe.
Ask for ONE piece of info at a time. Do not repeat questions already answered.

Once you have gathered origin, destination, dates, and vibe, set action to "show_flights".
Otherwise, set action to "ask".

You must respond ONLY with a valid JSON object matching this schema:
{
  "text": "your response to the user here",
  "action": "ask"
}
Valid values for "action" are either "ask" or "show_flights".
Do not include markdown fences, comments, or any extra text outside the JSON object.`
    };

    const raw = await callGroq([systemPrompt, ...messages], true);
    const result = safeParseJSON(raw);
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
      content: `Extract travel details from this conversation. You must respond ONLY with a valid JSON object matching this schema:
{
  "origin": "city name",
  "destination": "city name",
  "dates": "date range or description",
  "vibe": "trip vibe or style",
  "numDays": 3
}
"numDays" must be the total number of days for the trip as an integer. Calculate it from the date range if possible. If the user said something vague like "next week" or "5 days", use that number. If completely unclear, default to 3.
If any field is unclear, make a reasonable guess based on context. Return ONLY the JSON object with no additional text or markdown fences.`
    };

    const raw = await callGroq([systemPrompt, ...messages], true);
    const result = safeParseJSON(raw);
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
      const parsed = safeParseJSON(raw);
      const arr = Array.isArray(parsed)
        ? parsed
        : (parsed.flights || parsed.options || Object.values(parsed).find(Array.isArray) || []);

      if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error("Could not parse flights JSON from model response");
      }
      res.json(arr);

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
          content: `Generate exactly 4 realistic hotel options as a JSON array.
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
      const parsed = safeParseJSON(raw);
      const arr = Array.isArray(parsed)
        ? parsed
        : (parsed.hotels || parsed.options || Object.values(parsed).find(Array.isArray) || []);

      if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error("Could not parse hotels JSON from model response");
      }
      res.json(arr);
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
- Use the selected flight: ${flight?.airline || 'Flight'} (${flight?.path || ''}, ${flight?.time || ''})
- Use the selected hotel: ${hotel?.name || 'Hotel'} at ${hotel?.location || ''}
- Lat/lon MUST be real coordinates for actual places in/around ${destination}

Reply ONLY with the JSON object. No markdown. No extra text.`
      },
      {
        role: 'user',
        content: `Generate itinerary for ${numDays} days in ${destination} from ${origin}`
      }
    ];

    const raw = await callGroq(prompt, true);
    const parsed = safeParseJSON(raw);

    // Pre-geocode the destination city center as an API-based fallback
    const cityGeo = await geocodePlace(destination, "");

    // Handle possible top-level wrappers like { "itinerary": { "1": [...] } } or { "days": { ... } }
    let daysObj = parsed;
    if (parsed && typeof parsed === 'object' && !parsed["1"] && !parsed[1]) {
      const wrapperKey = Object.keys(parsed).find(
        k => parsed[k] && typeof parsed[k] === 'object' && (parsed[k]["1"] || parsed[k][1])
      );
      if (wrapperKey) {
        daysObj = parsed[wrapperKey];
      }
    }

    const result: Record<number, any[]> = {};
    if (daysObj && typeof daysObj === 'object') {
      for (const [dayStr, events] of Object.entries(daysObj)) {
        const dayNum = parseInt(dayStr, 10);
        if (isNaN(dayNum) || !Array.isArray(events)) continue;

        const processedEvents = [];
        for (const e of events) {
          if (!e || typeof e !== 'object') continue;

          // Try to geocode the real location via LocationIQ/Nominatim
          const geo = e.title ? await geocodePlace(e.title, destination) : null;

          const lat = geo ? geo.lat : (cityGeo ? cityGeo.lat : (typeof e.lat === 'number' ? e.lat : undefined));
          const lon = geo ? geo.lon : (cityGeo ? cityGeo.lon : (typeof e.lon === 'number' ? e.lon : undefined));

          processedEvents.push({
            id: e.id || `${dayNum}-${processedEvents.length + 1}`,
            type: e.type || 'activity',
            title: e.title || 'Activity',
            subtitle: e.subtitle || '',
            time: e.time || '12:00 PM',
            duration: e.duration,
            price: e.price,
            badges: Array.isArray(e.badges) ? e.badges : [],
            aiReasoning: e.aiReasoning,
            coordinates: (lat !== undefined && lon !== undefined) ? { lat, lon } : undefined
          });
        }

        result[dayNum] = processedEvents;
      }
    }

    res.json(result);
  } catch (error: any) {
    console.error("AI Itinerary Error:", error);
    res.status(500).json({ message: "Failed to generate itinerary", error: error.message });
  }
};
