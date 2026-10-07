import axios from "axios";

// Dynamically resolve backend base URL (works across localhost, LAN IP, and production)
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname || "localhost";
    const protocol = window.location.protocol || "http:";
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      return `${protocol}//${hostname}:5000`;
    }
    return "";
  }
  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: update dynamic baseURL and attach Authorization token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = getBaseURL();
    const token = localStorage.getItem("chat_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor: graceful error handling and auto-retry for GET requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry once on transient network errors for idempotent GET requests
    if (
      (!error.response || error.code === "ECONNABORTED" || error.message?.includes("Network Error")) &&
      config &&
      !config._retry &&
      config.method?.toLowerCase() === "get"
    ) {
      config._retry = true;
      try {
        await new Promise((res) => setTimeout(res, 800));
        return await api(config);
      } catch (retryError) {
        // Fall through to error handler
      }
    }

    if (!error.response) {
      console.warn("Backend server connection failed:", config?.baseURL, error.message);
      error.message = "Cannot connect to server. Please make sure the backend is running.";
    } else if (error.response.status === 401) {
      // Clear expired token if rejected
      if (typeof window !== "undefined") {
        const isAuthRoute =
          window.location.pathname === "/login" ||
          window.location.pathname === "/register";
        if (
          !isAuthRoute &&
          !config?.url?.includes("/api/auth/login") &&
          !config?.url?.includes("/api/auth/register")
        ) {
          localStorage.removeItem("chat_token");
          if (window.location.pathname.startsWith("/chat")) {
            window.location.href = "/login";
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;