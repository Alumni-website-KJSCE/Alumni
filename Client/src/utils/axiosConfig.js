import axios from "axios";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

// Global logout handler that can be set by the AuthContext
let globalLogoutHandler = null;

export const setGlobalLogoutHandler = (handler) => {
  globalLogoutHandler = handler;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log(
      "Axios request interceptor - token from localStorage:",
      token ? "present" : "missing",
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Axios request interceptor - Authorization header set");
    } else {
      console.log("Axios request interceptor - No token found in localStorage");
    }

    // Ensure Content-Type is set
    // Don't set Content-Type for FormData (multipart/form-data)
    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    console.log("Axios request interceptor - final headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("Axios request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token refresh is in progress, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await axiosInstance.post("/auth/refresh-token");
        const { token } = response.data;

        localStorage.setItem("token", token);
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${token}`;

        processQueue(null, token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Use the global logout handler if available, otherwise fallback to direct navigation
        if (globalLogoutHandler) {
          globalLogoutHandler();
        } else {
          // Fallback: Clear local storage and redirect to login
          localStorage.removeItem("token");
          // Redirect based on API route: admin or user
          if (
            originalRequest.url &&
            originalRequest.url.includes("/api/admin")
          ) {
            window.location.href = "/kjsce-admin-login";
          } else {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      // Log error details in development
      if (import.meta.env.DEV) {
        console.error(`Error from ${error.config.url}:`, {
          status: error.response.status,
          data: error.response.data,
          headers: error.config.headers,
        });
      }

      // Handle specific error cases
      switch (error.response.status) {
        case 403:
          // Handle forbidden access - redirect based on context
          if (globalLogoutHandler) {
            // Use the global logout handler to maintain proper auth flow
            globalLogoutHandler();
          } else {
            // Fallback: redirect to appropriate login page based on API route
            if (
              originalRequest.url &&
              originalRequest.url.includes("/api/admin")
            ) {
              window.location.href = "/kjsce-admin-login";
            } else {
              window.location.href = "/auth";
            }
          }
          break;
        case 404:
          // Handle not found
          console.error("Resource not found");
          break;
        case 500:
          // Handle server error
          console.error("Server error occurred");
          break;
        default:
          break;
      }
    } else if (error.request) {
      // Handle network errors
      console.error("Network error:", error.message);
    } else {
      // Handle other errors
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
