import api from "../lib/axios";

export const searchUsers = async (query = "") => {
  const response = await api.get("/api/users/search", {
    params: { q: query },
  });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/api/users");
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put("/api/users/profile", profileData);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};
