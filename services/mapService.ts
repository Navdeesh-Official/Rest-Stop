import { NOMINATIM_API_BASE, OSRM_API_BASE, OVERPASS_API_BASE, SEARCH_RADIUS_METERS } from '../constants';
import { Coordinates, LocationSuggestion, RouteData, Toilet } from '../types';
import { decodePolyline, getMinDistanceFromRoute } from '../utils/geo';

export const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
  if (query.length < 3) return [];
  try {
    const response = await fetch(`${NOMINATIM_API_BASE}/search?format=json&q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getRoute = async (start: Coordinates, end: Coordinates): Promise<RouteData> => {
  const url = `${OSRM_API_BASE}/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=polyline`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('No route found');
  }

  const route = data.routes[0];
  const coordinates = decodePolyline(route.geometry);
  
  // Calculate bounding box for the route to help with toilet search query
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  coordinates.forEach(c => {
    minLat = Math.min(minLat, c.lat);
    maxLat = Math.max(maxLat, c.lat);
    minLng = Math.min(minLng, c.lng);
    maxLng = Math.max(maxLng, c.lng);
  });
  
  // Add some buffer to the bbox
  const buffer = 0.02; // approx 2km

  return {
    coordinates,
    distance: route.distance,
    duration: route.duration,
    bbox: [minLat - buffer, minLng - buffer, maxLat + buffer, maxLng + buffer]
  };
};

export const findToiletsAlongRoute = async (routeData: RouteData): Promise<Toilet[]> => {
  const [minLat, minLng, maxLat, maxLng] = routeData.bbox;
  
  // Overpass QL query
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="toilets"](${minLat},${minLng},${maxLat},${maxLng});
      node["amenity"="fuel"](${minLat},${minLng},${maxLat},${maxLng});
      node["amenity"="fast_food"](${minLat},${minLng},${maxLat},${maxLng});
      node["shop"="mall"](${minLat},${minLng},${maxLat},${maxLng});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch(`${OVERPASS_API_BASE}?data=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    const candidates: Toilet[] = data.elements
      .filter((el: any) => el.lat && el.lon)
      .map((el: any) => ({
        id: el.id,
        lat: el.lat,
        lng: el.lon,
        name: el.tags.name || (el.tags.amenity === 'toilets' ? 'Public Toilet' : el.tags.amenity) || 'Unnamed Facility',
        access: el.tags.access || 'unknown',
        fee: el.tags.fee,
        wheelchair: el.tags.wheelchair,
        opening_hours: el.tags.opening_hours,
        description: el.tags.description
      }));

    // Post-processing: Filter by distance from route geometry
    // This runs on the client, so we rely on the JS thread. 
    // For very long routes, we'd need Web Workers or chunking, but for a demo app it's fine.
    
    // We sample the route to reduce calculation load if it's huge
    const sampleRate = Math.max(1, Math.floor(routeData.coordinates.length / 500));
    const simplifiedRoute = routeData.coordinates.filter((_, i) => i % sampleRate === 0);

    const validToilets = candidates.map(toilet => {
       const dist = getMinDistanceFromRoute({ lat: toilet.lat, lng: toilet.lng }, simplifiedRoute);
       return { ...toilet, distanceFromRoute: dist };
    }).filter(toilet => toilet.distanceFromRoute !== undefined && toilet.distanceFromRoute <= SEARCH_RADIUS_METERS);
    
    // Deduplicate
    const uniqueToilets = Array.from(new Map(validToilets.map(item => [item.id, item])).values());
    
    return uniqueToilets.sort((a, b) => (a.distanceFromRoute || 0) - (b.distanceFromRoute || 0));

  } catch (error) {
    console.error("Failed to fetch toilets:", error);
    return [];
  }
};
