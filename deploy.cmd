@echo off
echo ========================================
echo   Haohua Sensor - One-Click Deploy
echo ========================================
echo.
echo This will help you deploy your website to Vercel.
echo.
echo Step 1: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found. Downloading installer...
    echo Please install Node.js from https://nodejs.org (LTS version)
    echo After installing, run this script again.
    start https://nodejs.org
    pause
    exit /b
)
echo Node.js found!
echo.
echo Step 2: Install Vercel CLI
call npm install -g vercel
echo.
echo Step 3: Deploy to Vercel
echo The browser will open for you to log in to Vercel.
echo After logging in, return to this window.
vercel --prod
echo.
echo ========================================
echo   Deployment complete!
echo   Your site is now live on Vercel
echo ========================================
pause
