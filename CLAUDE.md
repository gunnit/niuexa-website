# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for Niuexa, an AI consulting company. The site showcases AI consulting services, training programs, and products. It's built with vanilla HTML, CSS, and JavaScript and deployed to Azure Static Web Apps.

## Development Commands

### Local Development
```bash
# Serve locally using Python
python -m http.server 8000

# Or use Node.js http-server
npx http-server

# Or use Live Server extension in VS Code
```

### Deployment
```bash
# Deploy to Azure using PowerShell script
.\deploy.ps1

# Or deploy via Azure CLI
az staticwebapp create --name niuexa-website --resource-group niuexa-rg --source https://github.com/USERNAME/REPO --location "East US" --branch master --app-location "/" --login-with-github
```

## Architecture

### Site Structure
- **Multi-page website** with shared navigation and footer components
- **Static HTML pages**: `index.html`, `chi-siamo.html`, `consulting.html`, `training.html`, `products.html`, `roi-calculator.html`, `login.html`
- **Modular includes**: Navigation and footer are loaded via JavaScript from `includes/` directory
- **Responsive design** with mobile-first approach

### Key Components

#### Navigation System (`includes/navigation.html` + `includes/includes.js`)
- Shared navigation loaded dynamically on all pages
- Mobile hamburger menu with smooth transitions
- Active page highlighting based on current URL
- Smooth scrolling for anchor links

#### Page-specific JavaScript
- `script.js`: Main functionality (scroll effects, animations, contact forms)
- `consulting.js`: Consulting page interactive elements
- `training.js`: Training page functionality
- `roi-calculator.js`: ROI calculator logic

#### Styling
- `styles.css`: Main stylesheet with responsive design
- Page-specific CSS: `consulting.css`, `training.css`, `roi-calculator.css`

### Technical Implementation

#### JavaScript Architecture
- **Modular approach**: Each page can have its own JS file
- **Shared functionality**: Common features in `script.js`
- **Event-driven**: Heavy use of `addEventListener` and `DOMContentLoaded`
- **Intersection Observer**: For scroll-based animations

#### Responsive Design
- CSS Grid and Flexbox for layouts
- Mobile-first media queries
- Hamburger menu for mobile navigation
- Optimized images and typography scaling

## Azure Static Web Apps Configuration

### Deployment Setup
- **GitHub Actions**: Automated deployment via `.github/workflows/azure-static-web-apps.yml`
- **Static Web App Config**: `staticwebapp.config.json` handles routing and fallbacks
- **PowerShell Script**: `deploy.ps1` for automated Azure resource creation

### Routing Configuration
- All routes serve `index.html` as fallback (SPA-style routing)
- Static assets (images, CSS, JS) served directly
- Navigation fallback excludes image and CSS files

## Content Management

### Images
- Located in `img/` directory
- Includes logos, profile pictures, and brand assets
- Optimized for web with proper alt text

### Internationalization
- Site is in Italian (`lang="it"`)
- Content focused on Italian market
- SEO optimized for Italian search terms

## SEO Implementation

### Meta Tags
- Comprehensive Open Graph tags
- Twitter Card integration
- Schema.org structured data for organization info
- Proper canonical URLs

### Performance
- Preconnect to Google Fonts
- Optimized loading order
- Compressed assets
- CDN delivery via Azure Static Web Apps

## Development Guidelines

### File Organization
- Keep page-specific assets with their respective pages
- Use the `includes/` directory for shared components
- Maintain consistent naming conventions (kebab-case for files)

### JavaScript Patterns
- Use vanilla JavaScript (no frameworks)
- Initialize functionality in `DOMContentLoaded` event
- Implement proper error handling for DOM queries
- Use modern ES6+ features where appropriate

### CSS Conventions
- Mobile-first responsive design
- CSS custom properties for theming
- Consistent spacing and typography scales
- Modular CSS with page-specific overrides

## Testing

### Manual Testing
- Test responsive design across devices
- Verify all navigation links work correctly
- Check contact form functionality
- Validate SEO meta tags

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers