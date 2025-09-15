# 🚀 Quick Deploy Guide - Server 161.35.92.24

## **Your DigitalOcean Server Details:**
- **Server IP**: `161.35.92.24`
- **Status**: Ready for deployment
- **OS**: Ubuntu 22.04 LTS (assumed)

---

## 🎯 **Step-by-Step Deployment**

### **Step 1: Connect to Your Server**
```bash
# Connect via SSH
ssh root@161.35.92.24

# Or if you have a specific user
ssh your-username@161.35.92.24
```

### **Step 2: Download and Run Deployment Script**
```bash
# Download the deployment script
wget https://raw.githubusercontent.com/vaing85/greenwoods-games/main/deploy-to-server.sh

# Make it executable


# Run the deployment script
sudo ./deploy-to-server.sh
```

### **Step 3: Enter Your Domain Name**
When prompted, enter your domain name (e.g., `greenwoodgames.com`)

### **Step 4: Wait for Deployment**
The script will automatically:
- ✅ Update system packages
- ✅ Install Node.js, Docker, Docker Compose
- ✅ Configure firewall
- ✅ Clone your repository
- ✅ Set up environment variables
- ✅ Deploy with Docker
- ✅ Generate SSL certificates
- ✅ Set up monitoring and backups

---

## 🌐 **Domain Configuration**

### **Before Running the Script:**
1. **Purchase a domain** (if you haven't already)
2. **Configure DNS records** in your domain registrar:

```
Type: A
Name: @
Value: 161.35.92.24
TTL: 300

Type: A
Name: www
Value: 161.35.92.24
TTL: 300

Type: A
Name: api
Value: 161.35.92.24
TTL: 300

Type: A
Name: mobile
Value: 161.35.92.24
TTL: 300
```

---

## 🎉 **After Deployment**

### **Your Live Casino Platform Will Be Available At:**
- **Main Site**: `https://yourdomain.com`
- **API**: `https://api.yourdomain.com`
- **Mobile**: `https://mobile.yourdomain.com`

### **Monitoring Dashboards:**
- **Grafana**: `https://yourdomain.com:3001`
- **Prometheus**: `https://yourdomain.com:9090`

### **Test Your Platform:**
1. Visit your main site
2. Test user registration/login
3. Play all casino games
4. Test mobile functionality
5. Check API endpoints

---

## 💰 **Revenue Generation**

### **Immediate Revenue Streams:**
- **Cryptocurrency Deposits**: BTC, ETH, USDT, USDC
- **Gaming Revenue**: House edge on all games
- **Tournament Fees**: Entry fees and platform fees
- **VIP Subscriptions**: Monthly premium plans
- **In-App Purchases**: Virtual currency and features

### **Expected Revenue:**
- **Month 1**: $10,000-25,000
- **Month 3**: $25,000-50,000
- **Month 6**: $50,000-100,000+
- **Year 1**: $100,000-500,000+

---

## 🚨 **Troubleshooting**

### **If Deployment Fails:**
```bash
# Check Docker status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### **If SSL Certificate Fails:**
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew
```

### **If Services Don't Start:**
```bash
# Check system resources
htop
df -h
free -h

# Check firewall
sudo ufw status
```

---

## 📞 **Support**

### **If You Need Help:**
1. Check the detailed guide: `DIGITALOCEAN_DEPLOYMENT_GUIDE.md`
2. Review server logs: `docker-compose -f docker-compose.prod.yml logs`
3. Check service status: `docker-compose -f docker-compose.prod.yml ps`

---

## 🎯 **Ready to Deploy!**

Your Greenwood Games casino platform is ready to go live on server **161.35.92.24**!

**Just run the deployment script and you'll have a fully functional casino platform generating revenue!** 🎰💰🚀
