import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const AUTH_TOKEN_KEY = "authToken";
const LEGACY_AUTH_TOKEN_KEY = "token";

const normalizeId = (id: any) => {
  if (typeof id === "string") return id;
  if (id && typeof id === "object") {
    if (typeof id.studentId === "string") return id.studentId;
    if (typeof id._id === "string") return id._id;
    if (typeof id.toString === "function") {
      const value = id.toString();
      if (value && value !== "[object Object]") {
        return value;
      }
    }
  }
  throw new Error("Invalid ID provided");
};

export const getStoredAuthToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    localStorage.getItem(LEGACY_AUTH_TOKEN_KEY)
  );
};

export const setStoredAuthToken = (token: string) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
};

export const clearStoredAuthToken = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptor to include token
apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Add error response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network error or server is unreachable:", error.message);
      return Promise.reject(
        new Error(
          `Unable to connect to server. Please ensure the backend is running on ${API_BASE_URL}`
        )
      );
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: any) => apiClient.post("/auth/register", data),
  login: (data: any) => apiClient.post("/auth/login", data),
  getProfile: () => apiClient.get("/auth/profile"),
};

// Student APIs
export const studentAPI = {
  getProfile: () => apiClient.get(`/auth/profile`),
  getDashboard: () => apiClient.get(`/auth/profile`),
  uploadResume: (formData: any) => apiClient.post(`/verification/upload`, formData),
  verifyResume: () => apiClient.post(`/verification/submit`),
  getResume: () => apiClient.get(`/verification/resume`),
  getEligibleDrives: () => apiClient.get(`/auth/profile`),
  getLockedDrives: () => apiClient.get(`/auth/profile`),
  getAllDrives: () => apiClient.get(`/auth/profile`),
  applyForDrive: (_studentId: any, _driveId: any) =>
    Promise.reject(new Error("Drive application is not supported by the current backend.")),
};

// Verification APIs
export const verificationAPI = {
  get: (studentId: any) => apiClient.get(`/verification/${normalizeId(studentId)}`),
  start: () => apiClient.post('/verification/start'),
  upload: (formData: FormData) => apiClient.post('/verification/upload', formData),
  submit: () => apiClient.post('/verification/submit'),
  update: (payload: any) => apiClient.patch('/verification/update', payload),
  history: (studentId: any) => apiClient.get(`/verification/history/${normalizeId(studentId)}`),
};

// Admin APIs
export const adminAPI = {
  getAnalytics: () => apiClient.get('/admin/analytics'),
  getStudents: (params?: any) => apiClient.get('/admin/students', { params }),
  getStudentDetail: (studentId: string) => apiClient.get(`/admin/students/${studentId}`),
  getRecruiters: (params?: any) => apiClient.get('/admin/recruiters', { params }),
  createRecruiter: (data: any) => apiClient.post('/admin/create-recruiter', data),
};

// Drive APIs
export const driveAPI = {
  getDrives: (params?: any) => apiClient.get('/drives', { params }),
  getDriveById: (driveId: string) => apiClient.get(`/drives/${driveId}`),
  createDrive: (data: any) => apiClient.post('/drives', data),
  updateDrive: (driveId: string, data: any) => apiClient.put(`/drives/${driveId}`, data),
  deleteDrive: (driveId: string) => apiClient.delete(`/drives/${driveId}`),
};

export default apiClient;
