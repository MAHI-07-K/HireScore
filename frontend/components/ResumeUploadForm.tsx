"use client";

import { DragEvent, FormEvent, useMemo, useState } from "react";

type VerificationField = {
  status: string;
  explanation: string;
};

type StudentResult = {
  studentId: string;
  resumeId: string;
  parsedData: {
    skills: string[];
    projects: string[];
    certifications: string[];
  };
  verificationCompleted: boolean;
  verificationResults: {
    projects: VerificationField;
    certifications: VerificationField;
  };
  confidenceScore: number;
  riskLevel: string;
  missingVerificationAlerts: string[];
  eligibility: {
    isEligible: boolean;
    reason: string;
  };
  appliedDrives: string[];
  createdAt: string;
};

type Drive = {
  id: string;
  company: string;
  role: string;
  location: string;
  minConfidenceScore: number;
  isEligible: boolean;
  alreadyApplied: boolean;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function ResumeUploadForm() {
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

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("githubUsername", githubUsername.trim());
    formData.append("certificateLinks", certificateLinks.trim());

    try {
      setIsSubmitting(true);

      const response = await fetch(`${apiBaseUrl}/api/students/submit`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Student submission failed");
      }

      setStudent(payload.data);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Student submission failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!student) return;

    try {
      setError("");
      setIsVerifying(true);

      const response = await fetch(
        `${apiBaseUrl}/api/students/${student.studentId}/verify`,
        {
          method: "POST",
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Verification failed");
      }

      setStudent(payload.data);

      const drivesResponse = await fetch(
        `${apiBaseUrl}/api/students/${student.studentId}/drives`
      );
      const drivesPayload = await drivesResponse.json();

      if (!drivesResponse.ok) {
        throw new Error(drivesPayload.message || "Could not load drives");
      }

      setDrives(drivesPayload.data);
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Verification failed"
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

      const response = await fetch(
        `${apiBaseUrl}/api/students/${student.studentId}/drives/${driveId}/apply`,
        {
          method: "POST",
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Could not apply for drive");
      }

      setDrives((currentDrives) =>
        currentDrives.map((drive) =>
          drive.id === driveId ? { ...drive, alreadyApplied: true } : drive
        )
      );
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "Could not apply for drive"
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
                Resume stored. Verification is currently{" "}
                {student.verificationCompleted ? "completed" : "pending"}.
              </p>
            </div>

            <ResultGroup title="Projects" items={student.parsedData.projects} />
            <ResultGroup
              title="Certifications"
              items={student.parsedData.certifications}
            />

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
                    Confidence: {student.confidenceScore}/100
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Risk level: {student.riskLevel}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Eligibility:{" "}
                    {student.eligibility.isEligible
                      ? "Eligible for drives"
                      : "Not eligible yet"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {student.eligibility.reason}
                  </p>
                </div>

                {student.missingVerificationAlerts.length ? (
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
                value.status === "verified"
                  ? "bg-emerald-100 text-emerald-800"
                  : value.status === "partial"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
              }`}
            >
              {value.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{value.explanation}</p>
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
          key={drive.id}
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
              onClick={() => onApply(drive.id)}
              disabled={!drive.isEligible || drive.alreadyApplied || applyingDriveId === drive.id}
              className="h-9 rounded-md bg-signal px-3 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {drive.alreadyApplied
                ? "Applied"
                : applyingDriveId === drive.id
                  ? "Applying..."
                  : "Apply"}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {drive.isEligible
              ? "Eligible to apply."
              : "Complete verification and meet the confidence threshold to apply."}
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
