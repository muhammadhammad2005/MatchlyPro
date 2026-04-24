# Production CI/CD Setup

This project now uses a gated production pipeline:

`Quality Gate -> Security Checks -> Docker Smoke Test -> Docker Publish -> Vercel Production Deploy`

The important behavior is:

- `main` par push hote hi Vercel khud se direct deploy nahi karega
- deployment sirf GitHub Actions pipeline ke successful hone ke baad hogi
- Vercel deploy `vercel deploy --prebuilt --prod` se hota hai
- Docker image pehle locally smoke-test hoti hai, phir GHCR aur Docker Hub par push hoti hai

## Required Repository Secrets

Ye secrets workflow use karta hai:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `SNYK_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SMTP_USER`
- `SMTP_PASS`

## What Changed

- `vercel.json` me `git.deploymentEnabled: false` add kiya gaya hai taa ke Vercel Git auto-deploy band rahe
- workflow ko production-style gated jobs me split kiya gaya hai
- fake/no-op test commands ki jagah real validation aur smoke checks add kiye gaye hain
- duplicate validation scripts remove karke Node-based reusable scripts add kiye gaye hain
- Dockerfile ko static-site optimized banaya gaya hai

## Local Validation

Local machine par ye commands chala sakte ho:

```bash
npm ci
npm run ci:validate
docker build --target production -t resume-matcher:local .
docker run --rm -p 8080:8080 resume-matcher:local
```

## Vercel Note

`vercel.json` auto deployments ko disable karta hai. Agar aapka Vercel project abhi bhi connected Git integration ke through deploy kar raha ho, to Vercel dashboard me project settings -> Git me ja kar verify kar lo ke automatic Git deployments off hon. CLI-based production deploy workflow already configured hai.
