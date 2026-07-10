import axiosClient from "./axiosClient";

export const vehicleApi = {
  /** Fetch all vehicles */
  list: () => axiosClient.get("/vehicles"),

  /** Fetch a single vehicle by its MongoDB _id */
  getById: (id) => axiosClient.get(`/vehicles/${id}`),

  /** Create a new vehicle */
  create: (payload) => axiosClient.post("/vehicles", payload),

  /** Update an existing vehicle by _id */
  update: (id, payload) => axiosClient.put(`/vehicles/${id}`, payload),

  /** Delete a vehicle by _id */
  remove: (id) => axiosClient.delete(`/vehicles/${id}`),
};
export default vehicleApi;
