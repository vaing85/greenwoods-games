# 🚀 Greenwood Games - Complete Cloud Hosting Guide

## Option C: Full Control Cloud Deployment

### 🎯 **Recommended Platform: DigitalOcean** (Best for beginners)

---

## 🌟 **Step 1: Create DigitalOcean Droplet**

### **1.1 Sign Up & Create Droplet**
1. Go to [DigitalOcean.com](https://digitalocean.com)
2. Create account (use referral codes for free credits)
3. Click "Create Droplet"

### **1.2 Droplet Configuration**
- **Image**: Ubuntu 22.04 LTS
- **Plan**: Basic
- **CPU Options**: Regular Intel (4GB RAM, 2 vCPU, 80GB SSD) - $24/month
- **Data Center**: Choose closest to your target audience
- **Authentication**: SSH Key (recommended) or Password
- **Hostname**: `greenwood-games-server`
- **Tags**: `production`, `casino`, `greenwood`

### **1.3 Get Your Server IP**
- Note down your server's IP address (e.g., `192.168.1.100`)

---

## 🌐 **Step 2: Domain Configuration**

### **2.1 Purchase Domain** (if you don't have one)
- **Recommended**: Namecheap, GoDaddy, Google Domains
- **Suggestions**: `greenwoodgames.com`, `yourcasinoname.com`

### **2.2 Configure DNS**
Point your domain to your server:
- **A Record**: `@` → `your-server-ip`
- **A Record**: `www` → `your-server-ip`
- **A Record**: `api` → `your-server-ip` (optional)

**DNS Propagation**: Wait 15-60 minutes for DNS to propagate

---

## 💻 **Step 3: Server Setup**

### **3.1 Connect to Your Server**
```bash
# SSH into your server
ssh root@your-server-ip

# Or if using SSH key
ssh -i /path/to/your/key root@your-server-ip
```

### **3.2 Run Automated Deployment**
```bash
# Download and run the deployment script
wget https://raw.githubusercontent.com/vaing85/greenwoods-games/main/cloud-deploy.sh
chmod +x cloud-deploy.sh
./cloud-deploy.sh yourdomain.com
```

**The script will automatically:**
- ✅ Update system packages
- ✅ Install Node.js, Docker, Nginx, PM2
- ✅ Clone your repository
- ✅ Install all dependencies
- ✅ Build production files
- ✅ Configure Nginx reverse proxy
- ✅ Setup SSL certificate
- ✅ Configure firewall
- ✅ Start all services

---

## 🗄️ **Step 4: Database Setup (MongoDB Atlas)**

### **4.1 Create MongoDB Atlas Account**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free account
3. Create new cluster (Free tier: M0 Sandbox)

### **4.2 Configure Database**
1. **Database Access**: Create database user
   - Username: `greenwood_admin`
   - Password: Generate secure password
   - Roles: `Read and write to any database`

2. **Network Access**: Add IP addresses
   - Add your server IP: `your-server-ip/32`
   - Or allow from anywhere: `0.0.0.0/0` (less secure)

3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

### **4.3 Update Environment Variables**
```bash
# On your server, edit the .env file
nano /path/to/greenwoods-games/.env

# Update MongoDB URI
MONGODB_URI=mongodb+srv://greenwood_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/greenwood_games?retryWrites=true&w=majority
```

---

## 🔐 **Step 5: SSL & Security**

### **5.1 SSL Certificate** (Automated by script)
- Let's Encrypt SSL certificate automatically installed
- Auto-renewal configured

### **5.2 Security Checklist**
- ✅ Firewall configured (ports 22, 80, 443)
- ✅ HTTPS redirect enabled
- ✅ Secure headers configured
- ✅ Rate limiting enabled
- ✅ Strong JWT secrets generated

---

## 🎮 **Step 6: Testing & Verification**

### **6.1 Test Your Live Site**
```bash
# Health check
curl https://yourdomain.com/api/health

# Test Phase 8 features
curl https://yourdomain.com/api/phase8/overview

# Test games API
curl https://yourdomain.com/api/games
```

### **6.2 Browser Testing**
1. Visit `https://yourdomain.com`
2. Test user registration/login
3. Test all casino games
4. Test Phase 8 features:
   - Cryptocurrency prices
   - Progressive jackpots
   - Tournament system
   - AI gaming features

---

## 📊 **Step 7: Monitoring & Maintenance**

### **7.1 Server Monitoring**
```bash
# Check PM2 processes
pm2 status

# View logs
pm2 logs

# Server resources
htop

# Disk usage
df -h
```

### **7.2 Application Monitoring**
- **Health endpoint**: `https://yourdomain.com/api/health`
- **Server logs**: `/var/log/pm2/`
- **Nginx logs**: `/var/log/nginx/`

### **7.3 Updates & Maintenance**
```bash
# Update your application
cd /path/to/greenwoods-games
./deploy-update.sh

# System updates
sudo apt update && sudo apt upgrade -y

# SSL renewal (automatic)
sudo certbot renew --dry-run
```

---

## 💰 **Cost Breakdown**

### **Monthly Costs**
- **DigitalOcean Droplet**: $24/month (4GB RAM)
- **Domain**: $1-2/month
- **MongoDB Atlas**: Free (M0) or $9/month (M2)
- **Total**: ~$25-35/month

### **Optional Upgrades**
- **Larger Droplet**: $48/month (8GB RAM)
- **Load Balancer**: $12/month
- **CDN**: $5/month
- **Backup Storage**: $1-5/month

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Site Not Loading**
```bash
# Check Nginx status
sudo systemctl status nginx

# Check PM2 processes
pm2 status

# Check logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

#### **2. Database Connection Issues**
```bash
# Test MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_MONGODB_URI').then(() => console.log('Connected')).catch(err => console.log('Error:', err));"
```

#### **3. SSL Certificate Issues**
```bash
# Renew SSL manually
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### **4. Performance Issues**
```bash
# Monitor resources
htop
iotop
sudo netstat -tulpn
```

---

## 🎯 **Production Checklist**

### **Before Going Live**
- [ ] Domain DNS configured and propagated
- [ ] SSL certificate installed and working
- [ ] MongoDB database connected
- [ ] All environment variables configured
- [ ] All games tested and functional
- [ ] Phase 8 features operational
- [ ] User registration/login working
- [ ] Payment systems configured (if applicable)
- [ ] Monitoring alerts set up
- [ ] Backup strategy implemented

### **Security Checklist**
- [ ] Strong passwords for all accounts
- [ ] SSH key authentication enabled
- [ ] Firewall properly configured
- [ ] Regular security updates scheduled
- [ ] SSL/TLS encryption enforced
- [ ] Rate limiting configured
- [ ] Database access restricted

---

## 🎉 **Success!**

Your Greenwood Games casino platform is now live and running on professional cloud infrastructure!

### **What You've Achieved:**
- ✅ **Professional Hosting**: Cloud server with full control
- ✅ **Enterprise Security**: SSL, firewall, secure headers
- ✅ **Scalable Architecture**: Ready for high traffic
- ✅ **Complete Platform**: All 8 phases + Phase 8 advanced features
- ✅ **Production Ready**: Monitoring, logging, auto-updates

### **Your Live Platform Features:**
- 🎰 **10+ Casino Games**: Fully operational
- 💰 **Cryptocurrency Integration**: Bitcoin, Ethereum, USDT, USDC
- 🤖 **AI Gaming Assistant**: Smart recommendations
- 🏆 **Tournament System**: Advanced competitions
- 🎰 **Progressive Jackpots**: Multi-tier rewards
- 📱 **Mobile Support**: React Native app ready

**🚀 Welcome to the big leagues! Your casino empire is now LIVE!**
