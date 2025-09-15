# 🎰 Greenwood Games - New Server Deployment Script (PowerShell)
# This script deploys the casino platform to a fresh DigitalOcean droplet

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

Write-Host "🎰 Greenwood Games - New Server Deployment" -ForegroundColor $Blue
Write-Host "=================================================="

Write-Host "📡 Deploying to server: $ServerIP" -ForegroundColor $Yellow

# Check if doctl is installed
try {
    doctl version | Out-Null
    Write-Host "✅ doctl is installed" -ForegroundColor $Green
} catch {
    Write-Host "❌ Error: doctl is not installed" -ForegroundColor $Red
    Write-Host "Please install doctl first:" -ForegroundColor $Yellow
    Write-Host "  Windows: choco install doctl" -ForegroundColor $Yellow
    Write-Host "  Or download from: https://github.com/digitalocean/doctl/releases" -ForegroundColor $Yellow
    exit 1
}

# Check if API token is set
if (-not $env:DIGITALOCEAN_ACCESS_TOKEN) {
    Write-Host "❌ Error: DIGITALOCEAN_ACCESS_TOKEN not set" -ForegroundColor $Red
    Write-Host "Please set your API token:" -ForegroundColor $Yellow
    Write-Host "  `$env:DIGITALOCEAN_ACCESS_TOKEN='your_token_here'" -ForegroundColor $Yellow
    exit 1
}

Write-Host "✅ Prerequisites checked" -ForegroundColor $Green

# Test server connectivity
Write-Host "🔍 Testing server connectivity..." -ForegroundColor $Yellow
try {
    $result = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@$ServerIP "echo 'Connection successful'" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Server connectivity confirmed" -ForegroundColor $Green
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "❌ Error: Cannot connect to server $ServerIP" -ForegroundColor $Red
    Write-Host "Please check:" -ForegroundColor $Yellow
    Write-Host "  1. Server IP is correct" -ForegroundColor $Yellow
    Write-Host "  2. SSH key is added to server" -ForegroundColor $Yellow
    Write-Host "  3. Server is running and accessible" -ForegroundColor $Yellow
    exit 1
}

# Update system packages
Write-Host "📦 Updating system packages..." -ForegroundColor $Yellow
ssh root@$ServerIP "apt update; apt upgrade -y"

# Install Docker
Write-Host "🐳 Installing Docker..." -ForegroundColor $Yellow
ssh root@$ServerIP "curl -fsSL https://get.docker.com -o get-docker.sh; sh get-docker.sh"

# Install Docker Compose
Write-Host "🐳 Installing Docker Compose..." -ForegroundColor $Yellow
ssh root@$ServerIP "curl -L `"https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-`$(uname -s)-`$(uname -m)`" -o /usr/local/bin/docker-compose; chmod +x /usr/local/bin/docker-compose"

# Install Nginx
Write-Host "🌐 Installing Nginx..." -ForegroundColor $Yellow
ssh root@$ServerIP "apt install -y nginx"

# Create project directory
Write-Host "📁 Creating project directory..." -ForegroundColor $Yellow
ssh root@$ServerIP "mkdir -p /opt/greenwood-games; cd /opt/greenwood-games"

# Copy project files
Write-Host "📤 Copying project files..." -ForegroundColor $Yellow
scp -r . "root@${ServerIP}:/opt/greenwood-games/"

# Set up environment
Write-Host "⚙️ Setting up environment..." -ForegroundColor $Yellow
ssh root@$ServerIP "cd /opt/greenwood-games; cp env.example .env"

# Build and start services
Write-Host "🚀 Building and starting services..." -ForegroundColor $Yellow
ssh root@$ServerIP "cd /opt/greenwood-games; docker-compose -f docker-compose.prod.yml up -d --build"

# Configure Nginx
Write-Host "🌐 Configuring Nginx..." -ForegroundColor $Yellow
ssh root@$ServerIP "cp /opt/greenwood-games/nginx/nginx-http.conf /etc/nginx/sites-available/default; systemctl restart nginx"

# Wait for services to start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor $Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "🔍 Checking service health..." -ForegroundColor $Yellow
ssh root@$ServerIP "cd /opt/greenwood-games && docker-compose -f docker-compose.prod.yml ps"

# Test endpoints
Write-Host "🧪 Testing endpoints..." -ForegroundColor $Yellow
try {
    $webResponse = Invoke-WebRequest -Uri "http://$ServerIP" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✅ Web app is accessible" -ForegroundColor $Green
} catch {
    Write-Host "❌ Web app is not accessible" -ForegroundColor $Red
}

try {
    $apiResponse = Invoke-WebRequest -Uri "http://$ServerIP:5000/health" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✅ API is healthy" -ForegroundColor $Green
} catch {
    Write-Host "❌ API is not healthy" -ForegroundColor $Red
}

Write-Host "🎉 Deployment completed!" -ForegroundColor $Green
Write-Host "=================================================="
Write-Host "🌐 Your casino is now live at:" -ForegroundColor $Blue
Write-Host "   http://$ServerIP" -ForegroundColor $Green
Write-Host "🔧 API Health Check:" -ForegroundColor $Blue
Write-Host "   http://$ServerIP:5000/health" -ForegroundColor $Green
Write-Host "📊 Monitoring Dashboard:" -ForegroundColor $Blue
Write-Host "   http://$ServerIP:3001" -ForegroundColor $Green
Write-Host "=================================================="
Write-Host "📝 Next steps:" -ForegroundColor $Yellow
Write-Host "1. Configure your domain DNS to point to $ServerIP" -ForegroundColor $Yellow
Write-Host "2. Install SSL certificate for HTTPS" -ForegroundColor $Yellow
Write-Host "3. Set up monitoring and alerts" -ForegroundColor $Yellow
Write-Host "4. Configure backups" -ForegroundColor $Yellow
Write-Host "5. Start marketing your casino!" -ForegroundColor $Yellow
