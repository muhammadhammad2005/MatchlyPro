# MatchlyPro

MatchlyPro is a production-ready resume matcher web app that compares a resume against a job description, highlights keyword coverage, surfaces ATS risks, and gives actionable improvement suggestions.

This project is part of my portfolio and showcases end-to-end ownership:

- product idea and implementation
- UI/UX design in a single-page app
- client-side PDF resume parsing with PDF.js
- Docker containerization with Nginx
- production deployment on Vercel
- CI/CD automation with GitHub Actions
- security checks with `npm audit` and Snyk

## Live Project

- Production app: [https://matchlypro.vercel.app](https://matchlypro.vercel.app)
- Repository: [https://github.com/muhammadhammad2005/MatchlyPro](https://github.com/muhammadhammad2005/MatchlyPro)

## What The App Does

- compares a job description and resume in real time
- supports PDF resume upload and text extraction in the browser
- calculates an overall match score
- groups results into strong, partial, and missing keywords
- analyzes resume sections and experience signals
- flags ATS-related risks
- lets users copy, export, and save result snapshots locally
- supports light and dark mode
- works on desktop and mobile

## Why This Project Matters

This is not just a frontend page. It is a complete portfolio project where I handled both application delivery and DevOps:

- built the tool myself
- deployed it to Vercel myself
- containerized it with Docker myself
- configured production CI/CD myself
- integrated security scanning and release gates myself

If you are reviewing this repository for hiring or portfolio purposes, the repo demonstrates practical ownership across development, deployment, and operations.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- PDF.js
- Nginx
- Docker
- Docker Hub
- GitHub Actions
- Vercel
- Snyk

## Application Highlights

### Resume analysis engine

- keyword matching between job description and resume
- weighted scoring logic
- section-aware analysis
- role-family insights
- risk detection for weak resume coverage

### Frontend experience

- responsive single-page interface
- polished visual design
- drag-and-drop PDF upload
- live character counters
- session history using local storage
- copy/export/save utilities

### Privacy-first approach

- no backend required for core matching
- resume parsing happens in the browser
- no database
- no user account requirement

## DevOps And Production Setup

The project includes a real CI/CD flow instead of a basic demo pipeline.

### Current pipeline

`Quality Gate -> Security Checks -> Docker Smoke Test -> Publish Container Images -> Deploy to Vercel Production -> Notification Stage`

### What the pipeline does

- installs dependencies with `npm ci`
- validates project structure
- runs static smoke checks
- runs `npm audit`
- runs a Snyk dependency scan
- builds and smoke-tests the production Docker image
- publishes container images to GHCR and Docker Hub
- deploys to Vercel only after earlier gates succeed
- sends a notification stage summary at the end

### Deployment rule

Vercel does not auto-deploy directly from Git pushes for this project.

The repository uses CLI-based deployment after pipeline success, and `vercel.json` disables automatic Git deployments for tighter release control.

## Containerization

The app is containerized for production use with Nginx.

### Docker features

- lightweight `nginx:alpine` production image
- custom Nginx config
- health endpoint support
- non-root runtime user
- static asset caching
- security headers

### Run locally with Docker

```bash
docker build --target production -t resume-matcher .
docker run --rm -p 8080:8080 resume-matcher
```

Open `http://localhost:8080`

### Run locally with Node

```bash
npm ci
npm start
```

Open `http://localhost:3000`

## Local Validation

```bash
npm run ci:validate
```

This runs:

- project validation
- static smoke testing

## Project Structure

```text
.
├─ .github/workflows/ci-cd.yml
├─ Dockerfile
├─ docker-compose.yml
├─ nginx.conf
├─ vercel.json
├─ package.json
├─ index.html
├─ health.html
├─ scripts/
│  ├─ smoke-static-site.mjs
│  └─ validate-project.mjs
└─ logo/
```

## Vercel Note

If Vercel shows `No Screenshot Available` on the deployment overview, that usually does not mean the deployment is broken.

In this project, the production deployment works, but the generated deployment URL can still be treated differently from the public production domain. Vercel's dashboard screenshot system uses generated deployment URLs, and protected or restricted generated URLs may fail screenshot capture even while the production domain is healthy.

Relevant references:

- Vercel generated URLs: https://vercel.com/docs/concepts/deployments/generated-urls
- Vercel deployment protection: https://vercel.com/docs/security/deployment-protection
- Similar community report: https://community.vercel.com/t/deployment-status-shows-error-due-to-authentication-redirect/7658

## Production Readiness Summary

This repository is in a strong portfolio-ready state for a static production app:

- working production deployment
- gated CI/CD pipeline
- containerized runtime
- security scanning integrated
- release flow separated from direct Vercel Git auto-deploy
- health checks for container and deployment verification
- clean documentation for reviewers

### Remaining limitations

- there is no backend or persistent database because the tool is intentionally browser-first
- screenshot availability inside Vercel dashboard is a platform-side generated-URL behavior, not an application outage
- local Docker verification depends on Docker Engine being available on the machine running the checks

## Future Improvements

- custom domain
- Lighthouse performance report badge
- automated accessibility audit in CI
- Playwright end-to-end tests
- Dependabot for dependency maintenance
- versioned releases and changelog

## Author

Muhammad Hammad

Built, containerized, deployed, and automated by me as a portfolio project to demonstrate product engineering plus practical DevOps ownership.
