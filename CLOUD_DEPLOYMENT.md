# Greenwood Games - Cloud Production Deployment Guide
# DigitalOcean / AWS / Azure / Google Cloud

## 🌐 Cloud Platform Setup Options

### Option C1: DigitalOcean Droplet (Recommended for beginners)
### Option C2: AWS EC2 Instance (Most popular)
### Option C3: Azure Virtual Machine (Enterprise)
### Option C4: Google Cloud Compute Engine

---

## 🔧 Server Requirements

### **Minimum Specifications:**
- **CPU**: 2 vCPUs (4 vCPUs recommended)
- **RAM**: 4GB (8GB recommended)
- **Storage**: 80GB SSD
- **Bandwidth**: 1TB/month
- **OS**: Ubuntu 22.04 LTS

### **Recommended Specifications (Production):**
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Storage**: 160GB SSD
- **Bandwidth**: 5TB/month
- **Load Balancer**: Yes
- **CDN**: Enabled

---

## 🚀 Quick Setup Commands

### **1. Initial Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install PM2 for process management
sudo npm install -g pm2
```

### **2. Clone and Setup Project**
```bash
# Clone your repository
git clone https://github.com/vaing85/greenwoods-games.git
cd greenwoods-games

# Copy environment template
cp .env.template .env

# Edit environment variables
nano .env
```

### **3. Configure Environment Variables**
```env
# Production Environment Variables
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/greenwood_games?retryWrites=true&w=majority
DB_NAME=greenwood_games

# Security (GENERATE SECURE SECRETS!)
JWT_SECRET=your-super-secure-production-jwt-secret-64-characters-long
SESSION_SECRET=your-production-session-secret-64-characters-long

# Domain Configuration
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com

# SSL Configuration
SSL_ENABLED=true
FORCE_HTTPS=true

# Phase 8 Advanced Features
COINGECKO_API_URL=https://api.coingecko.com/api/v3
AI_GAMING_ENABLED=true
TOURNAMENTS_ENABLED=true
PROGRESSIVE_JACKPOTS_ENABLED=true

# Rate Limiting (Production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Security
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE=strict

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
```

---

## 🐳 Docker Production Deployment

### **Method 1: Docker Compose (Recommended)**
```bash
# Install dependencies
npm install
cd server && npm install && cd ..
cd web && npm install && cd ..

# Start production with Docker
docker-compose -f docker-compose.yml up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### **Method 2: Manual Docker Build**
```bash
# Build server
cd server
docker build -t greenwood-server .

# Build web
cd ../web
docker build -t greenwood-web .

# Run containers
docker run -d --name greenwood-server -p 5000:5000 greenwood-server
docker run -d --name greenwood-web -p 3000:3000 greenwood-web
```

---

## 🌐 Nginx Configuration

### **Create Nginx Config**
```bash
sudo nano /etc/nginx/sites-available/greenwood-games
```

```nginx
# Greenwood Games Production Nginx Configuration
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/s;

    # Frontend (React App)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO for real-time features
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }

    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Monitoring Dashboard
server {
    listen 443 ssl http2;
    server_name monitoring.yourdomain.com;

    # SSL Configuration (same as above)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Basic Auth for monitoring
    auth_basic "Monitoring Access";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Enable Nginx Site**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/greenwood-games /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔐 SSL Certificate Setup

### **Let's Encrypt SSL (Free)**
```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal setup
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Production Monitoring Setup

### **PM2 Process Management**
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'greenwood-server',
      script: 'server/index.js',
      cwd: '/path/to/greenwoods-games',
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
    },
    {
      name: 'greenwood-web',
      script: 'serve',
      args: '-s web/build -l 3000',
      cwd: '/path/to/greenwoods-games',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔥 Firewall Configuration

```bash
# Setup UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 27017  # MongoDB (if local)
sudo ufw status
```

---

## 🎯 Database Setup

### **Option 1: MongoDB Atlas (Recommended)**
1. Sign up at https://cloud.mongodb.com
2. Create cluster
3. Create database user
4. Whitelist server IP
5. Get connection string

### **Option 2: Local MongoDB**
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## 🚀 Deployment Script

Save this as `production-deploy.sh`:
```bash
#!/bin/bash

echo "🎰 Greenwood Games - Production Deployment"
echo "========================================"

# Pull latest code
git pull origin main

# Install dependencies
npm install
cd server && npm install && cd ..
cd web && npm install && npm run build && cd ..

# Update PM2 processes
pm2 restart ecosystem.config.js

# Update Docker containers
docker-compose down
docker-compose up -d

echo "✅ Deployment complete!"
echo "🌐 Check: https://yourdomain.com"
echo "📊 Monitoring: https://monitoring.yourdomain.com"
```

---

## 📋 Go-Live Checklist

- [ ] Server provisioned and configured
- [ ] Domain DNS pointed to server IP
- [ ] SSL certificate installed
- [ ] Environment variables configured
- [ ] Database setup (MongoDB Atlas recommended)
- [ ] Nginx configuration active
- [ ] PM2 or Docker containers running
- [ ] Firewall configured
- [ ] Monitoring dashboard accessible
- [ ] All games tested in production
- [ ] Phase 8 features operational

---

## 💰 Estimated Costs

### **DigitalOcean** (Most cost-effective)
- **$40/month**: 4GB RAM, 2 vCPUs, 80GB SSD
- **$80/month**: 8GB RAM, 4 vCPUs, 160GB SSD

### **AWS EC2**
- **t3.medium**: ~$30/month + bandwidth
- **t3.large**: ~$60/month + bandwidth

### **Azure**
- **B2s**: ~$35/month
- **B4ms**: ~$120/month

### **Additional Costs**
- **Domain**: $10-15/year
- **MongoDB Atlas**: $0-$57/month (depending on usage)
- **CDN/Load Balancer**: $5-20/month

---

🎰 **Your Greenwood Games platform will be fully operational in the cloud!**
