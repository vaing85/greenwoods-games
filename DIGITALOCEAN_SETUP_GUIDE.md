# 🚀 DigitalOcean Setup Guide - Greenwood Games

## 📋 **Complete Step-by-Step Setup**

### **Step 1: Create DigitalOcean Account**
1. Go to [DigitalOcean.com](https://digitalocean.com)
2. Click "Sign Up" and create account
3. Verify your email address
4. Add a payment method (credit card required)

### **Step 2: Generate API Token**
1. Go to [API Tokens](https://cloud.digitalocean.com/account/api/tokens)
2. Click "Generate New Token"
3. **Name**: `Greenwood Games Deployment`
4. **Scope**: Select "Full Access"
5. Click "Generate Token"
6. **⚠️ IMPORTANT**: Copy and save the token immediately (you won't see it again!)

### **Step 3: Create New Droplet**
1. Go to [Droplets](https://cloud.digitalocean.com/droplets)
2. Click "Create Droplet"
3. **Choose Image**: Ubuntu 20.04 LTS
4. **Choose Size**: Basic Plan - $12/month (2GB RAM, 1 vCPU)
5. **Choose Region**: New York or San Francisco (closest to you)
6. **Authentication**: 
   - Option A: Add your SSH key (recommended)
   - Option B: Use password authentication
7. **Hostname**: `greenwood-casino`
8. **Tags**: `casino`, `greenwood-games`
9. Click "Create Droplet"
10. Wait 2-3 minutes for creation
11. **Note the Public IP address** (e.g., `157.230.123.45`)

---

## 🔧 **Install Required Tools on Windows**

### **Option 1: Install doctl (Recommended)**

#### **Method A: Using Chocolatey**
```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install doctl
choco install doctl
```

#### **Method B: Direct Download**
```powershell
# Download doctl
Invoke-WebRequest -Uri "https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-windows-amd64.zip" -OutFile "doctl.zip"
Expand-Archive -Path "doctl.zip" -DestinationPath "C:\doctl"
# Add C:\doctl to your PATH environment variable
```

#### **Method C: Using Scoop**
```powershell
# Install Scoop first (if not installed)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install doctl
scoop install doctl
```

### **Configure doctl:**
```powershell
# Set your API token
$env:DIGITALOCEAN_ACCESS_TOKEN="your_api_token_here"

# Test connection
doctl account get
```

---

## 🚀 **Deploy Your Casino App**

### **Method 1: Automated Deployment (Recommended)**

#### **Using PowerShell Script:**
```powershell
# Make sure you're in the project directory
cd C:\Users\Villa\greenwood_games

# Set your API token
$env:DIGITALOCEAN_ACCESS_TOKEN="your_api_token_here"

# Run deployment script
.\deploy-new-server.ps1 -ServerIP "YOUR_SERVER_IP"
```

#### **Using Bash Script (if you have WSL or Git Bash):**
```bash
# Make script executable
chmod +x deploy-new-server.sh

# Run deployment
./deploy-new-server.sh YOUR_SERVER_IP
```

### **Method 2: Manual Deployment**

#### **Step 1: Connect to Server**
```powershell
# SSH to your server
ssh root@YOUR_SERVER_IP
```

#### **Step 2: Install Dependencies**
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
apt install -y nginx
```

#### **Step 3: Deploy Application**
```bash
# Create project directory
mkdir -p /opt/greenwood-games
cd /opt/greenwood-games

# Copy project files (from your local machine)
# Use SCP or SFTP to copy files
```

#### **Step 4: Start Services**
```bash
# Set up environment
cp env.example .env

# Start services
docker-compose -f docker-compose.prod.yml up -d --build

# Configure Nginx
cp nginx/nginx-http.conf /etc/nginx/sites-available/default
systemctl restart nginx
```

---

## 🌐 **Configure Domain (Optional)**

### **Step 1: Get Your Server IP**
- Note your droplet's public IP address
- Example: `157.230.123.45`

### **Step 2: Configure DNS**
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS management
3. Add A record:
   - **Type**: A
   - **Name**: `@` (or `casino`)
   - **Value**: `YOUR_SERVER_IP`
   - **TTL**: 300 (5 minutes)

### **Step 3: Test Domain**
- Wait 5-10 minutes for DNS propagation
- Visit your domain: `http://yourdomain.com`

---

## 🔐 **Install SSL Certificate (Optional)**

### **Using Let's Encrypt:**
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

---

## 📊 **Monitor Your Deployment**

### **Check Service Status:**
```bash
# Check Docker containers
docker-compose -f docker-compose.prod.yml ps

# Check Nginx status
systemctl status nginx

# Check logs
docker-compose -f docker-compose.prod.yml logs
```

### **Access Your Casino:**
- **Main Site**: `http://YOUR_SERVER_IP`
- **API Health**: `http://YOUR_SERVER_IP:5000/health`
- **Monitoring**: `http://YOUR_SERVER_IP:3001`

---

## 🆘 **Troubleshooting**

### **Common Issues:**

#### **1. SSH Connection Failed**
```bash
# Check if server is running
ping YOUR_SERVER_IP

# Check SSH key
ssh-add -l

# Try password authentication
ssh root@YOUR_SERVER_IP
```

#### **2. Docker Build Failed**
```bash
# Check Docker logs
docker-compose -f docker-compose.prod.yml logs

# Rebuild without cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

#### **3. Nginx Not Working**
```bash
# Check Nginx status
systemctl status nginx

# Check Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### **4. Port Already in Use**
```bash
# Check what's using the port
netstat -tulpn | grep :80

# Kill the process
kill -9 PID
```

---

## 💰 **Cost Estimation**

### **Monthly Costs:**
- **Droplet**: $12/month (2GB RAM, 1 vCPU)
- **Storage**: $0.10/GB/month (20GB included)
- **Bandwidth**: $0.01/GB (1TB included)
- **Total**: ~$15-20/month

### **Scaling Options:**
- **4GB RAM**: $24/month
- **8GB RAM**: $48/month
- **Load Balancer**: $12/month
- **CDN**: $5-20/month

---

## 🎯 **Next Steps After Deployment**

### **1. Test Your Casino**
- Visit your server IP
- Test all games
- Check user registration
- Test cryptocurrency features

### **2. Configure Monitoring**
- Set up Grafana dashboards
- Configure alerts
- Monitor performance

### **3. Set Up Backups**
- Configure automated backups
- Test restore procedures
- Set up off-site storage

### **4. Marketing**
- Create social media accounts
- Set up Google Analytics
- Start user acquisition

---

## 🎉 **Success!**

**Your Greenwood Games casino is now live and ready to generate revenue!**

**🌐 Live Casino**: `http://YOUR_SERVER_IP`  
**💰 Revenue Ready**: All monetization features active  
**📱 Mobile Ready**: App ready for app store submission  
**🚀 Production Ready**: Enterprise-grade infrastructure  

**Congratulations! Your casino empire is now LIVE!** 🎰💰🚀
