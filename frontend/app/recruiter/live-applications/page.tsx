'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Student {
  _id: string;
  fullName: string;
  skills: string[];
  hireScore: number;
  confidenceScore: number;
  resumeUrl?: string;
}

interface Application {
  _id: string;
  studentId: Student;
  applicationStatus: string;
}

export default function LiveApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('recruiterToken');
      if (!token) {
        router.push('/recruiter/auth');
        return;
      }

      const response = await axios.get('/api/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setApplications(response.data.applications);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('recruiterToken');
      await axios.post('/api/applications/select', { applicationId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchApplications();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to select candidate');
    }
  };

  const handleRejectCandidate = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('recruiterToken');
      await axios.post('/api/applications/reject', { applicationId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchApplications();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject candidate');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 warm-theme">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Live Applications</h1>
        </div>

        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HireScore
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {application.studentId.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.studentId.skills?.join(', ') || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.studentId.hireScore?.toFixed(1) || '0.0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.studentId.confidenceScore?.toFixed(1) || '0.0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.studentId.resumeUrl ? (
                      <a
                        href={application.studentId.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      application.applicationStatus === 'shortlisted'
                        ? 'bg-green-100 text-green-800'
                        : application.applicationStatus === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.applicationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {application.applicationStatus === 'applied' && (
                      <>
                        <button
                          onClick={() => handleSelectCandidate(application._id)}
                          className="hover:opacity-80" style={{color: '#E89A3B'}}
                        >
                          Select
                        </button>
                        <button
                          onClick={() => handleRejectCandidate(application._id)}
                          className="text-red-600 hover:text-red-900 ml-2"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {applications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No applications yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}