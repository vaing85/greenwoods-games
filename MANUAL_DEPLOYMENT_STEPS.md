# 🎰 Manual Deployment Steps - Greenwood Games

## 🌐 **Your Server Details:**
- **IP Address**: `167.172.152.130` (or `68.183.139.44`)
- **Server**: DigitalOcean Droplet
- **OS**: Ubuntu 24.04 LTS
- **Status**: ✅ Active

---

## 📋 **Step-by-Step Manual Deployment**

### **Step 1: Access Your Server**
1. Go to [DigitalOcean Console](https://cloud.digitalocean.com/droplets)
2. Click on your droplet `greenwood-casino`
3. Click "Console" to open the web-based terminal
4. Login as `root` (no password needed in console)

### **Step 2: Update System**
```bash
apt update && apt upgrade -y
```

### **Step 3: Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### **Step 4: Install Docker Compose**
```bash
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### **Step 5: Install Nginx**
```bash
apt install -y nginx
```

### **Step 6: Create Project Directory**
```bash
mkdir -p /opt/greenwood-games
cd /opt/greenwood-games
```

### **Step 7: Upload Project Files**
You have three options:

#### **Option A: Use Optimized Deployment Script (Recommended)**
```bash
# For Linux/macOS/WSL
chmod +x deploy-optimized.sh
./deploy-optimized.sh

# For Windows PowerShell
.\deploy-optimized.ps1
```

#### **Option B: Upload via DigitalOcean Console**
1. In the DigitalOcean console, look for "Upload Files" or "File Manager"
2. Upload your project files to `/opt/greenwood-games/`

#### **Option C: Use SCP from Your Local Machine (Not Recommended)**
```bash
# From your local machine (Windows PowerShell)
scp -r . root@167.172.152.130:/opt/greenwood-games/
```
**Note**: This uploads ALL files including unnecessary ones, making deployment slower.

### **Step 8: Set Up Environment**
```bash
cd /opt/greenwood-games
cp env.example .env
```

### **Step 9: Start Services**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### **Step 10: Configure Nginx**
```bash
cp nginx/nginx-http.conf /etc/nginx/sites-available/default
systemctl restart nginx
```

### **Step 11: Check Status**
```bash
# Check Docker containers
docker-compose -f docker-compose.prod.yml ps

# Check Nginx status
systemctl status nginx

# Check if services are running
curl http://localhost
curl http://localhost:5000/health
```

---

## 🎯 **Expected Results**

After completion, your casino should be accessible at:
- **Main Site**: `http://167.172.152.130`
- **API Health**: `http://167.172.152.130:5000/health`
- **Monitoring**: `http://167.172.152.130:3001`

---

## 🆘 **Troubleshooting**

### **If Docker Build Fails:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Rebuild without cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

### **If Nginx Fails:**
```bash
# Check Nginx config
nginx -t

# Check Nginx logs
journalctl -u nginx

# Restart Nginx
systemctl restart nginx
```

### **If Services Don't Start:**
```bash
# Check Docker status
systemctl status docker

# Check available ports
netstat -tulpn | grep :80
netstat -tulpn | grep :5000
```

---

## 🎉 **Success!**

Once deployed, your Greenwood Games casino will be:
- ✅ **Live and operational**
- ✅ **Ready to generate revenue**
- ✅ **Accessible worldwide**
- ✅ **Fully functional with all games**

**Your casino empire is ready to launch!** 🎰💰🚀
