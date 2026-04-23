# Vercel Deployment Guide for Matchly

This guide provides step-by-step instructions for deploying your Matchly (Resume Matcher) application to Vercel.

## Prerequisites

1. **GitHub Account**: Your code must be in a GitHub repository at `https://github.com/muhammadhammad2005/Matchly`
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **GitHub Repository**: Ensure your repository is public or you have granted Vercel access

## Deployment Steps

### Option 1: One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/muhammadhammad2005/Matchly)

1. Click the "Deploy with Vercel" button above
2. Sign in to Vercel with your GitHub account
3. Authorize Vercel to access your GitHub repositories
4. Select the `muhammadhammad2005/Matchly` repository
5. Configure project settings:
   - **Project Name**: `matchly` (or choose your preferred name)
   - **Framework Preset**: `Other` (since this is a static HTML site)
   - **Build Command**: Leave empty (no build step needed)
   - **Output Directory**: `.` (root directory)
   - **Install Command**: Leave empty
6. Click "Deploy"

### Option 2: Manual Deployment via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your local repository**:
   ```bash
   cd "e:/Apps/Resume Matcher"
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - What's your project's name: `matchly`
   - In which directory is your code located: `.`
   - Want to override the settings: `N`

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

## Configuration

### Environment Variables
No environment variables are required for the basic static deployment. If you add backend functionality later, you can add them in the Vercel project settings.

### Custom Domain (Optional)
1. Go to your Vercel dashboard
2. Select your `matchly` project
3. Navigate to "Domains"
4. Add your custom domain (e.g., `matchly.yourdomain.com`)
5. Follow DNS configuration instructions

### GitHub Integration (Automatic Deployments)
1. In Vercel dashboard, go to your project → Settings → Git
2. Connect your GitHub repository if not already connected
3. Enable "Automatically deploy pushes to the Production Branch"
4. Your site will automatically deploy when you push to the `main` branch

## Post-Deployment Verification

1. **Check deployment status**: Visit your Vercel dashboard
2. **Test the application**: Open your deployed URL (e.g., `https://matchly.vercel.app`)
3. **Verify functionality**:
   - Upload a PDF resume
   - Paste a job description
   - Click "Analyze Match"
   - Ensure all features work correctly

4. **Check logs** (if issues):
   ```bash
   vercel logs
   ```

## Troubleshooting

### Common Issues

#### 1. 404 Errors on Page Refresh
**Solution**: The `vercel.json` file already includes SPA routing configuration that redirects all routes to `index.html`.

#### 2. Static Assets Not Loading
**Solution**: Check the `vercel.json` routes configuration. Assets should be cached properly.

#### 3. CORS Issues (if adding backend)
**Solution**: Add CORS headers in your backend or configure in `vercel.json`.

#### 4. Build Failures
**Solution**: Since this is a static site, there's no build step. If Vercel tries to build, set Framework Preset to "Other" in project settings.

### Checking Deployment Logs
1. **Vercel Dashboard**: Project → Deployments → Select deployment → "View Build Logs"
2. **CLI**:
   ```bash
   vercel logs matchly.vercel.app
   ```

## Advanced Configuration

### Branch Deployments
Vercel automatically creates preview deployments for pull requests:
- Create a feature branch
- Open a pull request
- Vercel will create a preview URL for testing

### Environment Variables
If you need environment variables later:
1. Project → Settings → Environment Variables
2. Add variables (e.g., `API_KEY`, `DATABASE_URL`)
3. Redeploy or wait for next automatic deployment

### Analytics
Enable Vercel Analytics in project settings to track:
- Page views
- Performance metrics
- Web Vitals

## Maintenance

### Updating the Application
1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Vercel will automatically deploy the changes

### Rollback
If a deployment has issues:
1. Go to Vercel dashboard → Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"

### Monitoring
- **Uptime**: Vercel provides 99.9% uptime SLA on paid plans
- **Performance**: Use Vercel Analytics or Google Lighthouse
- **Errors**: Check Vercel logs for runtime errors

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **GitHub Repository**: https://github.com/muhammadhammad2005/Matchly
- **Vercel Status**: https://vercel-status.com

---

**Deployment URL**: Will be provided after deployment (e.g., `https://matchly.vercel.app`)
**Repository**: https://github.com/muhammadhammad2005/Matchly
**Last Updated**: $(date)