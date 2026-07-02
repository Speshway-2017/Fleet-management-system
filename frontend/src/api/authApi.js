import axiosClient from "./axiosClient";

export const authApi = {
  login: (credentials) => axiosClient.post("/auth/login", credentials),
  logout: () => axiosClient.post("/auth/logout"),
  getProfile: () => axiosClient.get("/auth/me"),
};
