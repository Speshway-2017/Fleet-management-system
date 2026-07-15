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

  /**
   * Real-time duplicate check for a single field.
   * @param {'vehicleNumber'|'registrationNumber'|'chassisNumber'} field
   * @param {string} value - the value to check
   * @param {string} [excludeId] - vehicle _id to exclude (edit mode)
   */
  checkDuplicate: (field, value, excludeId) => {
    const params = { field, value };
    if (excludeId) params.excludeId = excludeId;
    return axiosClient.get("/vehicles/check-duplicate", { params });
  },
};
export default vehicleApi;

