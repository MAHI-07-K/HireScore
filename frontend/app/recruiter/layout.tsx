'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RecruiterLayoutProps {
  children: React.ReactNode;
}

export default function RecruiterLayout({ children }: RecruiterLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('recruiterToken');
    localStorage.removeItem('recruiterData');
    router.push('/recruiter/auth');
  };

  const navItems = [
    { href: '/recruiter/dashboard', label: 'Dashboard' },
    { href: '/recruiter/manage-rounds', label: 'Manage Rounds' },
    { href: '/recruiter/live-applications', label: 'Live Applications' },
    { href: '/recruiter/pipeline', label: 'Recruitment Pipeline' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">HireScore - Recruiter</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}