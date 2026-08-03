// Local lookup dictionary for popular cities and hubs
const CITY_COORDINATES = {
  guntakal: [15.1670, 77.3820],
  hyderabad: [17.3850, 78.4867],
  mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  delhi: [28.7041, 77.1025],
  newdelhi: [28.6139, 77.2090],
  chennai: [13.0827, 80.2707],
  kolhapur: [16.7050, 74.2433],
  satara: [17.6805, 73.9918],
  anantapur: [14.6819, 77.6006],
  anantapuram: [14.6819, 77.6006],
  goa: [15.2993, 74.1240],
  visakhapatnam: [17.6868, 83.2185],
  visakapatnam: [17.6868, 83.2185],
  visakapatanam: [17.6868, 83.2185],
  visakhapatanam: [17.6868, 83.2185],
  vizag: [17.6868, 83.2185],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  vijayawada: [16.5062, 80.6480],
  guntur: [16.3067, 80.4365],
  kurnool: [15.8281, 78.0373],
  kadapa: [14.4673, 78.8242],
  tirupati: [13.6288, 79.4192],
  warangal: [17.9689, 79.5941],
  nizamabad: [18.6725, 78.0941],
  karimnagar: [18.4386, 79.1288],
  solapur: [17.6599, 75.9064],
  nashik: [19.9975, 73.7898],
  nagpur: [21.1458, 79.0882],
  aurangabad: [19.8762, 75.3433],
  coimbatore: [11.0168, 76.9558],
  madurai: [9.9252, 78.1198],
  kochi: [9.9312, 76.2673],
  trivandrum: [8.5241, 76.9366],
  bhopal: [23.2599, 77.4126],
  indore: [22.7196, 75.8577]
};

/**
 * Normalize location names to handle variations, extra spaces, casing, and common city aliases.
 */
export function normalizeCityName(loc) {
  if (!loc) return '';
  let clean = loc.toString().trim().toLowerCase();
  clean = clean.split(',')[0].trim();
  clean = clean.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ');

  const aliases = {
    'visakapatnam': 'visakhapatnam',
    'visakapatanam': 'visakhapatnam',
    'visakhapatanam': 'visakhapatnam',
    'vizag': 'visakhapatnam',
    'waltair': 'visakhapatnam',
    'bengaluru': 'bangalore',
    'bangalore': 'bengaluru',
    'gurugram': 'gurgaon',
    'gurgaon': 'gurugram',
    'cyberabad': 'hyderabad',
    'secunderabad': 'hyderabad',
    'dtl': 'dwaraka tirumala',
    'dwarakatirumala': 'dwaraka tirumala',
    'vijayawada': 'vijayawada',
    'tirupati': 'tirupati'
  };

  return aliases[clean] || clean;
}

/**
 * Check if two location names represent the same location.
 */
export function isSameLocation(loc1, loc2) {
  if (!loc1 || !loc2) return false;
  const n1 = normalizeCityName(loc1);
  const n2 = normalizeCityName(loc2);

  if (n1 === n2) return true;
  if (n1.length >= 3 && n2.length >= 3) {
    if (n1.includes(n2) || n2.includes(n1)) return true;
  }
  return false;
}

const geocodeCache = new Map();

/**
 * Calculate distance in KM between two lat/lng coordinates (Haversine formula)
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Dynamically resolve lat/lng coordinates for any location name
 * @param {string} locationName 
 * @returns {Promise<[number, number]>} [latitude, longitude]
 */
export async function geocodeCity(locationName) {
  if (!locationName || typeof locationName !== 'string') return [15.1670, 77.3820];
  const query = locationName.trim().toLowerCase();
  if (!query) return [15.1670, 77.3820];

  if (geocodeCache.has(query)) {
    return geocodeCache.get(query);
  }

  // 1. Check local lookup dictionary
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (query.includes(key) || key.includes(query)) {
      geocodeCache.set(query, coords);
      return coords;
    }
  }

  // 2. Query Nominatim OpenStreetMap API
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName.trim())}&limit=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          const result = [lat, lon];
          geocodeCache.set(query, result);
          return result;
        }
      }
    }
  } catch (err) {
    // Ignore fetch failure and proceed to fallback
  }

  // 3. Fallback based on string hash if unknown
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = query.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = 15.0 + Math.abs((hash % 100) / 10);
  const lon = 75.0 + Math.abs(((hash >> 2) % 100) / 10);
  const coords = [Number(lat.toFixed(4)), Number(lon.toFixed(4))];
  geocodeCache.set(query, coords);
  return coords;
}

const roadDistanceCache = new Map();

/**
 * Calculate actual road distance and travel time ETA between two locations.
 * Uses OSRM driving route API with in-memory caching, with fallback to Haversine * 1.3 estimation.
 * @param {string} originLoc 
 * @param {string} destLoc 
 * @returns {Promise<{ distanceKm: number, estimatedTravelTime: string, durationSeconds: number }>}
 */
export async function getRoadDistanceAndEta(originLoc, destLoc) {
  if (!originLoc || !destLoc) {
    return { distanceKm: 0, estimatedTravelTime: '0 mins', durationSeconds: 0 };
  }
  const cleanOrigin = originLoc.trim();
  const cleanDest = destLoc.trim();

  if (cleanOrigin.toLowerCase() === cleanDest.toLowerCase()) {
    return { distanceKm: 0, estimatedTravelTime: '0 mins', durationSeconds: 0 };
  }

  const cacheKey = `${cleanOrigin.toLowerCase()}:${cleanDest.toLowerCase()}`;
  if (roadDistanceCache.has(cacheKey)) {
    return roadDistanceCache.get(cacheKey);
  }

  // 1. Resolve coordinates
  const [coords1, coords2] = await Promise.all([
    geocodeCity(cleanOrigin),
    geocodeCity(cleanDest)
  ]);

  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;

  // 2. Query OSRM API with 3-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && Array.isArray(data.routes) && data.routes.length > 0) {
        const distanceMeters = data.routes[0].distance;
        const durationSecs = data.routes[0].duration;

        const distanceKm = Math.max(1, Math.round(distanceMeters / 1000));
        const hours = Math.floor(durationSecs / 3600);
        const minutes = Math.round((durationSecs % 3600) / 60);

        let travelTime = `${minutes} mins`;
        if (hours > 0) {
          travelTime = minutes === 0 ? `${hours} hrs` : `${hours} hrs ${minutes} mins`;
        }

        const result = {
          distanceKm,
          estimatedTravelTime: travelTime,
          durationSeconds: durationSecs
        };

        roadDistanceCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    // Proceed to fallback
  }

  // 3. Fallback: Haversine distance * 1.3 (road factor multiplier)
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;
  const distanceKm = Math.max(5, Math.round(straightKm * 1.3));
  const durationSecs = Math.round((distanceKm / 55) * 3600);
  const hours = Math.floor(durationSecs / 3600);
  const minutes = Math.round((durationSecs % 3600) / 60);

  let travelTime = `${minutes} mins`;
  if (hours > 0) {
    travelTime = minutes === 0 ? `${hours} hrs` : `${hours} hrs ${minutes} mins`;
  }

  const fallbackResult = {
    distanceKm,
    estimatedTravelTime: travelTime,
    durationSeconds: durationSecs
  };

  roadDistanceCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

