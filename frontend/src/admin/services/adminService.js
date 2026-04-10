import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ response interceptor for AUTO REFRESH (Admin)
adminApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // We use a direct axios call to the user refresh endpoint
        const res = await axios.post(`${API_BASE_URL}/api/user/refresh-token`, {}, { withCredentials: true });

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return adminApi(originalRequest);
      } catch (err) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

const adminService = {
  // Dashboard
  getDashboardSummary: async (params) => {
    const response = await adminApi.get("/dashboard/summary", { params });
    return response.data;
  },
  getProductAnalytics: async (id, params) => {
    const response = await adminApi.get(`/dashboard/product/${id}`, { params });
    return response.data;
  },
  getAllProductsAnalytics: async () => {
    const response = await adminApi.get("/dashboard/all-products");
    return response.data;
  },

  // Products
  createProduct: async (formData) => {
    const response = await adminApi.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  updateProduct: async (id, formData) => {
    const response = await adminApi.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await adminApi.delete(`/products/${id}`);
    return response.data;
  },

  // Orders
  getAllOrders: async (params) => {
    const response = await adminApi.get("/orders", { params });
    return response.data;
  },
  updateOrderStatus: async (id, statusData) => {
    const response = await adminApi.put(`/orders/${id}/status`, statusData);
    return response.data;
  },

  // Users
  getAllUsers: async () => {
    const response = await adminApi.get("/users");
    return response.data;
  },
  toggleUserStatus: async (id) => {
    const response = await adminApi.put(`/users/${id}/toggle-status`, {});
    return response.data;
  },
};

export default adminService;
