# Generate SSL Certificates for Greenwood Games
Write-Host "Generating SSL certificates..." -ForegroundColor Green

# Create certificate using PowerShell
$cert = New-SelfSignedCertificate -DnsName "localhost", "yourdomain.com", "www.yourdomain.com" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(1)

# Export certificate to PEM format
$certPath = "cert:\LocalMachine\My\$($cert.Thumbprint)"
$certPem = [System.Convert]::ToBase64String($cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert), [System.Base64FormattingOptions]::InsertLineBreaks)

# Create certificate file
$certContent = "-----BEGIN CERTIFICATE-----`n$certPem`n-----END CERTIFICATE-----"
$certContent | Out-File -FilePath "nginx/ssl/cert.pem" -Encoding ASCII

# Export private key
$keyBytes = $cert.PrivateKey.Export([System.Security.Cryptography.CngKeyBlobFormat]::Pkcs8PrivateBlob)
$keyPem = [System.Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
$keyContent = "-----BEGIN PRIVATE KEY-----`n$keyPem`n-----END PRIVATE KEY-----"
$keyContent | Out-File -FilePath "nginx/ssl/key.pem" -Encoding ASCII

Write-Host "SSL certificates generated successfully!" -ForegroundColor Green
Write-Host "Certificate: nginx/ssl/cert.pem" -ForegroundColor White
Write-Host "Private Key: nginx/ssl/key.pem" -ForegroundColor White
