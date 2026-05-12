"use client";

import React, { useMemo, useState, useEffect } from "react";
import { studentAPI } from "@/services/api";

interface Project {
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
}

interface VerificationStatusProps {
  studentId: string;
  resumeUploaded: boolean;
  verificationStatus: string;
  confidenceScore: number;
  latestScore: number;
  feedback: string[];
  riskLevel: string;
  onRefresh: () => void;
}

export default function VerificationStatus({
  studentId,
  resumeUploaded,
  verificationStatus,
  confidenceScore,
  latestScore,
  feedback,
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        if (!studentId) return;
        const response = await studentAPI.getResume();
        const resumeData = response?.data?.data;
        if (resumeData?.parsedData?.projects) {
          setProjects(resumeData.parsedData.projects);
        }
        if (resumeData?.parsedData?.skills) {
          setSkills(resumeData.parsedData.skills);
        }
      } catch (err) {
        // Silently fail - resume data is optional
        console.debug("Failed to fetch resume data:", err);
      }
    };

    fetchResumeData();
  }, [studentId, resumeUploaded]);

  const normalizedStatus = verificationStatus?.toString().toLowerCase() || "not started";

  const fileLabel = useMemo(() => {
    if (!resumeFile) return "Drop PDF resume here or choose a file";
    return `${resumeFile.name} (${(resumeFile.size / 1024 / 1024).toFixed(2)} MB)`;
  }, [resumeFile]);

  const getStatusColor = (status: string) => {
    const normalized = status?.toString().toLowerCase();
    switch (normalized) {
      case "verified":
      case "completed":
        return "bg-green-100 text-green-800";
      case "partially verified":
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      case "not started":
        return "bg-gray-100 text-gray-800";
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

  const getStatusLabel = (status: string) => {
    if (!status) return "Not Started";
    return status
      .toString()
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const isVerified = ["verified", "completed"].includes(normalizedStatus);

  const lastScore = latestScore || confidenceScore;

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
    formData.append("file", resumeFile);
    formData.append("githubUsername", githubUsername.trim());
    formData.append("certificateLinks", certificateLinks.trim());

    try {
      setIsSubmitting(true);
      await studentAPI.uploadResume(formData);
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
      await studentAPI.verifyResume();
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
        <h2 className="text-xl font-bold text-gray-800">Verification Status</h2>
        <button
          onClick={onRefresh}
          className="font-semibold text-sm transition hover:opacity-80" style={{color: '#E89A3B', cursor: 'pointer'}}
        >
          Refresh
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">Status</label>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
              verificationStatus
            )}`}
          >
            {getStatusLabel(verificationStatus)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Latest Resume Score</p>
            <p className="text-3xl font-bold" style={{color: '#E89A3B'}}>{lastScore}%</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Risk Level</p>
            <p className={`font-semibold text-lg ${getRiskColor(riskLevel)}`}>{riskLevel}</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Feedback</p>
          {feedback && feedback.length ? (
            <ul className="space-y-2 text-sm text-gray-700">
              {feedback.map((item, index) => (
                <li key={index} className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No detailed feedback has been generated yet. Upload and validate your resume to see item-level guidance.</p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Skills</p>
          {skills && skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full border border-orange-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No skills found in your resume. Upload and validate your resume to see extracted skills here.</p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Projects</p>
          {projects && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project, index) => (
                <div key={index} className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
                  {project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold hover:opacity-80 hover:underline" style={{color: '#E89A3B'}}
                    >
                      {project.name}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-gray-700">{project.name}</p>
                  )}
                  {project.description && (
                    <p className="text-xs text-gray-500 mt-1">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="text-xs rounded px-2 py-1" style={{backgroundColor: '#FFE0D1', color: '#C2410C'}}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No projects found in your resume. Upload and validate your resume to see extracted projects here.</p>
          )}
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800 mb-2">
              {resumeUploaded ? "Replace your existing resume" : "Upload your resume to start verification"}
            </p>
            {resumeUploaded ? (
              <p className="text-sm text-slate-600 mb-3">
                Uploading a new resume will replace the previous one and reset verification status.
              </p>
            ) : null}

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
                  className="h-11 rounded-md border border-slate-300 px-3 text-ink outline-none transition focus:border-warm-500" style={{boxShadow: '0 0 0 2px rgba(232, 154, 59, 0.1)'}}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Certificate links or IDs</span>
                <textarea
                  value={certificateLinks}
                  onChange={(event) => setCertificateLinks(event.target.value)}
                  placeholder="One link or certificate ID per line"
                  rows={3}
                  className="resize-y rounded-md border border-slate-300 px-3 py-2 text-ink outline-none transition focus:border-warm-500" style={{boxShadow: '0 0 0 2px rgba(232, 154, 59, 0.1)'}}
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
            className="h-11 w-full rounded-md px-4 text-sm font-semibold text-white transition shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none" style={{backgroundColor: '#E89A3B'}}
          >
            {isSubmitting ? "Uploading resume..." : resumeUploaded ? "Replace resume" : "Upload resume"}
          </button>
        </form>

        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="h-11 w-full rounded-md bg-orange-500 px-4 text-sm font-semibold text-white transition shadow-md shadow-orange-500/50 hover:bg-orange-600 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        >
          {isVerifying
            ? "Validating resume..."
            : isVerified
            ? "Reverify resume"
            : "Validate resume"}
        </button>
      </div>
    </div>
  );
}
