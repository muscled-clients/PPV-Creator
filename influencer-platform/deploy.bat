@echo off
echo.
echo ================================
echo   Influencer Platform Deployment
echo ================================
echo.
echo Domain: https://influencer-platform-seven.vercel.app
echo.

REM Check if vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo Setting up environment variables...

REM Core configuration
vercel env add NODE_ENV production production
vercel env add NEXT_PUBLIC_APP_URL https://influencer-platform-seven.vercel.app production

REM Supabase configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL https://keuvtjwbgqvohqlshryc.supabase.co production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldXZ0andiZ3F2b2hxbHNocnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODM1MzQsImV4cCI6MjA3MDY1OTUzNH0._ZmNRYvrpPGGTl4SH8t5a0ly_TxlYmnmJcry2fMow8A production
vercel env add SUPABASE_SERVICE_ROLE_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldXZ0andiZ3F2b2hxbHNocnljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA4MzUzNCwiZXhwIjoyMDcwNjU5NTM0fQ.MxavmruJ3J20KsWO7sZPGjnjB0YNHTcVew4z2dTcxoc production

REM Security and monitoring
vercel env add WEBHOOK_SECRET 658ca77e1898ce3a0627204e177c44ee834f641544d6684cb0494875a2a44f44 production

REM Rate limiting
vercel env add RATE_LIMIT_ENABLED true production
vercel env add RATE_LIMIT_MAX_REQUESTS 100 production

echo Environment variables configured successfully!
echo.

echo Deploying to production...
vercel --prod

echo.
echo ================================
echo   Deployment Complete!
echo ================================
echo.
echo Your app is live at: https://influencer-platform-seven.vercel.app
echo.
echo Next steps:
echo 1. Visit https://influencer-platform-seven.vercel.app/api/health
echo 2. Test the application functionality
echo 3. Check Vercel dashboard for logs
echo.
pause