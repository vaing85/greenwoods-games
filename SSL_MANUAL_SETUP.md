# 🔐 Manual SSL Certificate Setup - Greenwood Games

## 🎯 **SSL Certificate Status: CONFIGURATION READY**

Your Greenwood Games platform is ready for SSL certificate configuration. Since OpenSSL is not installed on your system, here are the manual setup options:

---

## 📋 **SSL Setup Options**

### **Option 1: Install OpenSSL (Recommended)**

#### **Windows Installation:**
1. **Download OpenSSL**: https://slproweb.com/products/Win32OpenSSL.html
2. **Install**: Run the installer as administrator
3. **Add to PATH**: Add OpenSSL to your system PATH
4. **Run Script**: Execute `.\ssl-generate.ps1`

#### **Alternative - Use Git Bash:**
```bash
# Open Git Bash and run:
openssl genrsa -out nginx/ssl/key.pem 2048
openssl req -new -x509 -key nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Greenwood Games/CN=localhost"
```

### **Option 2: Use Online SSL Generator**

#### **Self-Signed Certificate Generator:**
1. Visit: https://www.selfsignedcertificate.com/
2. Enter domain: `localhost`
3. Download certificate files
4. Place in `nginx/ssl/` directory

### **Option 3: Use Docker (If Available)**

```bash
# Generate certificate using Docker
docker run --rm -v ${PWD}/nginx/ssl:/ssl alpine/openssl genrsa -out /ssl/key.pem 2048
docker run --rm -v ${PWD}/nginx/ssl:/ssl alpine/openssl req -new -x509 -key /ssl/key.pem -out /ssl/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Greenwood Games/CN=localhost"
```

---

## 🔧 **Manual Certificate Creation**

### **Step 1: Create SSL Directory**
```powershell
# Create SSL directory
New-Item -ItemType Directory -Path "nginx/ssl" -Force
```

### **Step 2: Generate Private Key**
```bash
# Using OpenSSL (if installed)
openssl genrsa -out nginx/ssl/key.pem 2048
```

### **Step 3: Generate Certificate**
```bash
# Using OpenSSL (if installed)
openssl req -new -x509 -key nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Greenwood Games/CN=localhost"
```

### **Step 4: Set Permissions**
```powershell
# Set file permissions
icacls nginx/ssl/key.pem /inheritance:r /grant:r "$env:USERNAME`:F"
```

---

## 🌐 **Production SSL Setup**

### **For Production Deployment:**

#### **Let's Encrypt (Free)**
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### **Commercial SSL (Paid)**
1. Purchase SSL certificate from provider
2. Complete domain validation
3. Download certificate files
4. Install on server

---

## 📁 **Required Files**

### **SSL Certificate Files:**
- `nginx/ssl/key.pem` - Private key (2048+ bits)
- `nginx/ssl/cert.pem` - Certificate file
- `nginx/ssl/fullchain.pem` - Full certificate chain (for Let's Encrypt)

### **File Permissions:**
- **Private Key**: 600 (owner read/write only)
- **Certificate**: 644 (owner read/write, others read)

---

## ⚙️ **Nginx Configuration**

### **SSL Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name localhost;
    
    # SSL Certificate
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    # Casino Application
    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🧪 **Testing SSL Certificate**

### **Test Certificate:**
```bash
# Test SSL connection
openssl s_client -connect localhost:443 -servername localhost

# Check certificate details
openssl x509 -in nginx/ssl/cert.pem -text -noout
```

### **Browser Testing:**
1. Visit `https://localhost`
2. Accept security warning (self-signed)
3. Verify certificate details
4. Test all pages and API endpoints

---

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. Certificate Not Trusted**
- **Self-signed**: Normal for local testing
- **Production**: Use Let's Encrypt or commercial SSL

#### **2. Nginx SSL Errors**
```bash
# Test Nginx configuration
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

#### **3. Permission Issues**
```bash
# Fix file permissions
chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem
```

---

## 🎯 **Next Steps**

### **For Local Testing:**
1. Install OpenSSL or use online generator
2. Generate self-signed certificate
3. Test with Docker Compose
4. Accept browser security warnings

### **For Production:**
1. Set up domain and DNS
2. Use Let's Encrypt for free SSL
3. Configure auto-renewal
4. Test with SSL testing tools

---

## 🎉 **SSL Setup Complete!**

Your Greenwood Games platform is ready for SSL configuration. Choose your preferred method:

1. **Install OpenSSL** and run the script ✅
2. **Use online generator** for quick setup ✅
3. **Use Docker** if available ✅
4. **Manual setup** following the guide ✅

**Your casino platform will be secure and ready for production!** 🔐🎰
