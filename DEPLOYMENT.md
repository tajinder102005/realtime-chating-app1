# Deployment Guide

This guide will help you deploy the ChatApp with Supabase authentication.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new Supabase project
3. Get your Supabase URL and keys from the project settings

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `database/schema.sql`
4. Enable Row Level Security (RLS) is already handled in the script

## Backend Deployment (Railway)

1. Push your code to GitHub
2. Create a new Railway project and connect your GitHub repository
3. Set the following environment variables in Railway:
   ```
   PORT=5000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret_key
   ```
4. Deploy the project

## Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Create a new Vercel project and connect your GitHub repository
3. Set the following environment variables in Vercel:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=your_railway_backend_url
   ```
4. Deploy the project

## Alternative: Backend Deployment (Render)

1. Create a new Render Web Service
2. Connect your GitHub repository
3. Set the same environment variables as Railway
4. Deploy the project

## Alternative: Frontend Deployment (Netlify)

1. Create a new Netlify site
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Set the same environment variables as Vercel
6. Deploy the project

## Environment Variables

### Backend (.env)
```
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
```

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_backend_url
```

## Post-Deployment

1. Test user registration and login
2. Test real-time messaging
3. Verify CORS settings are correct
4. Check that all API endpoints are working

## Troubleshooting

- **CORS Issues**: Make sure your frontend URL is added to Supabase CORS settings
- **Database Connection**: Verify Supabase connection strings and keys
- **Socket.IO Issues**: Ensure WebSocket connections are allowed in your deployment platform
- **Environment Variables**: Double-check all environment variables are set correctly
