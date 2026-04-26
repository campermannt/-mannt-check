# Mannt Check - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
1. Nxcode CLI installed
2. Logged into Nxcode platform
3. PWA icons created (icon-192.png and icon-512.png)

## Quick Deploy

### Deploy to Cloudflare Workers

```bash
# Build the application
npm run build

# Deploy using nxcode CLI
cd /workspace/mannt-check
nxcode deploy --type frontend
```

The nxcode CLI will automatically:
- Build your Next.js app for Cloudflare Workers
- Upload to Cloudflare
- Configure routing
- Provide you with a live URL

## Post-Deployment

### 1. Configure AI Billing Mode

After deployment, configure how AI usage is billed:

1. Go to Nxcode Dashboard
2. Navigate to **Menu → My Workspaces → Apps**
3. Select your "mannt-check" app
4. Go to **Settings**
5. Choose billing mode:
   - **Creator Pays** (default): You pay for AI usage, users can use anonymously
   - **User Pays**: Users must login and pay from their C$ balance

**Recommendation for Mannt Check:** Use "Creator Pays" initially to provide free AI assistance. Monitor usage and switch to "User Pays" if costs become significant.

### 2. Test the Deployed App

Visit your deployment URL and test:
- [x] Login with Google works
- [x] Onboarding flows correctly
- [x] Vehicle form saves data
- [x] All navigation works
- [x] Majster Mannt AI chat responds
- [x] PWA install prompt appears after 2 actions
- [x] App can be installed to home screen

### 3. PWA Installation Test

On mobile:
1. Visit the app URL
2. Perform 2 actions (e.g., click navigation, add vehicle)
3. Install prompt should appear
4. Install app
5. Verify it opens in standalone mode
6. Test offline functionality (if service worker added)

## Environment-Specific Notes

### Development (Preview)
- AI Gateway: Uses workspace credentials
- Auth: Development OAuth
- Storage: localStorage (per-browser)
- URL: `*.studio-api.nxcode.io`

### Production (Deployed)
- AI Gateway: Uses app credentials from Nxcode
- Auth: Production OAuth (same as dev)
- Storage: localStorage (per-browser)
- URL: `*.nxcode-io.workers.dev` or custom domain

## Custom Domain (Optional)

After deployment, you can add a custom domain:

1. Go to Cloudflare Dashboard
2. Add your domain
3. Configure DNS
4. Update Nxcode app settings

Example: `app.mannt.pl`

## Monitoring

### Check AI Usage
1. Nxcode Dashboard → Apps → mannt-check
2. View AI usage statistics
3. Monitor costs (if Creator Pays mode)

### Check User Activity
- Login analytics available in Nxcode Dashboard
- Monitor authentication metrics

## Troubleshooting

### AI Chat Not Working
- Verify AI module is enabled in deployment
- Check AI billing mode is configured
- Test with simple prompt: "Cześć"

### Auth Issues
- Ensure OAuth is configured for production domain
- Check Nxcode SDK is loaded (script tag in layout)

### PWA Not Installing
- Verify manifest.json is accessible at /manifest.json
- Check icons exist (icon-192.png, icon-512.png)
- Use Chrome DevTools → Application → Manifest to debug

### Data Not Persisting
- localStorage is per-browser/device
- To sync across devices, implement Supabase (see SUPABASE.md - future)

## Performance Optimization

For production, consider:
1. **Image Optimization**: Optimize PWA icons
2. **Caching**: Add service worker for offline support
3. **Analytics**: Add Nxcode analytics or Google Analytics
4. **Error Tracking**: Implement error logging (Sentry, etc.)

## Updating the App

To deploy updates:

```bash
# Make your changes
# Then rebuild and redeploy
npm run build
nxcode deploy --type frontend
```

Cloudflare will automatically handle cache invalidation.

## Rollback

If you need to rollback:
1. Go to Cloudflare Dashboard
2. Find your Worker
3. Use "Rollback" feature to previous version

## Security Notes

- OAuth tokens are handled by Nxcode SDK
- No credentials stored in app code
- All AI requests authenticated via Nxcode Platform
- localStorage data is client-side only

## Support

Issues with deployment?
- Check nxcode CLI docs: `nxcode deploy --help`
- Visit Nxcode documentation
- GitHub issues: https://github.com/anthropics/claude-code/issues

---

**Ready to deploy?** Run `nxcode deploy --type frontend` from the project root!
