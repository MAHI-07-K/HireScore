"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminAPI } from "@/services/api";
import { Users, TrendingUp, Award, CheckCircle, Loader2 } from "lucide-react";

interface AnalyticsData {
  totalStudents: number;
  averageConfidenceScore: number;
  averageHireScore: number;
  totalVerifiedStudents: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  loading?: boolean;
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {loading ? (
          <div className="flex items-center mt-1">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <span className="ml-2 text-2xl font-bold text-gray-900">...</span>
          </div>
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data.data);
      setError("");
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of student verification and scoring</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={analytics?.totalStudents || 0}
            icon={Users}
            color="bg-indigo-600"
            loading={loading}
          />
          <StatCard
            title="Average Confidence Score"
            value={`${analytics?.averageConfidenceScore || 0}%`}
            icon={TrendingUp}
            color="bg-green-600"
            loading={loading}
          />
          <StatCard
            title="Average HireScore"
            value={`${analytics?.averageHireScore || 0}%`}
            icon={Award}
            color="bg-purple-600"
            loading={loading}
          />
          <StatCard
            title="Verified Students"
            value={analytics?.totalVerifiedStudents || 0}
            icon={CheckCircle}
            color="bg-blue-600"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <h3 className="font-medium text-gray-900">View All Students</h3>
              <p className="text-sm text-gray-600">Browse and manage student profiles</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Award className="h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-medium text-gray-900">Generate Reports</h3>
              <p className="text-sm text-gray-600">Export student data and analytics</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <CheckCircle className="h-8 w-8 text-purple-500 mb-2" />
              <h3 className="font-medium text-gray-900">Verification Queue</h3>
              <p className="text-sm text-gray-600">Review pending verifications</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}