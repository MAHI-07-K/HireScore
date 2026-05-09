"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    rollNumber: "",
    password: "",
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    rollNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "",
    branch: "",
    cgpa: "",
  });

  // Ensure component is mounted on client before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(loginForm.rollNumber, loginForm.password);
      // Redirect based on user type
      const isAdminUser = loginForm.rollNumber.startsWith("ADMIN");
      router.push(isAdminUser ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const TEST_STUDENT = {
    rollNumber: "24B11CS219",
    password: "password123",
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate CGPA
    const cgpa = parseFloat(registerForm.cgpa);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      setError("CGPA must be a number between 0 and 10");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName: registerForm.fullName,
        rollNumber: registerForm.rollNumber,
        email: registerForm.email,
        password: registerForm.password,
        college: registerForm.college,
        branch: registerForm.branch,
        cgpa: cgpa,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestStudentLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      await login(TEST_STUDENT.rollNumber, TEST_STUDENT.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
      suppressHydrationWarning
    >
      <div 
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-8"
        suppressHydrationWarning
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HireScore</h1>
          <p className="text-gray-600 mt-2">AI-Powered Resume Verification</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => {
              setIsLoginMode(true);
              setError("");
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              isLoginMode
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLoginMode(false);
              setError("");
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              !isLoginMode
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Register
          </button>
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={handleTestStudentLogin}
            className="w-full py-2 px-4 rounded-lg font-semibold transition bg-yellow-400 text-gray-900 hover:bg-yellow-500"
            disabled={isLoading}
          >
            {isLoading ? "Logging in test student..." : "Login as Test Student"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        {isLoginMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNumber"
                value={loginForm.rollNumber}
                onChange={handleLoginChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="Enter your roll number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={registerForm.fullName}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNumber"
                value={registerForm.rollNumber}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="Your roll number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="Your email"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College
                </label>
                <input
                  type="text"
                  name="college"
                  value={registerForm.college}
                  onChange={handleRegisterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
                  placeholder="College name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  name="branch"
                  value={registerForm.branch}
                  onChange={handleRegisterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
                  placeholder="Branch"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CGPA (0-10)
              </label>
              <input
                type="number"
                name="cgpa"
                value={registerForm.cgpa}
                onChange={handleRegisterChange}
                min="0"
                max="10"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="Your CGPA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="Create password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="Confirm password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
