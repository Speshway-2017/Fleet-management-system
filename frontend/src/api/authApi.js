import axiosClient from "./axiosClient";

export const authApi = {
  /**
   * Authenticate a user with email + password.
   * Returns the raw axios response so AuthContext can destructure data.
   */
  login: (credentials) => axiosClient.post("/auth/login", credentials),

  /**
   * Notify the backend of logout (stateless JWT — mainly for audit purposes).
   */
  logout: () => axiosClient.post("/auth/logout"),

  /**
   * Fetch the currently authenticated user's profile.
   * Requires a valid Bearer token (injected automatically by axiosClient).
   */
  getProfile: () => axiosClient.get("/auth/profile"),
};
