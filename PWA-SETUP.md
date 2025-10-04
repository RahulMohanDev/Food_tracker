# Progressive Web App (PWA) Setup Guide

Your Food Tracker app is now a Progressive Web App! This means you can install it on your iPhone like a native app.

## ✅ What's Included

- **App Manifest** - Defines app name, icons, colors, and behavior
- **Service Worker** - Enables offline support and caching
- **iOS Optimization** - Special meta tags for iPhone compatibility
- **App Shortcuts** - Quick access to Track, Inventory, and Leaderboard
- **Installable** - Can be added to home screen

## 📱 How to Install on iPhone

### Step 1: Deploy the App
First, deploy your app to a server (see DEPLOYMENT.md) and access it via HTTPS.

**Important**: PWAs require HTTPS to work (except localhost for testing)

### Step 2: Install on iPhone

1. **Open Safari** on your iPhone
2. **Navigate** to your app URL (e.g., https://your-domain.com)
3. **Tap the Share button** (square with arrow pointing up)
4. **Scroll down** and tap "Add to Home Screen"
5. **Customize the name** if you want, then tap "Add"
6. **Done!** The app icon now appears on your home screen

### Step 3: Use as Native App

- Tap the icon to launch the app
- It opens in fullscreen (no Safari UI)
- Works offline (cached pages)
- Camera access works for food scanning
- Appears in app switcher like native apps

## 🎨 App Icons (Important!)

You need to create app icons for the best experience. Follow these steps:

### Quick Method (Recommended)

1. **Create a 512x512px icon** using:
   - Canva (free)
   - Figma (free)
   - Any design tool

2. **Design suggestions**:
   - Blue background (#2563eb)
   - Simple food/nutrition icon (fork & knife, apple, etc.)
   - Keep it minimal and recognizable
   - Make sure content is centered with padding

3. **Generate all sizes** at:
   - https://www.pwabuilder.com/imageGenerator (easiest)
   - Upload your 512x512 image
   - Download the generated icon pack

4. **Place icons** in `/public/icons/` directory:
   ```
   public/
   └── icons/
       ├── icon-72x72.png
       ├── icon-96x96.png
       ├── icon-128x128.png
       ├── icon-144x144.png
       ├── icon-152x152.png
       ├── icon-192x192.png
       ├── icon-384x384.png
       └── icon-512x512.png
   ```

5. **Rebuild and redeploy**:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

### Without Custom Icons

The app will still work without custom icons, but:
- iOS will show a screenshot of your app instead
- Less professional appearance
- Harder to identify on home screen

## 🧪 Testing PWA Features

### Test Locally (Desktop)

1. **Run the app**:
   ```bash
   npm run dev
   ```

2. **Open Chrome**:
   - Go to http://localhost:3000
   - Open DevTools (F12)
   - Go to "Application" tab
   - Check "Manifest" - should show your app details
   - Check "Service Workers" - should show registered worker

3. **Test Installation**:
   - Look for install icon in address bar
   - Click to install as desktop app

### Test on iPhone (Production)

1. Deploy to your server with HTTPS
2. Visit in Safari
3. Check for install prompt
4. Test offline mode:
   - Install the app
   - Turn on Airplane Mode
   - Open the app - should still load cached pages

## 🔧 PWA Features Explained

### Service Worker (`/public/sw.js`)
- Caches pages for offline access
- Network-first strategy (fresh data when online)
- Falls back to cache when offline
- Auto-updates when new version deployed

### Manifest (`/public/manifest.json`)
- App name and description
- Icon definitions
- Theme colors
- Display mode (standalone = fullscreen)
- App shortcuts (3D Touch menu)

### iOS Meta Tags (in `layout.tsx`)
- `apple-mobile-web-app-capable` - Enables standalone mode
- `apple-touch-icon` - High-res icon for iOS
- `theme-color` - Status bar color
- `viewport-fit=cover` - Uses full screen on iPhone X+

## 📊 App Capabilities

✅ **Works**:
- Full offline page caching
- Camera access for food scanning
- Push notifications (future feature)
- Background sync (future feature)
- Add to home screen
- Fullscreen mode
- App shortcuts

❌ **Limitations on iOS**:
- No true background processing
- Limited storage (less than native apps)
- Can't auto-update like App Store apps
- Must manually refresh for updates

## 🚀 Deployment Checklist

Before deploying your PWA:

- [ ] Create and add app icons to `/public/icons/`
- [ ] Deploy with HTTPS (required for PWA)
- [ ] Test manifest at `https://your-domain.com/manifest.json`
- [ ] Test service worker registration in browser console
- [ ] Verify installability in Chrome DevTools
- [ ] Test installation on actual iPhone
- [ ] Test offline functionality
- [ ] Customize colors in manifest.json if desired

## 🎨 Customization

### Change App Colors

Edit `/public/manifest.json`:
```json
{
  "theme_color": "#2563eb",        // Status bar color
  "background_color": "#ffffff"    // Splash screen background
}
```

Also update in `/app/layout.tsx`:
```typescript
themeColor: "#2563eb"
```

### Change App Name

Edit `/public/manifest.json`:
```json
{
  "name": "Your App Name",           // Full name
  "short_name": "Short Name"         // Home screen name (12 chars max)
}
```

### Add More Shortcuts

Edit `/public/manifest.json` shortcuts array:
```json
{
  "shortcuts": [
    {
      "name": "New Feature",
      "url": "/new-page",
      "icons": [...]
    }
  ]
}
```

## 🐛 Troubleshooting

### App Won't Install on iPhone
- Ensure you're using **Safari** (not Chrome)
- Check that site is served over **HTTPS**
- Verify manifest.json is accessible
- Clear Safari cache and try again

### Service Worker Not Registering
- Check browser console for errors
- Ensure `/sw.js` is accessible at root
- Verify HTTPS is enabled
- Try hard refresh (Cmd+Shift+R)

### Icons Not Showing
- Check icons exist in `/public/icons/`
- Verify file names match manifest.json
- Clear cache and reinstall app
- Check file permissions (readable)

### Offline Mode Not Working
- Service worker must be registered first
- Visit pages while online to cache them
- Check DevTools > Application > Cache Storage
- API calls won't work offline (need backend)

## 📚 Resources

- [PWA Builder](https://www.pwabuilder.com/) - Test and improve your PWA
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Audit PWA quality
- [Can I Use PWA](https://caniuse.com/web-app-manifest) - Browser compatibility
- [iOS PWA Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

## 🎉 Next Steps

1. Create your app icons
2. Deploy to production with HTTPS
3. Test installation on your iPhone
4. Share the app with friends!
5. Consider adding push notifications in the future

Your app is now installable and works offline! 🚀
