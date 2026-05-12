"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { adminAPI } from "@/services/api";
import {
  ArrowLeft,
  Mail,
  User,
  GraduationCap,
  Code,
  Award,
  FileText,
  ExternalLink,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Project {
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
}

interface VerificationHistory {
  status: string;
  score: number;
  timestamp: string;
  feedback: string[];
}

interface StudentDetail {
  _id: string;
  fullName: string;
  rollNumber: string;
  email: string;
  college: string;
  branch: string;
  cgpa: number;
  githubUsername: string;
  certificateLinks: string[];
  confidenceScore: number;
  hireScore: number;
  verificationStatus: string;
  feedback: string[];
  verifiedSkills: string[];
  projects: Project[];
  skills: string[];
  certifications: Certification[];
  resumeLink: string | null;
  verificationHistory: VerificationHistory[];
  createdAt: string;
  updatedAt: string;
}

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-green-600 bg-green-100";
  if (score >= 40) return "text-yellow-600 bg-yellow-100";
  return "text-red-600 bg-red-100";
};

const getStatusColor = (status: string) => {
  const normalized = status?.toLowerCase();
  switch (normalized) {
    case "verified":
      return "bg-green-100 text-green-800";
    case "partially verified":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ScoreCard = ({
  title,
  score,
  icon: Icon,
  color,
}: {
  title: string;
  score: number;
  icon: any;
  color: string;
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{score}%</p>
      </div>
    </div>
  </div>
);

export default function AdminStudentDetail() {
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (studentId) {
      fetchStudentDetail();
    }
  }, [studentId]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStudentDetail(studentId);
      setStudent(response.data.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !student) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center">
            <Link
              href="/admin/students"
              className="flex items-center hover:opacity-80" style={{color: '#E89A3B'}}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Students
            </Link>
          </div>
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {error || "Student not found"}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/admin/students"
              className="flex items-center hover:opacity-80 mr-4" style={{color: '#E89A3B'}}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Students
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.fullName}</h1>
              <p className="text-gray-600">Roll Number: {student.rollNumber}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              student.verificationStatus
            )}`}
          >
            {student.verificationStatus}
          </span>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScoreCard
            title="Confidence Score"
            score={student.confidenceScore}
            icon={TrendingUp}
            color="bg-warm-600"
          />
          <ScoreCard
            title="HireScore"
            score={student.hireScore}
            icon={Award}
            color="bg-purple-500"
          />
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">Full Name</label>
              <p className="mt-1 text-sm text-gray-900">{student.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Roll Number</label>
              <p className="mt-1 text-sm text-gray-900">{student.rollNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <p className="mt-1 text-sm text-gray-900 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                {student.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">CGPA</label>
              <p className="mt-1 text-sm text-gray-900">{student.cgpa}/10</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">College</label>
              <p className="mt-1 text-sm text-gray-900">{student.college}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Branch</label>
              <p className="mt-1 text-sm text-gray-900">{student.branch}</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Code className="h-5 w-5 mr-2" />
            Skills ({student.skills.length})
          </h2>
          {student.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    student.verifiedSkills.includes(skill)
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {student.verifiedSkills.includes(skill) && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills found</p>
          )}
        </div>

        {/* Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Projects ({student.projects.length})
          </h2>
          {student.projects.length > 0 ? (
            <div className="space-y-4">
              {student.projects.map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold hover:opacity-80 hover:underline flex items-center" style={{color: '#E89A3B'}}
                        >
                          {project.name}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      ) : (
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      )}
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                    </div>
                  </div>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{backgroundColor: '#FFE0D1', color: '#C2410C'}}
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
            <p className="text-gray-500">No projects found</p>
          )}
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Certifications ({student.certifications.length})
          </h2>
          {student.certifications.length > 0 ? (
            <div className="space-y-3">
              {student.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{cert.name}</h4>
                    {cert.issuer && (
                      <p className="text-sm text-gray-600">Issued by: {cert.issuer}</p>
                    )}
                  </div>
                  {cert.date && (
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {cert.date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No certifications found</p>
          )}
        </div>

        {/* Verification History */}
        {student.verificationHistory && student.verificationHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Verification History
            </h2>
            <div className="space-y-3">
              {student.verificationHistory.map((history, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        history.status
                      )}`}
                    >
                      {history.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(history.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 mr-2">Score:</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                        history.score
                      )}`}
                    >
                      {history.score}%
                    </span>
                  </div>
                  {history.feedback && history.feedback.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Feedback:</span>
                      <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                        {history.feedback.map((item, fbIndex) => (
                          <li key={fbIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resume Link */}
        {student.resumeLink && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Resume
            </h2>
            <a
              href={student.resumeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Resume
            </a>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}