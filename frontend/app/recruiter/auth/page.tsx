'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RecruiterLogin() {
  const [recruiterId, setRecruiterId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/recruiter/login', {
        recruiterId,
        password,
      });

      localStorage.setItem('recruiterToken', response.data.token);
      localStorage.setItem('recruiterData', JSON.stringify(response.data.recruiter));

      if (response.data.recruiter.hasDriveCreated) {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/recruiter/create-drive');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
        <div className="rounded-3xl bg-white/95 shadow-2xl ring-1 ring-slate-200 backdrop-blur-lg p-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white text-2xl font-bold">
              H
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] font-semibold" style={{color: '#E89A3B'}}>HireScore</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Recruiter Login</h1>
              <p className="mt-2 text-sm text-slate-500 max-w-md">
                Access your recruiter dashboard, manage recruitment drives, and review candidate applications quickly and securely.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Fast applicant review</p>
              <p className="mt-2 text-sm text-slate-600">Quickly screen applicants and move strong candidates through the pipeline.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Drive insights</p>
              <p className="mt-2 text-sm text-slate-600">Monitor live drives and keep track of your hiring progress in one place.</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Recruiter ID</span>
                <input
                  type="text"
                  required
                  value={recruiterId}
                  onChange={(e) => setRecruiterId(e.target.value)}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition"
                  placeholder="Enter your recruiter ID"
                  style={{
                    boxShadow: 'none',
                  }}
                  onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px rgba(232, 154, 59, 0.1), 0 0 0 1px #E89A3B')}
                  onBlur={(e) => (e.target.style.boxShadow = 'none')}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition"
                  placeholder="Enter your password"
                  style={{
                    boxShadow: 'none',
                  }}
                  onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px rgba(232, 154, 59, 0.1), 0 0 0 1px #E89A3B')}
                  onBlur={(e) => (e.target.style.boxShadow = 'none')}
                />
              </label>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in to Recruiter Portal'}
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] bg-slate-800 p-10 text-white shadow-2xl ring-1 ring-white/10">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Employer tools</p>
            <h2 className="mt-4 text-3xl font-bold">Manage recruitment with confidence</h2>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-slate-900/90 p-6">
              <p className="text-sm font-semibold text-emerald-300">Organized hiring</p>
              <p className="mt-2 text-sm text-slate-300">Keep all your recruitment drives, applicant progress, and round management in one place.</p>
            </div>
            <div className="rounded-3xl bg-slate-900/90 p-6">
              <p className="text-sm font-semibold text-emerald-300">Secure access</p>
              <p className="mt-2 text-sm text-slate-300">Your recruiter profile and drive controls are protected with secure login and token-based access.</p>
            </div>
            <div className="rounded-3xl bg-slate-900/90 p-6">
              <p className="text-sm font-semibold text-emerald-300">Fast onboarding</p>
              <p className="mt-2 text-sm text-slate-300">Create drives, review candidates, and move people through your pipeline faster than ever.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
