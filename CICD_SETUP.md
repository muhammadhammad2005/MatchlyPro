# CI/CD Pipeline Setup for Resume Matcher

## Overview

This document describes the complete CI/CD pipeline setup for the Resume Matcher application. The pipeline includes:

1. **Automated Testing** - Code validation and basic checks
2. **Security Scanning** - Comprehensive security analysis with 9+ tools
3. **Docker Containerization** - Multi-architecture Docker image builds
4. **Vercel Deployment** - Automated deployment to production
5. **Notifications** - Email notifications to `muhammadhammad.020050@gmail.com`

## Pipeline Architecture

```
GitHub Push/PR → Test → Security Scan → Docker Build → Vercel Deploy → Notify
```

### Jobs in the Workflow

1. **test** - Runs basic validation, HTML checks, and dependency audit
2. **security-scan** - Comprehensive security scanning with multiple tools
3. **build-docker** - Builds multi-architecture Docker images (amd64/arm64)
4. **deploy-vercel** - Deploys the application to Vercel production
5. **notify** - Sends email notifications with pipeline status

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
| `SNYK_TOKEN` | Snyk API token (optional) | Snyk security scanning |
| `GITLEAKS_LICENSE` | Gitleaks license (optional) | Secret scanning |

### Email Configuration

The pipeline is configured to send email notifications to:
- **Primary recipient**: `muhammadhammad.020050@gmail.com`
- Email notifications are sent for both success and failure states

## Security Scanning Tools

The pipeline includes the following security tools:

1. **Trivy** - Vulnerability scanner for filesystem and container images
2. **Grype** - Vulnerability scanner for dependencies
3. **Snyk** (optional) - Dependency vulnerability scanning
4. **OWASP Dependency Check** - Comprehensive dependency analysis
5. **Semgrep** - Static Application Security Testing (SAST)
6. **Hadolint** - Dockerfile linter and security checker
7. **Checkov** - Infrastructure as Code security scanning
8. **Gitleaks** - Secret detection and prevention
9. **GitHub CodeQL** - Code analysis (via SARIF upload)

All security findings are uploaded to GitHub Security tab for review.

## Docker Containerization

### Multi-Architecture Support

The Docker build supports both:
- `linux/amd64` (standard x86-64)
- `linux/arm64` (Apple Silicon, ARM servers)

### Image Features

- Multi-stage build for smaller final image size
- Non-root user execution for security
- Health checks with `/health` endpoint
- Nginx with optimized configuration
- Security headers and best practices

### Building Locally

```bash
# Build the Docker image
docker build -t resume-matcher .

# Run locally
docker run -p 8080:8080 resume-matcher

# Access the application
open http://localhost:8080
```

## Vercel Deployment

### Configuration

The `vercel.json` file includes:

- Security headers (CSP, HSTS, XSS protection)
- Cache optimization for static assets
- Health check endpoint at `/health`
- Production environment settings

### Deployment Process

1. **Pre-deployment checks** - Security scans must pass
2. **Build verification** - Project is built with Vercel CLI
3. **Production deployment** - Deployed to Vercel production
4. **Health verification** - Application health is verified

## Email Notifications

### Setup for Gmail

1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification
   - Click "App passwords"
   - Generate a password for "Mail"
   - Use this as `SMTP_PASS` secret

2. Set `SMTP_USER` to your Gmail address

### Notification Content

Emails include:
- Pipeline status (success/failure)
- Repository and branch information
- Job results summary
- Link to the GitHub Actions run
- Deployment URL (if applicable)

## Manual Testing

### Validation Scripts

Two validation scripts are provided:

1. **PowerShell** (Windows):
   ```powershell
   powershell -ExecutionPolicy Bypass -File validate-pipeline-simple.ps1
   ```

2. **Bash** (Linux/macOS):
   ```bash
   bash validate-pipeline.sh
   ```

### Quick Validation Commands

```bash
# Check workflow syntax
yamllint .github/workflows/ci-cd.yml

# Validate Dockerfile
docker run --rm -i hadolint/hadolint < Dockerfile

# Check package.json
jq empty package.json
```

## Troubleshooting

### Common Issues

1. **Vercel deployment fails**
   - Verify `VERCEL_TOKEN` has correct permissions
   - Check `VERCEL_PROJECT_ID` matches your Vercel project
   - Ensure Vercel CLI is installed in your project

2. **Email notifications not sent**
   - Verify SMTP credentials are correct
   - Check Gmail app password is valid
   - Ensure `SMTP_USER` and `SMTP_PASS` secrets are set

3. **Security scan failures**
   - Review security findings in GitHub Security tab
   - Some tools may report false positives
   - Adjust severity thresholds if needed

4. **Docker build fails on ARM64**
   - Ensure Buildx is properly configured
   - Check QEMU is available for cross-architecture builds

### Debugging Workflow

1. Check GitHub Actions logs for detailed error messages
2. Use `act` tool to run workflows locally (optional)
3. Review workflow summary in GitHub Actions UI

## Performance Optimization

### Caching

The pipeline implements:
- Docker layer caching via GitHub Actions cache
- npm dependency caching
- Buildx cache for faster Docker builds

### Parallel Execution

Jobs run in parallel where possible:
- Security scanning runs independently
- Docker build starts after test completion
- Notifications run after all other jobs

## Monitoring

### Health Checks

- Application health endpoint: `https://your-vercel-app.vercel.app/health`
- Docker container health check via curl
- Vercel deployment status monitoring

### Logs

- GitHub Actions workflow logs
- Vercel deployment logs
- Security scan results in GitHub Security tab

## Customization

### Modifying Email Recipient

To change the email recipient, update line in `.github/workflows/ci-cd.yml`:
```yaml
to: muhammadhammad.020050@gmail.com
```

### Adding New Security Tools

Add new steps to the `security-scan` job following the existing pattern.

### Adjusting Deployment Triggers

Modify the `on` section in `.github/workflows/ci-cd.yml`:
```yaml
on:
  push:
    branches: [ main, develop ]  # Add/remove branches as needed
  pull_request:
    branches: [ main ]
```

## Support

For issues with the CI/CD pipeline:
1. Check GitHub Actions logs
2. Review this documentation
3. Verify all required secrets are set
4. Test locally using validation scripts

---

**Last Updated**: April 2024  
**Pipeline Version**: 2.0  
**Contact**: muhammadhammad.020050@gmail.com