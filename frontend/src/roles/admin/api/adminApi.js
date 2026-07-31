import { mockUsers } from "@/data/mockUsers";

let users = [...mockUsers];

const MOCK_USERS = [
  { id: 1, name: "Admin User", email: "admin@fleet.com", role: "admin" },
  { id: 2, name: "Manager User", email: "manager@fleet.com", role: "manager" },
  { id: 3, name: "Sarah Connor", email: "sarah.c@fleet.com", role: "manager" },
  { id: 4, name: "Alex Rivera", email: "alex.r@fleet.com", role: "admin" },
  { id: 5, name: "David Kim", email: "david.k@fleet.com", role: "manager" },
];

const MOCK_OVERVIEW = {
  totalVehicles: 48,
  activeTrips: 18,
  maintenanceAlerts: 3,
  fuelEfficiency: "8.4 mpg",
};

export const adminApi = {
  getUsers: async () => {
    return { data: users.map(({ password, ...u }) => u) };
  },
  createUser: async (payload) => {
    const newUser = {
      id: users.length + 1,
      ...payload,
    };
    users.push(newUser);
    return { data: newUser };
  },
  updateUser: async (id, payload) => {
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...payload };
      return { data: users[index] };
    }
    throw new Error("User not found");
  },
  deleteUser: async (id) => {
    users = users.filter((u) => u.id !== id);
    return { data: { id } };
  },
  getFleetOverview: async () => {
    return { data: MOCK_OVERVIEW };
  },
};

