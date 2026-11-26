export const INDIAN_STATES = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "DD", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" }
];

export const STATE_CITIES_MAP = {
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Andhra Pradesh": ["Anantapur", "Chittoor", "Eluru", "Guntur", "Kadapa", "Kakinada", "Kurnool", "Machilipatnam", "Nellore", "Ongole", "Proddatur", "Rajahmundry", "Srikakulam", "Tenali", "Tirupati", "Vijayawada", "Visakhapatnam", "Vizianagaram"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang"],
  "Assam": ["Bongaigaon", "Dibrugarh", "Guwahati", "Jorhat", "Nagaon", "Silchar", "Tezpur", "Tinsukia"],
  "Bihar": ["Arrah", "Begusarai", "Bhagalpur", "Bihar Sharif", "Chhapra", "Darbhanga", "Gaya", "Katihar", "Munger", "Muzaffarpur", "Patna", "Purnia"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Ambikapur", "Bhilai", "Bilaspur", "Durg", "Jagdalpur", "Korba", "Raipur", "Rajnandgaon"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["Central Delhi", "Connaught Place", "Dwarka", "East Delhi", "Janakpuri", "New Delhi", "North Delhi", "Rohini", "South Delhi", "West Delhi"],
  "Goa": ["Mapusa", "Margao", "Panaji", "Ponda", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Anand", "Bharuch", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh", "Morbi", "Nadiad", "Navsari", "Porbandar", "Rajkot", "Surat", "Vadodara", "Valsad", "Vapi"],
  "Haryana": ["Ambala", "Bhiwani", "Faridabad", "Gurugram", "Hisar", "Karnal", "Panchkula", "Panipat", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Baddi", "Bilaspur", "Dharamshala", "Hamirpur", "Kullu", "Mandi", "Shimla", "Solan"],
  "Jammu and Kashmir": ["Anantnag", "Baramulla", "Jammu", "Kathua", "Srinagar", "Udhampur"],
  "Jharkhand": ["Bokaro Steel City", "Deoghar", "Dhanbad", "Giridih", "Hazaribagh", "Jamshedpur", "Ramgarh", "Ranchi"],
  "Karnataka": ["Ballari", "Belagavi", "Bengaluru", "Bidar", "Chhitradurga", "Davanagere", "Hassan", "Hosapete", "Hubballi-Dharwad", "Kalaburagi", "Mangaluru", "Mysuru", "Shivamogga", "Tumakuru", "Udupi", "Vijayapura"],
  "Kerala": ["Alappuzha", "Kannur", "Kochi", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Thalassery", "Thiruvananthapuram", "Thrissur"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Kavaratti"],
  "Madhya Pradesh": ["Bhopal", "Burhanpur", "Dewas", "Gwalior", "Indore", "Jabalpur", "Khandwa", "Ratlam", "Rewa", "Sagar", "Satna", "Singrauli", "Ujjain"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Bhiwandi", "Chandrapur", "Dhule", "Jalgaon", "Kalyan-Dombivli", "Kolhapur", "Latur", "Mira-Bhayandar", "Mumbai", "Nagpur", "Nashik", "Navi Mumbai", "Panvel", "Pimpri-Chinchwad", "Pune", "Sangli", "Satara", "Solapur", "Thane", "Vasai-Virar"],
  "Manipur": ["Churachandpur", "Imphal", "Thoubal"],
  "Meghalaya": ["Jowai", "Shillong", "Tura"],
  "Mizoram": ["Aizawl", "Lunglei"],
  "Nagaland": ["Dimapur", "Kohima", "Mokokchung"],
  "Odisha": ["Balasore", "Baripada", "Berhampur", "Bhadrak", "Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Sambalpur"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
  "Punjab": ["Amritsar", "Batala", "Bathinda", "Hoshiarpur", "Jalandhar", "Khanna", "Ludhiana", "Moga", "Mohali", "Pathankot", "Patiala"],
  "Rajasthan": ["Ajmer", "Alwar", "Bharatpur", "Bhilwara", "Bikaner", "Chittorgarh", "Jaipur", "Jodhpur", "Kota", "Pali", "Sikar", "Sri Ganganagar", "Udaipur"],
  "Sikkim": ["Gangtok", "Namchi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Cuddalore", "Dindigul", "Erode", "Hosur", "Kanchipuram", "Madurai", "Nagercoil", "Salem", "Thanjavur", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Vellore"],
  "Telangana": ["Adilabad", "Hyderabad", "Jagtial", "Karimnagar", "Khammam", "Mahbubnagar", "Mancherial", "Miryalaguda", "Nalgonda", "Nizamabad", "Ramagundam", "Siddipet", "Suryapet", "Warangal"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Bareilly", "Firozabad", "Ghaziabad", "Gorakhpur", "Greater Noida", "Jhansi", "Kanpur", "Lucknow", "Mathura", "Meerut", "Moradabad", "Muzaffarnagar", "Noida", "Prayagraj", "Saharanpur", "Varanasi"],
  "Uttarakhand": ["Dehradun", "Haldwani", "Haridwar", "Kashipur", "Rishikesh", "Roorkee", "Rudrapur"],
  "West Bengal": ["Asansol", "Baharampur", "Bardhaman", "Dankuni", "Durgapur", "Habra", "Howrah", "Kharagpur", "Kolkata", "Malda", "Shantipur", "Siliguri"]
};

export const getCitiesForState = (stateName) => {
  if (!stateName) {
    return [];
  }
  
  // Match state by exact or partial name
  const matchedKey = Object.keys(STATE_CITIES_MAP).find(
    s => s.toLowerCase() === stateName.trim().toLowerCase()
  );
  
  if (matchedKey) {
    return [...STATE_CITIES_MAP[matchedKey]].sort((a, b) => a.localeCompare(b));
  }
  
  return [];
};

export const getStateForCity = (cityName) => {
  if (!cityName || typeof cityName !== 'string') return "";
  const clean = cityName.trim().split(',')[0].trim().toLowerCase();
  if (!clean) return "";

  for (const [state, cities] of Object.entries(STATE_CITIES_MAP)) {
    if (cities.some(c => c.toLowerCase() === clean || clean.includes(c.toLowerCase()) || c.toLowerCase().includes(clean))) {
      return state;
    }
  }
  return "";
};
