# Resume Matcher

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/muhammadhammad2005/Matchly)

A modern web application for matching resumes with job descriptions using AI-powered analysis. The tool provides detailed insights, keyword matching, and improvement suggestions for job applicants.

## Quick Deployment

### Deploy to Vercel (Recommended)
Click the button above to deploy instantly to Vercel. No configuration needed!

### Alternative Deployment Options
- **Docker**: `docker run -p 3000:80 ghcr.io/muhammadhammad2005/matchly:latest`
- **Local**: `npm install && npm start`

## Features

- **Drag & Drop PDF Upload**: Upload resumes via file selection or drag-and-drop
- **Real-time Analysis**: Instant matching score and detailed insights
- **Keyword Analysis**: Identifies strong matches, partial matches, and missing keywords
- **Section-wise Scoring**: Breaks down resume into sections (Experience, Education, Skills, etc.)
- **ATS Risk Assessment**: Highlights potential ATS (Applicant Tracking System) issues
- **Theme Support**: Light and dark theme with smooth transitions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Export Results**: Save analysis as text summary or snapshot

## Quick Start

### Prerequisites
- Node.js 18+ (for local development)
- Docker (for containerized deployment)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/muhammadhammad2005/Matchly.git
   cd Matchly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   Open http://localhost:3000 in your browser.

### Using Docker

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up
   ```
   Open http://localhost:3000

2. **Build Docker image manually**
   ```bash
   docker build -t resume-matcher .
   docker run -p 3000:80 resume-matcher
   ```

## Deployment

### Vercel Deployment (Recommended)

1. **Connect your GitHub repository** to Vercel
2. **Configure environment variables** (if any)
3. **Automatic deployments** will be triggered on push to main branch

The `vercel.json` file includes optimal configuration for static hosting.

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t resume-matcher .
   ```

2. **Push to container registry**
   ```bash
   docker tag resume-matcher your-registry/resume-matcher:latest
   docker push your-registry/resume-matcher:latest
   ```

3. **Deploy to your infrastructure**
   - Kubernetes
   - AWS ECS
   - Google Cloud Run
   - Azure Container Instances

### Traditional Hosting

1. **Build static files**
   ```bash
   npm run build
   ```

2. **Deploy to any static hosting service**
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront
   - Firebase Hosting

## CI/CD Pipeline

This project includes GitHub Actions workflow for automated CI/CD:

### Workflow Features:
- **Automated Testing**: Basic HTML validation and security checks
- **Docker Image Building**: Multi-architecture Docker images
- **Security Scanning**: Trivy vulnerability scanning
- **Vercel Deployment**: Automatic deployment to production
- **Notifications**: Slack notifications for failures

### Secrets Required:
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `SLACK_WEBHOOK_URL`: (Optional) For notifications

## Project Structure

```
resume-matcher/
├── index.html              # Main application HTML
├── logo/                   # Brand logos and icons
├── package.json           # Node.js dependencies and scripts
├── Dockerfile            # Docker container definition
├── docker-compose.yml    # Local development with Docker
├── nginx.conf           # Nginx configuration for Docker
├── vercel.json          # Vercel deployment configuration
├── .github/workflows/   # GitHub Actions CI/CD pipelines
│   └── ci-cd.yml
├── .dockerignore        # Files to exclude from Docker builds
└── README.md            # This file
```

## Development

### Available Scripts

- `npm start` - Start development server on port 3000
- `npm run build` - Build for production (placeholder for future builds)
- `npm test` - Run tests (placeholder for future tests)
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container locally
- `npm run docker:compose` - Start with Docker Compose

### Adding Features

1. **Frontend Enhancements**: Modify `index.html` for UI changes
2. **Styling**: CSS is embedded in `index.html` within `<style>` tags
3. **JavaScript**: All application logic is in `index.html` within `<script>` tags
4. **Future Backend**: Consider separating backend API into `/api` directory

## Security Considerations

- **Content Security Policy**: Configured in `vercel.json` and `nginx.conf`
- **Security Headers**: Implemented for XSS protection, clickjacking, etc.
- **Dependency Scanning**: GitHub Actions includes npm audit and Trivy scans
- **HTTPS Enforcement**: Configure at hosting provider level

## Performance Optimization

- **Asset Caching**: Static assets cached for 1 year
- **Gzip Compression**: Enabled in nginx configuration
- **Image Optimization**: Consider adding image optimization pipeline
- **Code Splitting**: Future enhancement for larger applications

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests:
1. Check existing [Issues](https://github.com/yourusername/resume-matcher/issues)
2. Create a new issue with detailed description
3. Email: support@example.com

---

Built with ❤️ by the Resume Matcher Team