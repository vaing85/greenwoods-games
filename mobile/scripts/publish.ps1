# Greenwood Games - App Store Publishing Script (PowerShell)
# This script automates the publishing process for both Google Play and Apple App Store

Write-Host "🎰 Greenwood Games - App Store Publishing Script" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if EAS CLI is installed
try {
    $null = Get-Command eas -ErrorAction Stop
    Write-Host "✅ EAS CLI ready" -ForegroundColor Green
} catch {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g @expo/eas-cli
}

# Check if logged in to Expo
try {
    $null = eas whoami 2>$null
    Write-Host "✅ Logged in to Expo" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Expo. Please run: eas login" -ForegroundColor Red
    exit 1
}

# Function to build for Android
function Build-Android {
    Write-Host "📱 Building Android app..." -ForegroundColor Yellow
    eas build --platform android --profile production
    Write-Host "✅ Android build complete" -ForegroundColor Green
}

# Function to build for iOS
function Build-iOS {
    Write-Host "📱 Building iOS app..." -ForegroundColor Yellow
    eas build --platform ios --profile production
    Write-Host "✅ iOS build complete" -ForegroundColor Green
}

# Function to submit to Google Play Store
function Submit-Android {
    Write-Host "📤 Submitting to Google Play Store..." -ForegroundColor Yellow
    eas submit --platform android --profile production
    Write-Host "✅ Android submission complete" -ForegroundColor Green
}

# Function to submit to Apple App Store
function Submit-iOS {
    Write-Host "📤 Submitting to Apple App Store..." -ForegroundColor Yellow
    eas submit --platform ios --profile production
    Write-Host "✅ iOS submission complete" -ForegroundColor Green
}

# Main menu
Write-Host ""
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "1) Build Android app"
Write-Host "2) Build iOS app"
Write-Host "3) Build both platforms"
Write-Host "4) Submit Android to Google Play"
Write-Host "5) Submit iOS to App Store"
Write-Host "6) Submit both platforms"
Write-Host "7) Full publish (build + submit both)"
Write-Host "8) Exit"

$choice = Read-Host "Enter your choice (1-8)"

switch ($choice) {
    "1" {
        Build-Android
    }
    "2" {
        Build-iOS
    }
    "3" {
        Build-Android
        Build-iOS
    }
    "4" {
        Submit-Android
    }
    "5" {
        Submit-iOS
    }
    "6" {
        Submit-Android
        Submit-iOS
    }
    "7" {
        Write-Host "🚀 Starting full publish process..." -ForegroundColor Green
        Build-Android
        Build-iOS
        Write-Host "⏳ Waiting 5 minutes before submission..." -ForegroundColor Yellow
        Start-Sleep -Seconds 300
        Submit-Android
        Submit-iOS
        Write-Host "🎉 Full publish process complete!" -ForegroundColor Green
    }
    "8" {
        Write-Host "👋 Goodbye!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎰 Greenwood Games publishing script complete!" -ForegroundColor Green
Write-Host "Check your Expo dashboard for build status: https://expo.dev" -ForegroundColor Cyan
