
export const mockWalletBalance = {
  total: 142850.40,
  currency: "₹",
  lowBalanceVehicles: 12,
  autoTopupStatus: "Active",
};

export const mockTollTransactions = [
  {
    id: 1,
    vehicleId: "KA-01-AF-9234",
    vehicleModel: "Heavy Truck (Lorry)",
    location: "NICE Road Plaza, Bengaluru",
    plazaId: "12044-B",
    time: "2024-05-24T10:42:00",
    amount: 485.00,
    status: "settled",
  },
  {
    id: 2,
    vehicleId: "MH-12-PQ-4567",
    vehicleModel: "Semi-Trailer",
    location: "Khalapur Toll, Expressway",
    plazaId: "09882-A",
    time: "2024-05-24T09:15:00",
    amount: 640.00,
    status: "settled",
  },
  {
    id: 3,
    vehicleId: "DL-01-ST-7890",
    vehicleModel: "Tempo Traveller",
    location: "Kherki Daula Toll, Gurugram",
    plazaId: "07556-C",
    time: "2024-05-24T08:50:00",
    amount: 320.00,
    status: "settled",
  },
  {
    id: 4,
    vehicleId: "TN-09-RS-1234",
    vehicleModel: "Pickup Truck",
    location: "Chennai Bypass Toll",
    plazaId: "11223-D",
    time: "2024-05-24T07:30:00",
    amount: 210.00,
    status: "settled",
  },
];

export const mockMonthlySpending = [
  { month: "Aug", amount: 12500 },
  { month: "Sep", amount: 14200 },
  { month: "Oct", amount: 11800 },
  { month: "Nov", amount: 16500 },
  { month: "Dec", amount: 13900 },
  { month: "Jan", amount: 15200 },
];

