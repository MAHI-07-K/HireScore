# Frontend-Backend Authentication Connection Guide

## ✅ Connection Status

The frontend and backend are now properly configured for authentication. The following issues have been identified and fixed:

### Issues Fixed

1. **Error Response Format Consistency** ✅ FIXED
   - **Issue**: Success responses had `{ success, message, data }` structure, but error responses only had `{ success, message }` structure
   - **Fix**: Updated `errorHandler.js` to include `data: null` in error responses for consistency
   - **Impact**: Frontend error handling is now more reliable

2. **Corrupted LocalStorage Handling** ✅ FIXED
   - **Issue**: If localStorage contained invalid JSON, the app would crash on initialization
   - **Fix**: Added try-catch block in `AuthContext.tsx` to handle JSON parsing errors gracefully
   - **Impact**: App won't crash if localStorage is corrupted; it will clear it and start fresh

3. **Network Error Handling** ✅ FIXED
   - **Issue**: Network errors weren't being handled distinctively from API errors
   - **Fix**: Added response error interceptor in `api.ts` to provide helpful messages when backend is unreachable
   - **Impact**: Users get clear feedback when backend is not running

## 🔧 Authentication Flow

### Login Flow
1. User enters roll number and password on login page
2. Frontend calls `AuthContext.login(rollNumber, password)`
3. Frontend makes POST request to `http://localhost:5000/api/auth/login`
4. Backend validates credentials and generates JWT token
5. Backend returns `{ success, message, data: { token, student } }`
6. Frontend stores token and student data in localStorage
7. Frontend redirects to dashboard

### Registration Flow
1. User fills registration form
2. Frontend validates email format and password requirements
3. Frontend calls `AuthContext.register(userData)`
4. Frontend makes POST request to `http://localhost:5000/api/auth/register`
5. Backend creates new student and generates JWT token
6. Backend returns `{ success, message, data: { token, student } }`
7. Frontend stores authentication data and redirects to dashboard

## 🚀 How to Run

### Prerequisites
- Node.js installed
- MongoDB running on `mongodb://127.0.0.1:27017`

### Backend Setup
```bash
cd backend
npm install
# .env file should already exist with proper configuration
npm run dev
# Backend will start on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
# .env.local file should already exist with NEXT_PUBLIC_API_URL
npm run dev
# Frontend will start on http://localhost:3000
```

### Verify Connection
1. Open http://localhost:3000 in browser
2. You should see the HireScore login page
3. Try the test student login:
   - Roll Number: `24B11CS219`
   - Password: `password123`
   - (Only works if test student exists in database)

## 🔐 Authentication Endpoints

### Public Endpoints
- `POST /api/auth/register` - Register new student
  - Request: `{ fullName, rollNumber, email, password, college, branch, cgpa }`
  - Response: `{ success, message, data: { token, student } }`

- `POST /api/auth/login` - Login student
  - Request: `{ rollNumber, password }`
  - Response: `{ success, message, data: { token, student } }`

### Protected Endpoints (require Bearer token)
- `GET /api/auth/profile` - Get current student profile
  - Header: `Authorization: Bearer {token}`
  - Response: `{ success, data: { studentId, fullName, ... } }`

- `GET /api/verification/{studentId}` - Get verification status
  - Header: `Authorization: Bearer {token}`
  - Response: `{ success, data: { verificationStatus, overallScore, ... } }`

## 🐛 Common Issues and Solutions

### Issue: "Unable to connect to server"
**Cause**: Backend is not running or not reachable
**Solution**: 
1. Ensure MongoDB is running: `mongod`
2. Start backend: `npm run dev` in backend folder
3. Check if backend is running on port 5000
4. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Issue: "Invalid roll number or password"
**Cause**: Credentials don't match or student doesn't exist
**Solution**:
1. Verify student exists in MongoDB
2. Check that roll numbers are being uppercased correctly
3. Verify password is correct (case-sensitive)

### Issue: Session lost after refresh
**Cause**: Token expired or localStorage cleared
**Solution**:
1. Clear browser cache and localStorage
2. Log in again
3. Token expires after 7 days; user will need to log in again

### Issue: CORS errors in browser console
**Cause**: Frontend and backend have different origins configured
**Solution**:
1. Verify `FRONTEND_ORIGIN` in backend `.env` is `http://localhost:3000`
2. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local` is `http://localhost:5000/api`
3. Restart both servers

### Issue: "Failed to load dashboard" after login
**Cause**: Verification API is failing
**Solution**:
1. Check backend logs for errors
2. Verify MongoDB connection is working
3. Check that verification routes are properly registered

## 🧪 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads without errors
- [ ] Login page renders
- [ ] Can register new student with valid data
- [ ] Can login with existing credentials
- [ ] Dashboard loads after successful login
- [ ] Logout works and redirects to login page
- [ ] Invalid credentials show error message
- [ ] Token is properly stored in localStorage
- [ ] Refreshing dashboard keeps user logged in
- [ ] Expired token redirects to login page
- [ ] Network error shows helpful message

## 📝 Environment Configuration

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hirescore
FRONTEND_ORIGIN=http://localhost:3000
JWT_SECRET=hirescore-secret-key-2024
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🔗 Key Files Modified

1. **Backend**
   - `middleware/errorHandler.js` - Fixed error response format
   - `config/database.js` - Database connection configuration

2. **Frontend**
   - `context/AuthContext.tsx` - Added localStorage parsing error handling
   - `services/api.ts` - Added network error interceptor
   - `app/layout.tsx` - AuthProvider wraps entire app
   - `app/auth/AuthPage.tsx` - Login/registration UI
   - `app/dashboard/page.tsx` - Protected dashboard page

## 📊 Response Format Examples

### Successful Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "student": {
      "studentId": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "rollNumber": "24B11CS219",
      "email": "john@example.com",
      "college": "XYZ College",
      "branch": "CSE",
      "cgpa": 8.5,
      "verificationStatus": "pending",
      "hireScore": 0,
      "isEligibleForDrives": false
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid roll number or password",
  "data": null
}
```

## ✨ Next Steps

1. Create test student in MongoDB if not exists
2. Test complete login/registration flow
3. Verify dashboard loads all user data correctly
4. Test file upload functionality (resume verification)
5. Implement drive application features
