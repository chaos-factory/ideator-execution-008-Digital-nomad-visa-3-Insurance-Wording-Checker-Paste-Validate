# Insurance Wording Checker - Paste & Validate

**🌐 Live Site:** [https://chaos-factory.github.io/ideator-execution-008-Digital-nomad-visa-3-Insurance-Wording-Checker-Paste-Validate/](https://chaos-factory.github.io/ideator-execution-008-Digital-nomad-visa-3-Insurance-Wording-Checker-Paste-Validate/)

In-browser regex checker to verify insurance policy text meets required phrases/limits for specific digital-nomad programs (e.g., Japan, Spain, UAE). Paste text, see red/green checklist with explanations and official links, optional PDF. Static JSON requirements/tests; no uploads.

## Features

- ✅ **100% Client-Side** - All validation runs in your browser, no data sent to servers
- ⚡ **Instant Results** - Get immediate red/green checklist with detailed explanations
- 🌍 **Multiple Programs** - Support for Japan, Spain, and UAE digital nomad visas
- 🔒 **Privacy First** - Your policy text never leaves your device
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ♿ **Accessible** - WCAG compliant with ARIA labels and keyboard navigation
- 🎯 **SEO Optimized** - Structured data with JSON-LD for FAQs and products

## Supported Programs

1. **Japan Digital Nomad Visa** - ¥10,000,000 minimum coverage
2. **Spain Telework Visa** - €30,000 minimum coverage  
3. **UAE Remote Work Visa** - $150,000 minimum coverage

## How It Works

1. Select your target visa program
2. Paste your insurance policy text
3. Click "Check Wording" to validate
4. Review red/green checklist with tooltips
5. Export PDF summary (Premium feature)

## Project Structure

```
.
├── index.html              # Main landing page
├── checker.html            # Dedicated checker page
├── styles.css              # Main stylesheet
├── checker.js              # Validation logic
├── requirements.json       # Program requirements data
├── programs/               # Individual program pages
│   ├── japan-digital-nomad.html
│   ├── spain-telework.html
│   └── uae-remote-work.html
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Pages deployment
```

## Local Development

No build step required! Simply open `index.html` in your browser or run a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Deployment

The site automatically deploys to GitHub Pages:
- **Main branch pushes** → Live site deployment
- **Pull requests** → Preview comment with testing instructions

## Technologies

- Pure HTML5, CSS3, JavaScript (ES6+)
- No frameworks or build tools
- No external dependencies
- GitHub Actions for CI/CD

## Data Integrity

- Requirements reviewed monthly against official sources
- Version controlled in Git with full change history
- Community contributions welcome via GitHub Issues

## Privacy & Security

- No server-side processing
- No analytics or tracking
- No cookies (except localStorage for check limits)
- Open source for transparency

## License

All rights reserved. Code provided for demonstration purposes.

## Disclaimer

This tool provides automated guidance based on publicly available visa requirements. Results are for reference only and do not constitute legal or professional advice. Always verify with official embassy/consulate sources before submitting your visa application.