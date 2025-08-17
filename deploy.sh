#!/bin/bash

# Greenwood Games - Live Deployment Script
# This script prepares and deploys the complete casino platform

echo "🎰 Greenwood Games - Live Deployment Setup"
echo "==========================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js $(node --version) found"
else
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker $(docker --version) found"
else
    echo "⚠️ Docker not found. Docker is optional but recommended for production."
fi

# Check Git
if command -v git &> /dev/null; then
    echo "✅ Git $(git --version) found"
else
    echo "❌ Git not found. Please install Git first."
    exit 1
fi

echo ""
echo "🚀 Setting up Greenwood Games platform..."

# Copy environment template
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.template .env
    echo "⚠️ Please edit .env file with your configuration before continuing!"
    read -p "Press Enter after editing .env file..."
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."

echo "Installing root dependencies..."
npm install

echo "Installing server dependencies..."
cd server && npm install && cd ..

echo "Installing web dependencies..."
cd web && npm install && cd ..

echo "Installing mobile dependencies..."
cd mobile && npm install && cd ..

echo ""
echo "🏗️ Build options:"
echo "1. Development mode (all services locally)"
echo "2. Production mode (Docker containers)"
echo "3. Web build only"
echo "4. Mobile build only"

read -p "Choose deployment type (1-4): " deploy_type

case $deploy_type in
    1)
        echo "🔧 Starting development mode..."
        npm run dev
        ;;
    2)
        echo "🐳 Starting Docker production mode..."
        if command -v docker-compose &> /dev/null; then
            docker-compose up -d
            echo "✅ All services started!"
            echo "🌐 Web: http://localhost"
            echo "🔧 API: http://localhost:5000"
            echo "📊 Monitoring: http://localhost:3001"
        else
            echo "❌ docker-compose not found. Please install Docker Compose."
        fi
        ;;
    3)
        echo "🌐 Building web application..."
        cd web && npm run build
        echo "✅ Web build complete!"
        ;;
    4)
        echo "📱 Building mobile application..."
        cd mobile && npm run build
        echo "✅ Mobile build complete!"
        ;;
    *)
        echo "❌ Invalid option selected."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your domain and SSL certificates"
echo "2. Set up your MongoDB database"
echo "3. Configure external API keys in .env"
echo "4. Test all game functionality"
echo "5. Set up monitoring and alerts"
echo ""
echo "🎰 Greenwood Games is ready to go live!"
