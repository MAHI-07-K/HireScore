"use client";

import React, { useState } from "react";
import { studentAPI } from "@/services/api";

interface Drive {
  _id: string;
  company: string;
  role: string;
  description: string;
  location: string;
  minCGPA: number;
  minConfidenceScore: number;
  requiredSkills: string[];
  deadline: string;
  lockReasons?: string[];
}

interface DrivesSectionProps {
  drives: Drive[];
  studentId: string;
  isLocked: boolean;
  onApplySuccess: () => void;
}

export default function DrivesSection({
  drives,
  studentId,
  isLocked,
  onApplySuccess,
}: DrivesSectionProps) {
  const [applyingDriveId, setApplyingDriveId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleApplyForDrive = async (driveId: string) => {
    try {
      setApplyingDriveId(driveId);
      setError("");

      await studentAPI.applyForDrive(studentId, driveId);
      onApplySuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to apply for drive");
      setApplyingDriveId(null);
    }
  };

  if (drives.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center py-8">
          {isLocked ? "No locked drives at this time." : "No available drives at this time."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {drives.map((drive) => (
          <div key={drive._id} className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{drive.company}</h3>
                <p className="text-lg text-indigo-600 font-semibold">{drive.role}</p>
              </div>
              {isLocked ? (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                  Locked
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  Available
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-4">{drive.description || "No description provided"}</p>

            {/* Requirements */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold mb-1">Minimum CGPA</p>
                <p className="text-lg font-bold text-gray-900">{drive.minCGPA}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold mb-1">Min Confidence Score</p>
                <p className="text-lg font-bold text-gray-900">{drive.minConfidenceScore}%</p>
              </div>
            </div>

            {/* Deadline */}
            <div className="mb-4 text-sm text-gray-600">
              <span className="font-semibold">Deadline:</span>{" "}
              {new Date(drive.deadline).toLocaleDateString()}
            </div>

            {/* Required Skills */}
            {drive.requiredSkills && drive.requiredSkills.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {drive.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lock Reasons */}
            {isLocked && drive.lockReasons && drive.lockReasons.length > 0 && (
              <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-sm font-semibold text-red-700 mb-2">Reasons for Lock:</p>
                <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                  {drive.lockReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply Button */}
            {!isLocked && (
              <button
                onClick={() => handleApplyForDrive(drive._id)}
                disabled={applyingDriveId === drive._id}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                {applyingDriveId === drive._id ? "Applying..." : "Apply Now"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
