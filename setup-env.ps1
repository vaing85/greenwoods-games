# Greenwood Games Environment Setup Script
Write-Host "Setting up Greenwood Games Environment..." -ForegroundColor Green

# Create .env file with secure production values
$envContent = @"
# Greenwood Games Production Environment Configuration
# Generated on $(Get-Date)

# ============ SECURITY (PRODUCTION VALUES) ============
JWT_SECRET=greenwood-games-super-secret-jwt-key-2024-production-minimum-32-chars
MONGO_ROOT_PASSWORD=GreenwoodMongo2024!SecurePass
REDIS_PASSWORD=GreenwoodRedis2024!SecurePass

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
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# ============ RATE LIMITING ============
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# ============ WEB APPLICATION ============
WEB_PORT=3000
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com

# ============ NGINX CONFIGURATION ============
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# ============ MONITORING ============
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GRAFANA_USER=admin
GRAFANA_PASSWORD=GreenwoodGrafana2024!SecurePass

# ============ CRYPTOCURRENCY (Phase 8) ============
ETH_RPC_URL=https://mainnet.infura.io/v3/your-project-id
BITCOIN_NETWORK=testnet

# ============ UPLOAD LIMITS ============
UPLOAD_LIMIT=10mb
"@

# Write the environment file
$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Environment configuration created!" -ForegroundColor Green
Write-Host "Please update the domain names in .env file for your production deployment" -ForegroundColor Yellow

# Create SSL directory
if (!(Test-Path "nginx/ssl")) {
    New-Item -ItemType Directory -Path "nginx/ssl" -Force
    Write-Host "SSL directory created!" -ForegroundColor Green
}

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update domain names in .env file" -ForegroundColor White
Write-Host "2. Generate SSL certificates" -ForegroundColor White
Write-Host "3. Test Docker deployment" -ForegroundColor White
Write-Host "4. Deploy to production" -ForegroundColor White
