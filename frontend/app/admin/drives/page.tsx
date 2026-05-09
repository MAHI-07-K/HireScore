"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { driveAPI } from "@/services/api";
import { Edit2, Trash2, Plus, Search, X } from "lucide-react";
import DriveForm from "@/components/drives/DriveForm";
import DeleteDriveModal from "@/components/drives/DeleteDriveModal";

interface Drive {
  _id: string;
  title: string;
  company: string;
  location?: string;
  deadline?: string;
  postedDate?: string;
}

export default function DrivesPage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDrive, setEditingDrive] = useState<Drive | null>(null);
  const [deletingDrive, setDeletingDrive] = useState<Drive | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDrives();
  }, [page, search]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const response = await driveAPI.getDrives({
        search,
        page,
        limit: 10,
      });
      setDrives(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to fetch drives");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDrive = () => {
    setEditingDrive(null);
    setShowForm(true);
  };

  const handleEditDrive = (drive: Drive) => {
    setEditingDrive(drive);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDrive(null);
  };

  const handleFormSubmit = async () => {
    handleCloseForm();
    await fetchDrives();
  };

  const handleDeleteSuccess = async () => {
    setDeletingDrive(null);
    await fetchDrives();
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Manage Recruitment Drives</h1>
          <button
            onClick={handleAddDrive}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Drive
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search drives by title, company, or location..."
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

        {/* Drives Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading drives...</p>
            </div>
          ) : drives.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No drives found. Create one to get started!</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Posted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Deadline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {drives.map((drive) => (
                      <tr key={drive._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {drive.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {drive.company}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {drive.location || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(drive.postedDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(drive.deadline)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEditDrive(drive)}
                              className="text-indigo-600 hover:text-indigo-800 transition-colors"
                              title="Edit drive"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingDrive(drive)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete drive"
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

              {/* Pagination */}
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

      {/* Add/Edit Drive Modal */}
      {showForm && (
        <DriveForm
          drive={editingDrive}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingDrive && (
        <DeleteDriveModal
          drive={deletingDrive}
          onClose={() => setDeletingDrive(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </AdminLayout>
  );
}
