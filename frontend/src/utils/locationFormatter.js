/**
 * Location Display Formatter Utility for Fleet Management System
 * 
 * Rules:
 * 1. NEVER display raw latitude and longitude values in the UI.
 * 2. Display the actual City location of the driver/vehicle (currentLocation/driverLocation).
 * 3. If currentLocation is missing, fall back to Branch Name.
 * 4. Convert stored GPS coordinates into a readable location name (e.g., Hyderabad, Visakhapatnam, Pune).
 * 5. If reverse geocoding fails, return "Unknown Location" instead of raw coordinates.
 */

const LOCAL_CITY_COORDINATES = {
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

const frontendReverseCache = new Map();

/**
 * Check if string is a raw latitude,longitude coordinate format
 * @param {string} str 
 * @returns {boolean}
 */
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
 * Clean and format city or location name (capitalize first letter, trim)
 * @param {string} str 
 * @returns {string}
 */
export function cleanCityName(str) {
  if (!str || typeof str !== 'string') return "Unknown Location";
  const trimmed = str.trim();
  if (!trimmed || isCoordinateString(trimmed)) return "Unknown Location";
  
  // Extract main city name before comma if present (e.g. "Hyderabad, TS" -> "Hyderabad")
  const mainPart = trimmed.split(',')[0].trim();
  if (!mainPart) return "Unknown Location";

  return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
}

/**
 * Synchronous resolver for location names. Converts coordinates to nearest city name.
 * @param {string} location 
 * @param {string} [branch] 
 * @returns {string} Clean human-readable location or branch name (never raw coords)
 */
export function formatDisplayLocation(location, branch) {
  // 1. Check currentLocation/driverLocation first if valid text name
  if (location && typeof location === 'string' && location.trim() && !isCoordinateString(location)) {
    return cleanCityName(location);
  }

  // 2. Check branch if valid text name
  if (branch && typeof branch === 'string' && branch.trim() && !isCoordinateString(branch)) {
    return cleanCityName(branch);
  }

  // 3. Resolve coordinate string if present
  const coordCandidate = (location && isCoordinateString(location)) ? location : ((branch && isCoordinateString(branch)) ? branch : null);
  if (coordCandidate) {
    const trimmed = coordCandidate.trim();
    if (frontendReverseCache.has(trimmed)) {
      return frontendReverseCache.get(trimmed);
    }

    const parts = trimmed.split(',');
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);

    if (!isNaN(lat) && !isNaN(lon)) {
      let closestCity = null;
      let minDist = 65;

      for (const [cityName, coords] of Object.entries(LOCAL_CITY_COORDINATES)) {
        const d = calculateDistanceKm(lat, lon, coords[0], coords[1]);
        if (d < minDist) {
          minDist = d;
          closestCity = cityName;
        }
      }

      if (closestCity) {
        frontendReverseCache.set(trimmed, closestCity);
        return closestCity;
      }
    }
  }

  return "Unknown Location";
}
