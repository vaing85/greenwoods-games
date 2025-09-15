@echo off
REM 🎰 Optimized Deployment Script for Greenwood Games (Windows Batch)
REM This script only uploads essential files, making deployment faster and more secure

setlocal enabledelayedexpansion

REM Configuration
set SERVER_IP=167.172.152.130
set SERVER_USER=root
set SERVER_PATH=/opt/greenwood-games

echo 🎰 Greenwood Games - Optimized Deployment
echo ==========================================

REM Check if server is reachable
echo 🔍 Checking server connectivity...
ping -n 1 %SERVER_IP% >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cannot reach server %SERVER_IP%
    pause
    exit /b 1
)
echo ✅ Server is reachable

REM Create server directory if it doesn't exist
echo 📁 Creating server directory...
ssh %SERVER_USER%@%SERVER_IP% "mkdir -p %SERVER_PATH%"

REM Upload essential files using scp with exclusions
echo 📤 Uploading essential files...
echo This will upload only the necessary files for deployment:
echo - Docker configuration files
echo - Server and web application code
echo - Nginx configuration
echo - Monitoring configuration
echo - Environment template
echo.

REM Create a temporary directory with only essential files
set TEMP_DIR=temp_deploy_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TEMP_DIR=%TEMP_DIR: =0%
mkdir "%TEMP_DIR%" 2>nul

echo 📋 Copying essential files to temporary directory...

REM Copy essential files
if exist "docker-compose.prod.yml" (
    copy "docker-compose.prod.yml" "%TEMP_DIR%\" >nul
    echo   ✅ Copied: docker-compose.prod.yml
)
if exist "docker-compose.yml" (
    copy "docker-compose.yml" "%TEMP_DIR%\" >nul
    echo   ✅ Copied: docker-compose.yml
)
if exist "env.example" (
    copy "env.example" "%TEMP_DIR%\" >nul
    echo   ✅ Copied: env.example
)
if exist "README.md" (
    copy "README.md" "%TEMP_DIR%\" >nul
    echo   ✅ Copied: README.md
)
if exist "server" (
    xcopy "server" "%TEMP_DIR%\server\" /E /I /Q >nul
    echo   ✅ Copied: server
)
if exist "web" (
    xcopy "web" "%TEMP_DIR%\web\" /E /I /Q >nul
    echo   ✅ Copied: web
)
if exist "nginx" (
    xcopy "nginx" "%TEMP_DIR%\nginx\" /E /I /Q >nul
    echo   ✅ Copied: nginx
)
if exist "monitoring" (
    xcopy "monitoring" "%TEMP_DIR%\monitoring\" /E /I /Q >nul
    echo   ✅ Copied: monitoring
)
if exist "scripts" (
    xcopy "scripts" "%TEMP_DIR%\scripts\" /E /I /Q >nul
    echo   ✅ Copied: scripts
)

REM Upload the temporary directory
echo 📤 Uploading files to server...
scp -r "%TEMP_DIR%\*" %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/

if %errorlevel% equ 0 (
    echo ✅ Files uploaded successfully!
) else (
    echo ❌ Upload failed
    rmdir /s /q "%TEMP_DIR%" 2>nul
    pause
    exit /b 1
)

REM Clean up temporary directory
rmdir /s /q "%TEMP_DIR%" 2>nul

REM Set up environment file
echo ⚙️  Setting up environment...
ssh %SERVER_USER%@%SERVER_IP% "cd %SERVER_PATH% && cp env.example .env"

REM Start services
echo 🚀 Starting services...
ssh %SERVER_USER%@%SERVER_IP% "cd %SERVER_PATH% && docker-compose -f docker-compose.prod.yml up -d --build"

REM Check service status
echo 🔍 Checking service status...
ssh %SERVER_USER%@%SERVER_IP% "cd %SERVER_PATH% && docker-compose -f docker-compose.prod.yml ps"

REM Configure Nginx
echo 🌐 Configuring Nginx...
ssh %SERVER_USER%@%SERVER_IP% "cd %SERVER_PATH% && cp nginx/nginx-http.conf /etc/nginx/sites-available/default && systemctl restart nginx"

REM Final status check
echo 🔍 Final status check...
echo Checking if services are running:
ssh %SERVER_USER%@%SERVER_IP% "curl -s http://localhost > /dev/null && echo '✅ Web app is running' || echo '❌ Web app is not responding'"
ssh %SERVER_USER%@%SERVER_IP% "curl -s http://localhost:5000/health > /dev/null && echo '✅ API is running' || echo '❌ API is not responding'"

echo.
echo 🎉 Deployment completed!
echo Your casino is now live at: http://%SERVER_IP%
echo API Health: http://%SERVER_IP%:5000/health
echo Monitoring: http://%SERVER_IP%:3001
echo.
echo 🎰 Your casino empire is ready to launch! 🎰💰🚀
pause
