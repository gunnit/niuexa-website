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

## Deployment (GitHub Pages)

The site deploys automatically to GitHub Pages via `.github/workflows/github-pages.yml` on every push to `master`/`main`. The custom domain `niuexa.ai` is configured through the `CNAME` file; a branded `404.html` at the repo root is served automatically for missing pages.

No build step is required — the repository root is published as-is.

## Custom Domain

The domain `niuexa.ai` is configured via the `CNAME` file in the repository root and the GitHub Pages settings of the repo. DNS is managed at the registrar (A/ALIAS records to GitHub Pages, CNAME for www).

## Monitoring and Analytics

- **Google Tag Manager** (`GTM-KG9S42S4`): the single container loaded on every page (head snippet + `<noscript>` fallback). All Google tags — Google Analytics 4, Google Ads, etc. — are configured and fired inside GTM, not hard-coded in the page.
- **Google Consent Mode**: each page sets consent defaults to `denied` before GTM loads; the cookie banner (`cookie-banner.js`) calls `gtag('consent', 'update', …)` once the visitor accepts, so GTM-managed tags only fire with consent.

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
├── 404.html                # Branded 404 page (GitHub Pages)
├── .github/
│   └── workflows/
│       └── github-pages.yml    # GitHub Pages deploy workflow
└── README.md               # This file
```

## Support

For issues with:
- **Website functionality**: Check browser console for errors
- **Deployment**: Check the GitHub Actions logs (github-pages.yml)
- **DNS/Domain issues**: Contact your domain registrar

## License

© 2024 Niuexa. All rights reserved.
