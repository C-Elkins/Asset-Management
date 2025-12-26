ARG NODE_VERSION=20-bookworm-slim
FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY package*.json ./
# Clean install to handle optional dependencies (Rollup native modules)
RUN rm -rf node_modules package-lock.json && \
    npm install --no-audit --no-fund
COPY . .
# Ensure production env so Vite uses .env.production
ENV NODE_ENV=production
RUN npm run build

FROM docker.io/nginxinc/nginx-unprivileged:1.27.3-bookworm AS runtime
# Apply latest security patches to base packages to mitigate known CVEs
USER root
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/share/nginx/html
 # Copy build artifacts and config with proper ownership for non-root runtime
COPY --chown=101:101 --from=build /app/dist/ ./
COPY --chown=101:101 default.conf.template /etc/nginx/templates/default.conf.template

# The unprivileged image listens on 8080 by default
EXPOSE 8080
USER 101
# Use nginx config test for healthcheck to avoid curl/wget dependency in minimal image
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD nginx -t || exit 1
