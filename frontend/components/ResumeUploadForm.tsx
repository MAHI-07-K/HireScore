"use client";

import { DragEvent, FormEvent, useMemo, useState } from "react";
import { studentAPI } from "@/services/api";

type VerificationField = {
  status: string;
  explanation: string;
};

type StudentResult = {
  studentId: string;
  fullName: string;
  rollNumber: string;
  email: string;
  college: string;
  branch: string;
  cgpa: number;
  resumeUrl: string | null;
  resumeId: string;
  verificationStatus: string;
  confidenceData: {
    score: number;
    riskLevel: string;
    strengths: string[];
    concerns: string[];
    label?: string;
  };
  verificationResults: {
    education?: VerificationField;
    internships?: VerificationField;
    projects?: VerificationField;
    certifications?: VerificationField;
  };
  isEligibleForDrives: boolean;
  hireScore: number;
  appliedDrives: string[];
  verificationCompleted?: boolean;
  confidenceScore?: number;
  riskLevel?: string;
  eligibility?: {
    isEligible: boolean;
    reason: string;
  };
  missingVerificationAlerts?: string[];
  createdAt: string;
  updatedAt: string;
};

type Drive = {
  _id: string;
  company: string;
  role: string;
  location: string;
  minConfidenceScore: number;
  requiredSkills?: string[];
  deadline?: string;
  alreadyApplied?: boolean;
};

interface ResumeUploadFormProps {
  studentId: string;
  onVerificationComplete: () => void;
}

export function ResumeUploadForm({ studentId, onVerificationComplete }: ResumeUploadFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [certificateLinks, setCertificateLinks] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [applyingDriveId, setApplyingDriveId] = useState("");
  const [error, setError] = useState("");
  const [student, setStudent] = useState<StudentResult | null>(null);
  const [drives, setDrives] = useState<Drive[]>([]);

  const fileLabel = useMemo(() => {
    if (!resumeFile) return "Drop PDF resume here or choose a file";
    return `${resumeFile.name} (${(resumeFile.size / 1024 / 1024).toFixed(2)} MB)`;
  }, [resumeFile]);

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

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStudent(null);
    setDrives([]);

    if (!resumeFile) {
      setError("Select a PDF resume before submitting.");
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

      const response = await studentAPI.uploadResume(formData);
      setStudent(response.data.data);
      setError("");
    } catch (submitError: any) {
      setError(
        submitError.response?.data?.message ||
          (submitError instanceof Error ? submitError.message : "Student submission failed")
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

      const response = await studentAPI.verifyResume();
      setStudent(response.data.data);
      setError("");

      const drivesResponse = await studentAPI.getAllDrives();
      setDrives(drivesResponse.data.data.eligibleDrives || []);

      onVerificationComplete();
    } catch (verificationError: any) {
      setError(
        verificationError.response?.data?.message ||
          (verificationError instanceof Error ? verificationError.message : "Verification failed")
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleApply = async (driveId: string) => {
    if (!student) return;

    try {
      setError("");
      setApplyingDriveId(driveId);

      await studentAPI.applyForDrive(student.studentId, driveId);

      setDrives((currentDrives) =>
        currentDrives.map((drive) =>
          drive._id === driveId ? { ...drive, alreadyApplied: true } : drive
        )
      );
    } catch (applyError: any) {
      setError(
        applyError.response?.data?.message ||
          (applyError instanceof Error ? applyError.message : "Could not apply for drive")
      );
    } finally {
      setApplyingDriveId("");
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">
            Student Module Workflow
          </p>
          <div className="grid gap-2 text-sm text-slate-600">
            <p>1. Create student profile</p>
            <p>2. Validate resume when ready</p>
            <p>3. Apply for eligible drives</p>
          </div>
        </div>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
            isDragging
              ? "border-signal bg-teal-50"
              : "border-slate-300 bg-slate-50 hover:border-signal"
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            suppressHydrationWarning
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <span className="text-base font-semibold text-ink">{fileLabel}</span>
          <span className="mt-2 text-sm text-slate-500">
            Maximum file size: 5 MB
          </span>
        </label>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">
              GitHub username
            </span>
            <input
              value={githubUsername}
              onChange={(event) => setGithubUsername(event.target.value)}
              placeholder="octocat"
              suppressHydrationWarning
              className="h-11 rounded-md border border-slate-300 px-3 text-ink outline-none transition focus:border-signal focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">
              Certificate links or IDs
            </span>
            <textarea
              value={certificateLinks}
              onChange={(event) => setCertificateLinks(event.target.value)}
              placeholder="One link or certificate ID per line"
              rows={4}
              suppressHydrationWarning
              className="resize-y rounded-md border border-slate-300 px-3 py-2 text-ink outline-none transition focus:border-signal focus:ring-2 focus:ring-teal-100"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          suppressHydrationWarning
          className="mt-6 h-11 w-full rounded-md bg-signal px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Creating student profile..." : "Enter student module"}
        </button>
      </form>

      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Student dashboard</h2>
        {!student ? (
          <p className="mt-3 text-sm text-slate-500">
            Create the student profile first. Resume validation and drive
            applications appear in the next steps.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                Student profile created
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Resume stored. Verification is currently {student.verificationStatus}.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">Score</p>
                <p className="mt-1 text-sm text-slate-600">{student.confidenceData?.score ?? 0}/100</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">Risk Level</p>
                <p className="mt-1 text-sm text-slate-600">{student.confidenceData?.riskLevel || "Unknown"}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
              className="h-11 w-full rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isVerifying ? "Validating resume..." : "Validate resume"}
            </button>

            {student.verificationCompleted ? (
              <>
                <VerificationStatusList
                  verificationResults={student.verificationResults}
                />
                <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Confidence: {student.confidenceScore ?? 0}/100
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Risk level: {student.riskLevel || "Unknown"}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Eligibility:{" "}
                    {student.eligibility?.isEligible
                      ? "Eligible for drives"
                      : "Not eligible yet"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {student.eligibility?.reason || "Resume verification has not met the drive threshold yet."}
                  </p>
                </div>

                {student.missingVerificationAlerts?.length ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-semibold text-amber-900">
                      Missing verification alerts
                    </p>
                    <ul className="mt-2 space-y-2">
                      {student.missingVerificationAlerts.map((alert) => (
                        <li key={alert} className="text-sm text-amber-800">
                          {alert}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <DriveList
                  drives={drives}
                  applyingDriveId={applyingDriveId}
                  onApply={handleApply}
                />
              </>
            ) : null}
          </div>
        )}
      </aside>
    </section>
  );
}

function VerificationStatusList({
  verificationResults,
}: {
  verificationResults: StudentResult["verificationResults"];
}) {
  const items = [
    ["Projects", verificationResults.projects],
    ["Certifications", verificationResults.certifications],
  ] as const;

  return (
    <div className="space-y-3">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-800">{label}</p>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                value?.status === "verified"
                  ? "bg-emerald-100 text-emerald-800"
                  : value?.status === "partial"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
              }`}
            >
              {value?.status || "missing"}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {value?.explanation || "No verification result available yet."}
          </p>
        </div>
      ))}
    </div>
  );
}

function DriveList({
  drives,
  applyingDriveId,
  onApply,
}: {
  drives: Drive[];
  applyingDriveId: string;
  onApply: (driveId: string) => Promise<void>;
}) {
  if (!drives.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-600">
          Validate the resume to load available drives.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Available drives</h3>
      {drives.map((drive) => (
        <div
          key={drive._id}
          className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {drive.company}
              </p>
              <p className="mt-1 text-sm text-slate-600">{drive.role}</p>
              <p className="mt-1 text-xs text-slate-500">
                {drive.location} • Min confidence {drive.minConfidenceScore}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onApply(drive._id)}
              disabled={drive.alreadyApplied || applyingDriveId === drive._id}
              className="h-9 rounded-md bg-signal px-3 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {drive.alreadyApplied
                ? "Applied"
                : applyingDriveId === drive._id
                  ? "Applying..."
                  : "Apply"}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Eligible to apply once resume verification completes successfully.
          </p>
        </div>
      ))}
    </div>
  );
}

function ResultGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {items.length ? (
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">No entries found.</p>
      )}
    </div>
  );
}
