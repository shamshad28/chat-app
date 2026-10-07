import api from "../lib/axios";

export const sendMessage = async (messageData) => {
  const response = await api.post(
    "/api/messages",
    messageData
  );

  return response.data;
};

export const getMessages = async (
  conversationId,
  page = 1,
  limit = 20
) => {
  const response = await api.get(
    `/api/messages/${conversationId}`,
    {
      params: {
        page,
        limit,
      },
    }
  );

  return response.data;
};