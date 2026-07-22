import { FlightOption, HotelOption } from '../types/options';

const DUFFEL_FLIGHT_URL = 'https://api.duffel.com/air/offer_requests?return_offers=true';
const DUFFEL_STAYS_URL  = 'https://api.stays.duffel.com/accommodation/search';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Hard-coded city → IATA map
const CITY_IATA: Record<string, string> = {
  'Delhi':         'DEL',
  'New Delhi':     'DEL',
  'Mumbai':        'BOM',
  'Bombay':        'BOM',
  'Bangalore':     'BLR',
  'Bengaluru':     'BLR',
  'Goa':           'GOI',
  'Chennai':       'MAA',
  'Hyderabad':     'HYD',
  'Kolkata':       'CCU',
  'Bali':          'DPS',
  'Denpasar':      'DPS',
  'Singapore':     'SIN',
  'Bangkok':       'BKK',
  'Dubai':         'DXB',
  'London':        'LHR',
  'New York':      'JFK',
  'Paris':         'CDG',
  'Tokyo':         'NRT',
  'Sydney':        'SYD',
  'Toronto':       'YYZ',
};

// Caches
const flightCache = new Map<string, { ts: number; data: FlightOption[] }>();
const hotelCache  = new Map<string, { ts: number; data: HotelOption[] }>();

const getDuffelHeaders = () => {
  const token = process.env.DUFFEL_API_KEY;
  if (!token) throw new Error('DUFFEL_API_KEY is not set in environment');
  return {
    'Authorization': `Bearer ${token}`,
    'Duffel-Version': 'v2',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
};

const fmtTime = (iso: string | undefined): string => {
  if (!iso) return '??:??';
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
};

const futureDate = (daysFromNow: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Search for flights via Duffel sandbox.
 */
export const searchFlights = async (
  originCity: string,
  destinationCity: string,
  _dates: string
): Promise<FlightOption[] | null> => {
  const originIata = CITY_IATA[originCity];
  const destIata   = CITY_IATA[destinationCity];

  if (!originIata || !destIata) {
    console.warn(`[Duffel] No IATA mapping for "${originCity}" or "${destinationCity}" — falling back to Groq`);
    return null;
  }

  const departureDate = futureDate(7);
  const cacheKey = `${originIata}-${destIata}-${departureDate}`;

  const cached = flightCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    console.log(`[Duffel Cache Hit] flight: ${cacheKey}`);
    return cached.data;
  }
  console.log(`[Duffel Cache Miss] flight: ${cacheKey}`);

  try {
    const res = await fetch(DUFFEL_FLIGHT_URL, {
      method: 'POST',
      headers: getDuffelHeaders(),
      body: JSON.stringify({
        data: {
          slices: [{ origin: originIata, destination: destIata, departure_date: departureDate }],
          passengers: [{ type: 'adult' }],
        },
      }),
    });

    if (res.status === 429) {
      console.warn('[Duffel] Rate limited (429) on flights — falling back to Groq');
      return null;
    }
    if (!res.ok) {
      const err = await res.text();
      console.warn(`[Duffel] Flight request failed (${res.status}): ${err}`);
      return null;
    }

    const json: any = await res.json();
    const offers: any[] = json.data?.offers ?? [];
    if (offers.length === 0) {
      console.warn('[Duffel] Flight search returned 0 offers — falling back to Groq');
      return null;
    }

    // Sort flights by total_amount ascending
    offers.sort((a, b) => parseFloat(a.total_amount ?? '0') - parseFloat(b.total_amount ?? '0'));

    const TAGS = ['Cheapest', 'Recommended', 'Best Value'];
    const mapped: FlightOption[] = offers.slice(0, 3).map((offer: any, idx: number) => {
      const seg       = offer.slices?.[0]?.segments?.[0];
      const depTime   = fmtTime(seg?.departing_at);
      const arrTime   = fmtTime(seg?.arriving_at);
      const carrier   = seg?.operating_carrier?.name ?? offer.owner?.name ?? 'Unknown';
      const flightNum = seg?.marketing_carrier_flight_number ?? '';

      const priceRaw = parseFloat(offer.total_amount ?? '0');
      const currency = offer.total_currency ?? '';
      
      const priceDisplay = currency === 'INR'
        ? `₹${priceRaw.toLocaleString('en-IN')}`
        : `${currency} ${priceRaw.toFixed(2)}`;

      return {
        id: offer.id,
        airline: flightNum ? `${carrier} ${flightNum}` : carrier,
        path: `${originIata} → ${destIata}`,
        time: `${depTime} - ${arrTime}`,
        price: priceDisplay,
        tag: TAGS[idx] ?? 'Best Value',
        scarcityMsg: undefined,
      };
    });

    flightCache.set(cacheKey, { ts: Date.now(), data: mapped });
    return mapped;

  } catch (e: any) {
    console.error('[Duffel] Flight fetch error:', e.message);
    return null;
  }
};

/**
 * Search for hotels via Duffel Stays sandbox.
 */
export const searchHotels = async (
  lat: number,
  lon: number,
  destination: string
): Promise<HotelOption[] | null> => {
  const checkIn  = futureDate(7);
  const checkOut = futureDate(12);
  const cacheKey = `${lat.toFixed(4)}-${lon.toFixed(4)}-${checkIn}-${checkOut}`;

  const cached = hotelCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    console.log(`[Duffel Cache Hit] hotel: ${cacheKey}`);
    return cached.data;
  }
  console.log(`[Duffel Cache Miss] hotel: ${cacheKey}`);

  try {
    const res = await fetch(DUFFEL_STAYS_URL, {
      method: 'POST',
      headers: getDuffelHeaders(),
      body: JSON.stringify({
        data: {
          location: { latitude: lat, longitude: lon },
          check_in: checkIn,
          check_out: checkOut,
          radius: 5, // 5km
          guests: [{ type: 'adult' }],
        },
      }),
    });

    if (res.status === 429) {
      console.warn('[Duffel] Rate limited (429) on hotels — falling back to Groq');
      return null;
    }
    if (!res.ok) {
      const err = await res.text();
      console.warn(`[Duffel] Hotel request failed (${res.status}): ${err}`);
      return null;
    }

    const json: any = await res.json();
    const results: any[] = json.data?.results ?? [];

    if (results.length === 0) {
      console.warn('[Duffel] Hotel search returned 0 results — falling back to Groq');
      return null;
    }

    // Filter results that have cheapest_rate_total_amount
    const validResults = results.filter(r => r.cheapest_rate_total_amount != null);
    validResults.sort((a, b) => parseFloat(a.cheapest_rate_total_amount) - parseFloat(b.cheapest_rate_total_amount));

    const TAGS   = ['Budget Friendly', 'Vibe Match', 'Trending'];
    const IMAGES = ['bg-purple-900', 'bg-orbit-800', 'bg-indigo-900'];

    const mapped: HotelOption[] = validResults.slice(0, 3).map((result: any, idx: number) => {
      const acc      = result.accommodation ?? {};
      const priceRaw = parseFloat(result.cheapest_rate_total_amount ?? '0');
      const currency = result.cheapest_rate_currency ?? '';

      const priceDisplay = currency === 'INR'
        ? `₹${priceRaw.toLocaleString('en-IN')}`
        : `${currency} ${priceRaw.toFixed(2)}`;

      const rating = acc.rating != null ? String(acc.rating) : '4.5';

      return {
        id: acc.id ?? `duffel_h${idx}`,
        name: acc.name ?? 'Hotel',
        location: acc.city_name ?? destination,
        rating,
        price: priceDisplay,
        image: IMAGES[idx] ?? 'bg-indigo-900',
        tag: TAGS[idx] ?? 'Top Rated',
        scarcityMsg: undefined,
      };
    });

    hotelCache.set(cacheKey, { ts: Date.now(), data: mapped });
    return mapped;

  } catch (e: any) {
    console.error('[Duffel] Hotel fetch error:', e.message);
    return null;
  }
};
