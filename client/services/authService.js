import api from "../lib/axios";

export const registerUser = async (userData) => {
  const response = await api.post("/api/auth/register", userData);
  if (response.data.token && typeof window !== "undefined") {
    localStorage.setItem("chat_token", response.data.token);
  }
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/api/auth/login", credentials);
  if (response.data.token && typeof window !== "undefined") {
    localStorage.setItem("chat_token", response.data.token);
  }
  return response.data;
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    if (typeof window !== "undefined") {
      localStorage.removeItem("chat_token");
    }
    return response.data;
  } catch (err) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("chat_token");
    }
    throw err;
  }
};

export const getCurrentUser = async () => {
  if (typeof window !== "undefined" && !localStorage.getItem("chat_token")) {
    try {
      const loginRes = await loginUser({
        email: "shamshad@pulsechat.com",
        password: "password123",
      });
      return loginRes.user || loginRes;
    } catch {
      return null;
    }
  }
  const response = await api.get("/api/auth/me");
  return response.data;
};