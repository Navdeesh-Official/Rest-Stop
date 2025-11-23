import { Coordinates } from '../types';

export const decodePolyline = (str: string, precision?: number): Coordinates[] => {
  let index = 0,
      lat = 0,
      lng = 0,
      coordinates = [],
      shift = 0,
      result = 0,
      byte = null,
      latitude_change,
      longitude_change,
      factor = Math.pow(10, precision || 5);

  while (index < str.length) {
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

    shift = result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push({ lat: lat / factor, lng: lng / factor });
  }

  return coordinates;
};

// Calculate distance between two points in meters (Haversine formula)
export const getDistance = (p1: Coordinates, p2: Coordinates): number => {
  const R = 6371e3; // metres
  const φ1 = p1.lat * Math.PI/180; // φ, λ in radians
  const φ2 = p2.lat * Math.PI/180;
  const Δφ = (p2.lat-p1.lat) * Math.PI/180;
  const Δλ = (p2.lng-p1.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Calculate minimum distance from a point to a polyline segment
const pToSegmentDistance = (p: Coordinates, v: Coordinates, w: Coordinates): number => {
  const l2 = Math.pow(v.lat - w.lat, 2) + Math.pow(v.lng - w.lng, 2);
  if (l2 === 0) return getDistance(p, v);
  let t = ((p.lat - v.lat) * (w.lat - v.lat) + (p.lng - v.lng) * (w.lng - v.lng)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projection = {
    lat: v.lat + t * (w.lat - v.lat),
    lng: v.lng + t * (w.lng - v.lng)
  };
  return getDistance(p, projection);
}

// Calculate minimum distance from a point to the entire route polyline
// Optimization: We can sample the route if it's too long, but for reasonable routes this is fast enough in JS
export const getMinDistanceFromRoute = (point: Coordinates, route: Coordinates[]): number => {
  let minDistance = Infinity;
  // Step is an optimization to avoid checking every single segment for very dense polylines
  const step = 1; 
  for (let i = 0; i < route.length - 1; i += step) {
    const d = pToSegmentDistance(point, route[i], route[i+1]);
    if (d < minDistance) minDistance = d;
  }
  return minDistance;
};
