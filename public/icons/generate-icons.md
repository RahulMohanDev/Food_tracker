# App Icon Generation Guide

Since we can't generate actual PNG images programmatically, you'll need to create app icons manually.

## Quick Method: Use an Online Icon Generator

1. **Create a base icon** (512x512px) with your app branding
   - Use Canva, Figma, or any design tool
   - Recommended: Blue/green background with a food/nutrition icon
   - Keep it simple and recognizable

2. **Generate all sizes automatically** using one of these free tools:
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/
   - https://favicon.io/

3. **Upload your 512x512 image** and download the generated icon pack

4. **Extract the icons** to this directory with these names:
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

## Manual Method: Create with Design Tools

If you want to create icons manually, ensure:
- Square dimensions (1:1 ratio)
- PNG format with transparency
- Centered content with padding (safe zone)
- High contrast for visibility

## Quick Placeholder Icons

For testing, you can use this simple SVG converted to PNG:
- Background: #2563eb (blue)
- Icon: White fork and knife emoji or simple "F" letter
- Use any online SVG to PNG converter

## iOS Specific Requirements

For best iOS experience, also create:
- **apple-touch-icon.png** (180x180px) - place in /public/
- This ensures iOS uses a high-quality icon

The PWA will work without custom icons (browser will generate generic ones), but custom icons provide a much better user experience.
