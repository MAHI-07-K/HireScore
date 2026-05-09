"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  authAPI,
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "@/services/api";

interface Student {
  studentId: string;
  fullName: string;
  rollNumber: string;
  email: string;
  college: string;
  branch: string;
  cgpa: number;
  resumeUrl: string | null;
  verificationStatus: string;
  isEligibleForDrives: boolean;
  hireScore: number;
  confidenceData?: {
    score: number;
    riskLevel: string;
    strengths: string[];
    concerns: string[];
  };
}

interface AuthContextType {
  student: Student | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (data: any) => Promise<void>;
  login: (rollNumber: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const savedToken = getStoredAuthToken();
    const savedStudent = localStorage.getItem("student");

    if (savedToken && savedStudent) {
      try {
        setStoredAuthToken(savedToken);
        setToken(savedToken);
        const parsed = JSON.parse(savedStudent);
        if (parsed?.studentId) parsed.studentId = String(parsed.studentId);
        setStudent(parsed);
      } catch (error) {
        // If localStorage is corrupted, clear it and start fresh
        console.error("Failed to parse stored student data:", error);
        clearStoredAuthToken();
        localStorage.removeItem("student");
      }
    }

    setIsLoading(false);
  }, []);

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(data);
      const { token, student } = response.data.data;
      const normalizedStudent = {
        ...student,
        studentId: String(student.studentId),
      };

      setStoredAuthToken(token);
      localStorage.setItem("student", JSON.stringify(normalizedStudent));

      setToken(token);
      setStudent(normalizedStudent);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (rollNumber: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ rollNumber, password });
      const { token, student } = response.data.data;
      const normalizedStudent = {
        ...student,
        studentId: String(student.studentId),
      };

      setStoredAuthToken(token);
      localStorage.setItem("student", JSON.stringify(normalizedStudent));

      setToken(token);
      setStudent(normalizedStudent);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredAuthToken();
    localStorage.removeItem("student");
    setToken(null);
    setStudent(null);
  };

  return (
    <AuthContext.Provider
      value={{
        student,
        token,
        isLoading,
        isAuthenticated: !!token,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
