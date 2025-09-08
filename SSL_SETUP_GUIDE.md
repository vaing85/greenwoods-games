# 🔐 SSL Certificate Setup Guide - Greenwood Games

## 🎯 **SSL Configuration Status: READY TO CONFIGURE**

Your Greenwood Games platform is ready for SSL certificate configuration. This guide covers both local testing and production SSL setup.

---

## 📋 **SSL Setup Options**

### **✅ What's Already Ready:**
- ✅ **Nginx Configuration**: SSL-ready reverse proxy
- ✅ **Docker Setup**: SSL certificate mounting configured
- ✅ **Environment Variables**: SSL paths configured
- ✅ **Certificate Structure**: SSL directory created

### **🔧 SSL Options Available:**
1. **Let's Encrypt** (Free, Production-ready)
2. **Self-Signed** (Local testing only)
3. **Commercial SSL** (Enterprise-grade)
4. **Cloudflare SSL** (Free with CDN)

---

## 🚀 **Option 1: Let's Encrypt (Recommended for Production)**

### **Step 1: Install Certbot**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx

# Or use snap
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### **Step 2: Generate SSL Certificate**
```bash
# Single domain
sudo certbot --nginx -d yourdomain.com

# Multiple domains
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com -d mobile.yourdomain.com

# With email
sudo certbot --nginx -d yourdomain.com --email admin@yourdomain.com --agree-tos --non-interactive
```

### **Step 3: Test Auto-Renewal**
```bash
# Test renewal
sudo certbot renew --dry-run

# Check renewal status
sudo certbot certificates
```

### **Step 4: Setup Auto-Renewal**
```bash
# Add to crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# Or create systemd timer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🧪 **Option 2: Self-Signed Certificates (Local Testing)**

### **Step 1: Generate Self-Signed Certificate**
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate private key
openssl genrsa -out nginx/ssl/key.pem 2048

# Generate certificate
openssl req -new -x509 -key nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Set permissions
chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem
```

### **Step 2: Update Nginx Configuration**
```nginx
server {
    listen 443 ssl;
    server_name localhost;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Rest of your configuration...
}
```

---

## 💼 **Option 3: Commercial SSL Certificates**

### **Recommended Providers:**
- **DigiCert**: $175-500/year (Enterprise)
- **Comodo**: $50-200/year (Standard)
- **GoDaddy**: $60-300/year (Basic)
- **Sectigo**: $50-250/year (Popular)

### **Certificate Types:**
- **DV (Domain Validated)**: $50-100/year
- **OV (Organization Validated)**: $100-300/year
- **EV (Extended Validated)**: $200-500/year

### **Installation Process:**
1. Purchase certificate from provider
2. Complete domain validation
3. Download certificate files
4. Install on server
5. Configure Nginx

---

## ☁️ **Option 4: Cloudflare SSL (Free with CDN)**

### **Step 1: Add Domain to Cloudflare**
1. Create Cloudflare account
2. Add your domain
3. Change nameservers to Cloudflare

### **Step 2: Configure SSL**
1. Go to SSL/TLS settings
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Configure security headers

### **Step 3: Update DNS**
```
Type: A
Name: @
Value: YOUR_SERVER_IP
Proxy: Enabled (orange cloud)

Type: A
Name: www
Value: YOUR_SERVER_IP
Proxy: Enabled (orange cloud)
```

---

## 🔧 **SSL Configuration for Greenwood Games**

### **Nginx SSL Configuration**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Casino Application
    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API
    location /api/ {
        proxy_pass http://server:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://server:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🧪 **Local Testing SSL Setup**

### **Step 1: Generate Local Certificates**
```bash
# Run the SSL generation script
.\generate-ssl.ps1
```

### **Step 2: Update Docker Compose**
```yaml
services:
  nginx:
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
    ports:
      - "443:443"
```

### **Step 3: Test Local HTTPS**
```bash
# Test SSL certificate
curl -k https://localhost

# Test with browser
# Visit https://localhost (accept security warning)
```

---

## 🔍 **SSL Testing & Validation**

### **SSL Test Tools:**
- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **SSL Checker**: https://www.sslchecker.com/
- **SSL Shopper**: https://www.sslshopper.com/ssl-checker.html

### **Command Line Testing:**
```bash
# Test SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate details
openssl x509 -in /path/to/cert.pem -text -noout

# Test SSL configuration
nmap --script ssl-enum-ciphers -p 443 yourdomain.com
```

### **Browser Testing:**
1. Visit your site with HTTPS
2. Check for security warnings
3. Verify certificate details
4. Test all pages and API endpoints

---

## 🚨 **Common SSL Issues & Solutions**

### **Issue 1: Certificate Not Trusted**
```bash
# Check certificate chain
openssl s_client -connect yourdomain.com:443 -showcerts

# Verify certificate installation
sudo certbot certificates
```

### **Issue 2: Mixed Content Warnings**
```javascript
// Update API URLs to HTTPS
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

### **Issue 3: Certificate Expiration**
```bash
# Check expiration date
openssl x509 -in /path/to/cert.pem -noout -dates

# Renew certificate
sudo certbot renew
```

### **Issue 4: Nginx SSL Errors**
```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 **SSL Performance Optimization**

### **HTTP/2 Support**
```nginx
listen 443 ssl http2;
```

### **SSL Session Caching**
```nginx
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### **OCSP Stapling**
```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /path/to/root-ca.pem;
```

### **Perfect Forward Secrecy**
```nginx
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

---

## 🎯 **SSL Security Best Practices**

### **Certificate Management:**
- Use strong private keys (2048+ bits)
- Enable certificate transparency
- Monitor certificate expiration
- Implement auto-renewal

### **Security Headers:**
- HSTS (HTTP Strict Transport Security)
- CSP (Content Security Policy)
- X-Frame-Options
- X-Content-Type-Options

### **Cipher Suites:**
- Disable weak ciphers
- Prefer ECDHE over DHE
- Use TLS 1.2+ only
- Implement perfect forward secrecy

---

## 🎉 **SSL Setup Complete!**

### **What You'll Have:**
- ✅ **HTTPS Encryption**: All traffic encrypted
- ✅ **Security Headers**: Protection against attacks
- ✅ **Auto-Renewal**: Certificates stay current
- ✅ **Performance**: HTTP/2 and optimization
- ✅ **Trust**: Browser security indicators

### **Next Steps:**
1. **Test SSL Configuration**: Use SSL testing tools
2. **Update Application**: Ensure all URLs use HTTPS
3. **Monitor Expiration**: Set up certificate monitoring
4. **Deploy to Production**: Your casino is secure!

---

## 💰 **SSL Costs**

### **Free Options:**
- **Let's Encrypt**: $0/year
- **Cloudflare SSL**: $0/year (with CDN)

### **Paid Options:**
- **Basic SSL**: $50-100/year
- **Wildcard SSL**: $100-300/year
- **EV SSL**: $200-500/year

### **Recommended:**
- **Start with Let's Encrypt** (free)
- **Upgrade to commercial** if needed
- **Add Cloudflare** for CDN and DDoS protection

---

## 🚀 **Ready to Secure Your Casino!**

Your Greenwood Games platform is ready for SSL configuration. Choose your preferred option:

1. **Let's Encrypt** (Free, Production-ready) ✅
2. **Self-Signed** (Local testing) ✅
3. **Commercial SSL** (Enterprise-grade) ✅
4. **Cloudflare SSL** (Free with CDN) ✅

**Your casino platform will be secure and trusted by users!** 🔐🎰
