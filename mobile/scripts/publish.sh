#!/bin/bash

# Greenwood Games - App Store Publishing Script
# This script automates the publishing process for both Google Play and Apple App Store

echo "🎰 Greenwood Games - App Store Publishing Script"
echo "================================================"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

# Check if logged in to Expo
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please run: eas login"
    exit 1
fi

echo "✅ EAS CLI ready"

# Function to build for Android
build_android() {
    echo "📱 Building Android app..."
    eas build --platform android --profile production
    echo "✅ Android build complete"
}

# Function to build for iOS
build_ios() {
    echo "📱 Building iOS app..."
    eas build --platform ios --profile production
    echo "✅ iOS build complete"
}

# Function to submit to Google Play Store
submit_android() {
    echo "📤 Submitting to Google Play Store..."
    eas submit --platform android --profile production
    echo "✅ Android submission complete"
}

# Function to submit to Apple App Store
submit_ios() {
    echo "📤 Submitting to Apple App Store..."
    eas submit --platform ios --profile production
    echo "✅ iOS submission complete"
}

# Main menu
echo ""
echo "What would you like to do?"
echo "1) Build Android app"
echo "2) Build iOS app"
echo "3) Build both platforms"
echo "4) Submit Android to Google Play"
echo "5) Submit iOS to App Store"
echo "6) Submit both platforms"
echo "7) Full publish (build + submit both)"
echo "8) Exit"

read -p "Enter your choice (1-8): " choice

case $choice in
    1)
        build_android
        ;;
    2)
        build_ios
        ;;
    3)
        build_android
        build_ios
        ;;
    4)
        submit_android
        ;;
    5)
        submit_ios
        ;;
    6)
        submit_android
        submit_ios
        ;;
    7)
        echo "🚀 Starting full publish process..."
        build_android
        build_ios
        echo "⏳ Waiting 5 minutes before submission..."
        sleep 300
        submit_android
        submit_ios
        echo "🎉 Full publish process complete!"
        ;;
    8)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎰 Greenwood Games publishing script complete!"
echo "Check your Expo dashboard for build status: https://expo.dev"
