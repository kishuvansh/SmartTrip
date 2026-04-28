// Utility functions for LocationIQ Geocoding and MapTiler Map Tiles

export interface LocationData {
  lat: number;
  lon: number;
  display_name: string;
}

export const searchLocation = async (query: string): Promise<LocationData[]> => {
  const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
  if (!apiKey) {
    console.warn("LocationIQ API Key missing. Returning mock data.");
    return [{ lat: 19.0760, lon: 72.8777, display_name: "Mumbai, Maharashtra, India" }];
  }

  try {
    const response = await fetch(`https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(query)}&format=json`);
    if (!response.ok) throw new Error("Failed to fetch location");
    const data = await response.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      display_name: item.display_name,
    }));
  } catch (error) {
    console.error("Geocoding Error:", error);
    return [];
  }
};

export const getMapStyleUrl = () => {
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
  if (!apiKey) {
    // Fallback to a demo key or just error
    console.warn("MapTiler API Key missing.");
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL`; // MapTiler standard demo key
  }
  // Use a dark map style to match Orbit's theme
  return `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${apiKey}`;
};
