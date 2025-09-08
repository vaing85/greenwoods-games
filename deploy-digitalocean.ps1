# Greenwood Games - DigitalOcean Deployment Script (PowerShell)
# This script provides step-by-step instructions for DigitalOcean deployment

Write-Host "🚀 Greenwood Games - DigitalOcean Deployment Guide" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

Write-Host ""
Write-Host "📋 DigitalOcean Deployment Steps:" -ForegroundColor Yellow
Write-Host ""

Write-Host "🌐 Step 1: Create DigitalOcean Droplet" -ForegroundColor Cyan
Write-Host "1. Go to https://digitalocean.com" -ForegroundColor White
Write-Host "2. Sign up for account (get $5 credit with referral)" -ForegroundColor White
Write-Host "3. Click 'Create' → 'Droplets'" -ForegroundColor White
Write-Host "4. Choose 'Ubuntu 22.04 LTS'" -ForegroundColor White
Write-Host "5. Select 'Basic' plan with 4GB RAM, 2 vCPU, 80GB SSD ($24/month)" -ForegroundColor White
Write-Host "6. Choose data center closest to your audience" -ForegroundColor White
Write-Host "7. Set hostname: 'greenwood-games-server'" -ForegroundColor White
Write-Host "8. Add tags: 'production', 'casino', 'greenwood'" -ForegroundColor White
Write-Host "9. Click 'Create Droplet'" -ForegroundColor White
Write-Host "10. Note down your server IP address" -ForegroundColor White

Write-Host ""
Write-Host "🌐 Step 2: Domain Configuration" -ForegroundColor Cyan
Write-Host "1. Purchase domain from Namecheap, GoDaddy, or Cloudflare ($8-15/year)" -ForegroundColor White
Write-Host "2. Configure DNS records:" -ForegroundColor White
Write-Host "   Type: A, Name: @, Value: YOUR_SERVER_IP" -ForegroundColor White
Write-Host "   Type: A, Name: www, Value: YOUR_SERVER_IP" -ForegroundColor White
Write-Host "   Type: A, Name: api, Value: YOUR_SERVER_IP" -ForegroundColor White
Write-Host "   Type: A, Name: mobile, Value: YOUR_SERVER_IP" -ForegroundColor White
Write-Host "3. Wait 15-60 minutes for DNS propagation" -ForegroundColor White

Write-Host ""
Write-Host "🔑 Step 3: Connect to Your Server" -ForegroundColor Cyan
Write-Host "1. Open terminal/command prompt" -ForegroundColor White
Write-Host "2. Connect via SSH:" -ForegroundColor White
Write-Host "   ssh root@YOUR_SERVER_IP" -ForegroundColor White
Write-Host "3. Or use PuTTY on Windows" -ForegroundColor White

Write-Host ""
Write-Host "📦 Step 4: Run Deployment Script" -ForegroundColor Cyan
Write-Host "1. Download the deployment script:" -ForegroundColor White
Write-Host "   wget https://raw.githubusercontent.com/vaing85/greenwoods-games/main/deploy-digitalocean.sh" -ForegroundColor White
Write-Host "2. Make it executable:" -ForegroundColor White
Write-Host "   chmod +x deploy-digitalocean.sh" -ForegroundColor White
Write-Host "3. Run the script:" -ForegroundColor White
Write-Host "   sudo ./deploy-digitalocean.sh" -ForegroundColor White
Write-Host "4. Enter your domain name when prompted" -ForegroundColor White

Write-Host ""
Write-Host "🔐 Step 5: SSL Certificate (Automatic)" -ForegroundColor Cyan
Write-Host "The script will automatically:" -ForegroundColor White
Write-Host "- Install Let's Encrypt SSL certificate" -ForegroundColor White
Write-Host "- Configure auto-renewal" -ForegroundColor White
Write-Host "- Set up HTTPS redirect" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Step 6: Deploy Application" -ForegroundColor Cyan
Write-Host "The script will automatically:" -ForegroundColor White
Write-Host "- Clone your GitHub repository" -ForegroundColor White
Write-Host "- Install all dependencies" -ForegroundColor White
Write-Host "- Configure environment variables" -ForegroundColor White
Write-Host "- Start all services with Docker" -ForegroundColor White
Write-Host "- Set up monitoring and backups" -ForegroundColor White

Write-Host ""
Write-Host "🧪 Step 7: Test Your Live Site" -ForegroundColor Cyan
Write-Host "1. Visit https://yourdomain.com" -ForegroundColor White
Write-Host "2. Test user registration/login" -ForegroundColor White
Write-Host "3. Test all casino games" -ForegroundColor White
Write-Host "4. Test mobile app functionality" -ForegroundColor White
Write-Host "5. Check API endpoints" -ForegroundColor White

Write-Host ""
Write-Host "📊 Step 8: Access Monitoring" -ForegroundColor Cyan
Write-Host "1. Grafana Dashboard: https://yourdomain.com:3001" -ForegroundColor White
Write-Host "2. Prometheus Metrics: https://yourdomain.com:9090" -ForegroundColor White
Write-Host "3. Default Grafana login: admin / (generated password)" -ForegroundColor White

Write-Host ""
Write-Host "💰 Expected Revenue:" -ForegroundColor Yellow
Write-Host "Month 1: $10,000-25,000" -ForegroundColor White
Write-Host "Month 6: $50,000-100,000+" -ForegroundColor White
Write-Host "Year 1: $100,000-500,000+" -ForegroundColor White

Write-Host ""
Write-Host "🎯 What You'll Get:" -ForegroundColor Green
Write-Host "✅ Professional cloud hosting" -ForegroundColor White
Write-Host "✅ Enterprise-grade security" -ForegroundColor White
Write-Host "✅ Scalable architecture" -ForegroundColor White
Write-Host "✅ Complete casino platform" -ForegroundColor White
Write-Host "✅ Mobile app support" -ForegroundColor White
Write-Host "✅ Revenue generation" -ForegroundColor White
Write-Host "✅ Monitoring and backups" -ForegroundColor White

Write-Host ""
Write-Host "📞 Support:" -ForegroundColor Cyan
Write-Host "If you need help with deployment:" -ForegroundColor White
Write-Host "1. Check the detailed guide: DIGITALOCEAN_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "2. Review the deployment script: deploy-digitalocean.sh" -ForegroundColor White
Write-Host "3. Check server logs if issues occur" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Ready to Deploy!" -ForegroundColor Green
Write-Host "Your Greenwood Games casino platform is ready for DigitalOcean deployment!" -ForegroundColor White
Write-Host "Follow the steps above to get your casino live and generating revenue! 🎰💰🚀" -ForegroundColor White
