#!/bin/bash

# ChatApp Deployment Script
echo "🚀 Starting ChatApp Deployment Process..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📝 Step 1: Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install

cd ..

echo "🔧 Step 2: Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Step 3: Preparing for deployment..."

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env file not found. Please create it using backend/.env.example"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Warning: frontend/.env file not found. Please create it using frontend/.env.example"
fi

echo "📦 Step 4: Ready for deployment!"
echo ""
echo "📋 Deployment Checklist:"
echo "1. ✅ Dependencies installed"
echo "2. ✅ Frontend built"
echo "3. ⚠️  Set up Supabase project and run database/schema.sql"
echo "4. ⚠️  Configure environment variables"
echo "5. ⚠️  Deploy backend to Railway/Render"
echo "6. ⚠️  Deploy frontend to Vercel/Netlify"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "🌐 Next Steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Connect repository to Railway (backend)"
echo "3. Connect repository to Vercel (frontend)"
echo "4. Configure environment variables in both platforms"
echo ""
echo "🎉 Deployment preparation complete!"
