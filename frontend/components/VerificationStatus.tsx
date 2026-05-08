"use client";

import React, { useMemo, useState } from "react";
import { studentAPI } from "@/services/api";

interface VerificationStatusProps {
  studentId: string;
  resumeUploaded: boolean;
  verificationStatus: string;
  confidenceScore: number;
  riskLevel: string;
  onRefresh: () => void;
}

export default function VerificationStatus({
  studentId,
  resumeUploaded,
  verificationStatus,
  confidenceScore,
  riskLevel,
  onRefresh,
}: VerificationStatusProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [certificateLinks, setCertificateLinks] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const fileLabel = useMemo(() => {
    if (!resumeFile) return "Drop PDF resume here or choose a file";
    return `${resumeFile.name} (${(resumeFile.size / 1024 / 1024).toFixed(2)} MB)`;
  }, [resumeFile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low Risk":
        return "text-green-600";
      case "Medium Risk":
        return "text-yellow-600";
      case "High Risk":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleFile = (file?: File) => {
    setError("");

    if (!file) return;

    if (file.type !== "application/pdf") {
      setResumeFile(null);
      setError("Please upload a PDF resume.");
      return;
    }

    setResumeFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!resumeFile) {
      setError("Select a PDF resume before uploading.");
      return;
    }

    if (!studentId) {
      setError("Student identity is required. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("githubUsername", githubUsername.trim());
    formData.append("certificateLinks", certificateLinks.trim());

    try {
      setIsSubmitting(true);
      await studentAPI.uploadResume(studentId, formData);
      setError("");
      setResumeFile(null);
      setGithubUsername("");
      setCertificateLinks("");
      onRefresh();
    } catch (uploadError: any) {
      setError(
        uploadError.response?.data?.message ||
          (uploadError instanceof Error ? uploadError.message : "Upload failed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!studentId) {
      setError("Student identity is required. Please login again.");
      return;
    }

    try {
      setError("");
      setIsVerifying(true);
      await studentAPI.verifyResume(studentId);
      setError("");
      onRefresh();
    } catch (verificationError: any) {
      setError(
        verificationError.response?.data?.message ||
          (verificationError instanceof Error ? verificationError.message : "Verification failed")
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Verification Status</h2>
        <button
          onClick={onRefresh}
          className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
        >
          Refresh
        </button>
      </div>

      {!resumeUploaded ? (
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800 mb-2">
              Upload your resume to start verification
            </p>
            <label
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 text-center transition ${
                isDragging
                  ? "border-slate-500 bg-slate-100"
                  : "border-slate-300 bg-white hover:border-slate-500"
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              <span className="text-sm font-semibold text-slate-700">{fileLabel}</span>
              <span className="mt-2 text-sm text-slate-500">
                Drag & drop a PDF or click to choose a file.
              </span>
            </label>

            <div className="mt-4 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">GitHub username</span>
                <input
                  value={githubUsername}
                  onChange={(event) => setGithubUsername(event.target.value)}
                  placeholder="octocat"
                  className="h-11 rounded-md border border-slate-300 px-3 text-ink outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Certificate links or IDs</span>
                <textarea
                  value={certificateLinks}
                  onChange={(event) => setCertificateLinks(event.target.value)}
                  placeholder="One link or certificate ID per line"
                  rows={3}
                  className="resize-y rounded-md border border-slate-300 px-3 py-2 text-ink outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Uploading resume..." : "Upload resume"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Status</label>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                verificationStatus
              )}`}
            >
              {verificationStatus?.charAt(0).toUpperCase() +
                verificationStatus?.slice(1).replace("-", " ")}
            </span>
          </div>

          {verificationStatus === "completed" ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Confidence Score
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${confidenceScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-indigo-600 w-20 text-right">
                    {confidenceScore}%
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Risk Level
                </label>
                <p className={`font-semibold text-lg ${getRiskColor(riskLevel)}`}>
                  {riskLevel}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                {confidenceScore >= 81 ? (
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">✓ Highly Trustworthy</span> - Your resume has strong verification evidence.
                  </p>
                ) : confidenceScore >= 61 ? (
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">✓ Strong Verification</span> - Your resume has good verification evidence.
                  </p>
                ) : confidenceScore >= 41 ? (
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">⚠ Partial Verification</span> - Some aspects of your resume need verification.
                  </p>
                ) : confidenceScore >= 21 ? (
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">⚠ Weak Evidence</span> - Limited verification evidence found.
                  </p>
                ) : (
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">⚠ No Supporting Evidence</span> - Upload and verify your resume to generate a score.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-700">
                Your resume is uploaded, but verification has not completed yet. Click the button below to run verification.
              </p>
            </div>
          )}

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="h-11 w-full rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {verificationStatus === "completed"
              ? isVerifying
                ? "Reverifying..."
                : "Reverify resume"
              : isVerifying
              ? "Validating resume..."
              : "Validate resume"}
          </button>
        </div>
      )}
    </div>
  );
}
