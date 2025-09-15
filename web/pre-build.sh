#!/bin/bash

# Pre-build script for Greenwood Games Web App
# This ensures the React app is built before Docker tries to use it

echo "🔨 Pre-building React application..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the application
echo "🏗️ Building React application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ React application built successfully!"
    echo "📁 Build files are in: ./build/"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

echo "🎉 Pre-build completed successfully!"
