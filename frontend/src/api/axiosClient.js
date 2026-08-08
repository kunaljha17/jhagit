import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;
