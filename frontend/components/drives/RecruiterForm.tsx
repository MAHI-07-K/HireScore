"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { adminAPI } from "@/services/api";

interface Recruiter {
  _id: string;
  companyName: string;
  recruiterId: string;
  accountExpiryDate: string;
}

interface RecruiterFormProps {
  recruiter: Recruiter | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function RecruiterForm({ recruiter, onClose, onSubmit }: RecruiterFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [recruiterId, setRecruiterId] = useState("");
  const [password, setPassword] = useState("");
  const [accountExpiryDate, setAccountExpiryDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (recruiter) {
      setCompanyName(recruiter.companyName || "");
      setRecruiterId(recruiter.recruiterId || "");
      setAccountExpiryDate(recruiter.accountExpiryDate ? recruiter.accountExpiryDate.split("T")[0] : "");
      setPassword(""); // Don't show existing password for security
    } else {
      // Reset form for new recruiter
      setCompanyName("");
      setRecruiterId("");
      setPassword("");
      setAccountExpiryDate("");
    }
  }, [recruiter]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!companyName.trim() || !recruiterId.trim() || !password.trim() || !accountExpiryDate) {
      setError("All fields are required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        companyName: companyName.trim(),
        recruiterId: recruiterId.trim(),
        password: password.trim(),
        accountExpiryDate,
      };

      if (recruiter?._id) {
        // For editing, we'd need an update API - for now just show not implemented
        setError("Editing recruiters is not yet implemented.");
        return;
      } else {
        await adminAPI.createRecruiter(payload);
      }

      onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Unable to save recruiter.");
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
              {recruiter ? "Edit Recruiter" : "Add New Recruiter"}
            </h2>
            <p className="text-sm text-gray-500">
              Create recruiter account for recruitment management.
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
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              Account Expiry Date
              <input
                type="date"
                value={accountExpiryDate}
                onChange={(e) => setAccountExpiryDate(e.target.value)}
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
              {saving ? "Saving..." : recruiter ? "Update Recruiter" : "Create Recruiter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
