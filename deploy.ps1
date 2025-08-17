# Greenwood Games - Live Deployment Script (PowerShell)
# This script prepares and deploys the complete casino platform

Write-Host "🎰 Greenwood Games - Live Deployment Setup" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker $dockerVersion found" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Docker not found. Docker is optional but recommended for production." -ForegroundColor Yellow
}

# Check Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git $gitVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Please install Git first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Setting up Greenwood Games platform..." -ForegroundColor Green

# Copy environment template
if (!(Test-Path ".env")) {
    Write-Host "📄 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.template" ".env"
    Write-Host "⚠️ Please edit .env file with your configuration before continuing!" -ForegroundColor Yellow
    Read-Host "Press Enter after editing .env file"
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

Write-Host "Installing root dependencies..."
npm install

Write-Host "Installing server dependencies..."
Set-Location server
npm install
Set-Location ..

Write-Host "Installing web dependencies..."
Set-Location web
npm install
Set-Location ..

Write-Host "Installing mobile dependencies..."
Set-Location mobile
npm install
Set-Location ..

Write-Host ""
Write-Host "🏗️ Build options:" -ForegroundColor Cyan
Write-Host "1. Development mode (all services locally)"
Write-Host "2. Production mode (Docker containers)"
Write-Host "3. Web build only"
Write-Host "4. Mobile build only"

$deployType = Read-Host "Choose deployment type (1-4)"

switch ($deployType) {
    "1" {
        Write-Host "🔧 Starting development mode..." -ForegroundColor Green
        npm run dev
    }
    "2" {
        Write-Host "🐳 Starting Docker production mode..." -ForegroundColor Green
        try {
            docker-compose up -d
            Write-Host "✅ All services started!" -ForegroundColor Green
            Write-Host "🌐 Web: http://localhost"
            Write-Host "🔧 API: http://localhost:5000"
            Write-Host "📊 Monitoring: http://localhost:3001"
        } catch {
            Write-Host "❌ docker-compose not found. Please install Docker Compose." -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "🌐 Building web application..." -ForegroundColor Green
        Set-Location web
        npm run build
        Set-Location ..
        Write-Host "✅ Web build complete!" -ForegroundColor Green
    }
    "4" {
        Write-Host "📱 Building mobile application..." -ForegroundColor Green
        Set-Location mobile
        npm run build
        Set-Location ..
        Write-Host "✅ Mobile build complete!" -ForegroundColor Green
    }
    default {
        Write-Host "❌ Invalid option selected." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your domain and SSL certificates"
Write-Host "2. Set up your MongoDB database"
Write-Host "3. Configure external API keys in .env"
Write-Host "4. Test all game functionality"
Write-Host "5. Set up monitoring and alerts"
Write-Host ""
Write-Host "🎰 Greenwood Games is ready to go live!" -ForegroundColor Green
