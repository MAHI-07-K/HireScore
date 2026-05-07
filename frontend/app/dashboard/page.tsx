"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { studentAPI } from "@/services/api";
import { ResumeUploadForm } from "@/components/ResumeUploadForm";
import DrivesSection from "@/components/DrivesSection";
import VerificationStatus from "@/components/VerificationStatus";

interface DashboardData {
  profile: any;
  verificationStatus: string;
  confidenceScore: number;
  riskLevel: string;
  eligibilityStatus: {
    isEligible: boolean;
    minScoreRequired: number;
    currentScore: number;
  };
  availableDrives: any[];
  lockedDrives: any[];
  appliedDrives: any[];
}

export default function Dashboard() {
  const router = useRouter();
  const { student, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!student) {
      router.push("/auth");
      return;
    }

    fetchDashboard();
  }, [student, router]);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await studentAPI.getDashboard(student?.studentId);
      setDashboardData(response.data.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HireScore Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {student?.fullName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Profile */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Roll Number</h3>
            <p className="text-2xl font-bold text-gray-900">{student?.rollNumber}</p>
          </div>

          {/* CGPA */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">CGPA</h3>
            <p className="text-2xl font-bold text-gray-900">{student?.cgpa.toFixed(2)}</p>
          </div>

          {/* College */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">College</h3>
            <p className="text-xl font-semibold text-gray-900 truncate">{student?.college || "N/A"}</p>
          </div>

          {/* Branch */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Branch</h3>
            <p className="text-xl font-semibold text-gray-900 truncate">{student?.branch || "N/A"}</p>
          </div>
        </div>

        {/* Verification & Confidence Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Verification Status */}
          <VerificationStatus
            verificationStatus={dashboardData?.verificationStatus || "pending"}
            confidenceScore={dashboardData?.confidenceScore || 0}
            riskLevel={dashboardData?.riskLevel || "unknown"}
            onRefresh={fetchDashboard}
          />

          {/* Eligibility Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Drive Eligibility</h2>

            <div className="mb-6">
              <div className="flex items-center mb-3">
                {dashboardData?.eligibilityStatus.isEligible ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-green-700 font-semibold">Eligible for Drives</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-red-700 font-semibold">Not Eligible</span>
                  </div>
                )}
              </div>

              {!dashboardData?.eligibilityStatus.isEligible && (
                <p className="text-sm text-gray-600 mb-4">
                  Resume verification score must be at least{" "}
                  <span className="font-bold">
                    {dashboardData?.eligibilityStatus.minScoreRequired}%
                  </span>
                  . Current: {dashboardData?.eligibilityStatus.currentScore}%
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Current Score:</span>{" "}
                {dashboardData?.eligibilityStatus.currentScore}%
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Required Score:</span>{" "}
                {dashboardData?.eligibilityStatus.minScoreRequired}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div
                  className={`h-2.5 rounded-full ${
                    dashboardData?.eligibilityStatus.isEligible
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (dashboardData?.eligibilityStatus.currentScore || 0) * 1.42,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("resume")}
            className={`py-3 px-4 font-semibold transition ${
              activeTab === "resume"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Resume Upload
          </button>
          <button
            onClick={() => setActiveTab("drives")}
            className={`py-3 px-4 font-semibold transition ${
              activeTab === "drives"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Available Drives ({dashboardData?.availableDrives.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("locked")}
            className={`py-3 px-4 font-semibold transition ${
              activeTab === "locked"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Locked Drives ({dashboardData?.lockedDrives.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "resume" && (
          <ResumeUploadForm />
        )}

        {activeTab === "drives" && (
          <DrivesSection
            drives={dashboardData?.availableDrives || []}
            studentId={student?.studentId || ""}
            isLocked={false}
            onApplySuccess={fetchDashboard}
          />
        )}

        {activeTab === "locked" && (
          <DrivesSection
            drives={dashboardData?.lockedDrives || []}
            studentId={student?.studentId || ""}
            isLocked={true}
            onApplySuccess={fetchDashboard}
          />
        )}
      </main>
    </div>
  );
}
