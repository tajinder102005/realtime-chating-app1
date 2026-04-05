# 🚀 Quick Setup Guide for ChatApp

## Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com
2. Click "Start your project" 
3. Sign up/login with GitHub
4. Click "New Project"
5. Choose organization (or create new one)
6. Enter project name: `chatapp`
7. Set database password (save it somewhere)
8. Choose region closest to you
9. Click "Create new project"

## Step 2: Get Your Credentials (1 minute)

Once project is created:

1. Go to Project Settings (gear icon ⚙️)
2. Scroll down to "API" section
3. Copy these values:
   - **Project URL**: `https://xxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Setup Database (2 minutes)

1. Go to SQL Editor (left sidebar)
2. Click "New query"
3. Copy and paste the entire content from `database/schema.sql`
4. Click "Run" to execute

## Step 4: Configure Environment Variables (2 minutes)

### Backend (.env)
```env
PORT=5000
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
JWT_SECRET=your_jwt_secret_here
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
VITE_API_URL=http://localhost:5000
```

## Step 5: Run the Application (1 minute)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## Step 6: Test in Browser

1. Open http://localhost:5173
2. Register a new account
3. Login
4. Start chatting!

---

**Total setup time: ~8 minutes**
