'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Drive {
  _id: string;
  companyName: string;
  role: string;
  totalRounds: number;
  driveStatus: string;
  isLive: boolean;
  applicationsOpen: boolean;
}

export default function RecruiterDashboard() {
  const [drive, setDrive] = useState<Drive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchDrive();
  }, []);

  const fetchDrive = async () => {
    try {
      const token = localStorage.getItem('recruiterToken');
      if (!token) {
        router.push('/recruiter/auth');
        return;
      }

      const response = await axios.get('/api/drive/current', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDrive(response.data.drive);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch drive');
    } finally {
      setLoading(false);
    }
  };

  const handleGoLive = async () => {
    try {
      const token = localStorage.getItem('recruiterToken');
      await axios.post('/api/drive/go-live', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchDrive();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to go live');
    }
  };

  const handleCloseApplications = async () => {
    try {
      const token = localStorage.getItem('recruiterToken');
      await axios.post('/api/drive/close-applications', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchDrive();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to close applications');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!drive) {
    return <div className="min-h-screen flex items-center justify-center">No drive found</div>;
  }

  const getStatusBadge = () => {
    if (drive.driveStatus === 'live') return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">LIVE</span>;
    if (drive.driveStatus === 'applications_closed') return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">APPLICATIONS CLOSED</span>;
    if (drive.driveStatus === 'active') return <span className="px-2 py-1 rounded-full text-xs" style={{backgroundColor: '#FFE0D1', color: '#C2410C'}}>RECRUITMENT ACTIVE</span>;
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">DRAFT</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 warm-theme">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Company Name</h3>
            <p className="text-2xl font-bold" style={{color: '#E89A3B'}}>{drive.companyName}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Job Role</h3>
            <p className="text-2xl font-bold" style={{color: '#E89A3B'}}>{drive.role}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Current Round</h3>
            <p className="text-2xl font-bold" style={{color: '#E89A3B'}}>1</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Rounds</h3>
            <p className="text-2xl font-bold" style={{color: '#E89A3B'}}>{drive.totalRounds}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Drive Status</h2>
            {getStatusBadge()}
          </div>

          <div className="flex space-x-4">
            {!drive.isLive && (
              <button
                onClick={handleGoLive}
                className="text-white px-4 py-2 rounded hover:opacity-90"
                style={{backgroundColor: '#E89A3B'}}
              >
                Go Live
              </button>
            )}

            {drive.isLive && drive.applicationsOpen && (
              <button
                onClick={handleCloseApplications}
                className="text-white px-4 py-2 rounded hover:opacity-90"
                style={{backgroundColor: '#E89A3B'}}
              >
                Close Applications
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/recruiter/manage-rounds')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Manage Rounds</h3>
            <p className="text-gray-600">Create and manage recruitment rounds</p>
          </button>

          <button
            onClick={() => router.push('/recruiter/live-applications')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Live Applications</h3>
            <p className="text-gray-600">Review and select candidates</p>
          </button>

          <button
            onClick={() => router.push('/recruiter/pipeline')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Recruitment Pipeline</h3>
            <p className="text-gray-600">Track candidate progress</p>
          </button>
        </div>

        {error && (
          <div className="mt-4 text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}