const BASE_URL = "http://localhost:8080/building-management/api/v1";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

const apiClient = {
  get: async (url, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${BASE_URL}${url}?${queryString}` : `${BASE_URL}${url}`;
    const response = await fetch(fullUrl);
    return handleResponse(response);
  },

  post: async (url, data, isFormData = false) => {
    const options = {
      method: "POST",
      body: isFormData ? data : JSON.stringify(data),
    };
    if (!isFormData) {
      options.headers = { "Content-Type": "application/json" };
    }
    const response = await fetch(`${BASE_URL}${url}`, options);
    return handleResponse(response);
  },

  put: async (url, data) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  patch: async (url, data) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (url) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },
};

export default apiClient;
