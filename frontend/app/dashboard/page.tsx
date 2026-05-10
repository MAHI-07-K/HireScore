"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authAPI, verificationAPI } from "@/services/api";
import DrivesSection from "@/components/DrivesSection";
import VerificationStatus from "@/components/VerificationStatus";

interface DashboardData {
  profile: any;
  verificationStatus: string;
  confidenceScore: number;
  latestScore: number;
  verificationFeedback: string[];
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

const defaultDashboardState: DashboardData = {
  profile: null,
  verificationStatus: "pending",
  confidenceScore: 0,
  latestScore: 0,
  verificationFeedback: [],
  riskLevel: "High Risk",
  eligibilityStatus: {
    isEligible: false,
    minScoreRequired: 60,
    currentScore: 0,
  },
  availableDrives: [],
  lockedDrives: [],
  appliedDrives: [],
};

export default function Dashboard() {
  const router = useRouter();
  const { student, token, isLoading: isAuthLoading, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultDashboardState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthLoading) return;

    if (!student || !token) {
      router.push("/auth");
      return;
    }

    fetchDashboard();
  }, [student, token, isAuthLoading, router]);

  const computeEligibility = (score: number) => {
    const minScoreRequired = 60;
    return {
      isEligible: score >= minScoreRequired,
      minScoreRequired,
      currentScore: score,
    };
  };

  const computeRiskLevel = (score: number): string => {
    if (score >= 70) return "Low Risk";
    if (score >= 40) return "Medium Risk";
    return "High Risk";
  };

  const fetchDashboard = async () => {
    if (!token) {
      logout();
      router.push("/auth");
      return;
    }

    try {
      setIsLoading(true);
      const [profileResponse, verificationResponse] = await Promise.all([
        authAPI.getProfile(),
        verificationAPI.get(student?.studentId || ""),
      ]);

      const profile = profileResponse.data.data;
      const verification = verificationResponse.data.data;
      const confidenceScore =
        profile?.confidenceData?.score ?? verification?.overallScore ?? 0;
      const latestScore = verification?.overallScore ?? confidenceScore;
      const riskLevel = computeRiskLevel(latestScore);

      setDashboardData({
        profile,
        verificationStatus: verification?.verificationStatus || profile?.verificationStatus || "pending",
        confidenceScore,
        latestScore: verification?.overallScore ?? confidenceScore,
        verificationFeedback: verification?.feedback || [],
        riskLevel,
        eligibilityStatus: computeEligibility(confidenceScore),
        availableDrives: [],
        lockedDrives: [],
        appliedDrives: profile?.appliedDrives || [],
      });
      setError("");
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        router.push("/auth");
        return;
      }

      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  if (isAuthLoading || isLoading) {
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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

          {/* HireScore */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">HireScore</h3>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardData.profile?.hireScore?.toFixed(1) ?? 0}%
            </p>
          </div>
        </div>

        {/* Verification & Confidence Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Verification Status */}
          <VerificationStatus
            studentId={student?.studentId || ""}
            resumeUploaded={!!dashboardData?.profile?.resumeId}
            verificationStatus={dashboardData?.verificationStatus || "pending"}
            confidenceScore={dashboardData?.confidenceScore || 0}
            latestScore={dashboardData?.latestScore || 0}
            feedback={dashboardData?.verificationFeedback || []}
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

        <div className="space-y-8">
          <DrivesSection
            studentId={student?.studentId || ""}
            onApplySuccess={fetchDashboard}
          />
        </div>
      </main>
    </div>
  );
}
