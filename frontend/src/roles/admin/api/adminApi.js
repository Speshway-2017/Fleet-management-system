import axiosClient from "@/api/axiosClient";

export const adminApi = {
  getUsers: () => axiosClient.get("/admin/users"),
  createUser: (payload) => axiosClient.post("/admin/users", payload),
  updateUser: (id, payload) => axiosClient.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),
  getFleetOverview: () => axiosClient.get("/admin/fleet/overview"),
};
