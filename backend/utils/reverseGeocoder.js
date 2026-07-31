import fetch from 'node-fetch';

const CITY_COORDINATES = {
  Hyderabad: [17.3850, 78.4867],
  Mumbai: [19.0760, 72.8777],
  Pune: [18.5204, 73.8567],
  Bengaluru: [12.9716, 77.5946],
  Delhi: [28.7041, 77.1025],
  Chennai: [13.0827, 80.2707],
  Visakhapatnam: [17.6868, 83.2185],
  Kolhapur: [16.7050, 74.2433],
  Satara: [17.6805, 73.9918],
  Anantapur: [14.6819, 77.6006],
  Goa: [15.2993, 74.1240],
  Kolkata: [22.5726, 88.3639],
  Ahmedabad: [23.0225, 72.5714],
  Surat: [21.1702, 72.8311],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Vijayawada: [16.5062, 80.6480],
  Guntur: [16.3067, 80.4365],
  Kurnool: [15.8281, 78.0373],
  Kadapa: [14.4673, 78.8242],
  Tirupati: [13.6288, 79.4192],
  Warangal: [17.9689, 79.5941],
  Nizamabad: [18.6725, 78.0941],
  Karimnagar: [18.4386, 79.1288],
  Solapur: [17.6599, 75.9064],
  Nashik: [19.9975, 73.7898],
  Nagpur: [21.1458, 79.0882],
  Aurangabad: [19.8762, 75.3433],
  Coimbatore: [11.0168, 76.9558],
  Madurai: [9.9252, 78.1198],
  Kochi: [9.9312, 76.2673],
  Thiruvananthapuram: [8.5241, 76.9366],
  Bhopal: [23.2599, 77.4126],
  Indore: [22.7196, 75.8577],
  Guntakal: [15.1670, 77.3820],
  Manali: [32.2396, 77.1887],
  Imphal: [24.7991, 93.9364],
  Guwahati: [26.1445, 91.7362],
  Patna: [25.5941, 85.1376],
  Bhubaneswar: [20.2961, 85.8245]
};

const reverseCache = new Map();

export function isCoordinateString(str) {
  if (!str || typeof str !== 'string') return false;
  return /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(str.trim());
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Reverse geocode latitude and longitude string into human-readable city name.
 * Uses local coordinate lookup dictionary first, with Nominatim API fallback.
 * Never returns raw coordinates. Returns "Unknown Location" on failure.
 * @param {string} coordStr "lat, lon"
 * @returns {Promise<string>}
 */
export async function reverseGeocodeCoords(coordStr) {
  if (!coordStr || !isCoordinateString(coordStr)) {
    return "Unknown Location";
  }

  const clean = coordStr.trim();
  if (reverseCache.has(clean)) {
    return reverseCache.get(clean);
  }

  const parts = clean.split(',');
  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);

  if (isNaN(lat) || isNaN(lon)) {
    return "Unknown Location";
  }

  // 1. Check local lookup dictionary (nearest city within 60 km)
  let closestCity = null;
  let minDistance = 60;

  for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
    const dist = calculateDistanceKm(lat, lon, coords[0], coords[1]);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = cityName;
    }
  }

  if (closestCity) {
    reverseCache.set(clean, closestCity);
    return closestCity;
  }

  // 2. Query Nominatim Reverse Geocoding API with 2-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'FleetManagementSystem/1.0' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data?.address || {};
      const cityName = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || addr.suburb || addr.village;

      if (cityName && typeof cityName === 'string' && cityName.trim()) {
        const cleanName = cityName.trim();
        reverseCache.set(clean, cleanName);
        return cleanName;
      }
    }
  } catch (err) {
    // API fallback failed
  }

  return "Unknown Location";
}

/**
 * Resolve location field to a human-readable City/Branch name.
 * If branch is available and valid, prefers branch.
 * If coordinates, reverse geocodes to City/Branch name.
 * Never returns raw coordinates.
 * @param {string} locationStr 
 * @param {string} branchName 
 * @returns {Promise<string>}
 */
export async function resolveLocationName(locationStr, branchName) {
  if (branchName && typeof branchName === 'string' && branchName.trim() && !isCoordinateString(branchName)) {
    return branchName.trim();
  }

  if (!locationStr || typeof locationStr !== 'string' || !locationStr.trim()) {
    if (branchName && !isCoordinateString(branchName)) return branchName.trim();
    return "Unknown Location";
  }

  const cleanLoc = locationStr.trim();

  if (isCoordinateString(cleanLoc)) {
    const resolved = await reverseGeocodeCoords(cleanLoc);
    return resolved;
  }

  return cleanLoc;
}
