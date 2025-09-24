# syntax=docker/dockerfile:1

ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Ensure production env so Vite uses .env.production
ENV NODE_ENV=production
RUN npm run build

FROM docker.io/nginxinc/nginx-unprivileged:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html
 # Copy build artifacts and config with proper ownership for non-root runtime
COPY --chown=101:101 --from=build /app/dist/ ./
COPY --chown=101:101 default.conf.template /etc/nginx/templates/default.conf.template

# The unprivileged image listens on 8080 by default
EXPOSE 8080
USER 101
# Use nginx config test for healthcheck to avoid curl/wget dependency in minimal image
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD nginx -t || exit 1
