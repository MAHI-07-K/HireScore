import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const AUTH_TOKEN_KEY = "authToken";
const LEGACY_AUTH_TOKEN_KEY = "token";

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

  if (!config.headers) {
    config.headers = {};
  }

  if (token) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
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
    apiClient.post(`/students/${studentId}/upload-resume`, formData),
  verifyResume: (studentId: any) => apiClient.post(`/students/${studentId}/verify-resume`),
  getEligibleDrives: (studentId: any) => apiClient.get(`/students/${studentId}/drives/eligible`),
  getLockedDrives: (studentId: any) => apiClient.get(`/students/${studentId}/drives/locked`),
  getAllDrives: (studentId: any) => apiClient.get(`/students/${studentId}/drives`),
  applyForDrive: (studentId: any, driveId: any) => apiClient.post(`/students/${studentId}/drives/${driveId}/apply`),
};

// Verification APIs
export const verificationAPI = {
  get: (studentId: any) => apiClient.get(`/verification/${studentId}`),
  start: () => apiClient.post('/verification/start'),
  upload: (formData: FormData) => apiClient.post('/verification/upload', formData),
  submit: () => apiClient.post('/verification/submit'),
  update: (payload: any) => apiClient.patch('/verification/update', payload),
  history: (studentId: any) => apiClient.get(`/verification/history/${studentId}`),
};

export default apiClient;
