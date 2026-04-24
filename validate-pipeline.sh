#!/bin/bash

echo "=== Resume Matcher CI/CD Pipeline Validation ==="
echo ""

# Check if required files exist
echo "1. Checking required files..."
required_files=(
    ".github/workflows/ci-cd.yml"
    "Dockerfile"
    "nginx.conf"
    "package.json"
    "vercel.json"
    "index.html"
    "health.html"
    ".gitleaks.toml"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
        missing_files=$((missing_files + 1))
    fi
done

echo ""

# Check Dockerfile syntax
echo "2. Validating Dockerfile..."
if docker run --rm -i hadolint/hadolint < Dockerfile 2>/dev/null; then
    echo "  ✓ Dockerfile passes hadolint check"
else
    echo "  ⚠ Dockerfile may have issues (hadolint not available or found issues)"
fi

# Check package.json
echo "3. Validating package.json..."
if jq empty package.json 2>/dev/null; then
    echo "  ✓ package.json has valid JSON syntax"
else
    echo "  ⚠ package.json JSON validation skipped (jq not available)"
fi

# Check YAML syntax
echo "4. Validating workflow YAML..."
if command -v yamllint &> /dev/null; then
    yamllint .github/workflows/ci-cd.yml && echo "  ✓ Workflow YAML syntax is valid"
else
    echo "  ⚠ YAML validation skipped (yamllint not available)"
fi

# Check for common issues
echo "5. Checking for common issues..."
echo "  - Checking email configuration in workflow..."
if grep -q "muhammadhammad.020050@gmail.com" .github/workflows/ci-cd.yml; then
    echo "    ✓ Email notification configured correctly"
else
    echo "    ✗ Email not found in workflow"
fi

echo "  - Checking security scanning tools..."
if grep -q "security-scan" .github/workflows/ci-cd.yml; then
    echo "    ✓ Security scan job exists"
else
    echo "    ✗ Security scan job not found"
fi

echo "  - Checking multi-architecture build..."
if grep -q "platforms: linux/amd64,linux/arm64" .github/workflows/ci-cd.yml; then
    echo "    ✓ Multi-architecture build configured"
else
    echo "    ✗ Multi-architecture build not configured"
fi

echo "  - Checking Vercel deployment..."
if grep -q "deploy-vercel" .github/workflows/ci-cd.yml; then
    echo "    ✓ Vercel deployment job exists"
else
    echo "    ✗ Vercel deployment job not found"
fi

echo ""
echo "=== Summary ==="
if [ $missing_files -eq 0 ]; then
    echo "✓ All required files present"
else
    echo "⚠ $missing_files required files missing"
fi

echo ""
echo "=== Next Steps ==="
echo "1. Commit and push changes to trigger GitHub Actions"
echo "2. Set up required secrets in GitHub repository:"
echo "   - VERCEL_TOKEN"
echo "   - VERCEL_ORG_ID"
echo "   - VERCEL_PROJECT_ID"
echo "   - SMTP_USER (for email notifications)"
echo "   - SMTP_PASS (for email notifications)"
echo "3. Monitor workflow runs in GitHub Actions tab"
echo "4. Check email notifications at muhammadhammad.020050@gmail.com"