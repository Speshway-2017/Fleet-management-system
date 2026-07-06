import axiosInstance, { requestWithRetry } from "./axios";

const MOCK_DASHBOARD_STATS = {
  totalVehicles: 450,
  activeVehicles: 380,
  tripsToday: 120,
  underRepair: 15,
  driversAvailable: 45,
  fuelExpense: "₹4.2L",
  totalEarnings: "₹12.5L",
};

const MOCK_VEHICLES = [
  { id: 1, plateNumber: "UP 14 BT 9002", status: "repair", latitude: 28.6139, longitude: 77.2090 },
  { id: 2, plateNumber: "MH 12 RS 4321", status: "active", latitude: 28.6250, longitude: 77.2210 },
  { id: 3, plateNumber: "DL 01 CA 9981", status: "active", latitude: 28.6010, longitude: 77.1950 },
  { id: 4, plateNumber: "KA 03 MM 5566", status: "active", latitude: 28.6410, longitude: 77.2320 },
  { id: 5, plateNumber: "HR 26 AQ 7711", status: "active", latitude: 28.6320, longitude: 77.1820 },
  { id: 6, plateNumber: "AP 09 XX 1122", status: "active", latitude: 28.5850, longitude: 77.2150 },
];

const MOCK_LIVE_TRACKING = [
  { id: 1, vehicle: "UP 14 BT 9002", lat: 28.6139, lng: 77.2090, status: "Repair" },
  { id: 2, vehicle: "MH 12 RS 4321", lat: 28.6250, lng: 77.2210, status: "Running" },
  { id: 3, vehicle: "DL 01 CA 9981", lat: 28.6010, lng: 77.1950, status: "Running" },
  { id: 4, vehicle: "KA 03 MM 5566", lat: 28.6410, lng: 77.2320, status: "Running" },
  { id: 5, vehicle: "HR 26 AQ 7711", lat: 28.6320, lng: 77.1820, status: "Running" },
  { id: 6, vehicle: "AP 09 XX 1122", lat: 28.5850, lng: 77.2150, status: "Running" }
];

const MOCK_COMPLIANCES = [
  { id: 1, vehicle: "UP 14 BT 9002", document: "Insurance", expiryDate: "2026-06-15", status: "EXPIRED", statusType: "danger" },
  { id: 2, vehicle: "MH 12 RS 4321", document: "Permit", expiryDate: "2026-12-01", status: "VALID", statusType: "success" },
  { id: 3, vehicle: "DL 01 CA 9981", document: "Pollution (PUC)", expiryDate: "2026-07-20", status: "EXPIRING SOON", statusType: "warning" },
  { id: 4, vehicle: "KA 03 MM 5566", document: "Fitness Cert", expiryDate: "2027-02-10", status: "VALID", statusType: "success" },
  { id: 5, vehicle: "HR 26 AQ 7711", document: "Insurance", expiryDate: "2026-05-30", status: "EXPIRED", statusType: "danger" }
];

const MOCK_COSTS = [
  { label: "Maintenance", amount: "2.4L", percentage: 24 },
  { label: "Salaries", amount: "6.8L", percentage: 68 },
  { label: "Insurance", amount: "1.5L", percentage: 15 },
  { label: "Permits & Tolls", amount: "1.8L", percentage: 18 }
];

export const dashboardApi = {
  getDashboard: () =>
    requestWithRetry("/dashboard")
      .then((res) => res.data)
      .catch((err) => {
        console.warn("Using mock dashboard stats (API down):", err.message);
        return MOCK_DASHBOARD_STATS;
      }),

  getVehicles: () =>
    requestWithRetry("/vehicles")
      .then((res) => res.data)
      .catch((err) => {
        console.warn("Using mock vehicles array (API down):", err.message);
        return MOCK_VEHICLES;
      }),

  getLiveTracking: () =>
    requestWithRetry("/live-tracking")
      .then((res) => res.data)
      .catch((err) => {
        console.warn("Using mock live tracking (API down):", err.message);
        return MOCK_LIVE_TRACKING;
      }),

  getCompliance: () =>
    requestWithRetry("/compliance")
      .then((res) => res.data)
      .catch((err) => {
        console.warn("Using mock compliance values (API down):", err.message);
        return MOCK_COMPLIANCES;
      }),

  getCostBreakdown: () =>
    requestWithRetry("/cost-breakdown")
      .then((res) => res.data)
      .catch((err) => {
        console.warn("Using mock costs values (API down):", err.message);
        return MOCK_COSTS;
      }),
};
