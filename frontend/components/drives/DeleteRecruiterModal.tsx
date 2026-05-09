"use client";

import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { adminAPI } from "@/services/api";

interface Recruiter {
  _id: string;
  companyName: string;
  recruiterId: string;
}

interface DeleteRecruiterModalProps {
  recruiter: Recruiter;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteRecruiterModal({ recruiter, onClose, onSuccess }: DeleteRecruiterModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      // For now, we'll just show not implemented since we don't have a delete API
      setError("Deleting recruiters is not yet implemented.");
      // await adminAPI.deleteRecruiter(recruiter._id);
      // onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete recruiter.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delete Recruiter</h2>
              <p className="text-sm text-gray-500">
                This action cannot be undone. The recruiter account will be permanently removed.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete the recruiter account for <span className="font-semibold">{recruiter.companyName}</span> with ID <span className="font-semibold">{recruiter.recruiterId}</span>?
          </p>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {deleting ? "Deleting..." : "Delete Recruiter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
