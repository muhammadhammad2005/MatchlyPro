# Deployment Guide for Resume Matcher

This document provides detailed instructions for deploying the Resume Matcher application using various methods.

## Table of Contents
1. [Quick Deployment Options](#quick-deployment-options)
2. [Vercel Deployment](#vercel-deployment)
3. [Docker Deployment](#docker-deployment)
4. [GitHub Actions CI/CD](#github-actions-cicd)
5. [Manual Deployment](#manual-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Troubleshooting](#troubleshooting)

## Quick Deployment Options

### Option 1: One-Click Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/resume-matcher)

### Option 2: Deploy with Docker Hub
```bash
docker run -p 3000:80 ghcr.io/yourusername/resume-matcher:latest
```

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository connected

### Steps
1. **Connect your GitHub repository** to Vercel
2. **Import project** from your GitHub repository
3. **Configure project settings**:
   - Framework Preset: `Other`
   - Build Command: Leave empty (static site)
   - Output Directory: `.` (root)
4. **Deploy** - Vercel will automatically deploy on push to main branch

### Environment Variables (Optional)
No environment variables are required for the basic static deployment.

### Custom Domain
1. Go to your project in Vercel dashboard
2. Navigate to "Domains"
3. Add your custom domain and follow DNS configuration instructions

## Docker Deployment

### Build Docker Image Locally
```bash
# Build the image
docker build -t resume-matcher .

# Run the container
docker run -p 3000:80 resume-matcher
```

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Push to Container Registry

#### Docker Hub
```bash
# Login to Docker Hub
docker login

# Tag image
docker tag resume-matcher yourusername/resume-matcher:latest

# Push image
docker push yourusername/resume-matcher:latest
```

#### GitHub Container Registry
```bash
# Login to GitHub Container Registry
echo $GHCR_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag image
docker tag resume-matcher ghcr.io/yourusername/resume-matcher:latest

# Push image
docker push ghcr.io/yourusername/resume-matcher:latest
```

### Deployment Platforms

#### AWS ECS/Fargate
1. Create ECR repository
2. Push Docker image to ECR
3. Create ECS task definition
4. Configure load balancer and service

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/resume-matcher
gcloud run deploy resume-matcher --image gcr.io/PROJECT-ID/resume-matcher --platform managed
```

#### Azure Container Instances
```bash
az container create \
  --resource-group myResourceGroup \
  --name resume-matcher \
  --image yourusername/resume-matcher:latest \
  --ports 80 \
  --ip-address Public
```

## GitHub Actions CI/CD

### Setup Secrets
Configure the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

1. **VERCEL_TOKEN**: Get from Vercel dashboard (Settings → Tokens)
2. **VERCEL_ORG_ID**: Find in Vercel dashboard (Settings → General)
3. **VERCEL_PROJECT_ID**: Find in project settings
4. **DOCKER_USERNAME**: Docker Hub/Registry username
5. **DOCKER_PASSWORD**: Docker Hub/Registry password/token

### Workflow Triggers
- **Push to main/develop branches**: Automatic build and test
- **Pull requests to main**: Run tests only
- **Manual trigger**: Via GitHub Actions UI

### Pipeline Stages
1. **Test**: Basic validation and security checks
2. **Build Docker**: Multi-architecture Docker image build
3. **Security Scan**: Trivy vulnerability scanning
4. **Deploy to Vercel**: Automatic deployment (main branch only)
5. **Notify**: Status notifications (optional)

## Manual Deployment

### Static Hosting (Netlify, GitHub Pages, S3)

1. **Build the application** (if needed):
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **Deploy to GitHub Pages**:
   - Enable GitHub Pages in repository settings
   - Set source to `main` branch and `/` (root) folder

4. **Deploy to AWS S3 + CloudFront**:
   ```bash
   aws s3 sync . s3://your-bucket-name --exclude "node_modules/*" --exclude ".git/*"
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

### Traditional Web Server (Apache/Nginx)

1. **Copy files to server**:
   ```bash
   scp -r * user@yourserver:/var/www/resume-matcher/
   ```

2. **Configure web server**:

   **Nginx configuration** (`/etc/nginx/sites-available/resume-matcher`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/resume-matcher;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Enable site and restart**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/resume-matcher /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Environment Configuration

### Development
```bash
# Install dependencies
npm install

# Start development server
npm start
# or
docker-compose up
```

### Production
```bash
# Using Docker
docker run -d -p 80:80 --name resume-matcher resume-matcher:latest

# Using Node.js (if serving needed)
npm install -g serve
serve -s . -p 3000
```

### Environment Variables
Create `.env` file for local development:
```env
NODE_ENV=production
PORT=3000
```

## Troubleshooting

### Common Issues

#### 1. Docker Build Fails
**Problem**: `npm ci` fails due to missing package.json
**Solution**: Ensure package.json exists in build context

#### 2. Vercel Deployment Fails
**Problem**: Build fails with framework detection issues
**Solution**: In Vercel project settings, set Framework to "Other"

#### 3. GitHub Actions Workflow Fails
**Problem**: Missing secrets
**Solution**: Add required secrets in GitHub repository settings

#### 4. Application Doesn't Load
**Problem**: Blank page or 404 errors
**Solution**: Check browser console for errors, verify all files are deployed

#### 5. CORS Issues
**Problem**: API requests blocked
**Solution**: Configure proper CORS headers in server configuration

### Logs and Debugging

#### Docker Logs
```bash
docker logs resume-matcher
docker-compose logs -f
```

#### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

#### Vercel Logs
- Check deployment logs in Vercel dashboard
- Use Vercel CLI: `vercel logs`

### Performance Optimization

1. **Enable Gzip compression** (already configured in nginx.conf)
2. **Configure CDN** for static assets
3. **Implement caching strategies**
4. **Use HTTP/2** for faster loading

## Monitoring and Maintenance

### Health Checks
- Application: `http://your-domain.com/health`
- Docker: Built-in healthcheck in Dockerfile

### Backup Strategy
1. **Code**: GitHub repository
2. **Database**: Regular backups (if database added in future)
3. **Configuration**: Version control

### Updates
1. **Application updates**: Push to GitHub, CI/CD pipeline handles deployment
2. **Security updates**: Regularly update base Docker images
3. **Dependency updates**: Run `npm audit` and update packages

## Support

For deployment issues:
1. Check the [GitHub Issues](https://github.com/yourusername/resume-matcher/issues)
2. Review application logs
3. Verify environment configuration
4. Contact: support@example.com

---

**Last Updated**: $(date)
**Version**: 1.0.0