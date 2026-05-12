import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVerificationStore } from "@/store/verificationStore";
import { motion } from "framer-motion";

export default function VerificationCard() {
  const router = useRouter();
  const { data, loading, fetch } = useVerificationStore();
  const studentId = data?.studentId || ""; // will be set after fetch

  useEffect(() => {
    if (studentId) {
      fetch(studentId);
    }
  }, [studentId, fetch]);

  const handleClick = () => {
    router.push("/dashboard/verification");
  };

  const status = data?.verificationStatus || "Not Started";
  const score = data?.overallScore || 0;

  const bgClass = "bg-white/70 backdrop-blur-lg shadow-lg rounded-xl p-6";

  return (
    <motion.div
      className={bgClass}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Resume Verification</h2>
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading...</p>
        ) : (
          <>
            <p className="text-sm text-gray-600">Status: <span className="font-medium">{status}</span></p>
            <div className="flex items-center">
              <div className="w-32 h-32">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="2"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${score}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  <text x="18" y="20.35" className="percentage text-sm font-bold" textAnchor="middle" fill="#3b82f6">
                    {score}%
                  </text>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Overall Score</p>
                <p className="text-3xl font-bold" style={{color: '#E89A3B'}}>{score}</p>
              </div>
            </div>
          </>
        )}
        <button
          className="mt-2 self-start bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md shadow-blue-500/50"
        >
          Manage Verification →
        </button>
      </div>
    </motion.div>
  );
}
