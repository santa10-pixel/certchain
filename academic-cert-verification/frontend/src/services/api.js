import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cert_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.token) {
      localStorage.setItem("cert_admin_token", res.data.token);
      localStorage.setItem("cert_admin_user", JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem("cert_admin_token");
    localStorage.removeItem("cert_admin_user");
  },
  getCurrentUser: () => {
    try {
      const u = localStorage.getItem("cert_admin_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  isAuthenticated: () => {
    return !!localStorage.getItem("cert_admin_token");
  },
};

export const certificateService = {
  issue: async (formData) => {
    const res = await api.post("/certificates", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  getAll: async (params = {}) => {
    const res = await api.get("/certificates", { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/certificates/${encodeURIComponent(id)}`);
    return res.data;
  },
  revoke: async (id, reason) => {
    const res = await api.post(`/certificates/${encodeURIComponent(id)}/revoke`, { reason });
    return res.data;
  },
  getDownloadUrl: (id) => {
    return `${API_BASE_URL}/certificates/${encodeURIComponent(id)}/download`;
  },
};

export const verificationService = {
  verifyById: async (id) => {
    const res = await api.get(`/verify/${encodeURIComponent(id)}`);
    return res.data;
  },
  verifyByFile: async (file, certificateId = "") => {
    const formData = new FormData();
    formData.append("certificateFile", file);
    if (certificateId) {
      formData.append("certificateId", certificateId);
    }
    const res = await api.post("/verify/file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  /**
   * Browser-side SHA-256 calculation via Web Crypto API
   * Enables client-side pre-computation or instant tampering detection!
   */
  computeBrowserHash: async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  },
};

export const dashboardService = {
  getStats: async () => {
    const res = await api.get("/dashboard/stats");
    return res.data;
  },
};

export default api;
