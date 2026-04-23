# Step-by-Step Guide: Deploy Matchly to Vercel via GitHub Push

Follow these exact steps to deploy your Matchly (Resume Matcher) application to Vercel automatically when you push code to GitHub.

## Prerequisites Checklist
- [ ] GitHub account with repository at `https://github.com/muhammadhammad2005/Matchly`
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com) if needed)
- [ ] All CI/CD configuration files are in your repository (created in previous steps)

## Step 1: Prepare Your Local Repository

### 1.1 Check current files
Ensure you have these files in your repository:
```
index.html
package.json
vercel.json
.github/workflows/ci-cd.yml
Dockerfile
docker-compose.yml
nginx.conf
.dockerignore
README.md
vercel-deploy.md
deploy-vercel.sh
DEPLOYMENT.md
```

### 1.2 Commit all changes
```bash
cd "e:/Apps/Resume Matcher"
git add .
git commit -m "Add CI/CD pipeline and Vercel deployment configuration"
```

## Step 2: Push to GitHub

### 2.1 Push to your repository
```bash
git push origin main
```
*(Replace `main` with your branch name if different)*

## Step 3: Connect GitHub to Vercel

### 3.1 Login to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account

### 3.2 Import GitHub Repository
1. Click "Add New" → "Project"
2. Select "Import Git Repository"
3. Find and select `muhammadhammad2005/Matchly`
4. Click "Import"

### 3.3 Configure Project Settings
**IMPORTANT**: Configure these settings exactly:

| Setting | Value | Reason |
|---------|-------|--------|
| **Project Name** | `matchly` (or your preferred name) | |
| **Framework Preset** | `Other` | This is a static HTML site, not a framework |
| **Build Command** | Leave empty | No build step needed |
| **Output Directory** | `.` (dot) | Files are in root directory |
| **Install Command** | Leave empty | No dependencies to install |
| **Root Directory** | Leave empty | |

### 3.4 Environment Variables
No environment variables needed for now. Click "Deploy" without adding any.

## Step 4: Configure GitHub Secrets for CI/CD

### 4.1 Get Vercel Tokens
1. In Vercel dashboard, go to **Settings** → **Tokens**
2. Click "Create Token"
3. Name: `GitHub Actions CI/CD`
4. Scope: Select all (or at least "read" and "write" for projects)
5. Copy the generated token

### 4.2 Get Project IDs
1. In Vercel dashboard, go to your `matchly` project
2. Go to **Settings** → **General**
3. Find:
   - **Project ID** (e.g., `prj_xxxxxxxxxxxxxxxx`)
   - **Organization ID** (e.g., `team_xxxxxxxxxxxxxxxx`)

### 4.3 Add Secrets to GitHub
1. Go to your GitHub repository: `https://github.com/muhammadhammad2005/Matchly`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `VERCEL_TOKEN` | The token you created in step 4.1 | Vercel Settings → Tokens |
| `VERCEL_ORG_ID` | Your Organization ID | Vercel Project Settings → General |
| `VERCEL_PROJECT_ID` | Your Project ID | Vercel Project Settings → General |

## Step 5: Test the CI/CD Pipeline

### 5.1 Make a test commit
```bash
# Make a small change
echo "<!-- Test deployment -->" >> index.html

# Commit and push
git add index.html
git commit -m "Test CI/CD pipeline"
git push origin main
```

### 5.2 Monitor GitHub Actions
1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see "CI/CD Pipeline" running
4. Wait for all jobs to complete (should take 2-5 minutes)

### 5.3 Check Vercel Deployment
1. Go to Vercel dashboard
2. Select your `matchly` project
3. Click **Deployments**
4. You should see a new deployment with status "✅ Ready"

## Step 6: Verify Deployment

### 6.1 Access Your Live Site
Your site will be available at:
- `https://matchly.vercel.app` (or your custom domain if configured)

### 6.2 Test Functionality
1. Open your deployed URL
2. Test all features:
   - Upload a PDF resume
   - Paste a job description
   - Click "Analyze Match"
   - Check results display
   - Test theme toggle (light/dark mode)

### 6.3 Check Logs (if issues)
```bash
# Install Vercel CLI
npm install -g vercel

# View logs
vercel logs matchly.vercel.app
```

## Step 7: Configure Automatic Deployments (Optional)

### 7.1 Enable Branch Deployments
1. In Vercel dashboard, go to project **Settings** → **Git**
2. Enable "Automatically deploy pushes to the Production Branch"
3. Enable "Preview deployments for Pull Requests"

### 7.2 Set Up Custom Domain
1. In Vercel dashboard, go to project **Settings** → **Domains**
2. Add your custom domain (e.g., `matchly.yourdomain.com`)
3. Follow DNS configuration instructions

## Troubleshooting Common Issues

### Issue 1: GitHub Actions Fails
**Symptoms**: Red "❌" in GitHub Actions
**Solutions**:
1. Check workflow logs for error details
2. Verify secrets are correctly set
3. Ensure `vercel.json` exists and is valid JSON

### Issue 2: Vercel Deployment Fails
**Symptoms**: Deployment shows "Failed" in Vercel
**Solutions**:
1. Check Vercel deployment logs
2. Verify Framework Preset is set to "Other"
3. Ensure no build command is specified

### Issue 3: Application Doesn't Load
**Symptoms**: Blank page or 404 errors
**Solutions**:
1. Check browser console for errors
2. Verify `vercel.json` has correct routing
3. Ensure `index.html` is in root directory

### Issue 4: CI/CD Doesn't Trigger
**Symptoms**: No GitHub Actions run on push
**Solutions**:
1. Check `.github/workflows/ci-cd.yml` exists
2. Verify file is in correct location
3. Check repository Actions permissions

## Maintenance and Updates

### Adding New Features
1. Make changes to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin main
   ```
3. GitHub Actions will automatically:
   - Run tests
   - Build Docker image
   - Deploy to Vercel

### Rollback Deployment
1. Go to Vercel dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Monitoring
- **GitHub Actions**: Check run status and logs
- **Vercel Analytics**: Monitor performance and traffic
- **Vercel Logs**: View runtime errors and requests

## Quick Reference Commands

```bash
# Local development
npm start                    # Start local server
docker-compose up           # Start with Docker

# Deployment
git add .                   # Stage changes
git commit -m "Message"     # Commit changes
git push origin main        # Trigger CI/CD

# Vercel CLI
vercel login                # Login to Vercel
vercel                      # Deploy preview
vercel --prod               # Deploy to production
vercel logs                 # View deployment logs
```

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Repository**: https://github.com/muhammadhammad2005/Matchly
- **Vercel Status**: https://vercel-status.com

---

**Next Steps After Deployment**:
1. Share your live URL: `https://matchly.vercel.app`
2. Test on different devices and browsers
3. Consider adding analytics (Vercel Analytics or Google Analytics)
4. Set up monitoring alerts for downtime

Your Matchly application is now set up for continuous deployment - every push to GitHub will automatically deploy to Vercel!