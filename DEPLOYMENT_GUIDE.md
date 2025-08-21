# 🚀 Quick Deployment Guide - Niuexa Website to Azure

This guide will help you deploy your Niuexa website to Azure Static Web Apps in just a few steps.

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ **Azure Account** - [Sign up for free](https://azure.microsoft.com/free/)
- ✅ **GitHub Account** - [Create account](https://github.com/join)
- ✅ **Azure CLI** (optional) - [Install guide](https://docs.microsoft.com/cli/azure/install-azure-cli)

## 🎯 Option 1: Deploy via Azure Portal (Easiest)

### Step 1: Push to GitHub
First, push your code to GitHub:

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/niuexa-website.git
git push -u origin master
```

### Step 2: Create Azure Static Web App
1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Static Web App"** and select it
4. Click **"Create"**

### Step 3: Configure Settings
Fill in the form:
- **Subscription**: Choose your Azure subscription
- **Resource Group**: Create new → `niuexa-rg`
- **Name**: `niuexa-website` (or any unique name)
- **Plan Type**: `Free` (perfect for this website)
- **Region**: Choose closest to your users
- **Source**: `GitHub`

### Step 4: Connect GitHub
- Sign in to GitHub when prompted
- **Organization**: Select your GitHub username
- **Repository**: Select your repository
- **Branch**: `master` (or `main`)

### Step 5: Build Configuration
- **Build Presets**: `Custom`
- **App location**: `/` (root directory)
- **Api location**: Leave empty
- **Output location**: Leave empty

### Step 6: Deploy
- Click **"Review + create"**
- Click **"Create"**
- Wait 2-3 minutes for deployment

🎉 **Done!** Your website will be available at: `https://your-app-name.azurestaticapps.net`

## 🛠️ Option 2: Deploy via PowerShell Script

If you have Azure CLI installed, you can use the automated script:

```powershell
# Make sure you're in the project directory
cd C:\Dev\Nuexa

# Run the deployment script
.\deploy.ps1
```

The script will:
- Check prerequisites
- Create Azure resources
- Connect to GitHub
- Deploy your website

## 🎯 Option 3: Deploy via Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name niuexa-rg --location "East US"

# Create static web app (replace YOUR_GITHUB_REPO)
az staticwebapp create \
  --name niuexa-website \
  --resource-group niuexa-rg \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --location "East US" \
  --branch master \
  --app-location "/" \
  --login-with-github
```

## 🔧 Post-Deployment Steps

### 1. Verify Deployment
- Check your website URL (provided after deployment)
- Test all pages and functionality
- Verify mobile responsiveness

### 2. Set Up Custom Domain (Optional)
1. Go to Azure Portal → Your Static Web App
2. Click **"Custom domains"**
3. Click **"Add"**
4. Enter your domain name
5. Configure DNS records as instructed

### 3. Monitor Your Site
- **GitHub Actions**: Check deployment status
- **Azure Portal**: Monitor performance and usage
- **Application Insights**: Add for detailed analytics

## 🔄 Automatic Deployments

After initial setup, any changes you push to GitHub will automatically deploy:

```bash
# Make changes to your files
# Then commit and push
git add .
git commit -m "Update website content"
git push origin master
```

Your site will update automatically in 2-3 minutes!

## 🌐 Custom Domain Setup

### Step 1: Purchase Domain
Buy a domain from any registrar (GoDaddy, Namecheap, etc.)

### Step 2: Add to Azure
1. Azure Portal → Your Static Web App
2. **Custom domains** → **Add**
3. Enter your domain: `www.yourdomain.com`

### Step 3: Configure DNS
Add these DNS records at your domain registrar:

```
Type: CNAME
Name: www
Value: your-app-name.azurestaticapps.net
```

### Step 4: Verify
- Wait for DNS propagation (up to 48 hours)
- Azure will automatically provision SSL certificate

## 📊 Monitoring & Analytics

### Built-in Monitoring
- Azure provides basic monitoring out of the box
- View metrics in Azure Portal

### Add Google Analytics (Optional)
Add this to your `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🆘 Troubleshooting

### Common Issues

**❌ "Repository not found"**
- Make sure your GitHub repo is public
- Check repository URL is correct

**❌ "Build failed"**
- Check GitHub Actions logs
- Verify file structure is correct

**❌ "Site not loading"**
- Wait 5-10 minutes after deployment
- Check Azure Portal for deployment status

**❌ "Custom domain not working"**
- Verify DNS records are correct
- Wait for DNS propagation (up to 48 hours)
- Check domain registrar settings

### Getting Help
- **Azure Support**: [Azure Portal Support](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade)
- **GitHub Issues**: Check your repository's Actions tab
- **Documentation**: [Azure Static Web Apps Docs](https://docs.microsoft.com/azure/static-web-apps/)

## 💰 Costs

**Azure Static Web Apps Free Tier includes:**
- ✅ 100GB bandwidth per month
- ✅ 0.5GB storage
- ✅ Custom domains
- ✅ SSL certificates
- ✅ Global CDN

Perfect for most business websites! 🎉

---

**Need help?** Check the main [README.md](README.md) for detailed documentation.
