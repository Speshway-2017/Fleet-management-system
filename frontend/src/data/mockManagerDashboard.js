
export const mockDashboardStats = [
  { label: "Total Vehicles", value: "450", icon: "mdi:truck-delivery", color: "bg-black" },
  { label: "Active", value: "380", icon: "mdi:flash", color: "bg-white border border-gray-200" },
  { label: "Trips Today", value: "120", icon: "mdi:map-marker-path", color: "bg-white border border-gray-200" },
  { label: "Under Repair", value: "15", icon: "mdi:wrench", color: "bg-white border border-gray-200" },
  { label: "Drivers Available", value: "45", icon: "mdi:account-group", color: "bg-white border border-gray-200" },
  { label: "Fuel Expense", value: "₹4.2L", icon: "mdi:gas-station", color: "bg-white border border-gray-200" },
  { label: "Total Earnings", value: "₹12.5L", icon: "mdi:cash", color: "bg-black" },
];

export const mockVehicleStatus = {
  total: 450,
  active: 380,
  inactive: 55,
  maintenance: 15,
};

export const mockComplianceExpiry = [
  { vehicle: "UP-14-BT-9002", document: "Insurance", status: "Expired" },
  { vehicle: "DL-1C-AA-1234", document: "Permit", status: "Expiring Soon" },
  { vehicle: "HR-26-CF-5678", document: "Pollution", status: "Expiring Soon" },
];

export const mockCostBreakdown = [
  { category: "Maintenance", amount: "2.4L", percentage: 80 },
  { category: "Salaries", amount: "6.8L", percentage: 60 },
  { category: "Insurance", amount: "1.5L", percentage: 40 },
  { category: "Permits & Tolls", amount: "1.8L", percentage: 50 },
];
