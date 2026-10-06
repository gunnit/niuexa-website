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

## Deployment

Every push to `master`/`main` runs `.github/workflows/github-pages.yml`. It checks the site, packages the public files into `_site` and deploys them to Cloudflare Workers (static assets), which serves `niuexa.ai`. GitHub Pages receives the same build until it is retired. The branded `404.html` is served for missing pages.

## Custom Domain

`niuexa.ai` reaches the Worker through the route `niuexa.ai/*` on the proxied `niuexa.ai` DNS records, both set in the Cloudflare dashboard (`wrangler.jsonc` explains why they are not in the config). DNS is managed in Cloudflare; `www.niuexa.ai` redirects to `niuexa.ai` through a Cloudflare Redirect Rule. Email (MX) and `aeo.niuexa.ai` are separate DNS records.

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
├── 404.html                # Branded 404 page
├── .github/
│   └── workflows/
│       └── github-pages.yml    # Deploy workflow (Cloudflare and GitHub Pages)
└── README.md               # This file
```

## Support

For issues with:
- **Website functionality**: Check browser console for errors
- **Deployment**: Check the GitHub Actions logs (github-pages.yml)
- **DNS/Domain issues**: Cloudflare dashboard (DNS, and Workers & Pages → niuexa-website)

## License

© 2024 Niuexa. All rights reserved.
