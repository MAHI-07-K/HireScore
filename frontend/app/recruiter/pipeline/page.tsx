'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Student {
  _id: string;
  fullName: string;
}

interface DriveCandidate {
  _id: string;
  studentId: Student;
  currentRound: number;
  completedRounds: number;
  remainingRounds: number;
  status: 'active' | 'selected' | 'rejected' | 'completed';
  driveScore: number;
}

export default function RecruitmentPipeline() {
  const [candidates, setCandidates] = useState<DriveCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<DriveCandidate | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('recruiterToken');
      if (!token) {
        router.push('/recruiter/auth');
        return;
      }

      const response = await axios.get('/api/pipeline', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCandidates(response.data.candidates);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (result: 'selected' | 'rejected') => {
    if (!selectedCandidate) return;

    try {
      const token = localStorage.getItem('recruiterToken');
      await axios.post('/api/pipeline/update-stage', {
        candidateId: selectedCandidate._id,
        result
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowModal(false);
      setSelectedCandidate(null);
      fetchCandidates();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update candidate stage');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-500 text-white';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getProgressPercentage = (candidate: DriveCandidate) => {
    const totalRounds = candidate.completedRounds + candidate.remainingRounds;
    return totalRounds > 0 ? (candidate.completedRounds / totalRounds) * 100 : 0;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 warm-theme">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recruitment Pipeline</h1>
        </div>

        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {candidate.studentId.fullName}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      Drive Score: {candidate.driveScore}
                    </span>
                  </div>
                </div>
                {candidate.status === 'active' && (
                  <button
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      setShowModal(true);
                    }}
                    className="text-white px-4 py-2 rounded hover:opacity-90"
                    style={{backgroundColor: '#E89A3B'}}
                  >
                    Complete Round
                  </button>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{candidate.completedRounds}/{candidate.completedRounds + candidate.remainingRounds} rounds</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: '#E89A3B', width: `${getProgressPercentage(candidate)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Current Round:</span> {candidate.currentRound}
                </div>
                <div>
                  <span className="font-medium">Completed:</span> {candidate.completedRounds}
                </div>
                <div>
                  <span className="font-medium">Remaining:</span> {candidate.remainingRounds}
                </div>
              </div>
            </div>
          ))}
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No candidates in the pipeline yet.
          </div>
        )}

        {/* Modal */}
        {showModal && selectedCandidate && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Complete Round for {selectedCandidate.studentId.fullName}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Did the candidate clear Round {selectedCandidate.currentRound}?
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleUpdateStage('selected')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    Selected
                  </button>
                  <button
                    onClick={() => handleUpdateStage('rejected')}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                  >
                    Rejected
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedCandidate(null);
                  }}
                  className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}