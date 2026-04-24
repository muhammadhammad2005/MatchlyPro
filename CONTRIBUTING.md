# Contributing

## Branch Strategy

- `main` is the production-ready branch
- make changes in a feature branch such as `feature/...`, `fix/...`, or `chore/...`
- open a pull request into `main`
- wait for CI to pass
- get review before merge

## Deployment Policy

- branch pushes and pull requests run CI only
- production deployment does not happen from normal code pushes
- production deployment happens only from a version tag such as `v1.0.0`
- version tags are intended to be created only after approved code is already merged into `main`

## Release Flow

1. Merge approved changes into `main`
2. Create a version tag like `v1.0.0`
3. Push the tag
4. The release workflow publishes container images, deploys to Vercel production, and creates the GitHub Release entry

## Recommended GitHub Settings

For full enforcement, enable these repository rules in GitHub Settings:

- require a pull request before merging into `main`
- require status checks to pass before merging
- require review from code owners
- block force pushes to `main`
- restrict who can push directly to `main`
