# 🚀 Greenwood Games - Production Deployment Guide

## 🎯 Phase 7: Production Ready - Complete!

### ✅ What's Included in Phase 7:

#### 🛡️ Security Features:
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Rate Limiting**: Protection against DDoS and abuse
- **Input Validation**: Comprehensive validation and sanitization
- **Security Headers**: HSTS, CSP, XSS protection, and more
- **HTTPS Enforcement**: SSL/TLS encryption for all connections
- **Password Security**: Bcrypt hashing with configurable rounds

#### 🐳 Docker Infrastructure:
- **Multi-container Setup**: Server, Web, Database, Redis, Nginx
- **Health Checks**: Automated health monitoring for all services
- **Volume Management**: Persistent data storage
- **Network Isolation**: Secure container networking
- **Auto-restart**: Service recovery on failures

#### 📊 Monitoring & Analytics:
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visual dashboards and monitoring
- **Application Metrics**: Performance and usage tracking
- **Health Endpoints**: Real-time service status
- **Request Logging**: Comprehensive audit trails

#### 🔧 Production Configuration:
- **Environment Management**: Secure configuration handling
- **Load Balancing**: Nginx reverse proxy with SSL termination
- **Caching**: Redis for sessions and performance
- **Error Handling**: Graceful error management and recovery
- **Graceful Shutdown**: Clean service termination

---

## 🚀 Quick Start Deployment

### 1. **Pre-deployment Setup**
```bash
# Copy environment template
cp .env.production .env

# Edit with your production values
nano .env
```

### 2. **Security Setup**
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run security setup (Linux/Mac)
DOMAIN=yourdomain.com ./scripts/setup-security.sh

# Windows alternative - manual SSL setup required
```

### 3. **Deploy with Docker**
```bash
# Build and start all services
npm run deploy:start

# Check deployment status
npm run deploy:status

# View logs
npm run deploy:logs
```

### 4. **Verify Deployment**
```bash
# Health check
npm run health:check

# Test API endpoints
curl https://yourdomain.com/api/games
curl https://yourdomain.com/health
```

---

## 🔧 Configuration Guide

### **Required Environment Variables:**
```env
# Security (REQUIRED - Change in production!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
MONGO_ROOT_PASSWORD=your-secure-mongo-password
REDIS_PASSWORD=your-secure-redis-password

# Domain Configuration
DOMAIN_NAME=yourdomain.com
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Database
MONGODB_URI=mongodb://admin:password@mongodb:27017/greenwood_games?authSource=admin
```

### **SSL Certificates:**
- **Production**: Use Let's Encrypt (automated in setup script)
- **Development**: Self-signed certificates (generated automatically)
- **Custom**: Place `cert.pem` and `key.pem` in `nginx/ssl/`

---

## 📊 Monitoring Dashboard

### **Access Points:**
- **Application**: https://yourdomain.com
- **API**: https://api.yourdomain.com
- **Grafana**: https://yourdomain.com:3001 (admin/admin123)
- **Prometheus**: https://yourdomain.com:9090

### **Key Metrics:**
- **Response Times**: API and page load performance
- **Error Rates**: 4xx/5xx error tracking
- **Active Users**: Real-time user connections
- **Database Performance**: Query times and connections
- **Resource Usage**: CPU, memory, disk utilization

---

## 🔒 Security Features

### **Authentication & Authorization:**
- JWT tokens with expiration and refresh
- Rate limiting per IP and endpoint
- Password hashing with bcrypt
- Session management with Redis

### **Input Protection:**
- XSS prevention with input sanitization
- SQL injection protection
- CSRF protection with secure headers
- File upload validation and limits

### **Network Security:**
- HTTPS-only with HSTS headers
- Content Security Policy (CSP)
- Secure cookie settings
- CORS configuration

---

## 🛠️ Management Commands

### **Deployment:**
```bash
npm run deploy:start      # Start all services
npm run deploy:stop       # Stop all services  
npm run deploy:restart    # Restart deployment
npm run deploy:logs       # View service logs
npm run deploy:status     # Check service status
```

### **Database:**
```bash
npm run backup:db         # Create database backup
npm run restore:db        # Restore from backup
npm run migrate:up        # Run database migrations
npm run seed:production   # Seed production data
```

### **Monitoring:**
```bash
npm run monitor:start     # Start monitoring stack
npm run monitor:stop      # Stop monitoring
npm run health:check      # Check application health
```

### **Security:**
```bash
npm run security:scan     # Security vulnerability scan
npm run ssl:renew         # Renew SSL certificates
npm run test:security     # Run security tests
```

---

## 📋 Production Checklist

### **Before Deployment:**
- [ ] Update all environment variables in `.env`
- [ ] Configure domain DNS settings
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Test backup and restore procedures

### **After Deployment:**
- [ ] Verify all services are running
- [ ] Test authentication and authorization
- [ ] Check SSL certificate validity
- [ ] Configure monitoring alerts
- [ ] Perform load testing
- [ ] Set up log rotation
- [ ] Configure backup automation

### **Ongoing Maintenance:**
- [ ] Monitor application metrics
- [ ] Review security logs regularly
- [ ] Update dependencies monthly
- [ ] Renew SSL certificates
- [ ] Rotate JWT secrets quarterly
- [ ] Test disaster recovery procedures

---

## 🆘 Troubleshooting

### **Common Issues:**

#### **Service Won't Start:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs service-name

# Check disk space
df -h

# Check port conflicts
netstat -tulpn | grep :5000
```

#### **SSL Certificate Issues:**
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew
```

#### **Database Connection Issues:**
```bash
# Check MongoDB status
docker exec greenwood-mongodb mongo --eval "db.stats()"

# Reset database connection
docker-compose -f docker-compose.prod.yml restart mongodb
```

#### **Performance Issues:**
```bash
# Check resource usage
docker stats

# Analyze slow queries
docker exec greenwood-mongodb mongo --eval "db.setProfilingLevel(2)"
```

---

## 🎯 Phase 7 Complete! 

**Greenwood Games is now production-ready with:**
- ✅ Enterprise-grade security
- ✅ Scalable Docker infrastructure  
- ✅ Comprehensive monitoring
- ✅ Automated deployment
- ✅ SSL/HTTPS enforcement
- ✅ Performance optimization
- ✅ Error handling & recovery
- ✅ Production configuration

**Next Steps:**
- Deploy to your production environment
- Configure custom domain and SSL
- Set up monitoring alerts
- Perform load testing
- Plan scaling strategies

**Your complete casino platform with 6 development phases is ready for the world!** 🎰🚀
