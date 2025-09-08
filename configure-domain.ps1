# Greenwood Games - Domain Configuration Script
# This script helps configure your domain for production deployment

Write-Host "🌐 Greenwood Games - Domain Configuration Script" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Function to get domain input
function Get-DomainInput {
    Write-Host ""
    Write-Host "Please enter your domain information:" -ForegroundColor Yellow
    Write-Host ""
    
    $domain = Read-Host "Enter your domain (e.g., greenwoodgames.com)"
    $serverIP = Read-Host "Enter your server IP address"
    $email = Read-Host "Enter your email for SSL certificates"
    
    return @{
        Domain = $domain
        ServerIP = $serverIP
        Email = $email
    }
}

# Function to create production .env file
function Create-ProductionEnv {
    param($DomainInfo)
    
    Write-Host "📝 Creating production .env file..." -ForegroundColor Yellow
    
    $envContent = @"
# Greenwood Games Production Environment Configuration
# Generated on $(Get-Date)

# ============ DOMAIN CONFIGURATION ============
DOMAIN=$($DomainInfo.Domain)
WWW_DOMAIN=www.$($DomainInfo.Domain)
API_DOMAIN=api.$($DomainInfo.Domain)
MOBILE_DOMAIN=mobile.$($DomainInfo.Domain)

# ============ SECURITY (PRODUCTION VALUES) ============
JWT_SECRET=greenwood-games-super-secret-jwt-key-2024-production-minimum-32-chars
MONGO_ROOT_PASSWORD=GreenwoodMongo2024!SecurePass
REDIS_PASSWORD=GreenwoodRedis2024!SecurePass
GRAFANA_PASSWORD=GreenwoodGrafana2024!SecurePass

# ============ DATABASE CONFIGURATION ============
MONGODB_URI=mongodb://admin:GreenwoodMongo2024!SecurePass@mongodb:27017/greenwood_games?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_DB_NAME=greenwood_games
MONGO_PORT=27017

# ============ REDIS CONFIGURATION ============
REDIS_URL=redis://:GreenwoodRedis2024!SecurePass@redis:6379
REDIS_PORT=6379

# ============ SERVER CONFIGURATION ============
NODE_ENV=production
PORT=5000
SERVER_PORT=5000

# ============ JWT CONFIGURATION ============
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000

# ============ CORS CONFIGURATION ============
CORS_ORIGIN=https://$($DomainInfo.Domain),https://www.$($DomainInfo.Domain),https://api.$($DomainInfo.Domain),https://mobile.$($DomainInfo.Domain)

# ============ RATE LIMITING ============
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# ============ WEB APPLICATION ============
WEB_PORT=3000
REACT_APP_API_URL=https://api.$($DomainInfo.Domain)
REACT_APP_SOCKET_URL=https://api.$($DomainInfo.Domain)

# ============ NGINX CONFIGURATION ============
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# ============ SSL CONFIGURATION ============
SSL_CERT_PATH=/etc/letsencrypt/live/$($DomainInfo.Domain)/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/$($DomainInfo.Domain)/privkey.pem
SSL_EMAIL=$($DomainInfo.Email)

# ============ MONITORING ============
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GRAFANA_USER=admin

# ============ CRYPTOCURRENCY (Phase 8) ============
ETH_RPC_URL=https://mainnet.infura.io/v3/your-project-id
BITCOIN_NETWORK=mainnet
USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
USDC_CONTRACT_ADDRESS=0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C

# ============ UPLOAD LIMITS ============
UPLOAD_LIMIT=10mb

# ============ EMAIL CONFIGURATION ============
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@$($DomainInfo.Domain)
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@$($DomainInfo.Domain)

# ============ FEATURE FLAGS ============
ENABLE_CRYPTO_PAYMENTS=true
ENABLE_TOURNAMENTS=true
ENABLE_AI_GAMING=true
ENABLE_PROGRESSIVE_JACKPOTS=true
ENABLE_LIVE_DEALERS=true
ENABLE_SOCIAL_FEATURES=true

# ============ GAMING CONFIGURATION ============
HOUSE_EDGE=0.02
MIN_BET=0.01
MAX_BET=1000
JACKPOT_INCREMENT=0.01
TOURNAMENT_ENTRY_FEE=5.00
VIP_THRESHOLD=1000
"@

    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Production .env file created!" -ForegroundColor Green
}

# Function to update mobile app configuration
function Update-MobileConfig {
    param($DomainInfo)
    
    Write-Host "📱 Updating mobile app configuration..." -ForegroundColor Yellow
    
    $mobileConfigPath = "mobile/app.json"
    if (Test-Path $mobileConfigPath) {
        $config = Get-Content $mobileConfigPath | ConvertFrom-Json
        
        # Update iOS associated domains
        $config.expo.ios.associatedDomains = @("applinks:$($DomainInfo.Domain)")
        
        # Update Android intent filters
        $config.expo.android.intentFilters = @(
            @{
                action = "VIEW"
                autoVerify = $true
                data = @(
                    @{
                        scheme = "https"
                        host = $DomainInfo.Domain
                    }
                )
                category = @("BROWSABLE", "DEFAULT")
            }
        )
        
        $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $mobileConfigPath -Encoding UTF8
        Write-Host "✅ Mobile app configuration updated!" -ForegroundColor Green
    }
}

# Function to generate DNS configuration
function Generate-DNSConfig {
    param($DomainInfo)
    
    Write-Host "🌐 Generating DNS configuration..." -ForegroundColor Yellow
    
    $dnsConfig = @"
# DNS Configuration for $($DomainInfo.Domain)
# Add these records to your domain registrar's DNS settings

# A Records (IPv4)
Type: A
Name: @
Value: $($DomainInfo.ServerIP)
TTL: 300

Type: A
Name: www
Value: $($DomainInfo.ServerIP)
TTL: 300

Type: A
Name: api
Value: $($DomainInfo.ServerIP)
TTL: 300

Type: A
Name: mobile
Value: $($DomainInfo.ServerIP)
TTL: 300

# CNAME Records (Optional)
Type: CNAME
Name: admin
Value: $($DomainInfo.Domain)
TTL: 300

Type: CNAME
Name: cdn
Value: $($DomainInfo.Domain)
TTL: 300

# MX Records (Email)
Type: MX
Name: @
Value: mail.$($DomainInfo.Domain)
Priority: 10
TTL: 300

# TXT Records (Verification)
Type: TXT
Name: @
Value: "v=spf1 include:_spf.google.com ~all"
TTL: 300

Type: TXT
Name: @
Value: "google-site-verification=your-verification-code"
TTL: 300
"@

    $dnsConfig | Out-File -FilePath "dns-configuration.txt" -Encoding UTF8
    Write-Host "✅ DNS configuration saved to dns-configuration.txt" -ForegroundColor Green
}

# Function to generate SSL certificate commands
function Generate-SSLCmds {
    param($DomainInfo)
    
    Write-Host "🔐 Generating SSL certificate commands..." -ForegroundColor Yellow
    
    $sslCmds = @"
# SSL Certificate Generation Commands
# Run these commands on your server

# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d $($DomainInfo.Domain) -d www.$($DomainInfo.Domain) -d api.$($DomainInfo.Domain) -d mobile.$($DomainInfo.Domain)

# Test auto-renewal
sudo certbot renew --dry-run

# Add to crontab for auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
"@

    $sslCmds | Out-File -FilePath "ssl-setup-commands.txt" -Encoding UTF8
    Write-Host "✅ SSL setup commands saved to ssl-setup-commands.txt" -ForegroundColor Green
}

# Function to generate deployment commands
function Generate-DeployCmds {
    param($DomainInfo)
    
    Write-Host "🚀 Generating deployment commands..." -ForegroundColor Yellow
    
    $deployCmds = @"
# Deployment Commands for $($DomainInfo.Domain)
# Run these commands to deploy your casino platform

# 1. Copy environment file
cp .env .env.production

# 2. Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d

# 3. Check status
docker-compose -f docker-compose.prod.yml ps

# 4. View logs
docker-compose -f docker-compose.prod.yml logs -f

# 5. Test deployment
curl -I https://$($DomainInfo.Domain)
curl https://api.$($DomainInfo.Domain)/api/health

# 6. Test mobile app
curl https://$($DomainInfo.Domain)/.well-known/apple-app-site-association
"@

    $deployCmds | Out-File -FilePath "deployment-commands.txt" -Encoding UTF8
    Write-Host "✅ Deployment commands saved to deployment-commands.txt" -ForegroundColor Green
}

# Main execution
Write-Host ""
Write-Host "This script will help you configure your domain for production deployment." -ForegroundColor Cyan
Write-Host ""

$domainInfo = Get-DomainInput

Write-Host ""
Write-Host "🔧 Configuring domain: $($domainInfo.Domain)" -ForegroundColor Green
Write-Host "🌐 Server IP: $($domainInfo.ServerIP)" -ForegroundColor Green
Write-Host "📧 Email: $($domainInfo.Email)" -ForegroundColor Green
Write-Host ""

# Create production environment file
Create-ProductionEnv -DomainInfo $domainInfo

# Update mobile app configuration
Update-MobileConfig -DomainInfo $domainInfo

# Generate DNS configuration
Generate-DNSConfig -DomainInfo $domainInfo

# Generate SSL certificate commands
Generate-SSLCmds -DomainInfo $domainInfo

# Generate deployment commands
Generate-DeployCmds -DomainInfo $domainInfo

Write-Host ""
Write-Host "🎉 Domain configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Add DNS records to your domain registrar" -ForegroundColor White
Write-Host "2. Run SSL certificate commands on your server" -ForegroundColor White
Write-Host "3. Deploy your application using deployment commands" -ForegroundColor White
Write-Host "4. Test your live casino platform!" -ForegroundColor White
Write-Host ""
Write-Host "📁 Configuration files created:" -ForegroundColor Cyan
Write-Host "- .env (Production environment)" -ForegroundColor White
Write-Host "- dns-configuration.txt (DNS records)" -ForegroundColor White
Write-Host "- ssl-setup-commands.txt (SSL commands)" -ForegroundColor White
Write-Host "- deployment-commands.txt (Deployment commands)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Your Greenwood Games casino is ready for production!" -ForegroundColor Green
