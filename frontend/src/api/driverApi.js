import axiosClient from "./axiosClient";

export const driverApi = {
  /** Fetch all drivers with optional filters, search, pagination */
  list: (params) => axiosClient.get("/drivers", { params }),

  /** Fetch a single driver by MongoDB _id */
  getById: (id) => axiosClient.get(`/drivers/${id}`),

  /** Create a new driver */
  create: (payload) => axiosClient.post("/drivers", payload),

  /** Update an existing driver by _id */
  update: (id, payload) => axiosClient.put(`/drivers/${id}`, payload),

  /** Delete a driver by _id */
  remove: (id) => axiosClient.delete(`/drivers/${id}`),

  /**
   * Upload a driving license scan document.
   * @param {File} file - The file object from input/drop event
   * @param {function} onProgress - optional (loaded, total) progress callback
   */
  uploadDocument: (file, onProgress) => {
    const form = new FormData();
    form.append("document", file);
    return axiosClient.post("/drivers/upload-document", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (e) => onProgress(e.loaded, e.total)
        : undefined,
    });
  },
};
