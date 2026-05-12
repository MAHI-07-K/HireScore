'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Round {
  _id: string;
  roundName: string;
  roundNumber: number;
  status: 'upcoming' | 'active' | 'completed';
}

interface Drive {
  _id: string;
  totalRounds: number;
}

export default function ManageRounds() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [drive, setDrive] = useState<Drive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [formData, setFormData] = useState({
    roundName: '',
    roundNumber: 1
  });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('recruiterToken');
      if (!token) {
        router.push('/recruiter/auth');
        return;
      }

      const [driveResponse, roundsResponse] = await Promise.all([
        axios.get('/api/drive/current', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/rounds', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setDrive(driveResponse.data.drive);
      setRounds(roundsResponse.data.rounds);
    } catch (err: any) {
      console.error('Fetch data error:', err);
      if (err.response?.status === 404 && err.response?.data?.error === 'Drive not found') {
        setDrive(null);
      } else {
        setError(err.response?.data?.error || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('recruiterToken');
      await axios.post('/api/rounds/create', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowCreateForm(false);
      setFormData({ roundName: '', roundNumber: 1 });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create round');
    }
  };

  const handleUpdateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRound) return;

    try {
      const token = localStorage.getItem('recruiterToken');
      await axios.put('/api/rounds/update', {
        roundId: editingRound._id,
        roundName: formData.roundName,
        roundNumber: formData.roundNumber
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditingRound(null);
      setFormData({ roundName: '', roundNumber: 1 });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update round');
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    if (!confirm('Are you sure you want to delete this round?')) return;

    try {
      const token = localStorage.getItem('recruiterToken');
      await axios.delete('/api/rounds/delete', {
        data: { roundId },
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete round');
    }
  };

  const handleActivateRound = async (roundId: string) => {
    try {
      const token = localStorage.getItem('recruiterToken');
      await axios.post('/api/rounds/activate', { roundId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to activate round');
    }
  };

  const handleCompleteRound = async (roundId: string) => {
    try {
      const token = localStorage.getItem('recruiterToken');
      await axios.post('/api/rounds/complete', { roundId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete round');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'px-2 py-1 rounded text-white bg-orange-500';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!drive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Drive Found</h2>
          <p className="text-gray-600 mb-4">You need to create a drive first before managing rounds.</p>
          <button
            onClick={() => router.push('/recruiter/dashboard')}
            className="text-white px-4 py-2 rounded hover:opacity-90"
            style={{backgroundColor: '#E89A3B'}}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 warm-theme">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Rounds</h1>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-white px-4 py-2 rounded hover:opacity-90"
            style={{backgroundColor: '#E89A3B'}}
          >
            Create Round
          </button>
        </div>

        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {(showCreateForm || editingRound) && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingRound ? 'Edit Round' : 'Create Round'}
            </h2>
            <form onSubmit={editingRound ? handleUpdateRound : handleCreateRound}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Round Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roundName}
                    onChange={(e) => setFormData({...formData, roundName: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Round Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={drive.totalRounds}
                    required
                    value={formData.roundNumber}
                    onChange={(e) => setFormData({...formData, roundNumber: parseInt(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  {editingRound ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingRound(null);
                    setFormData({ roundName: '', roundNumber: 1 });
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rounds Timeline */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Rounds Timeline</h2>
          <div className="space-y-4">
            {rounds
              .sort((a, b) => a.roundNumber - b.roundNumber)
              .map((round, index) => (
                <div key={round._id} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{round.roundName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(round.status)}`}>
                        {round.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {round.status === 'upcoming' && (
                      <button
                        onClick={() => handleActivateRound(round._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Activate
                      </button>
                    )}
                    {round.status === 'active' && (
                      <button
                        onClick={() => handleCompleteRound(round._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingRound(round);
                        setFormData({
                          roundName: round.roundName,
                          roundNumber: round.roundNumber
                        });
                      }}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRound(round._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}