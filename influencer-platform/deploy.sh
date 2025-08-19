#!/bin/bash

# Deployment script for Influencer Platform on Vercel
# This script sets up environment variables and deploys to Vercel

echo "🚀 Starting deployment to Vercel..."
echo "Domain: https://influencer-platform-seven.vercel.app"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Set environment variables in Vercel
echo "🔧 Setting up environment variables..."

# Core configuration
vercel env add NODE_ENV production production
vercel env add NEXT_PUBLIC_APP_URL https://influencer-platform-seven.vercel.app production

# Supabase configuration (your existing values)
vercel env add NEXT_PUBLIC_SUPABASE_URL https://keuvtjwbgqvohqlshryc.supabase.co production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldXZ0andiZ3F2b2hxbHNocnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODM1MzQsImV4cCI6MjA3MDY1OTUzNH0._ZmNRYvrpPGGTl4SH8t5a0ly_TxlYmnmJcry2fMow8A production
vercel env add SUPABASE_SERVICE_ROLE_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldXZ0andiZ3F2b2hxbHNocnljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA4MzUzNCwiZXhwIjoyMDcwNjU5NTM0fQ.MxavmruJ3J20KsWO7sZPGjnjB0YNHTcVew4z2dTcxoc production

# Security
vercel env add WEBHOOK_SECRET 658ca77e1898ce3a0627204e177c44ee834f641544d6684cb0494875a2a44f44 production

# Payment providers (sandbox for now)
vercel env add PLAID_ENV sandbox production
vercel env add DWOLLA_ENV sandbox production
vercel env add PAYPAL_ENV sandbox production

# Rate limiting
vercel env add RATE_LIMIT_ENABLED true production
vercel env add RATE_LIMIT_MAX_REQUESTS 100 production
vercel env add RATE_LIMIT_WINDOW_MS 60000 production

echo "✅ Environment variables configured"

# Deploy to Vercel
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://influencer-platform-seven.vercel.app"
echo ""
echo "🔍 Next steps:"
echo "1. Visit https://influencer-platform-seven.vercel.app/api/health to check health"
echo "2. Test the application functionality"
echo "3. Monitor logs in Vercel dashboard"
echo ""
echo "📚 For more details, check DEPLOYMENT.md"