# 🌐 Domain Setup Guide - Greenwood Games

## 🎯 **Domain Configuration Status: READY TO CONFIGURE**

Your Greenwood Games platform is ready for domain configuration. This guide will help you set up your domain for production deployment.

---

## 📋 **Domain Setup Checklist**

### **✅ What's Already Ready:**
- ✅ **Docker Configuration**: Production-ready with domain support
- ✅ **Nginx Configuration**: Reverse proxy configured for domains
- ✅ **SSL Setup**: Certificate structure ready
- ✅ **Environment Variables**: Domain configuration placeholders
- ✅ **Mobile App**: Domain linking configured

### **🔧 What Needs Configuration:**
- [ ] **Domain Purchase**: Buy a domain name
- [ ] **DNS Configuration**: Point domain to your server
- [ ] **SSL Certificates**: Generate real certificates
- [ ] **Environment Variables**: Update with your domain
- [ ] **Mobile App**: Update domain in app configuration

---

## 🌐 **Step 1: Domain Purchase**

### **Recommended Domain Names:**
- `greenwoodgames.com`
- `greenwoodcasino.com`
- `yourcasinoname.com`
- `greenwood777.com`

### **Domain Registrars:**
- **Namecheap**: $8-12/year (recommended)
- **GoDaddy**: $10-15/year
- **Google Domains**: $12/year
- **Cloudflare**: $8-10/year

### **Domain Requirements:**
- **TLD**: .com (most trusted)
- **Length**: Short and memorable
- **Keywords**: Include "casino", "games", or "greenwood"
- **Availability**: Check availability first

---

## 🔧 **Step 2: DNS Configuration**

### **Required DNS Records:**

#### **A Records (IPv4):**
```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 300 (5 minutes)

Type: A
Name: www
Value: YOUR_SERVER_IP
TTL: 300 (5 minutes)

Type: A
Name: api
Value: YOUR_SERVER_IP
TTL: 300 (5 minutes)
```

#### **CNAME Records (Optional):**
```
Type: CNAME
Name: mobile
Value: yourdomain.com
TTL: 300 (5 minutes)

Type: CNAME
Name: admin
Value: yourdomain.com
TTL: 300 (5 minutes)
```

### **DNS Propagation:**
- **Time**: 15-60 minutes
- **Check**: Use `nslookup yourdomain.com`
- **Global**: Up to 24 hours for worldwide propagation

---

## 🔐 **Step 3: SSL Certificate Generation**

### **Option A: Let's Encrypt (Free)**
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Option B: Commercial SSL (Recommended for Production)**
- **DigiCert**: $175-500/year
- **Comodo**: $50-200/year
- **GoDaddy**: $60-300/year

### **Option C: Cloudflare SSL (Free)**
1. Add domain to Cloudflare
2. Change nameservers to Cloudflare
3. Enable SSL/TLS encryption
4. Set to "Full (strict)" mode

---

## ⚙️ **Step 4: Environment Configuration**

### **Update .env File:**
```bash
# Domain Configuration
DOMAIN=yourdomain.com
WWW_DOMAIN=www.yourdomain.com
API_DOMAIN=api.yourdomain.com

# SSL Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://api.yourdomain.com

# API URLs
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

---

## 📱 **Step 5: Mobile App Domain Configuration**

### **Update mobile/app.json:**
```json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:yourdomain.com"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "yourdomain.com"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

---

## 🚀 **Step 6: Production Deployment**

### **Deploy with Domain:**
```bash
# Update environment variables
cp env.example .env
# Edit .env with your domain settings

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### **Verify Domain Setup:**
```bash
# Test domain resolution
nslookup yourdomain.com

# Test HTTPS
curl -I https://yourdomain.com

# Test API
curl https://api.yourdomain.com/api/health

# Test mobile app
curl https://yourdomain.com/.well-known/apple-app-site-association
```

---

## 🔍 **Step 7: Domain Testing**

### **Web Application Tests:**
1. **Main Site**: `https://yourdomain.com`
2. **API Endpoints**: `https://api.yourdomain.com/api/health`
3. **SSL Certificate**: Check browser security
4. **Mobile Responsiveness**: Test on different devices

### **Mobile App Tests:**
1. **Deep Linking**: Test app links from website
2. **API Integration**: Verify mobile app connects to API
3. **Push Notifications**: Test notification delivery
4. **App Store**: Verify app store links work

---

## 📊 **Step 8: Monitoring & Analytics**

### **Domain Monitoring:**
- **Uptime**: Monitor domain availability
- **SSL**: Check certificate expiration
- **DNS**: Monitor DNS resolution
- **Performance**: Track loading times

### **Analytics Setup:**
- **Google Analytics**: Track website traffic
- **Google Search Console**: Monitor search performance
- **Mobile Analytics**: Track app usage
- **Error Monitoring**: Track application errors

---

## 🎯 **Domain Configuration Examples**

### **Example 1: Basic Setup**
```
Domain: greenwoodgames.com
Server IP: 192.168.1.100
SSL: Let's Encrypt
CDN: None
```

### **Example 2: Professional Setup**
```
Domain: greenwoodgames.com
Server IP: 192.168.1.100
SSL: DigiCert EV
CDN: Cloudflare
Load Balancer: Yes
```

### **Example 3: Enterprise Setup**
```
Domain: greenwoodgames.com
Server IP: 192.168.1.100
SSL: DigiCert EV
CDN: Cloudflare
Load Balancer: Yes
DDoS Protection: Yes
WAF: Yes
```

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Domain Not Resolving**
```bash
# Check DNS propagation
nslookup yourdomain.com
dig yourdomain.com

# Check nameservers
dig NS yourdomain.com
```

### **Issue 2: SSL Certificate Errors**
```bash
# Check certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Renew certificate
sudo certbot renew --dry-run
```

### **Issue 3: CORS Errors**
```bash
# Check CORS configuration
curl -H "Origin: https://yourdomain.com" https://api.yourdomain.com/api/health
```

---

## 🎉 **Domain Setup Complete!**

### **What You'll Have:**
- ✅ **Professional Domain**: Your own .com domain
- ✅ **SSL Security**: HTTPS encryption
- ✅ **Mobile Integration**: Deep linking support
- ✅ **API Access**: Dedicated API subdomain
- ✅ **Monitoring**: Domain health monitoring

### **Next Steps:**
1. **Deploy to Production**: Use your domain
2. **Test Everything**: Verify all functionality
3. **Launch Marketing**: Start promoting your casino
4. **Monitor Performance**: Track domain metrics

---

## 💰 **Domain Costs**

### **Annual Costs:**
- **Domain**: $8-15/year
- **SSL Certificate**: $0-500/year
- **DNS**: $0-50/year
- **Total**: $8-565/year

### **One-Time Costs:**
- **Domain Setup**: $0 (if you do it yourself)
- **SSL Setup**: $0 (if using Let's Encrypt)
- **Total**: $0

---

## 🎯 **Ready to Configure Your Domain!**

Your Greenwood Games platform is ready for domain configuration. Follow this guide to:

1. **Purchase a domain** ($8-15/year)
2. **Configure DNS** (15 minutes)
3. **Generate SSL certificates** (10 minutes)
4. **Update environment variables** (5 minutes)
5. **Deploy to production** (5 minutes)

**Total time: 30-45 minutes**
**Total cost: $8-15/year**

**Your casino platform will be live with a professional domain!** 🚀🎰
