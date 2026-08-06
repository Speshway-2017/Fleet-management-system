/**
 * Production Geocoding & Road Distance Service
 * Fleet Management System
 */

// Master Local Lookup Dictionary for AP, Telangana, and Major Indian Hubs
const LOCAL_COORDINATES = {
  // Andhra Pradesh Towns & Cities
  "eluru": [16.7107, 81.1042],
  "ellore": [16.7107, 81.1042],
  "dwaraka tirumala": [17.0036, 81.2453],
  "dwarka tirumala": [17.0036, 81.2453],
  "dwarakatirumala": [17.0036, 81.2453],
  "dwaraka tirupathi": [17.0036, 81.2453],
  "dwarakatirupathi": [17.0036, 81.2453],
  "vijayawada": [16.5062, 80.6480],
  "bezawada": [16.5062, 80.6480],
  "guntur": [16.3067, 80.4365],
  "rajahmundry": [17.0005, 81.8040],
  "rajamahendravaram": [17.0005, 81.8040],
  "rjqy": [17.0005, 81.8040],
  "bhimavaram": [16.5449, 81.5212],
  "bvrm": [16.5449, 81.5212],
  "tadepalligudem": [16.8333, 81.5000],
  "tpg": [16.8333, 81.5000],
  "tanuku": [16.7562, 81.6775],
  "gudivada": [16.4357, 80.9926],
  "machilipatnam": [16.1875, 81.1389],
  "masula": [16.1875, 81.1389],
  "kakinada": [16.9891, 82.2475],
  "visakhapatnam": [17.6868, 83.2185],
  "vizag": [17.6868, 83.2185],
  "tirupati": [13.6288, 79.4192],
  "kurnool": [15.8281, 78.0373],
  "kadapa": [14.4673, 78.8242],
  "cuddapah": [14.4673, 78.8242],
  "anantapur": [14.6819, 77.6006],
  "anantapuram": [14.6819, 77.6006],
  "ongole": [15.5057, 80.0499],
  "nellore": [14.4426, 79.9865],
  "srikakulam": [18.3000, 83.9000],
  "vizianagaram": [18.1167, 83.4167],
  "narsapuram": [16.4333, 81.7000],
  "palakollu": [16.5167, 81.7333],
  "jaggayyapeta": [16.8920, 80.0976],
  "nandigama": [16.7700, 80.2900],
  "nuzvid": [16.7886, 80.8464],
  "guntakal": [15.1670, 77.3820],

  // Telangana Cities & Towns
  "hyderabad": [17.3850, 78.4867],
  "hyd": [17.3850, 78.4867],
  "secunderabad": [17.4399, 78.4983],
  "khammam": [17.2473, 80.1514],
  "warangal": [17.9689, 79.5941],
  "nizamabad": [18.6725, 78.0941],
  "karimnagar": [18.4386, 79.1288],
  "ramagundam": [18.7905, 79.4754],
  "mahabubnagar": [16.7488, 77.9856],
  "nalgonda": [17.0540, 79.2671],
  "suryapet": [17.1439, 79.6237],

  // Major Indian Metropolitan Hubs
  "mumbai": [19.0760, 72.8777],
  "pune": [18.5204, 73.8567],
  "bengaluru": [12.9716, 77.5946],
  "bangalore": [12.9716, 77.5946],
  "chennai": [13.0827, 80.2707],
  "delhi": [28.6139, 77.2090],
  "new delhi": [28.6139, 77.2090],
  "kolkata": [22.5726, 88.3639],
  "ahmedabad": [23.0225, 72.5714],
  "surat": [21.1702, 72.8311],
  "jaipur": [26.9124, 75.7873],
  "lucknow": [26.8467, 80.9462],
  "solapur": [17.6599, 75.9064],
  "nashik": [19.9975, 73.7898],
  "nagpur": [21.1458, 79.0882],
  "aurangabad": [19.8762, 75.3433],
  "coimbatore": [11.0168, 76.9558],
  "madurai": [9.9252, 78.1198],
  "kochi": [9.9312, 76.2673],
  "trivandrum": [8.5241, 76.9366],
  "bhopal": [23.2599, 77.4126],
  "indore": [22.7196, 75.8577],
  "goa": [15.2993, 74.1240],
  "satara": [17.6805, 73.9918],
  "kolhapur": [16.7050, 74.2433]
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
const roadDistanceCache = new Map();

/**
 * Normalize location string for searching.
 * Lowercase, strip commas, hyphens, extra whitespace, and district/state suffixes.
 */
export function normalizeLocationString(str) {
  if (!str || typeof str !== 'string') return '';
  let norm = str.toLowerCase().trim();
  norm = norm.replace(/\s*(district|dist|dt|state|ap|ts|india)\b/gi, '');
  norm = norm.replace(/[^a-z0-9\s]/g, ' ');
  return norm.replace(/\s+/g, ' ').trim();
}

/**
 * Dynamically resolve lat/lng coordinates for any location name.
 * NEVER returns random or fake hash coordinates.
 * Returns [latitude, longitude] or null if unresolvable.
 * @param {string} locationName 
 * @returns {Promise<[number, number]|null>} [latitude, longitude]
 */
export async function geocodeCity(locationName) {
  if (!locationName || typeof locationName !== 'string') return null;
  const rawClean = locationName.trim();
  if (!rawClean) return null;

  // Check if raw input is already coordinates like "17.3850,78.4867"
  if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(rawClean)) {
    const parts = rawClean.split(',').map(p => parseFloat(p.trim()));
    if (!isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] >= -90 && parts[0] <= 90 && parts[1] >= -180 && parts[1] <= 180) {
      return [parts[0], parts[1]];
    }
  }

  const normalized = normalizeLocationString(rawClean);
  if (!normalized) return null;

  if (geocodeCache.has(normalized)) {
    return geocodeCache.get(normalized);
  }

  // 1. Check local lookup dictionary (Exact or Partial match)
  for (const [key, coords] of Object.entries(LOCAL_COORDINATES)) {
    const keyNorm = normalizeLocationString(key);
    if (normalized === keyNorm || normalized.includes(keyNorm) || keyNorm.includes(normalized)) {
      geocodeCache.set(normalized, coords);
      return coords;
    }
  }

  // 2. Query OpenStreetMap Nominatim API
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(rawClean)}&limit=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'FleetManagementSystem/1.0'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          const coords = [lat, lon];
          geocodeCache.set(normalized, coords);
          return coords;
        }
      }
    }
  } catch (err) {
    // Nominatim failed or timed out — proceed cleanly
  }

  // 3. Return null if unresolvable (NO FAKE / RANDOM COORDINATES)
  return null;
}

/**
 * Calculate straight-line distance in KM between two lat/lng coordinates (Haversine formula)
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round(R * c));
}

/**
 * Calculate actual road distance and travel time ETA between two locations.
 * Uses OSRM driving route API with in-memory caching and Haversine fallback.
 * NEVER uses fake or random coordinates.
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

  const normOrigin = normalizeLocationString(cleanOrigin);
  const normDest = normalizeLocationString(cleanDest);

  if (normOrigin && normDest && normOrigin === normDest) {
    return { distanceKm: 0, estimatedTravelTime: '0 mins', durationSeconds: 0 };
  }

  const cacheKey = `${normOrigin}:${normDest}`;
  if (roadDistanceCache.has(cacheKey)) {
    return roadDistanceCache.get(cacheKey);
  }

  // 1. Resolve coordinates
  const [coords1, coords2] = await Promise.all([
    geocodeCity(cleanOrigin),
    geocodeCity(cleanDest)
  ]);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n===================================`);
    console.log(`[GEOCODE] Origin: "${cleanOrigin}" -> Coords:`, coords1 ? `${coords1[0]}, ${coords1[1]}` : 'FAILED (null)');
    console.log(`[GEOCODE] Destination: "${cleanDest}" -> Coords:`, coords2 ? `${coords2[0]}, ${coords2[1]}` : 'FAILED (null)');
  }

  // Check if either origin or destination could not be resolved
  if (!coords1 || !coords2) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[GEOCODE WARNING] Could not resolve coordinates for "${cleanOrigin}" or "${cleanDest}".`);
      console.log(`===================================\n`);
    }
    return { distanceKm: 0, estimatedTravelTime: 'N/A', durationSeconds: 0 };
  }

  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;

  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return { distanceKm: 0, estimatedTravelTime: 'N/A', durationSeconds: 0 };
  }

  // 2. Query OSRM API (Longitude,Latitude order!)
  // Format: lon1,lat1;lon2,lat2
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OSRM REQUEST] URL: ${osrmUrl}`);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

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

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[OSRM RESPONSE] Code: ${data.code}`);
          console.log(`[OSRM RESULT] Distance: ${distanceKm} km | Travel Time: ${travelTime}`);
          console.log(`===================================\n`);
        }

        roadDistanceCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[OSRM FAILED] Error: ${err.message}. Falling back to Haversine formula.`);
    }
  }

  // 3. Fallback: Haversine distance * 1.3 (estimated road factor) using REAL resolved coordinates
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;
  const distanceKm = Math.max(1, Math.round(straightKm * 1.3));
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

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[HAVERSINE FALLBACK RESULT] Distance: ${distanceKm} km | Travel Time: ${travelTime}`);
    console.log(`===================================\n`);
  }

  roadDistanceCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}
