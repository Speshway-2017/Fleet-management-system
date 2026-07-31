/**
 * Backend Reverse Geocoder & Database Location Normalizer
 * Converts stored coordinate strings into City/Branch names and persists them in MongoDB.
 */

const KNOWN_LOCATIONS = [
  { name: "Hyderabad", lat: 17.4506, lng: 78.3836, tolerance: 0.8 },
  { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, tolerance: 0.8 },
  { name: "Pune", lat: 18.5204, lng: 73.8567, tolerance: 0.8 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, tolerance: 0.8 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946, tolerance: 0.8 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707, tolerance: 0.8 },
  { name: "Delhi", lat: 28.6139, lng: 77.2090, tolerance: 0.8 },
  { name: "Tirupati", lat: 13.6288, lng: 79.4192, tolerance: 0.8 }
];

export const isCoordinates = (val) => {
  if (!val || typeof val !== 'string') return false;
  return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(val.trim());
};

export const isCoordinateString = isCoordinates;

export const reverseGeocodeCoordinates = (lat, lng) => {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return null;

  for (const loc of KNOWN_LOCATIONS) {
    if (
      Math.abs(numLat - loc.lat) <= loc.tolerance &&
      Math.abs(numLng - loc.lng) <= loc.tolerance
    ) {
      return loc.name;
    }
  }
  return null;
};

export const resolveLocationName = (locVal, fallbackBranch = "") => {
  if (!locVal && !fallbackBranch) return "Unknown Location";

  const cleanFallback = fallbackBranch && typeof fallbackBranch === 'string' && !isCoordinates(fallbackBranch)
    ? fallbackBranch.split(',')[0].trim()
    : "";

  if (!locVal) return cleanFallback || "Unknown Location";

  if (typeof locVal === 'string') {
    const trimmed = locVal.trim();
    if (!trimmed) return cleanFallback || "Unknown Location";

    if (isCoordinates(trimmed)) {
      const [latStr, lngStr] = trimmed.split(',');
      const city = reverseGeocodeCoordinates(latStr, lngStr);
      return city || cleanFallback || "Unknown Location";
    }

    const cityName = trimmed.split(',')[0].trim();
    if (cityName && !isCoordinates(cityName)) {
      return cityName;
    }
  }

  return cleanFallback || "Unknown Location";
};
