import api from "../lib/axios";

export const sendMessage = async (messageData) => {
  const response = await api.post("/api/messages", messageData);
  return response.data;
};

export const getMessages = async (conversationId, page = 1, limit = 30, before = null) => {
  try {
    const params = { page, limit };
    if (before) {
      params.before = before;
    }
    const response = await api.get(`/api/messages/${conversationId}`, { params });
    return response.data;
  } catch (err) {
    console.warn("Failed to fetch messages:", err.message);
    return { success: false, messages: [], hasMore: false };
  }
};

export const toggleReaction = async (messageId, emoji) => {
  const response = await api.post(`/api/messages/${messageId}/reactions`, { emoji });
  return response.data;
};

export const markConversationAsRead = async (conversationId) => {
  const response = await api.put(`/api/messages/${conversationId}/read`);
  return response.data;
};

export const searchMessages = async (query, conversationId = null) => {
  const params = { q: query };
  if (conversationId) {
    params.conversationId = conversationId;
  }
  const response = await api.get("/api/messages/search", { params });
  return response.data;
};
