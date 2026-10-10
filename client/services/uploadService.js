import api from "../lib/axios";

export const uploadFiles = async (files) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

  const response = await api.post("/api/upload", formData);
  return response.data;
};
