const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/api/login`,
  users: `${API_BASE_URL}/api/users`,
  submissions: `${API_BASE_URL}/api/submissions`,
  stats: `${API_BASE_URL}/api/stats`,
  uploads: `${API_BASE_URL}/uploads`,
};

export const API_BASE = API_BASE_URL;
