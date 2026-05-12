"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { adminAPI } from "@/services/api";
import { Edit2, Trash2, Plus, Search, X } from "lucide-react";
import RecruiterForm from "@/components/drives/RecruiterForm";
import DeleteRecruiterModal from "@/components/drives/DeleteRecruiterModal";

interface Recruiter {
  _id: string;
  companyName: string;
  recruiterId: string;
  accountExpiryDate: string;
  hasDriveCreated: boolean;
}

export default function RecruitersPage() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);
  const [deletingRecruiter, setDeletingRecruiter] = useState<Recruiter | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRecruiters();
  }, [page, search]);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getRecruiters({ search, page, limit: 10 });
      setRecruiters(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch recruiters");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecruiter = () => {
    setEditingRecruiter(null);
    setShowForm(true);
  };

  const handleEditRecruiter = (recruiter: Recruiter) => {
    setEditingRecruiter(recruiter);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecruiter(null);
  };

  const handleFormSubmit = async () => {
    handleCloseForm();
    await fetchRecruiters();
  };

  const handleDeleteSuccess = async () => {
    setDeletingRecruiter(null);
    await fetchRecruiters();
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Manage Recruiters</h1>
          <button
            onClick={handleAddRecruiter}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Recruiter
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company or recruiter ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 ml-2 outline-none text-gray-700"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading recruiters...</p>
            </div>
          ) : recruiters.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No recruiters found. Create one to get started!</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Recruiter ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Account Expiry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Drive Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recruiters.map((recruiter) => (
                      <tr key={recruiter._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {recruiter.companyName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {recruiter.recruiterId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(recruiter.accountExpiryDate)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            recruiter.hasDriveCreated
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {recruiter.hasDriveCreated ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEditRecruiter(recruiter)}
                              className="hover:opacity-80 transition-colors" style={{color: '#E89A3B'}}
                              title="Edit recruiter"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingRecruiter(recruiter)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete recruiter"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <RecruiterForm
          recruiter={editingRecruiter}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {deletingRecruiter && (
        <DeleteRecruiterModal
          recruiter={deletingRecruiter}
          onClose={() => setDeletingRecruiter(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </AdminLayout>
  );
}
