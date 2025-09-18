# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for Niuexa, an AI consulting company. The site showcases AI consulting services, training programs, and products. It's built with vanilla HTML, CSS, and JavaScript and deployed to Azure Static Web Apps.

## Development Commands

### Local Development
```bash
# Serve locally using Python (recommended)
python -m http.server 8000

# Or use Node.js http-server
npx http-server

# Or use Live Server extension in VS Code
```

### Testing and Validation
```bash
# No build process required - static files only
# Test locally by serving and checking functionality manually

# Validate HTML, CSS, and JavaScript in browser
# Check responsive design across devices
# Test all navigation links and forms
```

### Deployment
```bash
# Automatic deployment via GitHub Actions on push to master/main branch
# Manual deployment via Azure CLI (if needed):
az staticwebapp create --name niuexa-website --resource-group niuexa-rg --source https://github.com/USERNAME/REPO --location "East US" --branch master --app-location "/" --login-with-github
```

## Architecture

### Site Structure
- **Multi-page website** with shared navigation and footer components  
- **Static HTML pages**: Core pages include `index.html`, `chi-siamo.html`, `consulting.html`, `training.html`, `products.html`, `impara.html`, `research.html`, `eventi.html`, `carriere.html`, `roi-calculator.html`, `login.html`
- **Tutorial pages**: Individual tutorial HTML files for AI-related topics
- **Modular includes**: Navigation and footer loaded dynamically via JavaScript
- **Quiz system**: JSON-based quiz data in `quiz-data/` directory for certifications
- **Responsive design** with mobile-first approach

### Key Components

#### Navigation System (`includes/includes.js`)
- **Dynamic loading**: Navigation and footer HTML embedded in JavaScript strings
- **Mobile hamburger menu**: Full accessibility support with ARIA attributes  
- **Dropdown navigation**: Multi-level menus for Solutions and Resources sections
- **Active page highlighting**: Automatic detection based on current URL
- **Keyboard navigation**: Full keyboard accessibility support
- **Smooth scrolling**: For internal anchor links

#### Page-specific Functionality
- `script.js`: Main functionality (scroll effects, animations, contact forms)
- `consulting.js`: Consulting page interactive elements
- `training.js`: Training page functionality  
- `eventi.js`: Events page functionality
- `research.js`: Research page functionality
- `impara.js`: Learning page functionality
- `roi-calculator.js`: ROI calculator logic
- `tutorial.js`: Tutorial page functionality
- `certification.js`: Quiz/certification functionality

#### Styling Architecture
- `styles.css`: Main stylesheet with responsive design and CSS custom properties
- Page-specific stylesheets: `consulting.css`, `training.css`, `eventi.css`, `research.css`, `impara.css`, `roi-calculator.css`, `tutorial.css`, `certification.css`, `carriere.css`
- Component-specific styles embedded within each CSS file

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
  - Triggers on push to main/master branches and pull requests
  - Uses `skip_app_build: "true"` since no build process is required
  - Deploys from root directory (`app_location: "/"`)
- **Static Web App Config**: `staticwebapp.config.json` handles routing, MIME types, and security headers

### Routing and Configuration (`staticwebapp.config.json`)
- **Route handling**: Direct serving of HTML files with fallback to `index.html`
- **Static assets**: Proper MIME type configuration for all file types
- **Security headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Caching**: Long-term caching (31536000s) for static assets
- **404 handling**: Fallback to `index.html` with 200 status for SPA-style navigation

## Content Management

### Images and Assets  
- **Main directory**: `img/` contains logos, profile pictures, team photos, brand assets
- **Event assets**: `img/eventi/` subdirectory for event-specific images and videos
- **Formats**: Mix of PNG, JPG, WebP, and WebM for optimal performance
- **Optimization**: Images sized appropriately with proper alt text for accessibility

### Content Structure
- **Quiz data**: JSON files in `quiz-data/` directory containing structured quiz questions for certifications
- **Tutorial content**: Individual HTML pages for AI-related tutorials with embedded content
- **Static pages**: Policy pages (`privacy-policy.html`, `cookie-policy.html`, `terms-of-service.html`)
- **SEO files**: `robots.txt`, `sitemap.xml`, `site.webmanifest` for search engine optimization

### Internationalization  
- Site is in Italian (`lang="it"`) targeting Italian market
- Content optimized for Italian search terms and business context
- Navigation and UI text in Italian throughout

## SEO Implementation

### Meta Tags
- Comprehensive Open Graph tags
- X (Twitter) Card integration
- Schema.org structured data for organization info
- Proper canonical URLs

### Performance
- Preconnect to Google Fonts
- Optimized loading order
- Compressed assets
- CDN delivery via Azure Static Web Apps

## Development Guidelines

### File Organization
- **Page-specific assets**: CSS and JS files match HTML page names (e.g., `consulting.html` → `consulting.css`, `consulting.js`)
- **Shared components**: Use `includes/` directory for navigation and footer
- **Naming conventions**: Kebab-case for all file names
- **Asset organization**: Images organized by purpose (`img/eventi/` for event-specific assets)

### JavaScript Architecture Patterns
- **Vanilla JavaScript**: No frameworks, pure JavaScript implementation
- **Modular loading**: Navigation and footer loaded dynamically via `includes/includes.js`
- **Event-driven**: Heavy use of `addEventListener` and `DOMContentLoaded` pattern
- **Accessibility**: Full keyboard navigation support and ARIA attributes
- **Error handling**: Try-catch blocks for dynamic content loading with retry functionality
- **State management**: Page-specific active states and dropdown interactions

### CSS Architecture
- **Mobile-first**: Responsive design starting from mobile breakpoints
- **CSS custom properties**: Used for theming and consistent spacing
- **Component-based**: Each page stylesheet extends base styles from `styles.css`
- **Loading states**: Placeholder styles for dynamically loaded content

### Quiz/Certification System
- **JSON structure**: Standardized format in `quiz-data/` with metadata, questions, and scoring
- **Question types**: Support for multiple-choice, true/false, and other formats
- **Scoring system**: Configurable passing scores and time limits per quiz
- **Progressive enhancement**: Quiz functionality built as enhancement over static content

## Design System and Styling

### CSS Architecture Standards
- **Centralized design system**: All colors, fonts, and spacing defined in `styles.css` using CSS custom properties
- **Color palette**: Standardized blue/green brand colors with neutral grays (see `STYLESHEET_GUIDE.md`)
- **Typography**: Orbitron for headings/brand, Inter for body text
- **Component consistency**: Standardized button styles, hero sections, and card components

### CSS Custom Properties (Required Usage)
```css
/* Colors - ALWAYS use these variables */
--primary-blue: #0066CC;
--primary-green: #00CC66;
--dark-gray: #343A40;
--medium-gray: #6C757D;
--light-gray: #F8F9FA;
--white: #FFFFFF;

/* Typography - ALWAYS use these variables */
--font-primary: 'Orbitron', monospace;    /* For headings */
--font-secondary: 'Inter', sans-serif;     /* For body text */

/* Gradients - ALWAYS use these variables */
--gradient-primary: linear-gradient(135deg, var(--primary-blue), var(--primary-green));
--gradient-secondary: linear-gradient(135deg, var(--dark-blue), var(--dark-green));
```

### Critical Styling Rules
- **NEVER use hard-coded colors** - always reference CSS custom properties from `:root` in `styles.css`
- **Hero sections**: Use consistent padding (120px 0 80px) and standardized gradient backgrounds
- **Button styles**: Use `.btn-primary` and `.btn-secondary` classes instead of custom implementations
- **Font families**: Always use `var(--font-primary)` and `var(--font-secondary)` instead of hard-coded font names
- **Page-specific stylesheets**: Should only contain unique elements, extending base styles from `styles.css`

### Maintenance Guidelines
- Before adding new colors, check if existing CSS custom properties can be used
- New components should extend existing patterns from `styles.css`
- Reference `STYLESHEET_GUIDE.md` for complete design system documentation
- Test changes across all pages to ensure visual consistency

## GitHub Actions Workflows
The repository includes several automated workflows:
- `azure-static-web-apps.yml`: Automated deployment to Azure Static Web Apps on push to master/main
- `github-pages.yml`: Alternative GitHub Pages deployment 
- `claude-code-review.yml` and `claude.yml`: AI-assisted code review workflows

## Critical Files for Maintenance
- `staticwebapp.config.json`: Azure Static Web Apps routing and MIME type configuration
- `STYLESHEET_GUIDE.md`: Comprehensive design system documentation - reference this for all styling decisions
- `robots.txt`, `sitemap.xml`, `site.webmanifest`: SEO and PWA configuration files
- `CNAME`: Custom domain configuration for niuexa.ai

## Cookie Consent System
The site implements a cookie consent banner via `cookie-banner.js` for GDPR compliance. This script handles user consent preferences and cookie management across all pages.

## Important Development Instructions
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested