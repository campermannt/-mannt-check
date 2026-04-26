# Mannt Check - Getting Started Guide

## 🎉 Congratulations! Your App is Ready

The Mannt Check PWA has been successfully built and is currently running in development mode.

**Preview URL:** https://50b4d891-c80c-439a-9bac-8050dd1af812.studio-api.nxcode.io/

## 📱 Quick Start

### 1. Access the Running App

Your development server is already running! Just click the preview URL above or open it in your browser.

### 2. Test the Application

Follow this test sequence:

#### A. First-Time User Flow
1. **Click "Zaloguj się przez Google"** (Login with Google)
2. **Complete the 3-step onboarding**:
   - Step 1: Welcome message
   - Step 2: Meet Majster Mannt
   - Step 3: Get started
3. **Add your vehicle**:
   - Fill in all fields (Marka, Model, Rok, etc.)
   - Click "Dodaj pojazd"
4. **Explore the Dashboard**:
   - See "Zaufaj profesjonalistom" section
   - View vehicle summary
   - Try quick actions

#### B. Feature Testing
1. **Checklist** (Tab: ✓ Checklista):
   - Click categories to expand/collapse
   - Check off items
   - Watch progress bars update

2. **Maintenance Log** (Tab: 🔧 Serwis):
   - Click "+ Dodaj wpis serwisowy"
   - Fill in maintenance entry
   - Click "Zgłoś do Mannt.pl" to test email integration

3. **AI Chat** (🔧 button bottom-right):
   - Click the floating button
   - Ask: "Jak sprawdzić poziom oleju?"
   - Watch streaming response
   - Try other questions about camper maintenance

4. **Travel Calculator** (Tab: 💰 Kalkulator):
   - Enter distance, fuel consumption, price
   - Click "Oblicz koszty"
   - View results

5. **PWA Install Prompt**:
   - Perform 2 actions (click around, add data)
   - Install prompt should appear
   - Test "Zainstaluj" or "Może później"

#### C. Vehicle Management (Tab: 🚐 Pojazd):
- Edit vehicle information
- Update mileage, inspection date, etc.

### 3. Mobile Testing (Recommended)

Open the preview URL on your mobile device to test:
- Responsive design
- Touch interactions
- PWA installation on mobile
- Offline behavior (if you add service worker)

## 🔧 Development Commands

### Running the Server
```bash
cd /workspace/mannt-check

# Start dev server
npm run dev

# Stop server
pkill -f "next dev"

# View logs
tail -f /tmp/dev-server.log
```

### Building for Production
```bash
# Build the app
npm run build

# Test production build locally
npm start
```

### Deployment
```bash
# Deploy to Cloudflare Workers
nxcode deploy --type frontend
```

## 📋 Pre-Deployment Checklist

Before deploying to production, complete these tasks:

### Required
- [ ] **Create PWA Icons**
  - icon-192.png (192×192 pixels)
  - icon-512.png (512×512 pixels)
  - Place in `/public/` folder
  - Use brand colors (forest green + orange)

### Recommended
- [ ] Test on multiple devices (mobile, tablet, desktop)
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test AI chat with various questions
- [ ] Test all forms and data persistence
- [ ] Review all texts for typos
- [ ] Test PWA installation on mobile device

### Optional (Post-MVP)
- [ ] Add service worker for offline support
- [ ] Set up analytics (Google Analytics, etc.)
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Add custom domain
- [ ] Set up monitoring

## 🎨 Creating PWA Icons

### Design Specifications

**icon-192.png & icon-512.png:**
- Background: Forest Green (#1a4d2e)
- Foreground: Orange (#ff8c42) or White
- Icon: Simple camper van or checkmark symbol
- Style: Flat, modern, recognizable
- Format: PNG with transparency

### Quick Creation Options

1. **Use Figma/Canva:**
   - Create 512×512 canvas
   - Green background
   - Simple icon (van/checkmark)
   - Export as PNG
   - Resize to 192×192 for smaller version

2. **Use AI Image Generator:**
   - Prompt: "Simple flat icon of camper van, forest green background, orange accent, minimalist, 512x512"
   - Generate
   - Edit if needed
   - Save both sizes

3. **Hire Designer:**
   - Provide brand guidelines
   - Request two sizes
   - Ensure high quality

### Placement
```bash
# Copy icons to public folder
cp icon-192.png /workspace/mannt-check/public/
cp icon-512.png /workspace/mannt-check/public/
```

## 🚀 Deployment Process

### Step 1: Pre-deployment
```bash
cd /workspace/mannt-check
npm run build
```

### Step 2: Deploy
```bash
nxcode deploy --type frontend
```

### Step 3: Configure (in Nxcode Dashboard)
1. Go to Menu → My Workspaces → Apps
2. Select "mannt-check"
3. Configure AI billing mode:
   - **Creator Pays** (recommended for start)
   - Or **User Pays** (for scaling)

### Step 4: Test Production
- Visit your deployment URL
- Test all features
- Verify AI chat works
- Test PWA installation

## 🐛 Troubleshooting

### Dev Server Won't Start
```bash
# Check if port is in use
lsof -i :5173

# Kill existing process
pkill -f "next dev"

# Restart
npm run dev
```

### Build Errors
```bash
# Clear cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try build again
npm run build
```

### AI Chat Not Working
- Check Nxcode SDK is loaded (browser console)
- Verify internet connection
- Check browser console for errors
- Try refreshing the page

### PWA Not Installing
- Check manifest.json is accessible
- Verify icons exist (even placeholders)
- Use Chrome DevTools → Application → Manifest
- Check for HTTPS (required for PWA)

### Data Not Saving
- Check browser localStorage (DevTools → Application → Local Storage)
- Verify JavaScript is enabled
- Try different browser
- Check for storage quota errors

## 📚 Documentation Structure

Your project includes comprehensive documentation:

- **README.md** - Project overview and setup
- **FEATURES.md** - Complete feature checklist
- **DEPLOYMENT.md** - Deployment instructions
- **PROJECT_SUMMARY.md** - Architecture and decisions
- **GETTING_STARTED.md** - This file!

## 🎯 Next Steps

1. **Test Everything** - Go through the test sequence above
2. **Create Icons** - Design and add PWA icons
3. **Deploy** - Use nxcode deploy command
4. **Monitor** - Watch usage and gather feedback
5. **Iterate** - Add features based on user needs

## 💡 Tips for Success

### For Development
- Use browser DevTools for debugging
- Test mobile-first (most users will be on mobile)
- Keep localStorage in mind (data per-browser)
- Monitor AI costs in Nxcode dashboard

### For Production
- Start with "Creator Pays" mode for AI
- Monitor usage patterns
- Gather user feedback early
- Plan for Supabase migration if multi-device sync needed

### For Users
- Encourage PWA installation for best experience
- Promote Majster Mannt AI chat as key feature
- Highlight integration with Mannt service center
- Share on camper communities

## 🆘 Getting Help

### Technical Issues
- Check browser console for errors
- Review Nxcode platform docs
- Check Next.js documentation
- Search GitHub issues

### Platform Support
- Nxcode documentation
- Nxcode community forums
- GitHub: https://github.com/anthropics/claude-code/issues

### Business Questions
- Contact Mannt service center
- Email: kontakt@mannt.pl
- Website: https://mannt.pl

## ✅ Ready to Launch?

Your checklist:
- [x] App built and running
- [x] All features implemented
- [x] Documentation complete
- [ ] Icons created (you need to do this)
- [ ] Tested on devices
- [ ] Deployed to production

**Once you have the icons, you're ready to deploy!**

```bash
nxcode deploy --type frontend
```

---

**Good luck with Mannt Check!** 🚐✨

Built with passion for the camper community.
