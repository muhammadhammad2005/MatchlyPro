#!/bin/bash

# Vercel Deployment Script for Matchly
# This script helps deploy the Matchly application to Vercel

set -e

echo "=========================================="
echo "Matchly Vercel Deployment Script"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "Please log in to Vercel:"
    vercel login
fi

echo ""
echo "Current directory: $(pwd)"
echo "Repository: https://github.com/muhammadhammad2005/Matchly"
echo ""

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "Error: vercel.json not found!"
    echo "Please ensure you're in the correct directory."
    exit 1
fi

echo "Configuration found:"
echo "-------------------"
cat vercel.json | python -m json.tool 2>/dev/null || cat vercel.json
echo ""

# Ask for deployment type
read -p "Deploy to production? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying to production..."
    vercel --prod --confirm
else
    echo "Deploying preview deployment..."
    vercel
fi

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Visit your Vercel dashboard: https://vercel.com/dashboard"
echo "2. Check deployment status"
echo "3. Test your application"
echo "4. Configure custom domain (optional)"
echo ""
echo "For more details, see vercel-deploy.md"