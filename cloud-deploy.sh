#!/bin/bash

# Greenwood Games - Cloud Production Deployment Script
# For DigitalOcean, AWS, Azure, Google Cloud

set -e  # Exit on any error

echo "🎰 GREENWOOD GAMES - CLOUD PRODUCTION DEPLOYMENT"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if domain is provided
if [ -z "$1" ]; then
    print_warning "Usage: $0 <your-domain.com>"
    print_info "Example: $0 greenwoodgames.com"
    exit 1
fi

DOMAIN=$1
echo "🌐 Domain: $DOMAIN"
echo ""

# Update system
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_status "System updated"

# Install essential packages
print_info "Installing essential packages..."
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx htop unzip
print_status "Essential packages installed"

# Install Node.js 18
print_info "Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_status "Node.js installed: $(node --version)"
else
    print_status "Node.js already installed: $(node --version)"
fi

# Install Docker and Docker Compose
print_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_status "Docker installed"
else
    print_status "Docker already installed"
fi

print_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed"
else
    print_status "Docker Compose already installed"
fi

# Install PM2
print_info "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_status "PM2 installed"
else
    print_status "PM2 already installed"
fi

# Clone repository if not exists
if [ ! -d "greenwoods-games" ]; then
    print_info "Cloning Greenwood Games repository..."
    git clone https://github.com/vaing85/greenwoods-games.git
    print_status "Repository cloned"
else
    print_info "Repository exists, pulling latest changes..."
    cd greenwoods-games
    git pull origin main
    cd ..
    print_status "Repository updated"
fi

cd greenwoods-games

# Setup environment variables
print_info "Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.template .env
    
    # Generate secure secrets
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    SESSION_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    
    # Update .env file
    sed -i "s/your-super-secure-jwt-secret-change-this-in-production/$JWT_SECRET/" .env
    sed -i "s/your-session-secret-key-change-this-in-production/$SESSION_SECRET/" .env
    sed -i "s/NODE_ENV=development/NODE_ENV=production/" .env
    sed -i "s|CORS_ORIGIN=http://localhost:3000|CORS_ORIGIN=https://$DOMAIN|" .env
    sed -i "s/SESSION_COOKIE_SECURE=false/SESSION_COOKIE_SECURE=true/" .env
    
    print_status "Environment variables configured"
    print_warning "Please edit .env file and configure your MongoDB URI!"
    print_info "Edit with: nano .env"
    read -p "Press Enter after configuring .env file..."
else
    print_status "Environment file already exists"
fi

# Install dependencies
print_info "Installing Node.js dependencies..."
npm install

print_info "Installing server dependencies..."
cd server && npm install && cd ..

print_info "Installing web dependencies..."
cd web && npm install && cd ..

print_info "Installing mobile dependencies..."
cd mobile && npm install && cd ..

print_status "All dependencies installed"

# Build web application
print_info "Building web application for production..."
cd web
npm run build
cd ..
print_status "Web application built"

# Create PM2 ecosystem file
print_info "Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'greenwood-server',
      script: 'server/index.js',
      cwd: '$(pwd)',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/greenwood-server-error.log',
      out_file: '/var/log/pm2/greenwood-server-out.log',
      log_file: '/var/log/pm2/greenwood-server.log'
    }
  ]
};
EOF
print_status "PM2 ecosystem file created"

# Create Nginx configuration
print_info "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/greenwood-games > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect to HTTPS (will be configured after SSL)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/greenwood-games /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
print_status "Nginx configuration created and tested"

# Setup firewall
print_info "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
print_status "Firewall configured"

# Start services
print_info "Starting services..."

# Start PM2 processes
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Serve web build with a simple static server
print_info "Starting web server..."
cd web
npx serve -s build -l 3000 &
cd ..

# Restart Nginx
sudo systemctl restart nginx
print_status "Services started"

# Setup SSL with Let's Encrypt
print_info "Setting up SSL certificate..."
print_warning "Make sure your domain $DOMAIN points to this server's IP address!"
read -p "Press Enter when DNS is configured and propagated..."

if sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN; then
    print_status "SSL certificate installed successfully"
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    print_status "SSL auto-renewal configured"
else
    print_warning "SSL certificate installation failed. You can run it manually later:"
    print_info "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# Create deployment script for future updates
print_info "Creating update deployment script..."
cat > deploy-update.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating Greenwood Games..."
git pull origin main
npm install
cd server && npm install && cd ..
cd web && npm install && npm run build && cd ..
pm2 restart ecosystem.config.js
echo "✅ Update complete!"
EOF
chmod +x deploy-update.sh
print_status "Update script created (./deploy-update.sh)"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
print_status "Greenwood Games is now live!"
echo ""
echo "🌐 URLs:"
echo "   Main site: https://$DOMAIN"
echo "   API: https://$DOMAIN/api"
echo "   Health check: https://$DOMAIN/api/health"
echo ""
echo "🔧 Management:"
echo "   PM2 status: pm2 status"
echo "   PM2 logs: pm2 logs"
echo "   Update: ./deploy-update.sh"
echo ""
echo "📋 Next steps:"
echo "   1. Configure your MongoDB database URI in .env"
echo "   2. Test all games and features"
echo "   3. Set up monitoring alerts"
echo "   4. Configure backups"
echo ""
print_warning "Don't forget to:"
print_info "   • Configure MongoDB URI in .env"
print_info "   • Test Phase 8 features (crypto, AI, tournaments)"
print_info "   • Set up domain DNS if not done already"
echo ""
echo "🎰 Your casino empire is ready to launch!"
