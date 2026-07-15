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

  /** Upload vehicle document */
  uploadDocument: (file, onProgress) => {
    const formData = new FormData();
    formData.append("document", file);
    return axiosClient.post("/vehicles/upload-document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(progressEvent.loaded, progressEvent.total);
        }
      },
    });
  },
};
export default vehicleApi;
