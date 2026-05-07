# HireScore - Student Module Setup Guide

## Overview

HireScore is an AI-powered Resume Verification System with a Student Module that enables:
- Student registration and authentication
- Resume upload and verification using AI
- Confidence score calculation
- Drive eligibility management
- Recruiter drive application system

## Project Structure

```
backend/
├── config/
├── controllers/
│   ├── auth.controller.js       (NEW)
│   ├── student.controller.js    (Updated)
│   └── resume.controller.js
├── middleware/
│   ├── auth.middleware.js       (NEW)
│   ├── errorHandler.js
│   └── upload.middleware.js
├── models/
│   ├── student.model.js         (Updated)
│   ├── drive.model.js           (Updated)
│   ├── resume.model.js
│   └── ...
├── routes/
│   ├── auth.routes.js           (NEW)
│   ├── student.routes.js        (Updated)
│   └── ...
├── services/
│   ├── confidenceService.js     (Updated)
│   ├── eligibilityService.js    (NEW)
│   ├── student.service.js       (Updated)
│   ├── verificationService.js
│   └── ...
├── phase2-verification/         (Existing - Integrated)
├── app.js                       (Updated)
└── server.js

frontend/
├── app/
│   ├── auth/                    (NEW)
│   │   └── page.tsx
│   ├── dashboard/               (NEW)
│   │   └── page.tsx
│   ├── layout.tsx               (Updated)
│   ├── page.tsx                 (Updated)
│   └── globals.css
├── components/
│   ├── ResumeUploadForm.tsx     (Updated)
│   ├── VerificationStatus.tsx   (NEW)
│   ├── DrivesSection.tsx        (NEW)
│   └── ...
├── context/
│   └── AuthContext.tsx          (NEW)
├── services/
│   └── api.ts                   (NEW)
└── package.json
```

## Installation & Setup

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

   New dependencies added:
   - `bcryptjs` - Password hashing
   - `jsonwebtoken` - JWT authentication

2. **Environment variables (.env):**
   ```bash
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/hirescore
   FRONTEND_ORIGIN=http://localhost:3000
   UPLOAD_DIR=uploads
   GITHUB_API_BASE_URL=https://api.github.com
   GITHUB_TOKEN=your_github_token
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=llama-3.1-8b-instant
   EXISTING_VERIFICATION_MODULE_URL=http://127.0.0.1:5000/api/verify/full
   JWT_SECRET=your_jwt_secret_key_change_in_production
   ```

3. **Start MongoDB:**
   ```bash
   # On Windows
   mongod

   # On macOS (using Homebrew)
   brew services start mongodb-community
   ```

4. **Start backend server:**
   ```bash
   npm run dev
   ```

   Server runs on http://localhost:5000

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment variables (.env.local):**
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```

   Frontend runs on http://localhost:3000

## API Endpoints

### Authentication APIs

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "rollNumber": "CS21001",
  "email": "john@example.com",
  "password": "securePassword123",
  "college": "IIT Delhi",
  "branch": "Computer Science",
  "cgpa": 8.5
}

Response:
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "student": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "rollNumber": "CS21001",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "student": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "studentId": "...",
    "fullName": "John Doe",
    "rollNumber": "CS21001",
    ...
  }
}
```

### Student APIs

#### Get Student Profile
```http
GET /api/students/:studentId
Authorization: Bearer <token>

Response: Student object
```

#### Get Dashboard
```http
GET /api/students/:studentId/dashboard
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "profile": {...},
    "verificationStatus": "pending|in-progress|completed|failed",
    "confidenceScore": 75,
    "riskLevel": "Low Risk|Medium Risk|High Risk",
    "eligibilityStatus": {
      "isEligible": true,
      "minScoreRequired": 70,
      "currentScore": 75
    },
    "availableDrives": [...],
    "lockedDrives": [...],
    "appliedDrives": [...]
  }
}
```

#### Upload Resume
```http
POST /api/students/:studentId/upload-resume
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- resume: <PDF file>

Response: Updated student object
```

#### Verify Resume
```http
POST /api/students/:studentId/verify-resume
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Resume verification initiated",
  "data": {
    "verificationStatus": "completed",
    "confidenceData": {
      "score": 78,
      "riskLevel": "Low Risk",
      "label": "Strong Verification",
      "strengths": [...],
      "concerns": [...]
    },
    "verificationResults": {
      "education": {"status": "verified", "explanation": "..."},
      "internships": {"status": "partial", "explanation": "..."},
      "projects": {"status": "verified", "explanation": "..."},
      "certifications": {"status": "verified", "explanation": "..."}
    }
  }
}
```

### Drive APIs

#### Get All Drives (Eligible & Locked)
```http
GET /api/students/:studentId/drives
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "eligibleDrives": [...],
    "lockedDrives": [
      {
        "drive": {...},
        "lockReasons": ["CGPA too low", "Confidence score insufficient"]
      }
    ],
    "totalDrives": 5
  }
}
```

#### Get Eligible Drives
```http
GET /api/students/:studentId/drives/eligible
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [Drive objects]
}
```

#### Get Locked Drives
```http
GET /api/students/:studentId/drives/locked
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "drive": {...},
      "reasons": ["reason1", "reason2"]
    }
  ]
}
```

#### Apply for Drive
```http
POST /api/students/:studentId/drives/:driveId/apply
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Applied successfully",
  "data": {
    "message": "Applied successfully",
    "drive": {...},
    "student": {...}
  }
}
```

## Database Models

### Student Schema

```javascript
{
  // Authentication
  fullName: String (required),
  rollNumber: String (unique, required),
  email: String (required),
  password: String (hashed, required),

  // Profile
  college: String,
  branch: String,
  cgpa: Number (0-10),

  // Resume
  resumeUrl: String,
  resumeId: ObjectId (ref: Resume),

  // Verification
  verificationStatus: String (pending|in-progress|completed|failed),
  verificationResults: {
    education: {status, explanation},
    internships: {status, explanation},
    projects: {status, explanation},
    certifications: {status, explanation}
  },

  // Confidence
  confidenceData: {
    score: Number (0-100),
    riskLevel: String,
    strengths: [String],
    concerns: [String],
    calculatedAt: Date
  },

  // Eligibility
  isEligibleForDrives: Boolean,
  hireScore: Number,

  // Applications
  appliedDrives: [ObjectId (ref: Drive)],

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Drive Schema

```javascript
{
  company: String (required),
  role: String (required),
  description: String,
  location: String,
  minCGPA: Number (0-10),
  minConfidenceScore: Number (0-100),
  requiredSkills: [String],
  deadline: Date (required),
  requiredVerificationStatuses: {
    education: String,
    projects: String,
    certifications: String
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Confidence Score Calculation

### Weights
- Education: 20%
- Internships: 25%
- Projects: 20%
- Certifications: 15%
- Skills: 20%

### Status Scores
- Verified: 100%
- Partial: 60%
- Unverified: 20%

### Risk Levels
- 80+: Low Risk
- 60-79: Medium Risk
- Below 60: High Risk

### Labels
- 0-20: No Supporting Evidence
- 21-40: Weak Evidence
- 41-60: Partial Verification
- 61-80: Strong Verification
- 81-100: Highly Trustworthy

### Eligibility
- Students with score >= 70 are eligible for drives

## Drive Eligibility Logic

A student can apply for a drive only if:
1. `confidenceScore >= drive.minConfidenceScore`
2. `cgpa >= drive.minCGPA`
3. All required verification statuses are met

## Frontend Workflow

1. **Auth Page (/auth)**
   - Register with rollNumber, password, and profile info
   - Login with rollNumber and password
   - JWT token stored in localStorage

2. **Dashboard (/dashboard)**
   - View profile and CGPA
   - View verification status and confidence score
   - Upload resume
   - Verify resume (async operation)
   - Browse eligible drives
   - View locked drives with reasons
   - Apply for eligible drives

3. **Protected Routes**
   - All dashboard and student routes require JWT token
   - Automatic redirect to auth if not authenticated

## Error Handling

### Common Error Codes

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (not eligible for action)
- **404**: Not Found (resource not found)
- **409**: Conflict (roll number already registered)
- **500**: Server Error

### Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

## Testing

### Test Student Account

```
Roll Number: TEST001
Password: Password123!
```

### Create Sample Drive

```bash
POST /api/drives (admin only)
{
  "company": "Google",
  "role": "Software Engineer",
  "description": "Backend developer position",
  "minCGPA": 7.5,
  "minConfidenceScore": 70,
  "requiredSkills": ["JavaScript", "MongoDB", "Express.js"],
  "deadline": "2026-06-30"
}
```

## Production Deployment

### Backend

1. Set `JWT_SECRET` to a strong random string
2. Use production MongoDB URI
3. Set `FRONTEND_ORIGIN` to frontend domain
4. Enable HTTPS
5. Use environment variables from secrets manager
6. Set proper `NODE_ENV=production`

### Frontend

1. Build for production: `npm run build`
2. Set `REACT_APP_API_URL` to production backend URL
3. Deploy to Vercel, Netlify, or your own server
4. Enable HTTPS

## Troubleshooting

### Token Expired
- Clear localStorage and login again
- Token expires in 7 days

### Verification Not Starting
- Ensure resume is uploaded first
- Check MongoDB connection
- Check GROQ_API_KEY in environment

### Drives Not Appearing
- Verify student meets minimum requirements
- Check drive deadline hasn't passed
- Verify drive.isActive = true in database

## Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
