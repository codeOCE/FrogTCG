import axios from "axios";

// All frontend → backend requests go through this instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://backend.codeoce.com",
  withCredentials: true, // IMPORTANT for Twitch login session cookies
});

// Optional basic interceptor logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);
    throw err;
  }
);

export default api;
