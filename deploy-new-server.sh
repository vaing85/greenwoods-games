#!/bin/bash

# 🎰 Greenwood Games - New Server Deployment Script
# This script deploys the casino platform to a fresh DigitalOcean droplet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎰 Greenwood Games - New Server Deployment${NC}"
echo "=================================================="

# Check if server IP is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide server IP address${NC}"
    echo "Usage: ./deploy-new-server.sh <SERVER_IP>"
    echo "Example: ./deploy-new-server.sh 157.230.123.45"
    exit 1
fi

SERVER_IP=$1
echo -e "${YELLOW}📡 Deploying to server: $SERVER_IP${NC}"

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo -e "${RED}❌ Error: doctl is not installed${NC}"
    echo "Please install doctl first:"
    echo "  Windows: choco install doctl"
    echo "  Or download from: https://github.com/digitalocean/doctl/releases"
    exit 1
fi

# Check if API token is set
if [ -z "$DIGITALOCEAN_ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Error: DIGITALOCEAN_ACCESS_TOKEN not set${NC}"
    echo "Please set your API token:"
    echo "  export DIGITALOCEAN_ACCESS_TOKEN='your_token_here'"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites checked${NC}"

# Test server connectivity
echo -e "${YELLOW}🔍 Testing server connectivity...${NC}"
if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@$SERVER_IP "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${RED}❌ Error: Cannot connect to server $SERVER_IP${NC}"
    echo "Please check:"
    echo "  1. Server IP is correct"
    echo "  2. SSH key is added to server"
    echo "  3. Server is running and accessible"
    exit 1
fi

echo -e "${GREEN}✅ Server connectivity confirmed${NC}"

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
ssh root@$SERVER_IP "apt update && apt upgrade -y"

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
ssh root@$SERVER_IP "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"

# Install Docker Compose
echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
ssh root@$SERVER_IP "curl -L \"https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose"

# Install Nginx
echo -e "${YELLOW}🌐 Installing Nginx...${NC}"
ssh root@$SERVER_IP "apt install -y nginx"

# Create project directory
echo -e "${YELLOW}📁 Creating project directory...${NC}"
ssh root@$SERVER_IP "mkdir -p /opt/greenwood-games && cd /opt/greenwood-games"

# Copy project files
echo -e "${YELLOW}📤 Copying project files...${NC}"
scp -r . root@$SERVER_IP:/opt/greenwood-games/

# Set up environment
echo -e "${YELLOW}⚙️ Setting up environment...${NC}"
ssh root@$SERVER_IP "cd /opt/greenwood-games && cp env.example .env"

# Build and start services
echo -e "${YELLOW}🚀 Building and starting services...${NC}"
ssh root@$SERVER_IP "cd /opt/greenwood-games && docker-compose -f docker-compose.prod.yml up -d --build"

# Configure Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
ssh root@$SERVER_IP "cp /opt/greenwood-games/nginx/nginx-http.conf /etc/nginx/sites-available/default && systemctl restart nginx"

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# Check service health
echo -e "${YELLOW}🔍 Checking service health...${NC}"
ssh root@$SERVER_IP "cd /opt/greenwood-games && docker-compose -f docker-compose.prod.yml ps"

# Test endpoints
echo -e "${YELLOW}🧪 Testing endpoints...${NC}"
if curl -s http://$SERVER_IP > /dev/null; then
    echo -e "${GREEN}✅ Web app is accessible${NC}"
else
    echo -e "${RED}❌ Web app is not accessible${NC}"
fi

if curl -s http://$SERVER_IP:5000/health > /dev/null; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API is not healthy${NC}"
fi

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo "=================================================="
echo -e "${BLUE}🌐 Your casino is now live at:${NC}"
echo -e "${GREEN}   http://$SERVER_IP${NC}"
echo -e "${BLUE}🔧 API Health Check:${NC}"
echo -e "${GREEN}   http://$SERVER_IP:5000/health${NC}"
echo -e "${BLUE}📊 Monitoring Dashboard:${NC}"
echo -e "${GREEN}   http://$SERVER_IP:3001${NC}"
echo "=================================================="
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Configure your domain DNS to point to $SERVER_IP"
echo "2. Install SSL certificate for HTTPS"
echo "3. Set up monitoring and alerts"
echo "4. Configure backups"
echo "5. Start marketing your casino!"
