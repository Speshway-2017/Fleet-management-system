import axios from "axios";

// Create custom Axios instance for Manager space
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Inject Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors, redirect unauthorized, and perform retry
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (config && config.retryCount !== undefined && config.retryCount < config.maxRetries) {
      config.retryCount += 1;
      const delay = Math.pow(2, config.retryCount) * 1000;
      console.warn(`API retry in ${delay}ms... (Attempt ${config.retryCount}/${config.maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return axiosInstance(config);
    }

    return Promise.reject(error);
  }
);

export const requestWithRetry = (url, options = {}, maxRetries = 2) => {
  return axiosInstance({
    url,
    ...options,
    maxRetries,
    retryCount: 0,
  });
};

export default axiosInstance;
