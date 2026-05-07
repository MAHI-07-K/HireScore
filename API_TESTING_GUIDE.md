# HireScore Student Module - API Examples & Testing Guide

## Quick Start Testing

### 1. Register a New Student

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Rajesh Kumar",
    "rollNumber": "CS21101",
    "email": "rajesh@example.com",
    "password": "SecurePass123!",
    "college": "IIT Delhi",
    "branch": "Computer Science",
    "cgpa": 8.75
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "student": {
      "studentId": "507f1f77bcf86cd799439011",
      "fullName": "Rajesh Kumar",
      "rollNumber": "CS21101",
      "email": "rajesh@example.com",
      "college": "IIT Delhi",
      "branch": "Computer Science",
      "cgpa": 8.75,
      "resumeUrl": null,
      "verificationStatus": "pending",
      "isEligibleForDrives": false,
      "hireScore": 0,
      "appliedDrives": [],
      "createdAt": "2026-05-06T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "rollNumber": "CS21101",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "student": { ...student object... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Profile (Protected)

**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "507f1f77bcf86cd799439011",
    "fullName": "Rajesh Kumar",
    "rollNumber": "CS21101",
    "email": "rajesh@example.com",
    "college": "IIT Delhi",
    "branch": "Computer Science",
    "cgpa": 8.75,
    "confidenceData": {
      "score": 0,
      "riskLevel": "High Risk",
      "strengths": [],
      "concerns": [],
      "calculatedAt": "2026-05-06T10:30:00.000Z"
    },
    "verificationResults": {},
    "isEligibleForDrives": false,
    "appliedDrives": []
  }
}
```

### 4. Upload Resume

**Request:**
```bash
curl -X POST http://localhost:5000/api/students/507f1f77bcf86cd799439011/upload-resume \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "resume=@resume.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "studentId": "507f1f77bcf86cd799439011",
    "resumeUrl": "uploads/resume_507f1f77bcf86cd799439011.pdf",
    "resumeId": "507f1f77bcf86cd799439012",
    "verificationStatus": "pending",
    "confidenceData": {
      "score": 0,
      "riskLevel": "High Risk",
      "strengths": [],
      "concerns": []
    }
  }
}
```

### 5. Verify Resume (Start Verification)

**Request:**
```bash
curl -X POST http://localhost:5000/api/students/507f1f77bcf86cd799439011/verify-resume \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (After Verification Completes):**
```json
{
  "success": true,
  "message": "Resume verification initiated",
  "data": {
    "studentId": "507f1f77bcf86cd799439011",
    "verificationStatus": "completed",
    "confidenceData": {
      "score": 76,
      "riskLevel": "Low Risk",
      "label": "Strong Verification",
      "strengths": [
        "Educational background verified",
        "All projects verified",
        "All certifications verified"
      ],
      "concerns": [
        "Some work experience could not be verified"
      ],
      "calculatedAt": "2026-05-06T10:35:00.000Z"
    },
    "verificationResults": {
      "education": {
        "status": "verified",
        "explanation": "Educational credentials match resume"
      },
      "internships": {
        "status": "partial",
        "explanation": "1 out of 2 internships verified"
      },
      "projects": {
        "status": "verified",
        "explanation": "All 3 GitHub projects verified"
      },
      "certifications": {
        "status": "verified",
        "explanation": "All certifications verified"
      }
    },
    "isEligibleForDrives": true,
    "hireScore": 76
  }
}
```

### 6. Get Dashboard

**Request:**
```bash
curl -X GET http://localhost:5000/api/students/507f1f77bcf86cd799439011/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": { ...student data... },
    "verificationStatus": "completed",
    "confidenceScore": 76,
    "riskLevel": "Low Risk",
    "eligibilityStatus": {
      "isEligible": true,
      "minScoreRequired": 70,
      "currentScore": 76
    },
    "availableDrives": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "company": "Google",
        "role": "Backend Engineer",
        "description": "Work on cloud infrastructure",
        "minCGPA": 7.5,
        "minConfidenceScore": 70,
        "requiredSkills": ["Java", "Python", "Go"],
        "deadline": "2026-06-30",
        "location": "Bangalore"
      },
      {
        "_id": "507f1f77bcf86cd799439021",
        "company": "Microsoft",
        "role": "Software Engineer",
        "description": "Build enterprise solutions",
        "minCGPA": 7.0,
        "minConfidenceScore": 65,
        "requiredSkills": ["C++", "C#", ".NET"],
        "deadline": "2026-07-15"
      }
    ],
    "lockedDrives": [
      {
        "drive": {
          "_id": "507f1f77bcf86cd799439022",
          "company": "Goldman Sachs",
          "role": "Quant Developer",
          "minCGPA": 9.0,
          "minConfidenceScore": 80
        },
        "lockReasons": [
          "CGPA too low. Required: 9.0, Your CGPA: 8.75",
          "Confidence score too low. Required: 80, Your Score: 76"
        ]
      }
    ],
    "appliedDrives": []
  }
}
```

### 7. Get Eligible Drives

**Request:**
```bash
curl -X GET http://localhost:5000/api/students/507f1f77bcf86cd799439011/drives/eligible \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "company": "Google",
      "role": "Backend Engineer",
      ...
    }
  ]
}
```

### 8. Get Locked Drives

**Request:**
```bash
curl -X GET http://localhost:5000/api/students/507f1f77bcf86cd799439011/drives/locked \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "drive": {
        "_id": "507f1f77bcf86cd799439022",
        "company": "Goldman Sachs",
        "role": "Quant Developer",
        "minCGPA": 9.0,
        "minConfidenceScore": 80
      },
      "reasons": [
        "CGPA too low. Required: 9.0, Your CGPA: 8.75",
        "Confidence score too low. Required: 80, Your Score: 76"
      ]
    }
  ]
}
```

### 9. Apply for Drive

**Request:**
```bash
curl -X POST http://localhost:5000/api/students/507f1f77bcf86cd799439011/drives/507f1f77bcf86cd799439020/apply \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully applied for drive",
  "data": {
    "message": "Applied successfully",
    "drive": {
      "_id": "507f1f77bcf86cd799439020",
      "company": "Google",
      "role": "Backend Engineer"
    },
    "student": {
      "studentId": "507f1f77bcf86cd799439011",
      "appliedDrives": [
        "507f1f77bcf86cd799439020"
      ]
    }
  }
}
```

## Error Scenarios

### Registration Errors

**Missing Fields:**
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

**Roll Number Already Registered:**
```json
{
  "success": false,
  "message": "Roll number or email already registered"
}
```

### Authentication Errors

**Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid roll number or password"
}
```

**Missing Token:**
```json
{
  "success": false,
  "message": "No token provided. Please login first."
}
```

**Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid or expired token. Please login again."
}
```

### Eligibility Errors

**Cannot Apply - Not Eligible:**
```json
{
  "success": false,
  "message": "Cannot apply: CGPA too low. Required: 8.5, Your CGPA: 8.0; Confidence score too low. Required: 75, Your Score: 68"
}
```

**Already Applied:**
```json
{
  "success": false,
  "message": "Already applied for this drive"
}
```

## Test Flow

### Complete Student Journey

```
1. Register
   POST /api/auth/register

2. Login
   POST /api/auth/login → Get Token

3. View Profile
   GET /api/auth/profile (with token)

4. Upload Resume
   POST /api/students/:id/upload-resume (with token)

5. Verify Resume
   POST /api/students/:id/verify-resume (with token)
   Wait for verification to complete (async)

6. Get Dashboard
   GET /api/students/:id/dashboard (with token)

7. View Eligible Drives
   GET /api/students/:id/drives/eligible (with token)

8. Apply for Drive
   POST /api/students/:id/drives/:driveId/apply (with token)

9. Check Updated Dashboard
   GET /api/students/:id/dashboard (with token)
```

## Using Postman

### Setup Collection

1. Create new Collection: "HireScore Student Module"
2. Create Environment Variables:
   - `baseUrl`: http://localhost:5000
   - `token`: (will be set after login)
   - `studentId`: (will be set after registration)

### Authorization Tab

Set Authorization type to: **Bearer Token**
Value: {{token}}

### Pre-request Script (for Login)

```javascript
// After login, automatically set token
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.data.token);
  pm.environment.set("studentId", jsonData.data.student.studentId);
}
```

## Database Seeding

### Create Sample Drive (MongoDB)

```javascript
db.drives.insertOne({
  company: "Google",
  role: "Backend Engineer",
  description: "Build scalable cloud infrastructure",
  location: "Bangalore",
  minCGPA: 7.5,
  minConfidenceScore: 70,
  requiredSkills: ["Java", "Python", "Go", "MongoDB"],
  deadline: new Date("2026-06-30"),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

db.drives.insertOne({
  company: "Microsoft",
  role: "Full Stack Developer",
  description: "Develop enterprise web applications",
  location: "Hyderabad",
  minCGPA: 7.0,
  minConfidenceScore: 65,
  requiredSkills: ["React", "Node.js", "SQL", "Azure"],
  deadline: new Date("2026-07-15"),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Frontend Testing

### Login and Dashboard Flow

1. Navigate to http://localhost:3000
2. Redirects to /auth (login/register page)
3. Register with test data:
   ```
   Name: Test Student
   Roll: TEST001
   Email: test@example.com
   Password: TestPass123!
   College: Test College
   Branch: CS
   CGPA: 8.5
   ```
4. Automatically redirected to dashboard
5. Upload resume PDF
6. Click "Start Resume Verification"
7. Wait for verification to complete
8. View confidence score and eligible drives
9. Apply for eligible drives
10. Check applied drives in dashboard

## Performance Notes

- First verification may take 30-60 seconds (Groq API)
- Resume upload should be < 5MB
- Dashboard loads all data in single request
- Eligibility checking happens at view-time (not cached)

## Next Testing Steps

1. Test with invalid resume files
2. Test with very high/low CGPA
3. Test concurrent applications
4. Test token expiration
5. Test database connection issues
