# 🏔️ The HillSide Oasis

A modern, responsive website for The HillSide Oasis - a serene farm retreat nestled in the Western Ghats near Pollachi, Tamil Nadu.

[![Live Website](https://img.shields.io/badge/Live-thehillsideoasis.com-4c9963)](https://thehillsideoasis.com)
[![HTML](https://img.shields.io/badge/HTML-83.2%25-e34c26)](https://github.com/venkimanoharan/thehillsideoasis)
[![CSS](https://img.shields.io/badge/CSS-16.0%25-1572b6)](https://github.com/venkimanoharan/thehillsideoasis)
[![JavaScript](https://img.shields.io/badge/JavaScript-0.8%25-f7df1e)](https://github.com/venkimanoharan/thehillsideoasis)

## 🌟 Overview

The HillSide Oasis website is a fully responsive, SEO-optimized website showcasing a nature retreat destination. Built with vanilla HTML, CSS, and JavaScript, it offers visitors an immersive digital experience of the physical retreat.

**Live Site:** [thehillsideoasis.com](https://thehillsideoasis.com)

## ✨ Features

### 🎨 Design & UX
- **Modern, Clean Interface** - Contemporary design with smooth animations
- **Fully Responsive** - Optimized for mobile, tablet, and desktop devices
- **Smooth Navigation** - Hamburger menu for mobile, sticky navigation bar
- **Interactive Elements** - Hover effects, smooth scrolling, and transitions

### 📱 Pages
- **Home** (`index.html`) - Hero section, features, testimonials, and CTAs
- **About** (`about.html`) - Story, mission, and values
- **Stay** (`stay.html`) - Accommodation details and pricing
- **Activities** (`activities.html`) - Available activities and experiences
- **Gallery** (`gallery.html`) - Photo showcase of the property
- **Contact** (`contact.html`) - Contact form with multiple communication options
- **Thank You** (`thankyou.html`) - Post-submission confirmation page

### 🔧 Technical Features
- **SEO Optimized** - Meta tags, Open Graph, Twitter Cards, Schema.org markup
- **Performance** - Optimized images, preloaded fonts, minimal dependencies
- **Accessibility** - Semantic HTML, ARIA labels, keyboard navigation support
- **Security Headers** - CSP, XSS protection, MIME type sniffing prevention
- **Form Handling** - Integrated with FormSubmit.co for contact inquiries
- **Analytics Ready** - Structured data for search engines

### 📞 Contact Integration
- Direct phone call links (`tel:`)
- WhatsApp integration (`wa.me`)
- Email links (`mailto:`)
- Sticky floating contact buttons

## 🛠️ Technology Stack

- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Custom properties, flexbox, grid, animations
- **Vanilla JavaScript** - No frameworks, lightweight and fast
- **Google Fonts** - Inter & Playfair Display
- **FormSubmit.co** - Contact form backend

## 📂 Project Structure

```
thehillsideoasis/
├── index.html          # Homepage
├── about.html          # About page
├── stay.html           # Accommodations
├── activities.html     # Activities listing
├── gallery.html        # Photo gallery
├── contact.html        # Contact form
├── thankyou.html       # Form submission confirmation
├── styles.css          # Main stylesheet
├── script.js           # JavaScript functionality
├── sitemap.xml         # SEO sitemap
├── robots.txt          # Search engine directives
├── CNAME              # Custom domain configuration
├── favicon.ico        # Website favicon
└── images/            # Image assets
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- A text editor (VS Code, Sublime Text, etc.)
- Basic knowledge of HTML/CSS/JS (for modifications)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/venkimanoharan/thehillsideoasis.git
```

2. Navigate to the project directory:
```bash
cd thehillsideoasis
```

3. Open `index.html` in your browser:
```bash
# On macOS
open index.html

# On Windows
start index.html

# On Linux
xdg-open index.html
```

Or use a local development server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server
```

Then visit `http://localhost:8000` in your browser.

## 📝 Configuration

### Update Contact Information

Edit the following files to update contact details:

**In HTML files:**
```html
<!-- Phone number -->
<a href="tel:+919150360597">+91 91503 60597</a>

<!-- WhatsApp -->
<a href="https://wa.me/919150360597">Message on WhatsApp</a>

<!-- Email -->
<a href="mailto:info@thehillsideoasis.com">info@thehillsideoasis.com</a>
```

**In `contact.html`:**
```html
<!-- Update FormSubmit email -->
<form action="https://formsubmit.co/your-email@example.com" method="POST">
```

### Update Social Media Links

Replace social media URLs throughout the site:
```html
<a href="https://facebook.com/thehillsideoasis">Facebook</a>
<a href="https://instagram.com/thehillsideoasis">Instagram</a>
```

### Customize Colors

Edit CSS custom properties in `styles.css`:
```css
:root {
  --primary: #2c5f3f;        /* Primary green */
  --accent: #4c9963;         /* Accent green */
  --accent-2: #6fb583;       /* Light accent */
  --dark: #1a1a1a;          /* Dark text */
  --light: #f8f9fa;         /* Light background */
  --muted: #6c757d;         /* Muted text */
}
```

## 🎨 Customization

### Adding New Pages

1. Create a new HTML file (e.g., `newpage.html`)
2. Copy the header and footer from existing pages
3. Add your content between the header and footer
4. Update navigation links in all pages
5. Add the page to `sitemap.xml`

### Modifying the Gallery

Edit `gallery.html` and add images to the `images/` folder:
```html
<div class="gallery-item">
  <img src="images/your-image.jpg" alt="Description" loading="lazy">
</div>
```

### Updating Activities

Edit `activities.html` to add or modify activities:
```html
<div class="activity-card">
  <div class="activity-icon">🎯</div>
  <h3>Activity Name</h3>
  <p>Activity description...</p>
</div>
```

## 🌐 Deployment

### GitHub Pages

1. Push your code to GitHub
2. Go to Settings → Pages
3. Select the `main` branch as source
4. Your site will be live at `https://username.github.io/thehillsideoasis`

### Custom Domain

1. Add a `CNAME` file with your domain:
```
thehillsideoasis.com
```

2. Configure DNS settings at your domain registrar:
```
Type: CNAME
Name: www
Value: username.github.io
```

## 📊 SEO Features

- ✅ Semantic HTML structure
- ✅ Meta descriptions on all pages
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card meta tags
- ✅ Schema.org structured data
- ✅ XML sitemap
- ✅ Robots.txt file
- ✅ Canonical URLs
- ✅ Alt text for images
- ✅ Mobile-friendly responsive design

## 🔒 Security Features

- Content Security Policy (CSP)
- X-Content-Type-Options
- X-XSS-Protection
- X-Frame-Options
- HTTPS ready (via GitHub Pages)

## 🐛 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📈 Performance

- Optimized images with lazy loading
- Minimal JavaScript footprint
- Preloaded critical fonts
- Efficient CSS with minimal specificity
- No external dependencies beyond fonts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Contact

**The HillSide Oasis**
- 🌐 Website: [thehillsideoasis.com](https://thehillsideoasis.com)
- 📞 Phone: +91 91503 60597
- 📧 Email: info@thehillsideoasis.com
- 📍 Location: Pollachi, Tamil Nadu, India

**Developer**
- 👤 GitHub: [@venkimanoharan](https://github.com/venkimanoharan)

## 🙏 Acknowledgments

- Google Fonts for Inter and Playfair Display typefaces
- FormSubmit.co for form handling services
- Icons and emojis for visual elements

---

<div align="center">

**Made with 💚 for nature lovers**

[⭐ Star this repo](https://github.com/venkimanoharan/thehillsideoasis) | [🐛 Report Bug](https://github.com/venkimanoharan/thehillsideoasis/issues) | [✨ Request Feature](https://github.com/venkimanoharan/thehillsideoasis/issues)

</div>
