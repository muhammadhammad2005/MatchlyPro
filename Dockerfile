# Production image for the static Resume Matcher site
FROM nginx:1.27-alpine AS production

RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html /usr/share/nginx/html/index.html
COPY health.html /usr/share/nginx/html/health.html
COPY logo /usr/share/nginx/html/logo

RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:8080/health > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
