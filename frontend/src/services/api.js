
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("eventease_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let Axios set the correct Content-Type automatically.
    // This is important for multipart/form-data image uploads.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
