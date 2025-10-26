import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/v1",
  withCredentials: true, // IMPORTANT: Enables cookie-based auth
});

export default apiClient;
