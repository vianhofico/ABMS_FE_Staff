import apiClient from "./apiClient";

export const uploadFile = (file, folder = "maintenance") => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post(`/files/upload?folder=${encodeURIComponent(folder)}`, formData, true);
};
