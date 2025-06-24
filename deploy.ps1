# Azure Static Web Apps Deployment Script for Niuexa Website
# This script helps you deploy your website to Azure Static Web Apps

param(
    [string]$ResourceGroupName = "niuexa-rg",
    [string]$StaticWebAppName = "niuexa-website",
    [string]$Location = "East US",
    [string]$GitHubRepo = "",
    [string]$Branch = "master"
)

Write-Host "🚀 Niuexa Website - Azure Deployment Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check if Azure CLI is installed
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✅ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI is not installed. Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Check if user is logged in
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Azure. Running 'az login'..." -ForegroundColor Yellow
    az login
}

# Get GitHub repository URL if not provided
if ([string]::IsNullOrEmpty($GitHubRepo)) {
    try {
        $remoteUrl = git remote get-url origin
        if ($remoteUrl) {
            $GitHubRepo = $remoteUrl
            Write-Host "✅ Found GitHub repository: $GitHubRepo" -ForegroundColor Green
        } else {
            Write-Host "❌ No GitHub repository found. Please push your code to GitHub first." -ForegroundColor Red
            Write-Host "   Run these commands:" -ForegroundColor Yellow
            Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor Yellow
            Write-Host "   git push -u origin master" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "❌ Could not determine GitHub repository. Please provide it manually:" -ForegroundColor Red
        Write-Host "   .\deploy.ps1 -GitHubRepo 'https://github.com/YOUR_USERNAME/YOUR_REPO'" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Deployment Configuration:" -ForegroundColor Yellow
Write-Host "   Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "   Static Web App: $StaticWebAppName" -ForegroundColor White
Write-Host "   Location: $Location" -ForegroundColor White
Write-Host "   GitHub Repo: $GitHubRepo" -ForegroundColor White
Write-Host "   Branch: $Branch" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Do you want to proceed with deployment? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Deployment cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔨 Creating Azure resources..." -ForegroundColor Yellow

# Create resource group
Write-Host "Creating resource group: $ResourceGroupName" -ForegroundColor Cyan
try {
    az group create --name $ResourceGroupName --location $Location --output table
    Write-Host "✅ Resource group created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create resource group" -ForegroundColor Red
    exit 1
}

# Create static web app
Write-Host "Creating static web app: $StaticWebAppName" -ForegroundColor Cyan
try {
    $result = az staticwebapp create `
        --name $StaticWebAppName `
        --resource-group $ResourceGroupName `
        --source $GitHubRepo `
        --location $Location `
        --branch $Branch `
        --app-location "/" `
        --login-with-github `
        --output json | ConvertFrom-Json
    
    Write-Host "✅ Static Web App created successfully!" -ForegroundColor Green
    Write-Host "🌐 Your website URL: $($result.defaultHostname)" -ForegroundColor Cyan
    Write-Host "📊 Resource ID: $($result.id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create static web app" -ForegroundColor Red
    Write-Host "   This might be because:" -ForegroundColor Yellow
    Write-Host "   1. The name '$StaticWebAppName' is already taken" -ForegroundColor Yellow
    Write-Host "   2. GitHub authentication failed" -ForegroundColor Yellow
    Write-Host "   3. Repository access issues" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Check your GitHub repository for the new workflow file" -ForegroundColor White
Write-Host "   2. Any push to the '$Branch' branch will trigger automatic deployment" -ForegroundColor White
Write-Host "   3. Visit the Azure Portal to configure custom domains, SSL, etc." -ForegroundColor White
Write-Host "   4. Monitor deployments in GitHub Actions tab" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful links:" -ForegroundColor Yellow
Write-Host "   Azure Portal: https://portal.azure.com" -ForegroundColor Blue
Write-Host "   GitHub Actions: $($GitHubRepo.Replace('.git', ''))/actions" -ForegroundColor Blue
Write-Host ""
