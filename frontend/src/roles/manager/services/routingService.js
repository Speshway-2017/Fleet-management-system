/**
 * Dynamic Routing & Geocoding Service for Manager Dashboard (Trip Management Module)
 * 
 * Features:
 * 1. Geocoding location names to [latitude, longitude] using Nominatim / Photon APIs
 *    with a local coordinate fallback lookup table for offline/fast resolution.
 * 2. Calculating actual road DRIVING routes (distance, duration, polyline coordinates)
 *    via OSRM (Open Source Routing Machine) API.
 * 3. In-memory caching for API requests to optimize performance and prevent duplicate calls.
 * 4. Error handling with descriptive user messages when route calculation fails.
 */

// Fallback coordinate lookup dictionary for known cities (lat, lon)
const LOCAL_CITY_COORDINATES = {
  mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  hyderabad: [17.3850, 78.4867],
  delhi: [28.7041, 77.1025],
  newdelhi: [28.6139, 77.2090],
  chennai: [13.0827, 80.2707],
  kolhapur: [16.7050, 74.2433],
  satara: [17.6805, 73.9918],
  anantapur: [14.6819, 77.6006],
  anantapuram: [14.6819, 77.6006],
  goa: [15.2993, 74.1240],
  visakhapatnam: [17.6868, 83.2185],
  vizag: [17.6868, 83.2185],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  manali: [32.2396, 77.1887],
  imphal: [24.7991, 93.9364],
  guwahati: [26.1445, 91.7362],
  patna: [25.5941, 85.1376],
  bhubaneswar: [20.2961, 85.8245],
  bhopal: [23.2599, 77.4126],
  indore: [22.7196, 75.8577],
  nagpur: [21.1458, 79.0882],
  coimbatore: [11.0168, 76.9558],
  kochi: [9.9312, 76.2673],
  thiruvananthapuram: [8.5241, 76.9366],
  trivandrum: [8.5241, 76.9366],
  chandigarh: [30.7333, 76.7794],
  amritsar: [31.6340, 74.8723],
  srinagar: [34.0837, 74.7973],
  shimla: [31.1048, 77.1734],
  dehradun: [30.3165, 78.0322],
  ranchi: [23.3441, 85.3096],
  raipur: [21.2514, 81.6296],
  vijayawada: [16.5062, 80.6480]
};

// In-memory cache maps
const geocodeCache = new Map();
const routeCache = new Map();

/**
 * Geocode a location string into [lat, lon]
 * @param {string} locationName 
 * @returns {Promise<[number, number]|null>}
 */
export async function geocodeLocation(locationName) {
  if (!locationName || typeof locationName !== 'string') return null;
  
  const query = locationName.trim().toLowerCase();
  if (!query) return null;

  if (geocodeCache.has(query)) {
    return geocodeCache.get(query);
  }

  // 1. Check local lookup dictionary first for exact or fuzzy match
  for (const [key, coords] of Object.entries(LOCAL_CITY_COORDINATES)) {
    if (query === key || query.includes(key)) {
      geocodeCache.set(query, coords);
      return coords;
    }
  }

  // 2. Fetch from OpenStreetMap Nominatim API
  try {
    const encoded = encodeURIComponent(locationName.trim());
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`, {
      headers: {
        'Accept-Language': 'en'
      }
    });

    if (response.ok) {
      const data = await response.json();
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
    console.warn(`[RoutingService] Nominatim geocoding failed for "${locationName}":`, err.message);
  }

  // 3. Fallback to Photon API if Nominatim fails or throttles
  try {
    const encoded = encodeURIComponent(locationName.trim());
    const response = await fetch(`https://photon.komoot.io/api/?q=${encoded}&limit=1`);
    if (response.ok) {
      const data = await response.json();
      if (data?.features?.[0]?.geometry?.coordinates) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        if (!isNaN(lat) && !isNaN(lon)) {
          const result = [lat, lon];
          geocodeCache.set(query, result);
          return result;
        }
      }
    }
  } catch (err) {
    console.warn(`[RoutingService] Photon geocoding failed for "${locationName}":`, err.message);
  }

  return null;
}

/**
 * Format duration in seconds into human readable text
 * @param {number} totalSeconds 
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds)) return "N/A";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} mins`;
  }
  if (minutes === 0) {
    return `${hours} hrs`;
  }
  return `${hours} hrs ${minutes} mins`;
}

/**
 * Calculate driving ETA Date based on departure date and duration in seconds
 * @param {string|Date} departureTime 
 * @param {number} durationSeconds 
 * @returns {string} ISO datetime string suitable for datetime-local input (YYYY-MM-DDTHH:mm)
 */
export function calculateEtaFromDuration(departureTime, durationSeconds) {
  const depDate = departureTime ? new Date(departureTime) : new Date();
  const etaMs = depDate.getTime() + (durationSeconds * 1000);
  const etaDate = new Date(etaMs);

  const year = etaDate.getFullYear();
  const month = String(etaDate.getMonth() + 1).padStart(2, '0');
  const day = String(etaDate.getDate()).padStart(2, '0');
  const hours = String(etaDate.getHours()).padStart(2, '0');
  const minutes = String(etaDate.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Calculate driving route details between two locations
 * @param {string} startLocation 
 * @param {string} endLocation 
 * @returns {Promise<{
 *   success: boolean,
 *   distanceKm: number,
 *   durationSeconds: number,
 *   durationHours: number,
 *   durationFormatted: string,
 *   startCoords: [number, number]|null,
 *   endCoords: [number, number]|null,
 *   routeGeometry: Array<[number, number]>,
 *   errorMessage?: string
 * }>}
 */
export async function calculateDrivingRoute(startLocation, endLocation) {
  if (!startLocation || !endLocation) {
    return {
      success: false,
      distanceKm: 0,
      durationSeconds: 0,
      durationHours: 0,
      durationFormatted: "N/A",
      startCoords: null,
      endCoords: null,
      routeGeometry: [],
      errorMessage: "Please provide both Start Location and Destination."
    };
  }

  const cleanStart = startLocation.trim();
  const cleanEnd = endLocation.trim();

  if (cleanStart.toLowerCase() === cleanEnd.toLowerCase()) {
    return {
      success: false,
      distanceKm: 0,
      durationSeconds: 0,
      durationHours: 0,
      durationFormatted: "0 mins",
      startCoords: null,
      endCoords: null,
      routeGeometry: [],
      errorMessage: "Start location and destination cannot be identical."
    };
  }

  const cacheKey = `${cleanStart.toLowerCase()}:${cleanEnd.toLowerCase()}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  // 1. Geocode locations to coordinates
  const [startCoords, endCoords] = await Promise.all([
    geocodeLocation(cleanStart),
    geocodeLocation(cleanEnd)
  ]);

  if (!startCoords) {
    return {
      success: false,
      distanceKm: 0,
      durationSeconds: 0,
      durationHours: 0,
      durationFormatted: "N/A",
      startCoords: null,
      endCoords: null,
      routeGeometry: [],
      errorMessage: `Could not find valid coordinates for pickup location: "${cleanStart}".`
    };
  }

  if (!endCoords) {
    return {
      success: false,
      distanceKm: 0,
      durationSeconds: 0,
      durationHours: 0,
      durationFormatted: "N/A",
      startCoords,
      endCoords: null,
      routeGeometry: [],
      errorMessage: `Could not find valid coordinates for destination: "${cleanEnd}".`
    };
  }

  // 2. Query OSRM Driving Route API (lon,lat format)
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(osrmUrl);
    if (!response.ok) {
      throw new Error(`OSRM HTTP status ${response.status}`);
    }

    const data = await response.json();
    if (data.code === 'Ok' && Array.isArray(data.routes) && data.routes.length > 0) {
      const primaryRoute = data.routes[0];
      const distanceMeters = primaryRoute.distance; // meters
      const durationSecs = primaryRoute.duration; // seconds

      const distanceKm = Math.round(distanceMeters / 1000);
      const durationHours = parseFloat((durationSecs / 3600).toFixed(1));
      const durationFormatted = formatDuration(durationSecs);

      // GeoJSON coordinates are [longitude, latitude]. Map to Leaflet [latitude, longitude].
      const routeGeometry = primaryRoute.geometry?.coordinates
        ? primaryRoute.geometry.coordinates.map(([lon, lat]) => [lat, lon])
        : [startCoords, endCoords];

      const result = {
        success: true,
        distanceKm,
        durationSeconds: durationSecs,
        durationHours,
        durationFormatted,
        startCoords,
        endCoords,
        routeGeometry
      };

      routeCache.set(cacheKey, result);
      return result;
    } else {
      return {
        success: false,
        distanceKm: 0,
        durationSeconds: 0,
        durationHours: 0,
        durationFormatted: "N/A",
        startCoords,
        endCoords,
        routeGeometry: [startCoords, endCoords],
        errorMessage: `No driving road route available between "${cleanStart}" and "${cleanEnd}".`
      };
    }
  } catch (err) {
    console.error(`[RoutingService] OSRM route fetch error for ${cleanStart} -> ${cleanEnd}:`, err);
    
    // Fallback: Haversine distance multiplier if OSRM is unreachable
    const R = 6371;
    const dLat = (endCoords[0] - startCoords[0]) * Math.PI / 180;
    const dLon = (endCoords[1] - startCoords[1]) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(startCoords[0] * Math.PI / 180) * Math.cos(endCoords[0] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;
    const drivingEstKm = Math.round(straightKm * 1.3);
    const estSecs = Math.round((drivingEstKm / 60) * 3600);

    const fallbackResult = {
      success: true,
      distanceKm: drivingEstKm,
      durationSeconds: estSecs,
      durationHours: parseFloat((estSecs / 3600).toFixed(1)),
      durationFormatted: formatDuration(estSecs),
      startCoords,
      endCoords,
      routeGeometry: [startCoords, endCoords],
      isFallback: true
    };

    routeCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }
}
