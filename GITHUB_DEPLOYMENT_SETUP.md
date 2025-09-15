# 🚀 GitHub Deployment Setup Guide

## Why GitHub Deployment is Faster

**Current Upload Issues:**
- ❌ Uploads entire `node_modules` (hundreds of MB)
- ❌ Manual file copying via SCP
- ❌ No version control
- ❌ Repetitive uploads of unchanged files

**GitHub Deployment Benefits:**
- ✅ Only uploads changed files (Git delta compression)
- ✅ Automated CI/CD pipelines
- ✅ Version control and easy rollbacks
- ✅ 10x faster subsequent deployments
- ✅ Professional deployment workflow

## Quick Setup (5 minutes)

### 1. Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name: `greenwood-games` (or your preferred name)
3. Set to **Private** (recommended for production)
4. **Do NOT** initialize with README (we already have files)

### 2. Push Your Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Greenwood Games Casino Platform"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/greenwood-games.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Set Up Server Secrets

In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:

```
SERVER_HOST = 167.172.152.130
SERVER_USER = root
SERVER_SSH_KEY = [Your private SSH key content]
SERVER_PORT = 22
```

**To get your SSH key:**
```bash
# If you don't have an SSH key, generate one:
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy your public key to server
ssh-copy-id root@167.172.152.130

# Copy your private key content for GitHub secret
cat ~/.ssh/id_rsa
```

### 4. Deploy Automatically

Once you push to GitHub, the deployment will start automatically! 

**Manual deployment:** Go to **Actions** tab → **Deploy to Production Server** → **Run workflow**

## Speed Comparison

| Method | First Deploy | Subsequent Deploys | File Size |
|--------|-------------|-------------------|-----------|
| **Current SCP** | 5-10 minutes | 5-10 minutes | ~500MB |
| **GitHub Actions** | 3-5 minutes | 30-60 seconds | ~50MB |

## What Gets Deployed

The GitHub workflow automatically:
- ✅ Builds your web application
- ✅ Uploads only essential files (excludes node_modules, logs, etc.)
- ✅ Starts Docker services
- ✅ Configures Nginx
- ✅ Runs health checks
- ✅ Provides deployment status

## Rollback Strategy

If something goes wrong:
```bash
# Rollback to previous version
git revert HEAD
git push origin main
```

Or manually:
```bash
# SSH into server
ssh root@167.172.152.130

# Go to deployment directory
cd /opt/greenwood-games

# Rollback to previous commit
git log --oneline
git checkout [previous-commit-hash]
docker-compose -f docker-compose.prod.yml up -d --build
```

## Monitoring Deployments

- **GitHub Actions**: View deployment logs in real-time
- **Server Status**: Check `http://167.172.152.130:3001` (Grafana)
- **Health Check**: `http://167.172.152.130:5000/health`

## Next Steps

1. **Set up the repository** (5 minutes)
2. **Configure secrets** (2 minutes)  
3. **Push your code** (1 minute)
4. **Watch it deploy automatically** (3-5 minutes)

**Total setup time: ~10 minutes vs. hours of manual uploads!**

## Troubleshooting

### Common Issues:

**SSH Key Problems:**
```bash
# Test SSH connection
ssh -i ~/.ssh/id_rsa root@167.172.152.130

# Fix permissions
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

**Docker Issues:**
```bash
# Check Docker status on server
ssh root@167.172.152.130 "docker ps"
ssh root@167.172.152.130 "docker-compose -f /opt/greenwood-games/docker-compose.prod.yml logs"
```

**Nginx Issues:**
```bash
# Check Nginx status
ssh root@167.172.152.130 "systemctl status nginx"
ssh root@167.172.152.130 "nginx -t"
```

## Benefits Summary

- 🚀 **10x faster deployments**
- 🔄 **Automatic deployments on code push**
- 📊 **Real-time deployment monitoring**
- 🔒 **Secure secret management**
- ↩️ **Easy rollbacks**
- 📝 **Deployment history and logs**
- 🎯 **Only uploads changed files**

**Ready to deploy like a pro? Let's get your casino live! 🎰💰**
