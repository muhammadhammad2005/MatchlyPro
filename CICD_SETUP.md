# CI/CD Pipeline Setup for Resume Matcher

## Overview

This document describes the simplified CI/CD pipeline setup for the Resume Matcher application. The pipeline includes:

1. **Automated Testing** - Code validation and basic checks with Snyk security scanning
2. **Docker Containerization** - Docker image builds
3. **Vercel Deployment** - Automated deployment to production
4. **Notifications** - Email notifications to `muhammadhammad.020050@gmail.com`

## Pipeline Architecture

```
GitHub Push/PR → Test (with Snyk) → Docker Build → Vercel Deploy → Notify
```

### Jobs in the Workflow

1. **test** - Runs basic validation and Snyk security scanning
2. **build-docker** - Builds Docker images and pushes to GitHub Container Registry
3. **deploy-vercel** - Deploys the application to Vercel production
4. **notify** - Sends email notifications with pipeline status

## Prerequisites

### GitHub Repository Settings

1. Enable GitHub Actions in your repository
2. Set up the following secrets in GitHub Settings → Secrets and variables → Actions:

### Required Secrets

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel authentication token | Vercel deployment |
| `VERCEL_ORG_ID` | Vercel organization ID | Vercel deployment |
| `VERCEL_PROJECT_ID` | Vercel project ID | Vercel deployment |
| `SMTP_USER` | SMTP username (Gmail) | Email notifications |
| `SMTP_PASS` | SMTP password/app password | Email notifications |
| `SNYK_TOKEN` | Snyk API token | Snyk security scanning |
| `DOCKERHUB_USERNAME` | Docker Hub username (optional) | Docker Hub push |
| `DOCKERHUB_TOKEN` | Docker Hub access token (optional) | Docker Hub push |

### Email Configuration

The pipeline is configured to send email notifications to:
- **Primary recipient**: `muhammadhammad.020050@gmail.com`
- Email notifications are sent for both success and failure states

## Pipeline Details

### 1. Test Job

The test job performs:
- Node.js dependency installation using `npm ci`
- Snyk security scanning for vulnerabilities
- Basic file structure validation

**Key Features:**
- Uses Node.js 18
- Caches npm dependencies for faster builds
- Runs Snyk with high severity threshold

### 2. Build Docker Job

The Docker build job:
- Builds a Docker image using the multi-stage Dockerfile
- Pushes the image to GitHub Container Registry
- Optionally pushes to Docker Hub if credentials are provided
- Tags images with branch name, commit SHA, and latest

**Key Features:**
- Uses security best practices (non-root user)
- Minimal Alpine-based image
- Nginx web server for static content
- Supports both GitHub Container Registry and Docker Hub
- Fixed cache export error by removing unsupported cache options

### 3. Deploy Vercel Job

The Vercel deployment job:
- Installs Vercel CLI
- Pulls environment configuration
- Builds and deploys to Vercel production
- Performs health checks on deployed application

**Key Features:**
- Production deployment only on `main` branch pushes
- Pre-built deployment for speed
- Health check validation

### 4. Notify Job

The notification job:
- Sends email notifications via SMTP (Gmail)
- Creates workflow summary in GitHub Actions
- Includes detailed status of all jobs

**Key Features:**
- Email sent to `muhammadhammad.020050@gmail.com`
- Includes deployment URL when available
- Runs regardless of job success/failure

## Setup Instructions

### Step 1: Configure GitHub Secrets

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

   **For Vercel:**
   - `VERCEL_TOKEN`: Get from Vercel dashboard → Settings → Tokens
   - `VERCEL_ORG_ID`: Find in Vercel dashboard URL or team settings
   - `VERCEL_PROJECT_ID`: Find in project settings

   **For Email Notifications:**
   - `SMTP_USER`: Your Gmail address (e.g., `your-email@gmail.com`)
   - `SMTP_PASS`: Gmail app password (not your regular password)

   **For Security Scanning:**
   - `SNYK_TOKEN`: Get from [Snyk.io](https://snyk.io) → Account Settings → API Token

   **For Docker Hub (Optional):**
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Docker Hub access token (create at https://hub.docker.com/settings/security)

### Step 2: Verify Configuration

Run the validation script to check your setup:

```bash
# On Windows
powershell -ExecutionPolicy Bypass -File validate-pipeline-simple.ps1

# On Linux/macOS
bash validate-pipeline.sh
```

### Step 3: Trigger the Pipeline

1. Commit and push changes to your repository
2. The pipeline will automatically run on:
   - Push to `main` or `develop` branches
   - Pull requests to `main` branch
   - Manual trigger via GitHub Actions UI

## Troubleshooting

### Common Issues

1. **Email Notifications Not Sending**
   - Verify SMTP credentials are correct
   - Check Gmail app password is generated correctly
   - Ensure less secure apps are allowed or use app-specific password

2. **Vercel Deployment Fails**
   - Verify Vercel tokens have correct permissions
   - Check project exists in Vercel
   - Ensure Vercel CLI is properly authenticated

3. **Snyk Scanning Fails**
   - Verify SNYK_TOKEN is valid
   - Check Snyk account has active subscription
   - Review Snyk scan logs for specific errors

4. **Docker Build Fails**
   - Check Dockerfile syntax
   - Verify build context has all required files
   - Ensure GitHub token has package write permissions

### Debugging

1. Check GitHub Actions logs for detailed error messages
2. Run validation scripts locally to identify configuration issues
3. Test individual components separately:
   - `npm ci` locally
   - Docker build with `docker build -t test .`
   - Vercel deployment manually with CLI

## Security Considerations

1. **Container Security**
   - Non-root user execution
   - Minimal base image (Alpine Linux)
   - Regular security updates

2. **Secret Management**
   - All sensitive data stored in GitHub Secrets
   - No hardcoded credentials in code
   - Secure transmission for notifications

3. **Code Security**
   - Snyk vulnerability scanning
   - Dependency auditing
   - Regular security updates

## Monitoring

1. **Pipeline Status**
   - Monitor GitHub Actions runs
   - Check email notifications
   - Review deployment URLs

2. **Application Health**
   - Health check endpoint: `/health`
   - Vercel deployment status
   - Container registry updates

## Customization

### Modify Email Recipient

To change the email recipient, edit `.github/workflows/ci-cd.yml`:
```yaml
# In the notify job, email step:
to: your-email@example.com
```

### Adjust Snyk Settings

To modify Snyk scanning:
```yaml
# In the test job, Snyk step:
args: --severity-threshold=critical  # Change threshold
```

### Change Docker Tags

To modify Docker image tagging:
```yaml
# In the build-docker job, metadata step:
tags: |
  type=ref,event=tag  # Add custom tagging logic
```

## Support

For issues with the CI/CD pipeline:
1. Check GitHub Actions logs
2. Review this documentation
3. Contact the development team

---

**Last Updated**: April 2026  
**Pipeline Version**: 2.0 (Simplified)  
**Contact**: muhammadhammad.020050@gmail.com