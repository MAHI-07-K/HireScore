import create from "zustand";
import { devtools } from "zustand/middleware";
import { verificationAPI } from "../services/api";

interface UploadedFile {
  fileName: string;
  url: string;
  type: string;
}

interface VerificationHistoryItem {
  status: string;
  score: number;
  timestamp: string;
  feedback: string[];
}

interface VerificationData {
  studentId: string;
  overallScore: number;
  verificationStatus: string;
  lastVerifiedAt: string | null;
  educationScore: number;
  skillsScore: number;
  certificationScore: number;
  projectScore: number;
  identityScore: number;
  uploadedFiles: UploadedFile[];
  feedback: string[];
  verificationHistory: VerificationHistoryItem[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

interface VerificationState {
  data: VerificationData | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
  fetch: (studentId: string) => Promise<void>;
  start: () => Promise<void>;
  uploadFile: (formData: FormData) => Promise<void>;
  submit: () => Promise<void>;
  updateUrls: (payload: { linkedinUrl?: string; githubUrl?: string; portfolioUrl?: string }) => Promise<void>;
  fetchHistory: (studentId: string) => Promise<void>;
}

export const useVerificationStore = create<VerificationState>()(
  devtools((set, get) => ({
    data: null,
    loading: false,
    error: null,
    uploadProgress: 0,
    async fetch(studentId) {
      set({ loading: true, error: null });
      try {
        const res = await verificationAPI.get(studentId);
        set({ data: res.data.data, loading: false });
      } catch (e: any) {
        set({ error: e.response?.data?.message || "Failed to load verification", loading: false });
      }
    },
    async start() {
      try {
        const res = await verificationAPI.start();
        set(state => ({ data: { ...state.data!, ...res.data.data } as any }));
      } catch (e: any) {
        set({ error: e.response?.data?.message || "Start verification failed" });
      }
    },
    async uploadFile(formData) {
      try {
        await verificationAPI.upload(formData);
        // after upload refresh data using stored studentId
        const studentId = get().data?.studentId || (await verificationAPI.getCurrentUser?.())?.data?.studentId;
        if (studentId) await get().fetch(studentId);
      } catch (e: any) {
        set({ error: e.response?.data?.message || "File upload failed" });
      }
    },
    async submit() {
      try {
        const res = await verificationAPI.submit();
        set(state => ({ data: { ...state.data!, ...res.data.data } as any }));
      } catch (e: any) {
        set({ error: e.response?.data?.message || "Verification submit failed" });
      }
    },
    async updateUrls(payload) {
      try {
        const res = await verificationAPI.update(payload);
        set(state => ({ data: { ...state.data!, ...res.data.data } as any }));
      } catch (e: any) {
        set({ error: e.response?.data?.message || "Update URLs failed" });
      }
    },
    async fetchHistory(studentId) {
      try {
        const res = await verificationAPI.history(studentId);
        set(state => ({ data: { ...state.data!, verificationHistory: res.data.data } as any }));
      } catch (e: any) {
        set({ error: e.response?.data?.message || "History fetch failed" });
      }
    },
  }))
);
