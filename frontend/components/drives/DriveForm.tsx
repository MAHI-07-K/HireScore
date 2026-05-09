"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { driveAPI } from "@/services/api";

interface Drive {
  _id: string;
  companyName: string;
  recruiterId: string;
  recruiterPassword: string;
  deadline?: string;
}

interface DriveFormProps {
  drive: Drive | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function DriveForm({ drive, onClose, onSubmit }: DriveFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [recruiterId, setRecruiterId] = useState("");
  const [recruiterPassword, setRecruiterPassword] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (drive) {
      setCompanyName(drive.companyName || "");
      setRecruiterId(drive.recruiterId || "");
      setRecruiterPassword(drive.recruiterPassword || "");
      setDeadline(drive.deadline ? drive.deadline.split("T")[0] : "");
    }
  }, [drive]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!companyName.trim() || !recruiterId.trim() || !recruiterPassword.trim()) {
      setError("Company name, recruiter ID, and password are required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        companyName: companyName.trim(),
        recruiterId: recruiterId.trim(),
        recruiterPassword: recruiterPassword.trim(),
        deadline: deadline || undefined,
      };

      if (drive?._id) {
        await driveAPI.updateDrive(drive._id, payload);
      } else {
        await driveAPI.createDrive(payload);
      }

      onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Unable to save drive.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {drive ? "Edit Drive" : "Add New Drive"}
            </h2>
            <p className="text-sm text-gray-500">
              Manage recruitment drive credentials and deadline.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 px-6 py-5">
          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-gray-700">
              Company Name
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              Recruiter ID
              <input
                value={recruiterId}
                onChange={(e) => setRecruiterId(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-gray-700">
              Recruiter Password
              <input
                type="password"
                value={recruiterPassword}
                onChange={(e) => setRecruiterPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              Deadline
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : drive ? "Update Drive" : "Create Drive"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
