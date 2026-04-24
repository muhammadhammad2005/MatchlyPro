# PowerShell script to validate CI/CD pipeline
Write-Host "=== Resume Matcher CI/CD Pipeline Validation ===" -ForegroundColor Cyan
Write-Host ""

# Check if required files exist
Write-Host "1. Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    ".github/workflows/ci-cd.yml"
    "Dockerfile"
    "nginx.conf"
    "package.json"
    "vercel.json"
    "index.html"
    "health.html"
    ".gitleaks.toml"
)

$missingFiles = 0
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (MISSING)" -ForegroundColor Red
        $missingFiles++
    }
}

Write-Host ""

# Check package.json
Write-Host "2. Validating package.json..." -ForegroundColor Yellow
try {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    Write-Host "  ✓ package.json has valid JSON syntax" -ForegroundColor Green
} catch {
    Write-Host "  ✗ package.json has invalid JSON syntax" -ForegroundColor Red
}

# Check for common issues
Write-Host "3. Checking for common issues..." -ForegroundColor Yellow

# Check email configuration
Write-Host "  - Checking email configuration in workflow..." -ForegroundColor Gray
$workflowContent = Get-Content ".github/workflows/ci-cd.yml" -Raw
if ($workflowContent -match "muhammadhammad\.020050@gmail\.com") {
    Write-Host "    ✓ Email notification configured correctly" -ForegroundColor Green
} else {
    Write-Host "    ✗ Email not found in workflow" -ForegroundColor Red
}

# Check security scanning
Write-Host "  - Checking security scanning tools..." -ForegroundColor Gray
if ($workflowContent -match "security-scan") {
    Write-Host "    ✓ Security scan job exists" -ForegroundColor Green
} else {
    Write-Host "    ✗ Security scan job not found" -ForegroundColor Red
}

# Check multi-architecture build
Write-Host "  - Checking multi-architecture build..." -ForegroundColor Gray
if ($workflowContent -match "platforms: linux/amd64,linux/arm64") {
    Write-Host "    ✓ Multi-architecture build configured" -ForegroundColor Green
} else {
    Write-Host "    ✗ Multi-architecture build not configured" -ForegroundColor Red
}

# Check Vercel deployment
Write-Host "  - Checking Vercel deployment..." -ForegroundColor Gray
if ($workflowContent -match "deploy-vercel") {
    Write-Host "    ✓ Vercel deployment job exists" -ForegroundColor Green
} else {
    Write-Host "    ✗ Vercel deployment job not found" -ForegroundColor Red
}

# Check Dockerfile
Write-Host "4. Checking Dockerfile..." -ForegroundColor Yellow
$dockerfileContent = Get-Content "Dockerfile" -Raw
if ($dockerfileContent -match "FROM node:.*AS builder" -and $dockerfileContent -match "FROM nginx:.*AS production") {
    Write-Host "  ✓ Dockerfile has multi-stage build" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Dockerfile may not have proper multi-stage build" -ForegroundColor Yellow
}

if ($dockerfileContent -match "USER appuser") {
    Write-Host "  ✓ Dockerfile uses non-root user" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Dockerfile may not use non-root user" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
if ($missingFiles -eq 0) {
    Write-Host "✓ All required files present" -ForegroundColor Green
} else {
    Write-Host "⚠ $missingFiles required files missing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Commit and push changes to trigger GitHub Actions" -ForegroundColor White
Write-Host "2. Set up required secrets in GitHub repository:" -ForegroundColor White
Write-Host "   - VERCEL_TOKEN" -ForegroundColor Gray
Write-Host "   - VERCEL_ORG_ID" -ForegroundColor Gray
Write-Host "   - VERCEL_PROJECT_ID" -ForegroundColor Gray
Write-Host "   - SMTP_USER (for email notifications)" -ForegroundColor Gray
Write-Host "   - SMTP_PASS (for email notifications)" -ForegroundColor Gray
Write-Host "   - SNYK_TOKEN (optional, for Snyk scanning)" -ForegroundColor Gray
Write-Host "3. Monitor workflow runs in GitHub Actions tab" -ForegroundColor White
Write-Host "4. Check email notifications at muhammadhammad.020050@gmail.com" -ForegroundColor White
Write-Host ""
Write-Host "=== Pipeline Overview ===" -ForegroundColor Cyan
Write-Host "Jobs in the workflow:" -ForegroundColor White
Write-Host "- test: Runs tests and basic validation" -ForegroundColor Gray
Write-Host "- security-scan: Comprehensive security scanning with 9+ tools" -ForegroundColor Gray
Write-Host "- build-docker: Multi-architecture Docker image build" -ForegroundColor Gray
Write-Host "- deploy-vercel: Production deployment to Vercel" -ForegroundColor Gray
Write-Host "- notify: Email notifications and status reporting" -ForegroundColor Gray