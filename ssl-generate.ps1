# Greenwood Games - SSL Certificate Generation Script

Write-Host "Greenwood Games - SSL Certificate Generation" -ForegroundColor Green

# Create SSL directory
if (!(Test-Path "nginx/ssl")) {
    New-Item -ItemType Directory -Path "nginx/ssl" -Force | Out-Null
    Write-Host "Created SSL directory" -ForegroundColor Green
}

# Check if OpenSSL is available
try {
    $null = Get-Command openssl -ErrorAction Stop
    Write-Host "OpenSSL found" -ForegroundColor Green
} catch {
    Write-Host "OpenSSL not found. Please install OpenSSL first." -ForegroundColor Red
    Write-Host "Download from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
    exit 1
}

# Generate self-signed certificate
Write-Host "Generating self-signed SSL certificate..." -ForegroundColor Yellow

# Generate private key
& openssl genrsa -out nginx/ssl/key.pem 2048

# Generate certificate
& openssl req -new -x509 -key nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Greenwood Games/CN=localhost"

Write-Host "SSL certificate generated successfully!" -ForegroundColor Green
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "   - nginx/ssl/key.pem (Private key)" -ForegroundColor White
Write-Host "   - nginx/ssl/cert.pem (Certificate)" -ForegroundColor White
Write-Host ""
Write-Host "Note: This is a self-signed certificate for local testing only." -ForegroundColor Yellow
Write-Host "For production, use Let's Encrypt or commercial SSL certificates." -ForegroundColor Yellow