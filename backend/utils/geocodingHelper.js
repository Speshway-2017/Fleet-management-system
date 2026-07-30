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

const geocodeCache = new Map();

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
