# HireScore Vercel Deployment Guide

## Prerequisites

1. **MongoDB Atlas Account**: Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Vercel Account**: Sign up at [Vercel](https://vercel.com)
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Database Setup

1. Create a MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Get your connection string (replace `<username>`, `<password>`, and `<cluster>`)

## Step 2: Backend Deployment

1. **Create Vercel Project**:
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Select the `backend` folder as the root directory

2. **Configure Environment Variables**:
   - In Vercel project settings, add these environment variables:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hirescore
     JWT_SECRET=your-super-secret-jwt-key-here
     FRONTEND_ORIGIN=https://your-frontend-project.vercel.app
     GITHUB_TOKEN=your_github_token
     GROQ_API_KEY=your_groq_api_key
     GROQ_MODEL=llama-3.1-8b-instant
     EXISTING_VERIFICATION_MODULE_URL=https://your-backend-project.vercel.app/api/verify/full
     ```

3. **Deploy**: Vercel will automatically deploy using the `vercel.json` configuration

## Step 3: Frontend Deployment

1. **Create Vercel Project**:
   - Create another Vercel project
   - Select the `frontend` folder as the root directory

2. **Configure Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app/api
   ```

3. **Deploy**: Vercel will automatically deploy the Next.js app

## Step 4: Update CORS (if needed)

Update the `FRONTEND_ORIGIN` in backend environment variables with your actual frontend Vercel URL.

## Step 5: Testing

1. Test authentication endpoints
2. Test file upload functionality
3. Test verification features
4. Verify database connections

## Important Notes

- **Cold Starts**: Serverless functions may have cold start delays
- **File Uploads**: Vercel has limitations on file sizes and temporary storage
- **Database**: Ensure MongoDB Atlas allows connections from `0.0.0.0/0` or Vercel's IP ranges
- **Environment Variables**: Never commit `.env` files to GitHub

## Troubleshooting

- Check Vercel function logs for backend errors
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas connection string is correct
- Test API endpoints using tools like Postman