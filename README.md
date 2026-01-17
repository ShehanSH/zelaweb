# Zela - Online Clothing Brand Website

A beautiful, modern, and responsive static website for the Zela clothing brand.

## Features

- ✨ Modern and elegant design with gold accents
- 📱 Fully responsive (mobile-friendly)
- 🛒 Latest products showcase
- 🔮 Upcoming products section
- 💬 WhatsApp integration for orders and inquiries
- 📱 Social media links (Instagram, Facebook, Twitter, Pinterest, TikTok)
- 🎨 Smooth animations and hover effects
- 🚀 Fast and lightweight

## Setup Instructions

### 1. Logo Image
Place your Zela logo image file named `logo.png` in the same directory as `index.html`. If your logo has a different name or extension, update the logo reference in `index.html` (line 11).

### 2. WhatsApp Phone Number
Update the WhatsApp phone number in these locations:

**In `index.html`:**
- Line 284: Contact section WhatsApp link
- Line 330: Footer WhatsApp link
- Line 343: Floating WhatsApp button

**In `script.js`:**
- Line 8: `const phoneNumber = 'YOUR_PHONE_NUMBER';`

**Format:** Use country code + number (no + sign or spaces)
- Example: `1234567890` for a US number
- Example: `919876543210` for an Indian number

### 3. Social Media Links
Update the social media URLs in `index.html`:
- Line 241: Instagram link
- Line 248: Facebook link
- Line 255: Twitter link
- Line 262: Pinterest link
- Line 269: TikTok link
- Line 360-363: Footer social links

Replace `https://www.instagram.com/yourbrand` with your actual social media URLs.

### 4. Product Information
Customize the products in `index.html` (starting around line 58):
- Product names
- Descriptions
- Prices
- Product images (currently using gradient placeholders)

### 5. Customizing Product Images
To add actual product images:
1. Create an `images` folder
2. Add your product images
3. Update the `.product-image` div in `index.html` to use `<img>` tags or CSS background-image

### 6. Upcoming Products
Update the upcoming products section (starting around line 186) with your actual launch dates and collections.

## File Structure

```
zela/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # JavaScript functionality
├── logo.png           # Your Zela logo (add this file)
└── README.md          # This file
```

## Opening the Website

Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).

## Customization Tips

1. **Colors**: Edit CSS variables in `styles.css` (lines 6-14) to change the color scheme
2. **Fonts**: Currently using Google Fonts (Playfair Display & Poppins). Change in `index.html` line 8-9
3. **Products**: Add or remove product cards in the `.products-grid` section
4. **Sections**: All sections are clearly marked with IDs for easy navigation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Notes

- The website uses WhatsApp Web/App links - customers need WhatsApp installed
- All product ordering goes through WhatsApp for easy communication
- The floating WhatsApp button appears on all pages for easy access

Enjoy your beautiful Zela website! 🎉
