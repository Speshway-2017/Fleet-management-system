import axiosClient from "./axiosClient";

export const vehicleApi = {
  /** Fetch all vehicles for the authenticated manager */
  list: () => axiosClient.get("/manager/vehicles"),

  /** Fetch a single vehicle by its MongoDB _id */
  getById: (id) => axiosClient.get(`/manager/vehicles/${id}`),

  /**
   * Create a new vehicle.
   * Accepts the full AddVehiclePage formData shape mapped to backend field names.
   */
  create: (payload) => axiosClient.post("/manager/vehicles", payload),

  /** Update an existing vehicle by id */
  update: (id, payload) => axiosClient.put(`/manager/vehicles/${id}`, payload),

  /** Delete a vehicle by id */
  remove: (id) => axiosClient.delete(`/manager/vehicles/${id}`),
};
