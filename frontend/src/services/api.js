import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or health endpoints
      if (!error.config.url.includes("/auth/login") && !error.config.url.includes("/public/")) {
        // Token expired or invalid
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AUTH SERVICES
// ==========================================
export const authService = {
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },
  sendOtp: async (data) => {
    const res = await api.post("/auth/send-otp", data);
    return res.data;
  },
  verifyOtp: async (data) => {
    const res = await api.post("/auth/verify-otp", data);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post("/auth/register", userData);
    return res.data;
  },
};

// ==========================================
// DEPARTMENT SERVICES
// ==========================================
export const departmentService = {
  getAll: async () => {
    const res = await api.get("/departments");
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },
};

// ==========================================
// SERVICE SERVICES
// ==========================================
export const serviceService = {
  getAll: async () => {
    const res = await api.get("/services");
    return res.data;
  },
  getByDepartment: async (deptId) => {
    const res = await api.get(`/services/department/${deptId}`);
    return res.data;
  },
};

// ==========================================
// TOKEN SERVICES
// ==========================================
export const tokenService = {
  generateToken: async (departmentId, serviceId, priorityType = "NORMAL", office = undefined) => {
    const payload =
      typeof departmentId === "object"
        ? departmentId
        : { department: departmentId, service: serviceId, priorityType, office };
    const res = await api.post("/tokens", payload);
    return res.data;
  },
  getMyToken: async () => {
    const res = await api.get("/tokens/my-token");
    return res.data;
  },
  getQueue: async (departmentId) => {
    const res = await api.get(`/tokens/queue/${departmentId}`);
    return res.data;
  },
  getPublicQueue: async (departmentId) => {
    const res = await api.get(`/tokens/public/queue/${departmentId}`);
    return res.data;
  },
  callNextToken: async () => {
    const res = await api.post("/tokens/call-next");
    return res.data;
  },
  startService: async (tokenId) => {
    const res = await api.post(`/tokens/${tokenId}/start`);
    return res.data;
  },
  completeService: async (tokenId) => {
    const res = await api.post(`/tokens/${tokenId}/complete`);
    return res.data;
  },
  skipToken: async (tokenId) => {
    const res = await api.post(`/tokens/${tokenId}/skip`);
    return res.data;
  },
  verifyPriority: async (tokenId, priorityVerified = true, priorityType) => {
    const res = await api.patch(`/tokens/${tokenId}/verify-priority`, {
      priorityVerified,
      priorityType,
    });
    return res.data;
  },
};

// ==========================================
// APPOINTMENT SERVICES
// ==========================================
export const appointmentService = {
  createAppointment: async (data) => {
    const res = await api.post("/appointments", data);
    return res.data;
  },
  getMyAppointments: async () => {
    const res = await api.get("/appointments/my");
    return res.data;
  },
  checkIn: async (appointmentId) => {
    const res = await api.post(`/appointments/${appointmentId}/check-in`);
    return res.data;
  },
  cancelAppointment: async (appointmentId) => {
    const res = await api.put(`/appointments/${appointmentId}/cancel`);
    return res.data;
  },
};

// ==========================================
// OFFICER SERVICES
// ==========================================
export const officerService = {
  getProfile: async () => {
    const res = await api.get("/officers/profile");
    return res.data;
  },
  getDashboard: async () => {
    const res = await api.get("/officers/dashboard");
    return res.data;
  },
  getQueue: async () => {
    const res = await api.get("/officers/queue");
    return res.data;
  },
  getCurrentToken: async () => {
    const res = await api.get("/officers/current-token");
    return res.data;
  },
  updateAvailability: async (isAvailable) => {
    const res = await api.post("/officers/availability", { isAvailable });
    return res.data;
  },
};

// ==========================================
// COUNTER SERVICES
// ==========================================
export const counterService = {
  getAll: async () => {
    const res = await api.get("/counters");
    return res.data;
  },
};

// ==========================================
// ADMIN SERVICES
// ==========================================
export const adminService = {
  getDashboard: async () => {
    const res = await api.get("/admin/dashboard");
    return res.data;
  },
  // Departments
  getDepartments: async () => {
    const res = await api.get("/admin/departments");
    return res.data;
  },
  createDepartment: async (data) => {
    const res = await api.post("/admin/departments", data);
    return res.data;
  },
  updateDepartment: async (id, data) => {
    const res = await api.put(`/admin/departments/${id}`, data);
    return res.data;
  },
  deleteDepartment: async (id) => {
    const res = await api.delete(`/admin/departments/${id}`);
    return res.data;
  },
  // Services
  getServices: async () => {
    const res = await api.get("/admin/services");
    return res.data;
  },
  createService: async (data) => {
    const res = await api.post("/admin/services", data);
    return res.data;
  },
  updateService: async (id, data) => {
    const res = await api.put(`/admin/services/${id}`, data);
    return res.data;
  },
  deleteService: async (id) => {
    const res = await api.delete(`/admin/services/${id}`);
    return res.data;
  },
  // Officers
  getOfficers: async () => {
    const res = await api.get("/admin/officers");
    return res.data;
  },
  createOfficer: async (data) => {
    const res = await api.post("/admin/officers", data);
    return res.data;
  },
  updateOfficer: async (id, data) => {
    const res = await api.put(`/admin/officers/${id}`, data);
    return res.data;
  },
  deleteOfficer: async (id) => {
    const res = await api.delete(`/admin/officers/${id}`);
    return res.data;
  },
  // Counters
  getCounters: async () => {
    const res = await api.get("/admin/counters");
    return res.data;
  },
  createCounter: async (data) => {
    const res = await api.post("/admin/counters", data);
    return res.data;
  },
  updateCounter: async (id, data) => {
    const res = await api.put(`/admin/counters/${id}`, data);
    return res.data;
  },
  deleteCounter: async (id) => {
    const res = await api.delete(`/admin/counters/${id}`);
    return res.data;
  },
  assignOfficer: async (counterId, officerId) => {
    const res = await api.post(`/admin/counters/${counterId}/assign-officer`, { officerId });
    return res.data;
  },
  removeOfficer: async (counterId) => {
    const res = await api.post(`/admin/counters/${counterId}/remove-officer`);
    return res.data;
  },
  // Appointments
  getAppointments: async (params) => {
    const res = await api.get("/admin/appointments", { params });
    return res.data;
  },
  // Statewide Hierarchy
  getHierarchyOverview: async () => {
    const res = await api.get("/admin/hierarchy-overview");
    return res.data;
  },
  getHierarchyDrillDown: async (params) => {
    const res = await api.get("/admin/drill-down", { params });
    return res.data;
  },
};

// ==========================================
// NOTIFICATION SERVICES
// ==========================================
export const notificationService = {
  getMy: async (limit = 30) => {
    const res = await api.get("/notifications", { params: { limit } });
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.patch("/notifications/read-all");
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};

// ==========================================
// GOVERNMENT OFFICE SERVICES
// ==========================================
export const officeService = {
  getAll: async (all = false, filters = {}) => {
    const res = await api.get("/offices", { params: { all, ...filters } });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/offices/${id}`);
    return res.data;
  },
  getDepartments: async (officeId) => {
    const res = await api.get(`/offices/${officeId}/departments`);
    return res.data;
  },
  getServices: async (officeId) => {
    const res = await api.get(`/offices/${officeId}/services`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/offices", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/offices/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/offices/${id}`);
    return res.data;
  },
};

// ==========================================
// LOCATION SERVICES (Tamil Nadu Statewide)
// ==========================================
export const locationService = {
  getStates: async () => {
    const res = await api.get("/locations/states");
    return res.data;
  },
  getDistricts: async (stateId) => {
    const res = await api.get(`/locations/districts/${stateId}`);
    return res.data;
  },
  getTaluks: async (districtId) => {
    const res = await api.get(`/locations/taluks/${districtId}`);
    return res.data;
  },
  getOfficesByTaluk: async (talukId) => {
    const res = await api.get(`/locations/offices/${talukId}`);
    return res.data;
  },
  createState: async (data) => {
    const res = await api.post("/locations/states", data);
    return res.data;
  },
  createDistrict: async (data) => {
    const res = await api.post("/locations/districts", data);
    return res.data;
  },
  createTaluk: async (data) => {
    const res = await api.post("/locations/taluks", data);
    return res.data;
  },
};

// ==========================================
// APPLICATION WORKFLOW SERVICES
// ==========================================
export const applicationService = {
  create: async (data) => {
    const res = await api.post("/applications", data);
    return res.data;
  },
  getMy: async () => {
    const res = await api.get("/applications/my");
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/applications/${id}`);
    return res.data;
  },
  track: async (query) => {
    const res = await api.get(`/applications/track/${encodeURIComponent(query)}`);
    return res.data;
  },
  getAll: async (params) => {
    const res = await api.get("/applications", { params });
    return res.data;
  },
  updateStatus: async (id, data) => {
    const res = await api.patch(`/applications/${id}/status`, data);
    return res.data;
  },
  uploadDocument: async (id, formData) => {
    const res = await api.post(`/applications/${id}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  verifyDocument: async (docId, data) => {
    const res = await api.patch(`/applications/documents/${docId}/verify`, data);
    return res.data;
  },
};

// ==========================================
// FEEDBACK SERVICES
// ==========================================
export const feedbackService = {
  submit: async (data) => {
    const res = await api.post("/feedback", data);
    return res.data;
  },
  getMy: async () => {
    const res = await api.get("/feedback/my");
    return res.data;
  },
  getAnalytics: async () => {
    const res = await api.get("/feedback/analytics");
    return res.data;
  },
};

// ==========================================
// SERVICE CATALOG SERVICES
// ==========================================
export const serviceCatalogService = {
  getAll: async (params) => {
    const res = await api.get("/service-catalog", { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/service-catalog/${id}`);
    return res.data;
  },
};

export default api;
