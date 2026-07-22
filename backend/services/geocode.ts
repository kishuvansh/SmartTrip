const geocodeCache = new Map<string, { lat: number; lon: number }>();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const geocodePlace = async (place: string, city: string): Promise<{ lat: number; lon: number } | null> => {
    const query = place ? `${place}, ${city}`.trim() : city;
    
    if (geocodeCache.has(query)) {
        return geocodeCache.get(query) || null;
    }

    const locationIqKey = process.env.LOCATIONIQ_API_KEY;

    if (locationIqKey) {
        try {
            // LocationIQ is Nominatim-compatible, so structure is identical
            const url = `https://us1.locationiq.com/v1/search?key=${locationIqKey}&q=${encodeURIComponent(query)}&format=json&limit=1`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const result = {
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon)
                    };
                    geocodeCache.set(query, result);
                    return result;
                }
            }
        } catch (error) {
            console.warn(`LocationIQ lookup failed for ${query}, falling back to Nominatim:`, error);
        }
    }

    try {
        // Enforce a small delay to respect Nominatim's 1 req/sec policy
        await sleep(1000); 
        
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: {
                // Nominatim requires a valid User-Agent
                'User-Agent': 'SmartTripOrbit/1.0 (https://github.com/vansh/Orbit)'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                const result = {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
                geocodeCache.set(query, result);
                return result;
            }
        }
    } catch (error) {
        console.error(`Nominatim fallback geocoding failed for ${query}:`, error);
    }
    
    return null;
};
