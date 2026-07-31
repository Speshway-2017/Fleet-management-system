/**
 * Universal Location Formatter & Reverse Geocoding Utility
 * Ensures raw GPS coordinates (latitude, longitude) are NEVER rendered in the UI.
 * Converts coordinates into human-readable City / Branch names.
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
  if (!val) return false;
  if (typeof val === 'object' && (val.lat !== undefined || val.latitude !== undefined)) return true;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(trimmed);
  }
  return false;
};

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

export const formatDisplayLocation = (locVal, fallbackVal = "") => {
  if (!locVal && !fallbackVal) return "Unknown Location";

  const cleanFallback = fallbackVal && typeof fallbackVal === 'string' && !isCoordinates(fallbackVal)
    ? fallbackVal.split(',')[0].trim()
    : "";

  if (!locVal) return cleanFallback || "Unknown Location";

  // Case 1: Object with lat/lng
  if (typeof locVal === 'object') {
    if (locVal.city) return locVal.city.trim();
    if (locVal.name) return locVal.name.trim();
    const lat = locVal.lat ?? locVal.latitude;
    const lng = locVal.lng ?? locVal.longitude;
    if (lat !== undefined && lng !== undefined) {
      const city = reverseGeocodeCoordinates(lat, lng);
      return city || cleanFallback || "Unknown Location";
    }
  }

  // Case 2: String
  if (typeof locVal === 'string') {
    const trimmed = locVal.trim();
    if (!trimmed) return cleanFallback || "Unknown Location";

    // If it's a coordinate string "17.4506,78.3836"
    if (isCoordinates(trimmed)) {
      const [latStr, lngStr] = trimmed.split(',');
      const city = reverseGeocodeCoordinates(latStr, lngStr);
      return city || cleanFallback || "Unknown Location";
    }

    // It's a text location like "Hyderabad, TS" or "Pune"
    const cityName = trimmed.split(',')[0].trim();
    if (cityName && !isCoordinates(cityName)) {
      return cityName;
    }
  }

  return cleanFallback || "Unknown Location";
};
