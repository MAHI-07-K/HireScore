import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: any) => apiClient.post("/auth/register", data),
  login: (data: any) => apiClient.post("/auth/login", data),
  getProfile: () => apiClient.get("/auth/profile"),
};

// Student APIs
export const studentAPI = {
  getProfile: (studentId: any) => apiClient.get(`/students/${studentId}`),
  getDashboard: (studentId: any) => apiClient.get(`/students/${studentId}/dashboard`),
  uploadResume: (studentId: any, formData: any) =>
    apiClient.post(`/students/${studentId}/upload-resume`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  verifyResume: (studentId: any) => apiClient.post(`/students/${studentId}/verify-resume`),
  getEligibleDrives: (studentId: any) => apiClient.get(`/students/${studentId}/drives/eligible`),
  getLockedDrives: (studentId: any) => apiClient.get(`/students/${studentId}/drives/locked`),
  getAllDrives: (studentId: any) => apiClient.get(`/students/${studentId}/drives`),
  applyForDrive: (studentId: any, driveId: any) =>
    apiClient.post(`/students/${studentId}/drives/${driveId}/apply`),
};

export default apiClient;
