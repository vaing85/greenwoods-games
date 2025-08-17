#!/bin/bash

# 🛡️ Greenwood Games - Production Security Setup Script
# This script handles SSL certificate generation and security hardening

set -e

echo "🛡️  Starting Greenwood Games Security Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${DOMAIN:-"yourdomain.com"}
EMAIL=${EMAIL:-"admin@yourdomain.com"}
SSL_DIR="./nginx/ssl"
BACKUP_DIR="./backups"

# Create directories
mkdir -p $SSL_DIR
mkdir -p $BACKUP_DIR
mkdir -p ./logs

echo -e "${YELLOW}📂 Created required directories${NC}"

# Generate SSL certificates (Let's Encrypt)
generate_ssl() {
    echo -e "${YELLOW}🔐 Generating SSL certificates for $DOMAIN...${NC}"
    
    if command -v certbot &> /dev/null; then
        sudo certbot certonly --standalone \
            --email $EMAIL \
            --agree-tos \
            --no-eff-email \
            -d $DOMAIN \
            -d www.$DOMAIN \
            -d api.$DOMAIN
        
        # Copy certificates to nginx directory
        sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/cert.pem
        sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/key.pem
        sudo chown $(whoami):$(whoami) $SSL_DIR/*
        
        echo -e "${GREEN}✅ SSL certificates generated successfully${NC}"
    else
        echo -e "${RED}❌ Certbot not found. Installing...${NC}"
        sudo apt-get update
        sudo apt-get install -y certbot
        generate_ssl
    fi
}

# Generate self-signed certificates for development
generate_self_signed() {
    echo -e "${YELLOW}🔐 Generating self-signed certificates for development...${NC}"
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout $SSL_DIR/key.pem \
        -out $SSL_DIR/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=$DOMAIN"
    
    echo -e "${GREEN}✅ Self-signed certificates generated${NC}"
}

# Set up firewall
setup_firewall() {
    echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
    
    # Enable UFW
    sudo ufw --force enable
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Allow specific application ports
    sudo ufw allow 3000  # Web app
    sudo ufw allow 5000  # API server
    
    # Deny all other incoming connections
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    echo -e "${GREEN}✅ Firewall configured${NC}"
}

# Secure file permissions
secure_permissions() {
    echo -e "${YELLOW}🔒 Setting secure file permissions...${NC}"
    
    # SSL certificates
    chmod 600 $SSL_DIR/*.pem 2>/dev/null || true
    
    # Environment files
    chmod 600 .env* 2>/dev/null || true
    
    # Script files
    chmod +x scripts/*.sh 2>/dev/null || true
    
    # Log directory
    chmod 755 logs/ 2>/dev/null || true
    
    echo -e "${GREEN}✅ File permissions secured${NC}"
}

# Install security updates
install_security_updates() {
    echo -e "${YELLOW}🔄 Installing security updates...${NC}"
    
    sudo apt-get update
    sudo apt-get upgrade -y
    sudo apt-get autoremove -y
    
    echo -e "${GREEN}✅ Security updates installed${NC}"
}

# Main execution
main() {
    echo -e "${GREEN}🚀 Starting production security setup for Greenwood Games${NC}"
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        echo -e "${RED}❌ Do not run this script as root${NC}"
        exit 1
    fi
    
    # Environment check
    if [[ -z "$DOMAIN" ]]; then
        echo -e "${RED}❌ DOMAIN environment variable is required${NC}"
        echo "Usage: DOMAIN=yourdomain.com ./setup-security.sh"
        exit 1
    fi
    
    # Install security updates
    install_security_updates
    
    # Generate SSL certificates
    if [[ "$NODE_ENV" == "production" ]]; then
        generate_ssl
    else
        generate_self_signed
    fi
    
    # Set up firewall
    setup_firewall
    
    # Secure file permissions
    secure_permissions
    
    echo -e "${GREEN}✅ Security setup completed successfully!${NC}"
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "1. Review and update .env.production with your values"
    echo "2. Run: npm run deploy:start"
    echo "3. Test your deployment: npm run health:check"
    echo "4. Set up monitoring: npm run monitor:start"
}

# Run main function
main "$@"
