# Gemini Project Context (`GEMINI.md`)

This document provides essential context for the Gemini agent to understand and effectively assist with this project. Please keep it up-to-date.

## 1. Project Overview

*   **What is the goal of this project?** A professional website for Niuexa, showcasing AI consulting, training, and product services.
*   **Who are the end-users?** Potential clients, partners, and individuals interested in AI solutions.
*   **What are the key features?** Responsive design, modern UI/UX, interactive elements, and a contact form. The site is structured to provide information on various services.

## 2. Key Technologies & Frameworks

*   **Programming Languages:** JavaScript
*   **Frameworks:** None. This is a vanilla HTML/CSS/JS project.
*   **UI/Styling:** CSS3 (with CSS Grid and Flexbox)
*   **Databases:** None.
*   **Key Libraries:** None.

## 3. Project Structure

```
/
├── index.html              # Main landing page
├── chi-siamo.html          # "About Us" page
├── consulting.html         # Consulting services page
├── training.html           # Training services page
├── eventi.html             # Events page
├── *.css                   # Corresponding CSS files for each HTML page
├── *.js                    # Corresponding JS files for each HTML page
├── includes/               # Reusable HTML partials
│   ├── navigation.html     # Navigation bar
│   └── footer.html         # Footer
├── img/                    # Images and other static assets
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml # GitHub Actions workflow for deployment
└── README.md               # Project documentation
```

## 4. Build & Development

*   **How do I install dependencies?**
    *   None required.
*   **How do I run the development server?**
    *   Open the HTML files directly in a browser or use a simple local server.
    *   Example using Python: `python -m http.server 8000`
    *   Example using Node.js: `npx http-server`

## 5. Testing

*   **What testing framework is used?**
    *   None.
*   **How do I run the tests?**
    *   N/A
*   **Where are the tests located?**
    *   N/A

## 6. Deployment

*   **How is this project deployed?**
    *   Via GitHub Actions to Azure Static Web Apps.
*   **What are the relevant deployment scripts or configuration files?**
    *   `.github/workflows/azure-static-web-apps.yml`
    *   `staticwebapp.config.json`

## 7. Important Notes & Conventions

*   **Modular Content:** The `includes/` directory contains HTML for the navigation and footer, which are loaded dynamically by `includes/includes.js`.
*   **Styling:** Each main HTML page has its own dedicated CSS file (e.g., `consulting.html` uses `consulting.css`). Global styles are in `styles.css`.
