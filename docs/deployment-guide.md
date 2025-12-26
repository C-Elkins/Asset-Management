# Deployment Guide

## Docker Compose

1. Build and start services:
   docker compose up -d --build

2. Access:
   - Frontend: <http://localhost:3000>
   - Backend: <http://localhost:8080>
   - DB: localhost:5432 (PostgreSQL)

## Environment Variables

- SPRING_PROFILES_ACTIVE (backend)
- SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD (backend DB)

## Privacy Features Deployment Notes

Backend endpoints (context path /api/v1):

- GET /privacy/policy-status — returns compliance status summary
- GET /privacy/consent — returns current consent (or default if none)
- PUT /privacy/consent — updates consent
- GET /privacy/my-data — returns user profile + consent snapshot
- POST /privacy/request-deletion — submits deletion request

Frontend configuration:

- VITE_API_BASE_URL can be set to the backend base (e.g.
   <http://backend:8080/api/v1>) when deploying behind Docker or a reverse proxy.
   If unset, the frontend defaults to <http://localhost:8080/api/v1>.
