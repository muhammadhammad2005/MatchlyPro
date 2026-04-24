# Simple PowerShell validation script
Write-Host "=== Resume Matcher CI/CD Pipeline Validation ==="
Write-Host ""

# Check if required files exist
Write-Host "1. Checking required files..."
$requiredFiles = @(
    ".github/workflows/ci-cd.yml",
    "Dockerfile",
    "nginx.conf",
    "package.json",
    "vercel.json",
    "index.html",
    "health.html",
    ".gitleaks.toml"
)

$missingFiles = 0
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file"
    } else {
        Write-Host "  [MISSING] $file"
        $missingFiles++
    }
}

Write-Host ""

# Quick validation
Write-Host "2. Quick validation checks..."

# Check email in workflow
$hasEmail = Select-String -Path ".github/workflows/ci-cd.yml" -Pattern "muhammadhammad.020050@gmail.com" -Quiet
if ($hasEmail) {
    Write-Host "  [OK] Email configured in workflow"
} else {
    Write-Host "  [WARN] Email not found in workflow"
}

# Check multi-arch build
$hasMultiArch = Select-String -Path ".github/workflows/ci-cd.yml" -Pattern "platforms: linux/amd64,linux/arm64" -Quiet
if ($hasMultiArch) {
    Write-Host "  [OK] Multi-architecture build configured"
} else {
    Write-Host "  [WARN] Multi-architecture build not found"
}

# Check security scan
$hasSecurityScan = Select-String -Path ".github/workflows/ci-cd.yml" -Pattern "security-scan" -Quiet
if ($hasSecurityScan) {
    Write-Host "  [OK] Security scan job exists"
} else {
    Write-Host "  [WARN] Security scan job not found"
}

Write-Host ""
Write-Host "=== Summary ==="
if ($missingFiles -eq 0) {
    Write-Host "[SUCCESS] All required files present"
} else {
    Write-Host "[WARNING] $missingFiles required files missing"
}

Write-Host ""
Write-Host "=== Next Steps ==="
Write-Host "1. Commit and push changes to trigger GitHub Actions"
Write-Host "2. Set up required GitHub secrets:"
Write-Host "   - VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID"
Write-Host "   - SMTP_USER and SMTP_PASS for email notifications"
Write-Host "3. Monitor workflow runs in GitHub Actions"
Write-Host "4. Check email: muhammadhammad.020050@gmail.com"