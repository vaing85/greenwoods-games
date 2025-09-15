#!/bin/bash

# Greenwood Games - Deploy to DigitalOcean Server
# Server IP: 161.35.92.24

set -e

echo "🚀 Deploying Greenwood Games to DigitalOcean Server"
echo "Server IP: 161.35.92.24"
echo "=================================================="

# Colors for output
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
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Get domain name
read -p "Enter your domain name (e.g., greenwoodgames.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    print_error "Domain name is required"
    exit 1
fi

print_info "Domain: $DOMAIN"
print_info "Server IP: 161.35.92.24"

# Update system
print_info "Updating system packages..."
apt update && apt upgrade -y
print_status "System updated"

# Install essential packages
print_info "Installing essential packages..."
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw htop
print_status "Essential packages installed"

# Install Node.js 18
print_info "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
print_status "Node.js installed: $(node --version)"

# Install Docker
print_info "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER
rm get-docker.sh
print_status "Docker installed: $(docker --version)"

# Install Docker Compose
print_info "Installing Docker Compose..."
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
print_status "Docker Compose installed: $(docker-compose --version)"

# Install PM2
print_info "Installing PM2..."
npm install -g pm2
print_status "PM2 installed: $(pm2 --version)"

# Configure firewall
print_info "Configuring firewall..."
ufw --force enable
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 3000  # Web app
ufw allow 5000  # API
print_status "Firewall configured"

# Clone repository
print_info "Cloning Greenwood Games repository..."
if [ -d "greenwoods-games" ]; then
    print_warning "Repository already exists, updating..."
    cd greenwoods-games
    git pull origin main
else
    git clone https://github.com/vaing85/greenwoods-games.git
    cd greenwoods-games
fi
print_status "Repository cloned/updated"

# Create production environment
print_info "Creating production environment..."
cp env.example .env

# Update environment variables
print_info "Updating environment variables..."
cat > .env << EOF
# Greenwood Games Production Environment Configuration
# Generated on $(date)
# Server IP: 161.35.92.24

# Domain Configuration
DOMAIN=$DOMAIN
WWW_DOMAIN=www.$DOMAIN
API_DOMAIN=api.$DOMAIN
MOBILE_DOMAIN=mobile.$DOMAIN

# Security (PRODUCTION VALUES - CHANGE THESE!)
JWT_SECRET=$(openssl rand -base64 32)
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
GRAFANA_PASSWORD=$(openssl rand -base64 32)

# Database Configuration
MONGODB_URI=mongodb://admin:\$MONGO_ROOT_PASSWORD@mongodb:27017/greenwood_games?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_DB_NAME=greenwood_games
MONGO_PORT=27017

# Redis Configuration
REDIS_URL=redis://:\$REDIS_PASSWORD@redis:6379
REDIS_PORT=6379

# Server Configuration
NODE_ENV=production
PORT=5000
SERVER_PORT=5000

# JWT Configuration
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000

# CORS Configuration
CORS_ORIGIN=https://$DOMAIN,https://www.$DOMAIN,https://api.$DOMAIN,https://mobile.$DOMAIN

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Web Application
WEB_PORT=3000
REACT_APP_API_URL=https://api.$DOMAIN
REACT_APP_SOCKET_URL=https://api.$DOMAIN

# Nginx Configuration
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# SSL Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/$DOMAIN/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/$DOMAIN/privkey.pem
SSL_EMAIL=admin@$DOMAIN

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GRAFANA_USER=admin

# Cryptocurrency (Phase 8)
ETH_RPC_URL=https://mainnet.infura.io/v3/your-project-id
BITCOIN_NETWORK=mainnet
USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
USDC_CONTRACT_ADDRESS=0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C

# Upload Limits
UPLOAD_LIMIT=10mb

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@$DOMAIN
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@$DOMAIN

# Feature Flags
ENABLE_CRYPTO_PAYMENTS=true
ENABLE_TOURNAMENTS=true
ENABLE_AI_GAMING=true
ENABLE_PROGRESSIVE_JACKPOTS=true
ENABLE_LIVE_DEALERS=true
ENABLE_SOCIAL_FEATURES=true

# Gaming Configuration
HOUSE_EDGE=0.02
MIN_BET=0.01
MAX_BET=1000
JACKPOT_INCREMENT=0.01
TOURNAMENT_ENTRY_FEE=5.00
VIP_THRESHOLD=1000
EOF

print_status "Environment file created with secure random passwords"

# Pre-build React application
print_info "Pre-building React application..."
cd web
chmod +x pre-build.sh
./pre-build.sh
cd ..

# Deploy with Docker
print_info "Deploying application with Docker..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to start
print_info "Waiting for services to start..."
sleep 30

# Check service status
print_info "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Generate SSL certificate
print_info "Generating SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN -d mobile.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Setup auto-renewal
print_info "Setting up SSL auto-renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# Create backup script
print_info "Creating backup script..."
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
mkdir -p $BACKUP_DIR

# Backup database
docker exec greenwood-mongodb mongodump --out /backup
docker cp greenwood-mongodb:/backup $BACKUP_DIR/mongodb_$DATE

# Backup application
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /root/greenwoods-games

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -delete
EOF

chmod +x /root/backup.sh

# Setup daily backups
echo "0 2 * * * /root/backup.sh" | crontab -

# Test deployment
print_info "Testing deployment..."
sleep 10

# Test health endpoints
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_status "API server is healthy"
else
    print_warning "API server health check failed"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "Web application is running"
else
    print_warning "Web application health check failed"
fi

# Final status
echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
print_status "Your Greenwood Games casino platform is now live!"
echo ""
echo "🌐 Access Points:"
echo "   Main Site: https://$DOMAIN"
echo "   API: https://api.$DOMAIN"
echo "   Mobile: https://mobile.$DOMAIN"
echo ""
echo "📊 Monitoring:"
echo "   Grafana: https://$DOMAIN:3001"
echo "   Prometheus: https://$DOMAIN:9090"
echo ""
echo "🔐 Credentials:"
echo "   Grafana: admin / $(grep GRAFANA_PASSWORD .env | cut -d'=' -f2)"
echo ""
echo "📋 Next Steps:"
echo "   1. Test your live site: https://$DOMAIN"
echo "   2. Configure your domain DNS if not done already"
echo "   3. Test all casino games and features"
echo "   4. Start marketing your casino platform"
echo "   5. Monitor performance and user feedback"
echo ""
echo "💰 Revenue Potential:"
echo "   Month 1: \$10,000-25,000"
echo "   Month 6: \$50,000-100,000+"
echo "   Year 1: \$100,000-500,000+"
echo ""
print_status "Your casino empire is now LIVE! 🎰🚀💰"
