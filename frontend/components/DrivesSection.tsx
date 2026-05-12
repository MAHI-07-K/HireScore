"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getStoredAuthToken } from "@/services/api";

interface LiveDrive {
  _id: string;
  companyName: string;
  role: string;
  description: string;
  minCgpa: number;
  requiredSkills: string[];
  totalRounds: number;
}

interface DrivesSectionProps {
  studentId: string;
  studentProfile?: any;
  canApply: boolean;
  onApplySuccess: () => void;
}

export default function DrivesSection({
  studentId,
  studentProfile,
  canApply,
  onApplySuccess,
}: DrivesSectionProps) {
  const [liveDrives, setLiveDrives] = useState<LiveDrive[]>([]);
  const [applyingDriveId, setApplyingDriveId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveDrives();
  }, []);

  const fetchLiveDrives = async () => {
    try {
      const response = await axios.get('/api/drive/live');
      setLiveDrives(response.data.drives);
    } catch (err: any) {
      setError('Failed to fetch live drives');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForDrive = async (driveId: string) => {
    try {
      setApplyingDriveId(driveId);
      setError("");

      const token = localStorage.getItem('token'); // Assuming student token
      await axios.post('/api/drive/apply', { driveId }, {
        headers: { Authorization: `Bearer ${getStoredAuthToken()}` }
      });

      onApplySuccess();
      alert('Applied successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to apply for drive");
    } finally {
      setApplyingDriveId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading live drives...</div>;
  }

  const isEligibleForDrive = (drive: LiveDrive) => {
    if (!canApply) return false;
    if (!studentProfile) return false;
    
    if (drive.minCgpa !== undefined && (studentProfile.cgpa || 0) < drive.minCgpa) {
      return false;
    }
    
    if (drive.requiredSkills && drive.requiredSkills.length > 0) {
      const studentSkills = (studentProfile.skills || []).map((s: string) => s.toLowerCase());
      const missingSkills = drive.requiredSkills.filter(rs => !studentSkills.includes(rs.toLowerCase()));
      if (missingSkills.length > 0) return false;
    }
    
    return true;
  };

  const getEligibilityMessage = (drive: LiveDrive) => {
    if (!canApply) return "Confidence Score < 60";
    if (!studentProfile) return "Profile missing";
    
    if (drive.minCgpa !== undefined && (studentProfile.cgpa || 0) < drive.minCgpa) {
      return `Requires CGPA ${drive.minCgpa}`;
    }
    
    if (drive.requiredSkills && drive.requiredSkills.length > 0) {
      const studentSkills = (studentProfile.skills || []).map((s: string) => s.toLowerCase());
      const missingSkills = drive.requiredSkills.filter(rs => !studentSkills.includes(rs.toLowerCase()));
      if (missingSkills.length > 0) return "Missing required skills";
    }
    
    return "Not eligible";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Live Recruitment Drives</h2>

      {error && (
        <div className="mb-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {liveDrives.length === 0 ? (
        <p className="text-gray-600">No live recruitment drives available.</p>
      ) : (
        <div className="space-y-4">
          {liveDrives.map((drive) => (
            <div key={drive._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {drive.companyName} - {drive.role}
                  </h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    LIVE
                  </span>
                </div>
                <button
                  onClick={() => handleApplyForDrive(drive._id)}
                  disabled={applyingDriveId === drive._id || !isEligibleForDrive(drive)}
                  className="text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{backgroundColor: '#E89A3B'}}
                >
                  {applyingDriveId === drive._id
                    ? 'Applying...'
                    : isEligibleForDrive(drive)
                    ? 'Apply'
                    : getEligibilityMessage(drive)}
                </button>
              </div>

              <p className="text-gray-700 mb-2">{drive.description}</p>

              <div className="text-sm text-gray-600">
                <p><strong>Min CGPA:</strong> {drive.minCgpa || "N/A"}</p>
                <p><strong>Required Skills:</strong> {drive.requiredSkills && drive.requiredSkills.length > 0 ? drive.requiredSkills.join(", ") : "None"}</p>
                <p><strong>Rounds:</strong> {drive.totalRounds}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
