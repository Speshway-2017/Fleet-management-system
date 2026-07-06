import axiosClient from "@/api/axiosClient";

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
    try {
      return await axiosClient.get("/admin/users");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("API getUsers failed, returning mock data in DEV:", error);
        return { data: MOCK_USERS };
      }
      throw error;
    }
  },
  createUser: async (payload) => {
    try {
      return await axiosClient.post("/admin/users", payload);
    } catch (error) {
      if (import.meta.env.DEV) {
        const newUser = { id: Date.now(), ...payload };
        return { data: newUser };
      }
      throw error;
    }
  },
  updateUser: (id, payload) => axiosClient.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),
  getFleetOverview: async () => {
    try {
      return await axiosClient.get("/admin/fleet/overview");
    } catch (error) {
      if (import.meta.env.DEV) {
        return { data: MOCK_OVERVIEW };
      }
      throw error;
    }
  },
};

