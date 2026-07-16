const CITY_COORDINATES = {
  mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  hyderabad: [17.3850, 78.4867],
  delhi: [28.7041, 77.1025],
  chennai: [13.0827, 80.2707],
  kolhapur: [16.7050, 74.2433],
  satara: [17.6805, 73.9918],
  anantapur: [14.6819, 77.6006],
  goa: [15.2993, 74.1240],
  visakhapatnam: [17.6868, 83.2185],
  vizag: [17.6868, 83.2185],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  manali: [32.2396, 77.1887]
};

const getCoordinates = (cityName) => {
  if (!cityName) return [18.5204, 73.8567]; // default Pune
  const norm = cityName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (norm.includes(key)) return coords;
  }
  return [18.5204, 73.8567]; // default Pune
};

export const calculateDistance = (startCity, endCity) => {
  if (!startCity || !endCity) return 120;
  const startCoords = getCoordinates(startCity);
  const endCoords = getCoordinates(endCity);

  if (startCoords[0] === 18.5204 && startCoords[1] === 73.8567 && 
      endCoords[0] === 18.5204 && endCoords[1] === 73.8567) {
    return 350;
  }

  const R = 6371; // Radius of the earth in km
  const dLat = (endCoords[0] - startCoords[0]) * Math.PI / 180;
  const dLon = (endCoords[1] - startCoords[1]) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startCoords[0] * Math.PI / 180) * Math.cos(endCoords[0] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d);
};
