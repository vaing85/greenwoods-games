#!/bin/bash

# 🎰 Optimized Deployment Script for Greenwood Games
# This script only uploads essential files, making deployment faster and more secure

set -e  # Exit on any error

# Configuration
SERVER_IP="167.172.152.130"
SERVER_USER="root"
SERVER_PATH="/opt/greenwood-games"
LOCAL_PATH="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎰 Greenwood Games - Optimized Deployment${NC}"
echo -e "${BLUE}==========================================${NC}"

# Check if rsync is available
if ! command -v rsync &> /dev/null; then
    echo -e "${RED}❌ rsync is not installed. Please install it first.${NC}"
    echo "On Windows: Install WSL or use Git Bash"
    echo "On macOS: brew install rsync"
    echo "On Linux: sudo apt install rsync"
    exit 1
fi

# Check if server is reachable
echo -e "${YELLOW}🔍 Checking server connectivity...${NC}"
if ! ping -c 1 $SERVER_IP &> /dev/null; then
    echo -e "${RED}❌ Cannot reach server $SERVER_IP${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is reachable${NC}"

# Create server directory if it doesn't exist
echo -e "${YELLOW}📁 Creating server directory...${NC}"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_PATH"

# Upload essential files using rsync
echo -e "${YELLOW}📤 Uploading essential files...${NC}"
echo "This will upload only the necessary files for deployment:"
echo "- Docker configuration files"
echo "- Server and web application code"
echo "- Nginx configuration"
echo "- Monitoring configuration"
echo "- Environment template"
echo ""

# Use rsync with exclude patterns
rsync -avz --progress \
    --exclude='node_modules/' \
    --exclude='*.md' \
    --exclude='!README.md' \
    --exclude='*_GUIDE.md' \
    --exclude='*_STEPS.md' \
    --exclude='*_STATUS.md' \
    --exclude='*_PROGRESS.md' \
    --exclude='*_COMPLETE.md' \
    --exclude='*_SUMMARY.md' \
    --exclude='*_REPORT.md' \
    --exclude='*_CHECKPOINT.md' \
    --exclude='*_UPDATED.md' \
    --exclude='deploy*.sh' \
    --exclude='deploy*.ps1' \
    --exclude='cloud-deploy.sh' \
    --exclude='setup-*.ps1' \
    --exclude='generate-*.ps1' \
    --exclude='configure-*.ps1' \
    --exclude='*.zip' \
    --exclude='*.bak' \
    --exclude='*.backup' \
    --exclude='logs/' \
    --exclude='*.log' \
    --exclude='.env' \
    --exclude='.env.*' \
    --exclude='/web/build/' \
    --exclude='/web/dist/' \
    --exclude='/server/dist/' \
    --exclude='coverage/' \
    --exclude='*.lcov' \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    --exclude='.vscode/' \
    --exclude='.idea/' \
    --exclude='*.swp' \
    --exclude='*.swo' \
    --exclude='/mobile/dist/' \
    --exclude='/mobile/.expo/' \
    --exclude='/mobile/web-build/' \
    --exclude='*.db' \
    --exclude='*.sqlite' \
    --exclude='*.sqlite3' \
    --exclude='*.pem' \
    --exclude='*.key' \
    --exclude='*.crt' \
    --exclude='/monitoring/data/' \
    $LOCAL_PATH/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files uploaded successfully!${NC}"
else
    echo -e "${RED}❌ Upload failed${NC}"
    exit 1
fi

# Set up environment file
echo -e "${YELLOW}⚙️  Setting up environment...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && cp env.example .env"

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f docker-compose.prod.yml up -d --build"

# Check service status
echo -e "${YELLOW}🔍 Checking service status...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f docker-compose.prod.yml ps"

# Configure Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && cp nginx/nginx-http.conf /etc/nginx/sites-available/default && systemctl restart nginx"

# Final status check
echo -e "${YELLOW}🔍 Final status check...${NC}"
echo "Checking if services are running:"
ssh $SERVER_USER@$SERVER_IP "curl -s http://localhost > /dev/null && echo '✅ Web app is running' || echo '❌ Web app is not responding'"
ssh $SERVER_USER@$SERVER_IP "curl -s http://localhost:5000/health > /dev/null && echo '✅ API is running' || echo '❌ API is not responding'"

echo ""
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${GREEN}Your casino is now live at: http://$SERVER_IP${NC}"
echo -e "${GREEN}API Health: http://$SERVER_IP:5000/health${NC}"
echo -e "${GREEN}Monitoring: http://$SERVER_IP:3001${NC}"
echo ""
echo -e "${BLUE}🎰 Your casino empire is ready to launch! 🎰💰🚀${NC}"
