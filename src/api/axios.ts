import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api",
  withCredentials: true,
});

// Request interceptor to attach authorization token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 Unauthorized (token expired or invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        const isLoginRequest = error.config?.url?.includes("/auth/login");
        if (!isLoginRequest) {
          localStorage.removeItem("token");
          if (
            window.location.pathname.startsWith("/admin") &&
            window.location.pathname !== "/admin/login"
          ) {
            window.location.href = "/admin/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;