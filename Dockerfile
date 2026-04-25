# Production image for MatchlyPro with AI proxy support
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:8080/health > /dev/null || exit 1

CMD ["node", "server.mjs"]
