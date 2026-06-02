# Niuexa Website Stylesheet Guide

## Overview
This guide documents the design system and coding standards for maintaining consistency across the Niuexa website. It identifies current inconsistencies and provides solutions for better UI/UX uniformity.

## 🎨 Design System Foundation

### Color Palette (Centralized in `styles.css`)
All pages should use these standardized CSS custom properties:

```css
:root {
    /* Primary Colors — brand spectrum (blue → teal → green) */
    --primary-blue: #237DA6;
    --dark-blue: #1F64AE;
    --light-blue: #E3F0F5;
    --primary-green: #43AE68;          /* fills / borders / gradients only */
    --dark-green: #2C8A4C;
    --green-text: #2C7A45;             /* AA-safe green for TEXT on light surfaces (5.28:1) */
    --light-green: #E6F5EC;
    --brand-teal: #0E9C9A;
    --cyan: #06B6D4;

    /* Neutral Colors — cool navy ink */
    --white: #FFFFFF;
    --light-gray: #F1F5F8;
    --medium-gray: #54697A;            /* muted text — clears WCAG AA on white + tinted sections */
    --dark-gray: #14324A;
    --black: #0A1A26;

    /* Gradients */
    --gradient-primary: linear-gradient(115deg, #237DA6 0%, #0E9C9A 50%, #43AE68 100%);
    --gradient-secondary: linear-gradient(135deg, var(--dark-blue), var(--dark-green));
    --gradient-light: linear-gradient(135deg, var(--light-blue), var(--light-green));
}
```

> **Accessibility:** `--primary-green` and the teal signal fail WCAG AA as *text* on light backgrounds. Use `--green-text` for green text and `--signal: #0E7A78` (in `polish.css`) for teal text/links. `--medium-gray` is tuned to clear 4.5:1 on white and on tinted (`--light-gray` / cream) section backgrounds.

### Typography Standards
```css
:root {
    --font-primary: 'Space Grotesk', system-ui, sans-serif;    /* Headings & Brand */
    --font-secondary: 'Hanken Grotesk', system-ui, sans-serif; /* Body Text */
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;    /* Code / labels */
}

/* Typography Hierarchy */
h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-primary);
    font-weight: 700;
    line-height: 1.2;
}

body {
    font-family: var(--font-secondary);
    line-height: 1.6;
    color: var(--dark-gray);
}

.section-title {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 3rem;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

### Spacing System
```css
:root {
    --section-padding: 80px 0;
    --container-padding: 0 20px;
    
    /* Transitions */
    --transition-fast: 0.3s ease;
    --transition-medium: 0.5s ease;
    --transition-slow: 0.8s ease;
}
```

## 🧩 Component Standards

### Button System
All pages should use standardized button classes:

```css
/* Primary Button */
.btn-primary {
    background: var(--gradient-primary);
    color: var(--white);
    padding: 12px 30px;
    border-radius: 50px;
    font-weight: 600;
    transition: all var(--transition-fast);
    box-shadow: 0 4px 15px rgba(0, 102, 204, 0.3);
}

/* Secondary Button */
.btn-secondary {
    background: transparent;
    color: var(--primary-blue);
    border: 2px solid var(--primary-blue);
    padding: 12px 30px;
    border-radius: 50px;
    font-weight: 600;
}

/* Large Button */
.btn-large {
    padding: 16px 40px;
    font-size: 1.1rem;
}
```

### Card Components
Standardize card styling across all pages:

```css
.card {
    background: var(--white);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: transform var(--transition-fast);
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}
```

### Hero Section Standards
```css
.hero-section {
    min-height: 80vh;
    display: flex;
    align-items: center;
    text-align: center;
    position: relative;
    overflow: hidden;
    padding: 120px 0 80px;
}

.hero-title {
    font-size: 3.5rem;
    font-family: var(--font-primary);
    margin-bottom: 1rem;
    color: var(--white);
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}
```

## ⚠️ Current Inconsistencies Identified

### 1. Color Usage Issues
**Problems Found:**
- `carriere.css`: Uses undefined custom properties (`--text-secondary-color`, `--background-dark`, `--accent-color`)
- `tutorial.css`: Hard-coded colors instead of CSS custom properties (`#2d3748`, `#718096`, `#667eea`)
- Inconsistent gradient implementations across pages

**Solution:**
```css
/* Replace undefined variables with standardized ones */
/* OLD: var(--text-secondary-color) */
color: var(--medium-gray);

/* OLD: var(--background-dark) */
background-color: var(--dark-gray);

/* OLD: var(--accent-color) */
color: var(--primary-blue);

/* Replace hard-coded colors with variables */
/* OLD: color: #2d3748; */
color: var(--dark-gray);

/* OLD: color: #718096; */
color: var(--medium-gray);
```

### 2. Typography Inconsistencies
**Problems Found:**
- Mixed usage of hard-coded `font-family` names vs `font-family: var(--font-primary)`
- Inconsistent heading sizes across pages
- Some pages missing proper font fallbacks

**Solution:**
```css
/* Always use CSS custom properties */
h1, h2, h3 { font-family: var(--font-primary); }
p, span, div { font-family: var(--font-secondary); }

/* Standardized heading sizes */
h1 { font-size: 3.5rem; }
h2 { font-size: 2.5rem; }
h3 { font-size: 2rem; }
h4 { font-size: 1.5rem; }
```

### 3. Hero Section Variations
**Problems Found:**
- Different class names: `.consulting-hero`, `.training-hero`, `.research-hero`, `.impara-hero`, `.careers-hero`
- Inconsistent padding and sizing
- Different background implementations

**Solution:**
Standardize hero sections:
```css
/* Use consistent class naming */
.page-hero {
    /* Standardized hero styles */
    min-height: 80vh;
    padding: 120px 0 80px;
    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2d3561 100%);
    color: var(--white);
    text-align: center;
    position: relative;
    overflow: hidden;
}
```

### 4. Button Inconsistencies
**Problems Found:**
- Custom button implementations in individual CSS files
- Different hover effects and transitions
- Inconsistent sizing and spacing

**Solution:**
Use standardized button classes from `styles.css` and avoid custom implementations.

## 📋 Implementation Checklist

### Phase 1: Color Standardization
- [ ] Update `carriere.css` - Replace undefined custom properties
- [ ] Update `tutorial.css` - Replace hard-coded colors with CSS custom properties
- [ ] Review all CSS files for color consistency
- [ ] Ensure all colors reference the centralized color palette

### Phase 2: Typography Cleanup
- [ ] Replace any hard-coded heading font (e.g. `'Space Grotesk'`) with `var(--font-primary)`
- [ ] Replace any hard-coded body font (e.g. `'Hanken Grotesk'`) with `var(--font-secondary)`
- [ ] Standardize heading sizes across all pages
- [ ] Add proper font fallbacks where missing

### Phase 3: Component Standardization
- [ ] Standardize hero section class names and styles
- [ ] Consolidate button implementations
- [ ] Standardize card component styles
- [ ] Create consistent spacing patterns

### Phase 4: Layout Consistency
- [ ] Standardize section padding across all pages
- [ ] Ensure consistent grid implementations
- [ ] Align responsive breakpoints
- [ ] Standardize animation and transition timing

## 🎯 Best Practices Moving Forward

### 1. CSS Architecture
- Always use CSS custom properties from `:root` in `styles.css`
- Keep page-specific styles minimal and focused on unique elements
- Follow the established naming conventions
- Prefer extending base styles over creating new implementations

### 2. Maintenance Guidelines
- Before adding new colors, check if existing custom properties can be used
- New components should extend existing patterns from `styles.css`
- Test changes across all pages to ensure consistency
- Document any new custom properties in this guide

### 3. Code Quality
- Use meaningful class names that describe function, not appearance
- Group related CSS properties logically
- Include browser fallbacks for modern CSS features
- Optimize for accessibility and performance

### 4. Responsive Design
- Use consistent breakpoints across all pages
- Test designs on mobile, tablet, and desktop
- Ensure touch targets are appropriately sized
- Maintain readability across all device sizes

## 📊 File Structure Recommendations

```
styles/
├── styles.css              # Base styles, variables, and common components
├── components/
│   ├── buttons.css         # All button variations
│   ├── cards.css           # Card component styles
│   ├── forms.css           # Form styling
│   └── navigation.css      # Navigation components
└── pages/
    ├── consulting.css      # Consulting-specific styles
    ├── training.css        # Training-specific styles
    └── [page].css          # Other page-specific styles
```

This structure would improve maintainability but requires refactoring the current implementation.

## 🔧 Quick Fixes Priority List

1. **High Priority**: Fix undefined CSS custom properties in `carriere.css`
2. **High Priority**: Replace hard-coded colors in `tutorial.css`
3. **Medium Priority**: Standardize hero section implementations
4. **Medium Priority**: Consolidate button styles
5. **Low Priority**: Refactor file structure for better organization

---

*This guide should be updated whenever new design patterns are introduced or existing ones are modified.*