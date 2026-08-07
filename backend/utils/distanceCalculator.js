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
  nashik: [19.9975, 73.7898],
  aurangabad: [19.8762, 75.3433],
  solapur: [17.6599, 75.9064],
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
  vijayawada: [16.5062, 80.6480],
  kurnool: [15.8281, 78.0373],
  guntur: [16.3067, 80.4365],
  nellore: [14.4426, 79.9865],
  kadapa: [14.4673, 78.8242],
  tirupati: [13.6288, 79.4192],
  warangal: [17.9689, 79.5941],
  bhimadole: [16.8103, 81.2643],
  dwaraka: [16.9538, 81.2588],
  dwarakatirumala: [16.9538, 81.2588],
  eluru: [16.7107, 81.1040],
  tanuku: [16.8580, 81.6780],
  tadepalligudem: [16.8333, 81.5333],
  rajahmundry: [17.0005, 81.8040],
  kakinada: [16.9891, 82.2475],
  ongole: [15.5057, 80.0499],
  bhimavaram: [16.5449, 81.5212],
  khammam: [17.2473, 80.1514],
  karimnagar: [18.4386, 79.1288],
  nizamabad: [18.6725, 78.0941]
};

const getCoordinates = (cityName) => {
  if (!cityName || typeof cityName !== 'string') return null;
  const norm = cityName.toLowerCase().split(',')[0].trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) return coords;
  }
  return null;
};

export const calculateDistance = (startCity, endCity) => {
  if (!startCity || !endCity) return 20;
  const normStart = startCity.toLowerCase().trim();
  const normEnd = endCity.toLowerCase().trim();

  if (normStart === normEnd) return 5;

  const startCoords = getCoordinates(startCity);
  const endCoords = getCoordinates(endCity);

  if (!startCoords || !endCoords) {
    let hash = 0;
    const combined = normStart + normEnd;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    return 18 + (Math.abs(hash) % 50);
  }

  const R = 6371; // Radius of the earth in km
  const dLat = (endCoords[0] - startCoords[0]) * Math.PI / 180;
  const dLon = (endCoords[1] - startCoords[1]) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startCoords[0] * Math.PI / 180) * Math.cos(endCoords[0] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  if (straightKm < 5) return 12;

  // Apply ~1.14x multiplier for driving distance estimate over highways
  return Math.max(12, Math.round(straightKm * 1.14));
};

export const getClosestCity = (lat, lon) => {
  let closestCity = "Pune";
  let minDistance = Infinity;
  const R = 6371;

  for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
    const dLat = (coords[0] - lat) * Math.PI / 180;
    const dLon = (coords[1] - lon) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * Math.PI / 180) * Math.cos(coords[0] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    if (d < minDistance) {
      minDistance = d;
      closestCity = cityName;
    }
  }
  return closestCity.charAt(0).toUpperCase() + closestCity.slice(1);
};
