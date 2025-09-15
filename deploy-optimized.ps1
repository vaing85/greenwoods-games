# 🎰 Optimized Deployment Script for Greenwood Games (PowerShell)
# This script only uploads essential files, making deployment faster and more secure

param(
    [string]$ServerIP = "167.172.152.130",
    [string]$ServerUser = "root",
    [string]$ServerPath = "/opt/greenwood-games"
)

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$NC = "`e[0m" # No Color

Write-Host "${Blue}🎰 Greenwood Games - Optimized Deployment${NC}" -ForegroundColor Blue
Write-Host "${Blue}==========================================${NC}" -ForegroundColor Blue

# Check if server is reachable
Write-Host "${Yellow}🔍 Checking server connectivity...${NC}" -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName $ServerIP -Count 1 -Quiet
    if ($ping) {
        Write-Host "${Green}✅ Server is reachable${NC}" -ForegroundColor Green
    } else {
        Write-Host "${Red}❌ Cannot reach server $ServerIP${NC}" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "${Red}❌ Cannot reach server $ServerIP${NC}" -ForegroundColor Red
    exit 1
}

# Create server directory if it doesn't exist
Write-Host "${Yellow}📁 Creating server directory...${NC}" -ForegroundColor Yellow
ssh $ServerUser@$ServerIP "mkdir -p $ServerPath"

# Upload essential files using scp with exclusions
Write-Host "${Yellow}📤 Uploading essential files...${NC}" -ForegroundColor Yellow
Write-Host "This will upload only the necessary files for deployment:"
Write-Host "- Docker configuration files"
Write-Host "- Server and web application code"
Write-Host "- Nginx configuration"
Write-Host "- Monitoring configuration"
Write-Host "- Environment template"
Write-Host ""

# Create a temporary directory with only essential files
$TempDir = "temp_deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

Write-Host "${Yellow}📋 Copying essential files to temporary directory...${NC}" -ForegroundColor Yellow

# Copy essential files
$EssentialFiles = @(
    "docker-compose.prod.yml",
    "docker-compose.yml",
    "env.example",
    "README.md",
    "server",
    "web",
    "nginx",
    "monitoring",
    "scripts"
)

foreach ($file in $EssentialFiles) {
    if (Test-Path $file) {
        if (Test-Path $file -PathType Container) {
            Copy-Item -Path $file -Destination $TempDir -Recurse -Force
        } else {
            Copy-Item -Path $file -Destination $TempDir -Force
        }
        Write-Host "  ✅ Copied: $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Not found: $file" -ForegroundColor Yellow
    }
}

# Upload the temporary directory
Write-Host "${Yellow}📤 Uploading files to server...${NC}" -ForegroundColor Yellow
scp -r $TempDir/* $ServerUser@$ServerIP`:$ServerPath/

if ($LASTEXITCODE -eq 0) {
    Write-Host "${Green}✅ Files uploaded successfully!${NC}" -ForegroundColor Green
} else {
    Write-Host "${Red}❌ Upload failed${NC}" -ForegroundColor Red
    Remove-Item -Path $TempDir -Recurse -Force
    exit 1
}

# Clean up temporary directory
Remove-Item -Path $TempDir -Recurse -Force

# Set up environment file
Write-Host "${Yellow}⚙️  Setting up environment...${NC}" -ForegroundColor Yellow
ssh $ServerUser@$ServerIP "cd $ServerPath && cp env.example .env"

# Start services
Write-Host "${Yellow}🚀 Starting services...${NC}" -ForegroundColor Yellow
ssh $ServerUser@$ServerIP "cd $ServerPath && docker-compose -f docker-compose.prod.yml up -d --build"

# Check service status
Write-Host "${Yellow}🔍 Checking service status...${NC}" -ForegroundColor Yellow
ssh $ServerUser@$ServerIP "cd $ServerPath && docker-compose -f docker-compose.prod.yml ps"

# Configure Nginx
Write-Host "${Yellow}🌐 Configuring Nginx...${NC}" -ForegroundColor Yellow
ssh $ServerUser@$ServerIP "cd $ServerPath && cp nginx/nginx-http.conf /etc/nginx/sites-available/default && systemctl restart nginx"

# Final status check
Write-Host "${Yellow}🔍 Final status check...${NC}" -ForegroundColor Yellow
Write-Host "Checking if services are running:"
$webCheck = ssh $ServerUser@$ServerIP "curl -s http://localhost > /dev/null && echo 'Web app is running' || echo 'Web app is not responding'"
$apiCheck = ssh $ServerUser@$ServerIP "curl -s http://localhost:5000/health > /dev/null && echo 'API is running' || echo 'API is not responding'"

if ($webCheck -like "*running*") {
    Write-Host "  ✅ Web app is running" -ForegroundColor Green
} else {
    Write-Host "  ❌ Web app is not responding" -ForegroundColor Red
}

if ($apiCheck -like "*running*") {
    Write-Host "  ✅ API is running" -ForegroundColor Green
} else {
    Write-Host "  ❌ API is not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "${Green}🎉 Deployment completed!${NC}" -ForegroundColor Green
Write-Host "${Green}Your casino is now live at: http://$ServerIP${NC}" -ForegroundColor Green
Write-Host "${Green}API Health: http://$ServerIP:5000/health${NC}" -ForegroundColor Green
Write-Host "${Green}Monitoring: http://$ServerIP:3001${NC}" -ForegroundColor Green
Write-Host ""
Write-Host "${Blue}🎰 Your casino empire is ready to launch! 🎰💰🚀${NC}" -ForegroundColor Blue
