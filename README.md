# Matchly - AI Resume Matcher

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/muhammadhammad2005/Matchly)

Matchly is a modern web application that uses AI-powered analysis to match resumes with job descriptions. It provides detailed insights, keyword matching, and improvement suggestions for job applicants.

## 🚀 Live Demo
Deployed on Vercel: [https://matchly.vercel.app](https://matchly.vercel.app)

## ✨ Features

### Core Functionality
- **Drag & Drop PDF Upload**: Upload resumes via file selection or drag-and-drop interface
- **Real-time Analysis**: Instant matching score calculation with detailed insights
- **Keyword Analysis**: Identifies strong matches, partial matches, and missing keywords
- **Section-wise Scoring**: Breaks down resume into sections (Experience, Education, Skills, etc.)
- **ATS Risk Assessment**: Highlights potential Applicant Tracking System issues
- **Improvement Suggestions**: Actionable recommendations to improve resume match

### User Experience
- **Theme Support**: Light and dark theme with smooth transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Export Results**: Save analysis as text summary or snapshot
- **Visual Feedback**: Progress indicators, loading animations, and success notifications
- **Accessibility**: Keyboard navigation, screen reader support, and ARIA labels

### Technical Features
- **Client-side PDF Processing**: Uses PDF.js for secure, client-side PDF text extraction
- **No Backend Required**: All processing happens in the browser
- **Modern UI**: Glassmorphism design with smooth animations
- **Performance Optimized**: Fast loading with efficient algorithms

## 🛠️ How It Works

### 1. Input
- **Job Description**: Paste the target job description in the left editor
- **Resume**: Paste resume text or upload a PDF file in the right editor

### 2. Analysis Process
1. **Text Extraction**: PDF files are processed client-side using PDF.js
2. **Keyword Matching**: Advanced algorithm matches keywords between job description and resume
3. **Section Analysis**: Resume is analyzed by sections (Experience, Education, Skills, Projects)
4. **Score Calculation**: Weighted scoring based on keyword relevance and section completeness

### 3. Results Display
- **Match Score**: Overall percentage match (0-100%)
- **Keyword Categories**: Strong matches, partial matches, missing keywords
- **Section Scores**: Individual scores for each resume section
- **ATS Risks**: Potential issues that could affect ATS parsing
- **Improvement Suggestions**: Specific recommendations to improve match

## 📁 Project Structure

```
Matchly/
├── index.html              # Main application (HTML, CSS, JavaScript)
├── logo/                   # Brand logos and icons
├── package.json           # Project configuration and dependencies
├── vercel.json           # Vercel deployment configuration
├── .github/workflows/    # GitHub Actions CI/CD pipeline
│   └── ci-cd.yml         # Automated deployment workflow
├── Dockerfile            # Docker container configuration
├── docker-compose.yml    # Docker Compose for local development
├── nginx.conf           # Nginx web server configuration
├── .dockerignore        # Docker ignore file
└── README.md            # This documentation
```

## 🐳 Docker Deployment

Matchly is fully containerized and can be deployed using Docker.

### Running with Docker Compose

```bash
# Start the application
docker-compose up -d

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Building Docker Image

```bash
# Build the Docker image
docker build -t matchly-resume-matcher .

# Run the container
docker run -p 8080:8080 --name matchly matchly-resume-matcher

# Access the application at http://localhost:8080
```

### Docker Image Features
- **Multi-stage build** for optimized image size
- **Non-root user** for security
- **Health checks** for container monitoring
- **Nginx** for production-ready web server
- **Security headers** and compression enabled

## 🔒 Security Scanning

The CI/CD pipeline includes comprehensive security scanning:

### Automated Security Checks
1. **Trivy Vulnerability Scanner** - Scans for vulnerabilities in dependencies and container images
2. **Grype Vulnerability Scanner** - Alternative scanner for comprehensive coverage
3. **Snyk Security Scan** - Advanced dependency vulnerability detection (requires SNYK_TOKEN)
4. **OWASP Dependency Check** - Identifies project dependencies with known vulnerabilities
5. **npm audit** - Node.js package vulnerability scanning

### Security Features
- **GitHub Security Tab Integration**: All scan results are uploaded to GitHub Security tab
- **SARIF Reports**: Standardized security report format
- **Fail-on-high-severity**: Pipeline fails on critical vulnerabilities
- **Regular Scanning**: Automated scanning on every push and pull request

## 📱 WhatsApp Notifications

Get real-time notifications on WhatsApp about your CI/CD pipeline status.

### Setup Instructions

#### Option 1: Twilio WhatsApp API (Recommended)
1. **Create a Twilio Account** at [twilio.com](https://www.twilio.com)
2. **Enable WhatsApp Sandbox** in Twilio Console
3. **Get Credentials**:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM` (Twilio WhatsApp number)
   - `WHATSAPP_TO` (Your WhatsApp number with country code)

4. **Add Secrets to GitHub**:
   ```bash
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_FROM=+14155238886  # Twilio sandbox number
   WHATSAPP_TO=+1234567890            # Your WhatsApp number
   ```

#### Option 2: CallMeBot API (Free Alternative)
1. **Get CallMeBot API Key**:
   - Message "I allow callmebot to send me messages" to WhatsApp number `+34 644 44 84 24`
   - You'll receive an API key

2. **Add Secrets to GitHub**:
   ```bash
   CALLMEBOT_API_KEY=your_api_key
   WHATSAPP_PHONE=+1234567890  # Your WhatsApp number with country code
   ```

#### Option 3: Email Notifications (Fallback)
1. **Configure SMTP** (Gmail example):
   ```bash
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_TO=recipient@example.com
   ```

### Notification Types
- **Success**: All tests passed, Docker built successfully
- **Failure**: Any job in the pipeline failed
- **Deployment**: Successful deployment to Vercel
- **Security Alerts**: Critical vulnerabilities detected

## 🚀 Quick Deployment

### Option 1: One-Click Deploy to Vercel
Click the "Deploy with Vercel" button above. No configuration needed!

### Option 2: Manual Deployment
1. **Push to GitHub**: Commit and push this repository to GitHub
2. **Connect to Vercel**: Import repository in Vercel dashboard
3. **Configure**: Set Framework Preset to "Other" (static site)
4. **Deploy**: Click deploy - your site will be live in seconds

### Option 3: Local Development
```bash
# Clone repository
git clone https://github.com/muhammadhammad2005/Matchly.git
cd Matchly

# Install dependencies
npm install

# Start local server
npm start
# Open http://localhost:3000
```

## 🔧 Technical Implementation

### Frontend Technologies
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with variables, grid, flexbox, and animations
- **JavaScript (ES6+)**: Vanilla JavaScript with modular architecture
- **PDF.js**: Client-side PDF text extraction library

### Key Algorithms
1. **Keyword Extraction**: Tokenization, stemming, and TF-IDF scoring
2. **Semantic Matching**: Context-aware keyword matching
3. **Section Detection**: Automatic resume section identification
4. **Score Calculation**: Weighted scoring based on industry standards

### Performance Optimizations
- **Lazy Loading**: Resources loaded on demand
- **Caching**: Local storage for recent analyses
- **Debounced Input**: Efficient real-time processing
- **Optimized Algorithms**: O(n log n) complexity for large texts

## 📊 Usage Guide

### For Job Seekers
1. **Upload Resume**: Drag and drop your PDF resume or paste text
2. **Paste Job Description**: Copy-paste the job description you're targeting
3. **Analyze**: Click "Analyze Match" to get instant results
4. **Review**: Check match score, keyword analysis, and improvement suggestions
5. **Improve**: Use suggestions to optimize your resume for the specific job

### For Recruiters
1. **Test Resumes**: Compare multiple resumes against a job description
2. **Identify Gaps**: Quickly see missing skills and experience
3. **Standardize Evaluation**: Consistent scoring across candidates
4. **Save Time**: Automated analysis reduces manual review time

## 🔒 Privacy & Security

- **No Data Storage**: All processing happens in your browser
- **No Server Upload**: PDFs are processed client-side using PDF.js
- **No Tracking**: No analytics, cookies, or user tracking
- **Open Source**: Transparent code that you can audit

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# The application will auto-reload on changes
```

## 📈 Roadmap

### Planned Features
- [ ] Multi-resume comparison
- [ ] Industry-specific templates
- [ ] LinkedIn profile import
- [ ] Cover letter generator
- [ ] Interview question suggestions
- [ ] Salary range estimation

### Technical Improvements
- [x] ✅ Docker containerization
- [x] ✅ Comprehensive security scanning
- [x] ✅ WhatsApp notifications for CI/CD
- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality
- [ ] Advanced NLP for semantic analysis
- [ ] Browser extension
- [ ] API for integration with other platforms

## 🐛 Troubleshooting

### Common Issues

**PDF Upload Not Working**
- Ensure PDF is not password protected
- Check browser supports PDF.js (modern browsers only)
- Try a different PDF file

**Slow Analysis**
- Very long documents may take longer to process
- Consider breaking into sections
- Check browser performance

**Display Issues**
- Clear browser cache
- Try different browser
- Check console for errors (F12 → Console)

### Getting Help
1. Check existing [GitHub Issues](https://github.com/muhammadhammad2005/Matchly/issues)
2. Create a new issue with detailed description
3. Include browser version and steps to reproduce

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **PDF.js**: For client-side PDF processing
- **Vercel**: For hosting and deployment
- **GitHub**: For version control and CI/CD
- **Docker**: For containerization and deployment
- **Trivy & Grype**: For security vulnerability scanning
- **Twilio & CallMeBot**: For WhatsApp notification services
- **Open Source Community**: For inspiration and tools

## 📞 Contact

**Repository**: https://github.com/muhammadhammad2005/Matchly  
**Live Demo**: https://matchly.vercel.app  
**Issues**: https://github.com/muhammadhammad2005/Matchly/issues

---

Built with ❤️ by the Matchly Team | Making job matching smarter and fairer