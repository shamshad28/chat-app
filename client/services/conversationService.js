import api from "../lib/axios";

export const getMyConversations = async () => {
  try {
    const response = await api.get("/api/conversations");
    return response.data;
  } catch (err) {
    console.warn("Failed to fetch conversations:", err.message);
    return { success: false, conversations: [] };
  }
};

export const getConversationById = async (conversationId) => {
  const response = await api.get(`/api/conversations/${conversationId}`);
  return response.data;
};

export const createDirectConversation = async (userId) => {
  const response = await api.post("/api/conversations/direct", { userId });
  return response.data;
};

export const createGroupConversation = async ({ name, members = [], avatar = "" }) => {
  const response = await api.post("/api/conversations/group", {
    name,
    members,
    avatar,
  });
  return response.data;
};

export const addGroupMembers = async (conversationId, members) => {
  const response = await api.post(`/api/conversations/${conversationId}/members`, {
    members,
  });
  return response.data;
};

export const removeGroupMember = async (conversationId, userId) => {
  const response = await api.delete(`/api/conversations/${conversationId}/members/${userId}`);
  return response.data;
};

export const toggleAdminRole = async (conversationId, userId, role) => {
  const response = await api.put(`/api/conversations/${conversationId}/admins`, {
    userId,
    role,
  });
  return response.data;
};

export const updateGroupSettings = async (conversationId, data) => {
  const response = await api.put(`/api/conversations/${conversationId}`, data);
  return response.data;
};
