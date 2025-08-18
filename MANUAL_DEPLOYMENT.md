# Manual DigitalOcean Deployment Guide

## Your Server Details:
- **IP Address**: 167.71.240.91
- **SSH Key**: Already configured
- **Plan**: Basic $24/month (4GB RAM, 2 vCPUs, 80GB SSD)

## Step 1: Connect to Your Server

Open a **separate** PowerShell window (not in VS Code) and run:

```bash
ssh root@167.71.240.91
```

When prompted "Are you sure you want to continue connecting?", type `yes` and press Enter.

## Step 2: Run These Commands on Your Server

Once connected to your server, copy and paste these commands one by one:

### Update System
```bash
apt update && apt upgrade -y
```

### Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
```

### Install Git, Nginx, and PM2
```bash
apt install -y git nginx
npm install -g pm2
```

### Clone Your Repository
```bash
cd /var/www
git clone https://github.com/vaing85/greenwoods-games.git
cd greenwoods-games
```

**Note**: If you get an authentication error, the repository might be private. In that case, use:
```bash
# Alternative: Download as ZIP if repository is private
wget https://github.com/vaing85/greenwoods-games/archive/refs/heads/main.zip
unzip main.zip
mv greenwoods-games-main greenwoods-games
cd greenwoods-games
```

### Install Dependencies
```bash
# Install server dependencies
cd server
npm install
cd ..

# Install web dependencies
cd web
npm install
npm run build
cd ..

# Install mobile dependencies (if needed)
cd mobile
npm install
cd ..
```

### Set Up Environment Variables
```bash
cd server
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/greenwood_games_prod
JWT_SECRET=your-super-secure-jwt-secret-key-2025
ENCRYPTION_KEY=your-32-character-encryption-key
COINGECKO_API_KEY=your-coingecko-api-key
SESSION_SECRET=your-session-secret-key
EOF
```

### Install and Configure MongoDB
```bash
# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod
```

### Configure Nginx
```bash
cat > /etc/nginx/sites-available/greenwood-games << 'EOF'
server {
    listen 80;
    server_name 167.71.240.91;

    # Serve React app
    location / {
        root /var/www/greenwoods-games/web/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
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
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/greenwood-games /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### Start Your Application
```bash
cd /var/www/greenwoods-games/server
pm2 start index.js --name "greenwood-games"
pm2 startup
pm2 save
```

### Configure Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

## Step 3: Test Your Deployment

Open your browser and go to:
- **http://167.71.240.91** - Your casino platform should be live!

## Step 4: Monitor Your Application

```bash
# Check server status
pm2 status

# View logs
pm2 logs greenwood-games

# Restart if needed
pm2 restart greenwood-games
```

## Troubleshooting

If something goes wrong:

1. **Check PM2 status**: `pm2 status`
2. **Check logs**: `pm2 logs greenwood-games`
3. **Check Nginx**: `systemctl status nginx`
4. **Check MongoDB**: `systemctl status mongod`

## Your Casino Features Will Be Live:

✅ **All 10+ Games**: Slots, Blackjack, Roulette, Baccarat, Craps, Video Poker
✅ **Phase 8 Advanced**: Cryptocurrency, AI Gaming, Tournaments, Progressive Jackpots  
✅ **Enterprise Security**: JWT authentication, rate limiting
✅ **Real-time Features**: Live chat, multiplayer games
✅ **Mobile Ready**: React Native app integration

**Your casino empire is ready to go live!** 🎰🚀
