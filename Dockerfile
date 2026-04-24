# Multi-stage Dockerfile for MatchlyPro Resume Matcher
# Stage 1: Builder stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production --ignore-scripts

# Copy application files
COPY . .

# Remove development files and sensitive data
RUN rm -rf .git .github/workflows/*.yml .vscode .idea \
    && find . -name "*.md" -type f ! -name "README.md" -delete \
    && find . -name "*.log" -type f -delete \
    && find . -name "*.tmp" -type f -delete

# Stage 2: Production stage with Nginx
FROM nginx:alpine AS production

# Install minimal required packages
RUN apk add --no-cache curl tzdata \
    && rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=UTC

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S -u 1001 -G appuser appuser && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

# Switch to non-root user
USER appuser

# Expose port (Nginx default is 80, but we use 8080 for compatibility)
EXPOSE 8080

# Health check with improved reliability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || curl -f http://localhost:8080/ || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Development stage (optional)
FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Stage 4: Test stage (optional)
FROM node:18-alpine AS test
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "test"]