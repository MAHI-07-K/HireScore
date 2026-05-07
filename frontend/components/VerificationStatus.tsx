"use client";

import React from "react";

interface VerificationStatusProps {
  verificationStatus: string;
  confidenceScore: number;
  riskLevel: string;
  onRefresh: () => void;
}

export default function VerificationStatus({
  verificationStatus,
  confidenceScore,
  riskLevel,
  onRefresh,
}: VerificationStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low Risk":
        return "text-green-600";
      case "Medium Risk":
        return "text-yellow-600";
      case "High Risk":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Verification Status</h2>
        <button
          onClick={onRefresh}
          className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {/* Status Badge */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">
            Status
          </label>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
              verificationStatus
            )}`}
          >
            {verificationStatus?.charAt(0).toUpperCase() +
              verificationStatus?.slice(1).replace("-", " ")}
          </span>
        </div>

        {/* Confidence Score */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">
            Confidence Score
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${confidenceScore}%` }}
                ></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-indigo-600 w-20 text-right">
              {confidenceScore}%
            </span>
          </div>
        </div>

        {/* Risk Level */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">
            Risk Level
          </label>
          <p className={`font-semibold text-lg ${getRiskColor(riskLevel)}`}>
            {riskLevel}
          </p>
        </div>

        {/* Score Interpretation */}
        <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-200">
          {confidenceScore >= 81 ? (
            <p className="text-sm text-blue-800">
              <span className="font-semibold">✓ Highly Trustworthy</span> - Your
              resume has strong verification evidence.
            </p>
          ) : confidenceScore >= 61 ? (
            <p className="text-sm text-blue-800">
              <span className="font-semibold">✓ Strong Verification</span> -
              Your resume has good verification evidence.
            </p>
          ) : confidenceScore >= 41 ? (
            <p className="text-sm text-blue-800">
              <span className="font-semibold">⚠ Partial Verification</span> -
              Some aspects of your resume need verification.
            </p>
          ) : confidenceScore >= 21 ? (
            <p className="text-sm text-blue-800">
              <span className="font-semibold">⚠ Weak Evidence</span> - Limited
              verification evidence found.
            </p>
          ) : (
            <p className="text-sm text-blue-800">
              <span className="font-semibold">⚠ No Supporting Evidence</span> -
              Upload and verify your resume to generate a score.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
