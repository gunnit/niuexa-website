# Niuexa - Advanced AI Solutions Website

A professional website for Niuexa, showcasing AI consulting, training, and product services.

## Features

- **Responsive Design**: Optimized for all devices
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Interactive Elements**: Hover effects, smooth scrolling, and dynamic content
- **Contact Form**: Functional contact form with validation
- **SEO Optimized**: Proper meta tags and semantic HTML structure

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- Google Fonts (Orbitron & Inter)

## Deployment to Azure Static Web Apps

### Prerequisites

1. **Azure Account**: Sign up at [portal.azure.com](https://portal.azure.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Azure CLI** (optional): For command-line deployment

### Method 1: Deploy via Azure Portal (Recommended)

1. **Create Azure Static Web App**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource"
   - Search for "Static Web App"
   - Click "Create"

2. **Configure the Static Web App**:
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: Create new or select existing
   - **Name**: Choose a unique name (e.g., `niuexa-website`)
   - **Plan Type**: Select "Free" for development
   - **Region**: Choose closest to your users
   - **Source**: Select "GitHub"

3. **Connect to GitHub**:
   - Sign in to GitHub when prompted
   - Select your repository
   - Select branch (usually `main` or `master`)
   - **Build Presets**: Select "Custom"
   - **App location**: `/` (root directory)
   - **Api location**: Leave empty
   - **Output location**: Leave empty

4. **Review and Create**:
   - Review your settings
   - Click "Review + create"
   - Click "Create"

5. **Automatic Deployment**:
   - Azure will automatically create a GitHub Actions workflow
   - Your site will be deployed automatically
   - You'll get a URL like: `https://your-app-name.azurestaticapps.net`

### Method 2: Deploy via Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name niuexa-rg --location "East US"

# Create static web app
az staticwebapp create \
  --name niuexa-website \
  --resource-group niuexa-rg \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --location "East US" \
  --branch main \
  --app-location "/" \
  --login-with-github
```

### Method 3: Deploy via GitHub Actions (Manual Setup)

If you prefer to set up GitHub Actions manually:

1. **Create Azure Static Web App** (without GitHub integration)
2. **Get Deployment Token**:
   - Go to your Static Web App in Azure Portal
   - Click "Manage deployment token"
   - Copy the token

3. **Add GitHub Secret**:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add new secret: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Paste the deployment token

4. **Push to GitHub**:
   - The workflow file is already included in this repository
   - Push your code to trigger deployment

## Custom Domain Setup

1. **Purchase Domain**: Buy a domain from any registrar
2. **Add Custom Domain**:
   - Go to your Static Web App in Azure Portal
   - Click "Custom domains"
   - Click "Add"
   - Enter your domain name
   - Follow DNS configuration instructions

3. **Configure DNS**:
   - Add CNAME record pointing to your Azure Static Web App URL
   - Wait for DNS propagation (can take up to 48 hours)

## Environment Variables

If you need to add environment variables:

1. Go to Azure Portal → Your Static Web App
2. Click "Configuration"
3. Add application settings as needed

## Monitoring and Analytics

- **Azure Monitor**: Built-in monitoring for your Static Web App
- **Application Insights**: Add for detailed analytics
- **Google Analytics**: Add tracking code to `index.html` if needed

## Local Development

To run locally:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Open with a local server (e.g., Live Server in VS Code)
# Or use Python's built-in server:
python -m http.server 8000

# Or use Node.js http-server:
npx http-server
```

## File Structure

```
/
├── index.html              # Main HTML file
├── styles.css              # Main stylesheet
├── script.js               # JavaScript functionality
├── staticwebapp.config.json # Azure Static Web Apps configuration
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml # GitHub Actions workflow
└── README.md               # This file
```

## Support

For issues with:
- **Website functionality**: Check browser console for errors
- **Azure deployment**: Check GitHub Actions logs
- **DNS/Domain issues**: Contact your domain registrar

## License

© 2024 Niuexa. All rights reserved.
